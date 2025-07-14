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
import svgutils.transform as sg
import uvicorn

from hatched import hatched
from hatch_fill import Hatch_Fill
from isolines import clean_svg
from depth import get_depth_image
from isolines import get_isolines

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

# Pen types and widths
PEN_TYPES = {
    "felt_tip": "0.7mm",
    "technical_pen": "0.15mm",
    "gel_pen": "0.5mm",
}

# Pen colors and hex values
PEN_COLORS = {
    "Light Violet": "#ce6aee",
    "Orange": "#f67f35",
    "Blue": "#357ef3",
    "Dark Pink": "#d373ed",
    "Grey": "#aeb9c1",
    "Bluish Red": "#e34b7f",
    "Red": "#eb5d7a",
    "Light Green": "#84d174",
    "Cream": "#e5cab0",
    "Brown": "#c47967",
    "Dark Green": "#2cc2ac",
    "Violet": "#7d4be2",
    "Yellow": "#ddcf48",
    "Pink": "#ee7dd9",
    "Lavender": "#9b95ef",
    "Light Blue": "#00aded",
    "Black": "#4b4a59",
    "Dark Terracotta": "#cc6867",
    "Turquoise": "#00b9c2",
    "Dark Blue": "#3b56dd",
    "Gray": "#888888",
    "Sepia": "#704214",
    "Green": "#27AE60",
    "Pink": "#FF69B4",
    "Blue": "#1E90FF",
    "Black (gel pen)": "#222222",
}

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
        pen_parts = pen_id.split("_")
        if len(pen_parts) < 2:
            tool = pen_parts[0]
            color_name = None
        else:
            tool = "_".join(pen_parts[:-1])
            color_name = pen_parts[-1]
        pen_width = PEN_TYPES.get(tool, "0.3mm")
        layer = {
            "layer_id": idx + 1,  # 1-based layer index
            "name": f"{idx + 1}_{pen_id}",
            "pen_width": pen_width,
        }
        if color_name and color_name in PEN_COLORS:
            layer["color"] = PEN_COLORS[color_name]
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
    max_colors: int = Query(..., description="Maximum number of colors"),
    remove_whites: bool = Query(False, description="Remove white colors from the image")
):
    """
    Vectorize an image using the vectorizer.ai API.
    This endpoint relays the request to vectorizer.ai and returns the vectorized SVG.
    """
    # If mode is mock, return the wimbledon.svg file
    if mode == "mock":
        try:
            with open("wimbledon_figma.svg", "r") as f:
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
        
        # Add palette processing if remove_whites flag is present
        if remove_whites:
            data["processing.palette"] = "#FFFFFF -> #00000000 ~ 0.05;"
        
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

@app.post("/api/hatch-svg")
async def hatch_svg(
    file: UploadFile = File(...),
    hatch_spacing: float = Query(10.0, description="Spacing between hatch lines"),
    hatch_angle: float = Query(45.0, description="Angle of inclination for hatch lines"),
    hold_back_steps: float = Query(1.0, description="How far hatch strokes stay from boundary"),
    cross_hatch: bool = Query(False, description="Generate a cross hatch pattern"),
    reduce_pen_lifts: bool = Query(False, description="Reduce plotting time by joining some hatches"),
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
            
            # Create a temporary file for the final output
            with tempfile.NamedTemporaryFile(delete=False, suffix=".svg") as tmp_final:
                final_output_path = tmp_final.name
            
            try:
                # Run vpype to remove fills and keep only strokes
                import vpype_cli
                new_doc = vpype_cli.execute(pipeline=f"read --attr stroke {output_svg_path}")

                # Return SVG as XML
                return document_to_svg_response(new_doc)
                
            except Exception as e:
                # If vpype fails, return the original hatched SVG
                print(f"Warning: vpype command failed: {str(e)}")
                return Response(content=svg_content, media_type="image/svg+xml")
            finally:
                # Clean up the final output file
                if os.path.exists(final_output_path):
                    os.remove(final_output_path)
            
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

@app.post("/api/move")
async def move(file: UploadFile = File(...)):
    """
    Create a new SVG figure and append the uploaded SVG content to it.
    Returns the combined SVG as XML.
    """
    # Save uploaded file to a temporary location
    input_svg_path = await upload_file_to_temp(file, ".svg")
    
    try:
        # Create a temporary output file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".svg") as tmp_output:
            output_svg_path = tmp_output.name
        
        # Create new SVG figure
        fig = sg.SVGFigure("264mm", "373mm")
        
        # Get the root of the passed SVG file
        fig1 = sg.fromfile(input_svg_path)
        plot1 = fig1.getroot()
        
        # Append it to the fig
        fig.append([plot1])
        
        # Save to temp file
        fig.save(output_svg_path)
        
        # Read the output SVG file
        with open(output_svg_path, "r") as f:
            svg_content = f.read()
        
        # Return the processed SVG as XML
        return Response(content=svg_content, media_type="image/svg+xml")
        
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

@app.post("/api/clean-svg")
async def clean_svg_endpoint(file: UploadFile = File(...)):
    """
    Receives an SVG file, cleans it using clean_svg, and returns the cleaned SVG.
    """
    # Save uploaded file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=".svg") as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        clean_svg(tmp_path)
        with open(tmp_path, "r") as f:
            svg_content = f.read()
        return Response(content=svg_content, media_type="image/svg+xml")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.post("/api/depth-lines")
async def depth_lines(
    image: UploadFile = File(...),
    mask: UploadFile = File(None)
):
    """
    Receives an image (for depth) and an optional mask image, computes depth, extracts isolines, cleans the SVG, processes it with vpype, and returns it.
    """
    import uuid
    # Save uploaded files to temporary locations
    with tempfile.TemporaryDirectory() as tmpdir:
        # Save depth image
        image_path = os.path.join(tmpdir, f"depth_input_{uuid.uuid4().hex}.png")
        with open(image_path, "wb") as f:
            f.write(await image.read())
        # Save mask image if provided
        mask_path = None
        if mask is not None:
            mask_path = os.path.join(tmpdir, f"mask_input_{uuid.uuid4().hex}.png")
            with open(mask_path, "wb") as f:
                f.write(await mask.read())
        # Output paths
        depth_output_path = os.path.join(tmpdir, f"depth_output_{uuid.uuid4().hex}.png")
        svg_output_path = os.path.join(tmpdir, f"isolines_{uuid.uuid4().hex}.svg")
        processed_svg_path = os.path.join(tmpdir, f"processed_{uuid.uuid4().hex}.svg")
        # Run depth computation
        get_depth_image(image_path, depth_output_path)
        # Run isolines extraction
        get_isolines(mask_path if mask_path else image_path, depth_output_path, svg_output_path)
        # Clean the SVG
        clean_svg(svg_output_path)
        # Run vpype pipeline
        import vpype_cli
        new_doc = vpype_cli.execute(
            pipeline=f"read --simplify {svg_output_path} linesimplify filter --min-length 3mm linesort"
        )
        # Return SVG
        return document_to_svg_response(new_doc)


if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=8000, reload=True)