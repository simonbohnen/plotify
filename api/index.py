from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Response, Query
from shapely.geometry import MultiLineString
import vpype
from fastapi.middleware.cors import CORSMiddleware
import os

from hatched import hatched

from api.layout import vpype_layout


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
    with open("api/ellie_simplified.svg", "r") as f:
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
    from vpype import read_multilayer_svg
    
    # Save uploaded file to a temporary location
    tmp_path = await upload_file_to_temp(file, ".svg")

    # Read the SVG as a multilayer document
    document = read_multilayer_svg(tmp_path, quantization=0.1, crop=True)

    # Clean up temp file
    os.remove(tmp_path)

    size_tuple = (width, height)

    # Apply layout using vpype_cli layout function
    document = vpype_layout(
        document=document,
        size=size_tuple,
        landscape=landscape,
        margin=margin,
        align="center",
        valign="center",
        no_bbox=False
    )

    # Return SVG as XML
    return document_to_svg_response(document)