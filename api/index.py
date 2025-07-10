from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Response
from shapely.geometry import MultiLineString
import vpype
from fastapi.middleware.cors import CORSMiddleware



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

@app.get("/api/hello")
async def hello_world():
    return "Hello"

import pathlib
import os

from hatched import hatched

if __name__ == "__main__":
    image_path = pathlib.Path(__file__).parent / "skull.png"
    hatched.hatch(str(image_path), hatch_pitch=5, levels=(20, 100, 180), blur_radius=1)

@app.post("/api/hatch-mock")
async def hatch_mock(file: UploadFile = File(...)):
    # Read the response.svg file
    with open("api/response.svg", "r") as f:
        svg_content = f.read()
    return Response(content=svg_content, media_type="image/svg+xml")

@app.post("/api/hatch")
async def hatch_image(file: UploadFile = File(...)):
    import tempfile
    import io
    from vpype import write_svg
    
    # Get file extension from filename
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".png"
    
    # Save uploaded file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name
    
    # Call the hatch function (assume it returns SVG as a string)
    multiLineString: MultiLineString = hatched.hatch(tmp_path, blur_radius=1, show_plot=False)
    lc = vpype.LineCollection(lines=multiLineString)
    document = vpype.Document(lc)
    
    # Clean up temp file
    os.remove(tmp_path)
    
    # Write SVG to TextIO object
    svg_io = io.StringIO()
    write_svg(svg_io, document)
    svg_content = svg_io.getvalue()
    svg_io.close()
    
    # Return SVG as XML
    return Response(content=svg_content, media_type="image/svg+xml")