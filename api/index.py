from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Response, Query
from shapely.geometry import MultiLineString
import vpype
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
import toml
import vpype_cli
from vpype import read_svg_by_attributes

from hatched import hatched

load_dotenv(".env.local")

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# client = OpenAI(
#     api_key=os.environ.get("OPENAI_API_KEY"),
# )

async def upload_file_to_temp(upload_file: UploadFile, suffix: str = None) -> str:
    import tempfile
    
    # Get file extension from filename
    file_extension = os.path.splitext(upload_file.filename)[1] if upload_file.filename else suffix or ".tmp"
    
    # Save uploaded file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp:
        contents = await upload_file.read()
        tmp.write(contents)
        tmp_path = tmp.name
    
    return tmp_path

@app.post("/api/hatch-mock")
async def hatch_mock(file: UploadFile = File(...)):
    # Read the response.svg file
    with open("example_no_fill.svg", "r") as f:
        svg_content = f.read()
    return Response(content=svg_content, media_type="image/svg+xml")

@app.post("/api/hatch")
async def hatch_image(file: UploadFile = File(...)):
    # Save uploaded file to a temporary location
    tmp_path = await upload_file_to_temp(file, ".png")
    
    # Call the hatch function (assume it returns SVG as a string)
    multiLineString: MultiLineString = hatched.hatch(tmp_path, blur_radius=1, show_plot=False)
    lc = vpype.LineCollection(lines=multiLineString)
    document = vpype.Document(lc)
    
    # Clean up temp file
    os.remove(tmp_path)
    
    # Return SVG as XML
    return document_to_svg_response(document)

def document_to_svg_response(document: vpype.Document) -> Response:
    import io
    from vpype import write_svg
    svg_io = io.StringIO()
    write_svg(svg_io, document)
    svg_content = svg_io.getvalue()
    svg_io.close()
    return Response(content=svg_content, media_type="image/svg+xml")

@app.post("/api/layout")
async def layout(
    file: UploadFile = File(...),
    margin: float = Query(None, description="Margin in mm"),
    width: float = Query(None, description="Width in mm"),
    height: float = Query(None, description="Height in mm"),
    landscape: bool = Query(False, description="Use landscape orientation")
):    
    # Save uploaded file to a temporary location
    tmp_path = await upload_file_to_temp(file, ".svg")

    new_doc = vpype_cli.execute(pipeline=f"read --simplify --attr stroke {tmp_path} layout -m {margin}mm {'-l ' if landscape else ''}{width}mmx{height}mm")

    # Clean up temp file
    os.remove(tmp_path)

    # Return SVG as XML
    return document_to_svg_response(new_doc)

@app.post("/api/stroke-colors-to-layers")
async def stroke_to_layers(file: UploadFile = File(...)):    
    # Save uploaded file to a temporary location
    tmp_path = await upload_file_to_temp(file, ".svg")

    # Read the SVG as a multilayer document
    document = read_svg_by_attributes(tmp_path, ["stroke"], quantization=0.4, crop=True)

    # Clean up temp file
    os.remove(tmp_path)

    # Return SVG as XML
    return document_to_svg_response(document)

@app.post("/api/assign-pens")
async def assign_pens(
    file: UploadFile = File(...),
    pen_ids: list[str] = Query(..., description="List of pen identifiers for each layer")
):
    # Save uploaded file to a temporary location
    tmp_path = await upload_file_to_temp(file, ".svg")

    # Create a temporary vpype config file
    layers = []
    for idx, pen_id in enumerate(pen_ids):
        pen_info = PEN_INFO.get(pen_id, {"color": "#000000", "pen_width": "0.3mm"})
        layer = {
            "layer_id": idx + 1,  # 1-based layer index
            "name": pen_id,
            "color": pen_info["color"],
            "pen_width": pen_info["pen_width"],
        }
        layers.append(layer)
    config_dict = {
        "pen_config": {
            "my_pen_config": {
                "layers": layers
            }
        }
    }
    # Write config to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".toml", mode="w") as config_file:
        toml.dump(config_dict, config_file)
        config_path = config_file.name
    # (For now, do not use config_path further)

    # Use vpype cli execute to assign pens to layers (for now, just run 'read')
    new_doc = vpype_cli.execute(pipeline=f"read --simplify {tmp_path} pens my_pen_config", global_opt=f"--config {config_path}")

    # Clean up temp file
    os.remove(tmp_path)

    # Return the SVG as XML
    return document_to_svg_response(new_doc)

# Mapping of pen identifiers to color and pen width
PEN_INFO = {
    "felt_tip_Black": {"color": "#222222", "pen_width": "0.7mm"},
    "felt_tip_Brown": {"color": "#8B5C2A", "pen_width": "0.7mm"},
    "felt_tip_Red": {"color": "#C0392B", "pen_width": "0.7mm"},
    "felt_tip_Blue": {"color": "#2980B9", "pen_width": "0.7mm"},
    "technical_pen_Black": {"color": "#111111", "pen_width": "0.15mm"},
    "technical_pen_Gray": {"color": "#888888", "pen_width": "0.15mm"},
    "technical_pen_Sepia": {"color": "#704214", "pen_width": "0.15mm"},
    "gel_pen_Black": {"color": "#222222", "pen_width": "0.5mm"},
    "gel_pen_Blue": {"color": "#1E90FF", "pen_width": "0.5mm"},
    "gel_pen_Green": {"color": "#27AE60", "pen_width": "0.5mm"},
    "gel_pen_Pink": {"color": "#FF69B4", "pen_width": "0.5mm"},
}
