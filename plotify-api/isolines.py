import numpy as np
from skimage import io
import matplotlib.pyplot as plt
import os
from lxml import etree
from skimage.transform import resize

def get_isolines(filename_mask, filename_depth, output_filename):
    # filename_mask = '/Users/simon/Library/Mobile Documents/com~apple~CloudDocs/Downloads/Adobe Express - file (2).png'

    # filename_depth = '/Users/simon/Library/Mobile Documents/com~apple~CloudDocs/Downloads/grey_max.png'
    # base_filename_depth = os.path.splitext(os.path.basename(filename_depth))[0]  # Extract filename without extension

    # Load image with alpha channel
    image_mask = io.imread(filename_mask, as_gray=False)
    image = io.imread(filename_depth, as_gray=True)  # Load image as grayscale

    # Resize mask if needed
    if image_mask.shape[:2] != image.shape[:2]:
        image_mask = resize(image_mask, image.shape[:2], preserve_range=True, anti_aliasing=True).astype(image_mask.dtype)

    if image_mask.shape[-1] == 4:
        alpha_channel = image_mask[..., 3]
        transparent_mask = alpha_channel < 200  # True where transparent
    else:
        transparent_mask = np.zeros(image_mask.shape[:2], dtype=bool)  # No alpha channel, so no transparency
        
    height, width = image_mask.shape[:2]

    # Calculate and print the percentage of area captured by the mask
    # total_pixels = transparent_mask.size
    # masked_pixels = np.sum(transparent_mask)
    # percentage_masked = (masked_pixels / total_pixels) * 100
    # print(f"Percentage of area captured by mask: {percentage_masked:.2f}%")

    uniques = np.unique(image)
    uniques_foreground = uniques[-250:]

    image_masked = np.copy(image)
    image_masked = image_masked.astype(float)
    image_masked[transparent_mask] = np.nan

    contour_set = plt.contour(image_masked, levels=uniques_foreground, colors='black')
    plt.xlim(0, width)
    plt.ylim(height, 0)  # Invert y-axis so origin is at top-left, matching image coordinates
    plt.axis('off')
    plt.axis('equal')
    # plt.gca().invert_yaxis()
    plt.savefig(output_filename, bbox_inches='tight')
    # plt.show()


def clean_svg(svg_path):
    """
    Parses the SVG at svg_path, removes the first <path> with style="fill: #ffffff",
    and removes the first <path> (in reverse order) without a 'd' attribute.
    The SVG is overwritten in place.
    """
    parser = etree.XMLParser(remove_blank_text=True)
    tree = etree.parse(svg_path, parser)
    root = tree.getroot()

    # SVG namespace handling
    nsmap = root.nsmap.copy()
    if None in nsmap:
        nsmap['svg'] = nsmap.pop(None)
    svg_ns = nsmap.get('svg', 'http://www.w3.org/2000/svg')
    path_tag = f'{{{svg_ns}}}path'

    # Remove first <path> with style="fill: #ffffff"
    found_fill = False
    for elem in root.iter(path_tag):
        style = elem.get('style', '')
        if 'fill: #ffffff' in style:
            parent = elem.getparent()
            parent.remove(elem)
            found_fill = True
        elif elem.get('d') is None:
            parent = elem.getparent()
            parent.remove(elem)

    # Write back to file
    tree.write(svg_path, pretty_print=True, xml_declaration=True, encoding='utf-8')

