import replicate
import dotenv

dotenv.load_dotenv()

def get_depth_image(image_path, output_path):
    file_input = open(image_path, "rb")

    output = replicate.run(
        "chenxwh/depth-anything-v2:b239ea33cff32bb7abb5db39ffe9a09c14cbc2894331d1ef66fe096eed88ebd4",
        input={
            "image": file_input,
            "model_size": "Large"
        }
    )

    file_input.close()
    
    grey_fileoutput = output['grey_depth']
    with open(output_path, 'wb') as f:
        f.write(grey_fileoutput.read())