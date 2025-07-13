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
import sys
import requests

from hatched import hatched
from hatch_fill import Hatch_Fill

load_dotenv(".env.local")

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
    "https://plotify-pi.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    with open("example2.svg", "r") as f:
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

@app.post("/api/vectorize")
async def vectorize(
    file: UploadFile = File(...),
    mode: str = Query(..., description="Vectorization mode"),
    max_colors: int = Query(..., description="Maximum number of colors")
):
    """
    Vectorize an image using the vectorizer.ai API.
    This endpoint relays the request to vectorizer.ai and returns the vectorized SVG.
    """
    # If mode is mock, return the wimbledon.svg file
    if mode == "mock":
        try:
            with open("wimbledon.svg", "r") as f:
                svg_content = f.read()
            return Response(content=svg_content, media_type="image/svg+xml")
        except FileNotFoundError:
            return Response(
                content="wimbledon.svg not found",
                status_code=404,
                media_type="text/plain"
            )
    
    # If mode is mock-preview, return the default image
    if mode == "mock-preview":
        try:
            with open("/Users/simon/code/plotify/plotify-api/IMG_3296.png", "rb") as f:
                image_content = f.read()
            return Response(content=image_content, media_type="image/png")
        except FileNotFoundError:
            return Response(
                content="Default preview image not found",
                status_code=404,
                media_type="text/plain"
            )
    
    # Save uploaded file to a temporary location
    tmp_path = await upload_file_to_temp(file)
    
    try:
        # Prepare the data for the vectorizer.ai API
        data = {
            "mode": mode,
            "processing.max_colors": max_colors
        }
        
        # Make request to vectorizer.ai API
        response = requests.post(
            'https://vectorizer.ai/api/v1/vectorize',
            files={'image': open(tmp_path, 'rb')},
            data=data,
            auth=(os.getenv("VECTORIZER_AI_API_ID"), os.getenv("VECTORIZER_AI_API_SECRET")),
        )
        
        # Check if the request was successful
        response.raise_for_status()
        
        media_type = "image/png" if mode == "preview" else "image/svg+xml"
        
        # Return the vectorized SVG
        return Response(content=response.content, media_type=media_type)
        
    except requests.exceptions.RequestException as e:
        # Return a proper error response for API errors
        return Response(
            content=f"Error calling vectorizer.ai API: {str(e)}",
            status_code=500,
            media_type="text/plain"
        )
    except Exception as e:
        # Return a proper error response for other errors
        return Response(
            content=f"Error processing image: {str(e)}",
            status_code=500,
            media_type="text/plain"
        )
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

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

@app.post("/api/hatch-svg")
async def hatch_svg(
    file: UploadFile = File(...),
    hatch_spacing: float = Query(10.0, description="Spacing between hatch lines"),
    hatch_angle: float = Query(90.0, description="Angle of inclination for hatch lines"),
    hold_back_steps: float = Query(3.0, description="How far hatch strokes stay from boundary"),
    cross_hatch: bool = Query(False, description="Generate a cross hatch pattern"),
    reduce_pen_lifts: bool = Query(True, description="Reduce plotting time by joining some hatches"),
    hold_back_hatch_from_edges: bool = Query(True, description="Stay away from edges"),
    hatch_scope: float = Query(3.0, description="Radius searched for segments to join"),
    tolerance: float = Query(20.0, description="Allowed deviation from original paths"),
    unit: str = Query("mm", description="Unit for measurements")
):
    """
    Hatch an SVG file using the Hatch_Fill class directly.
    This endpoint processes SVG files and adds hatching patterns to them.
    """
    # Save uploaded file to a temporary location
    input_svg_path = await upload_file_to_temp(file, ".svg")
    
    try:
        # Create a temporary output file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".svg") as tmp_output:
            output_svg_path = tmp_output.name
        
        # Set up sys.argv to simulate command line arguments for Hatch_Fill
        original_argv = sys.argv.copy()
        sys.argv = [
            "hatch_fill.py",
            "--output", output_svg_path,
            "--hatchSpacing", str(hatch_spacing),
            "--hatchAngle", str(hatch_angle),
            "--holdBackSteps", str(hold_back_steps),
            "--crossHatch", str(cross_hatch).lower(),
            "--reducePenLifts", str(reduce_pen_lifts).lower(),
            "--holdBackHatchFromEdges", str(hold_back_hatch_from_edges).lower(),
            "--hatchScope", str(hatch_scope),
            "--tolerance", str(tolerance),
            "--unit", unit,
            input_svg_path
        ]
        
        try:
            # Run the Hatch_Fill class directly
            hatch_fill = Hatch_Fill()
            hatch_fill.run()
            
            # Read the output SVG file
            with open(output_svg_path, "r") as f:
                svg_content = f.read()
            
            # Return the hatched SVG as XML
            return Response(content=svg_content, media_type="image/svg+xml")
            
        finally:
            # Restore original sys.argv
            sys.argv = original_argv
        
    except Exception as e:
        # Return a proper error response
        return Response(
            content=f"Error processing SVG: {str(e)}",
            status_code=500,
            media_type="text/plain"
        )
    finally:
        # Clean up temporary files
        if os.path.exists(input_svg_path):
            os.remove(input_svg_path)
        if os.path.exists(output_svg_path):
            os.remove(output_svg_path)
