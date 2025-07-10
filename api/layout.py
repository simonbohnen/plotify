import vpype as vp

def _normalize_page_size(
    page_size: tuple[float, float], landscape: bool
) -> tuple[float, float]:
    """Normalize page size to respect the orientation."""
    if (landscape and page_size[0] < page_size[1]) or (
        not landscape and page_size[0] > page_size[1]
    ):
        return page_size[::-1]
    else:
        return page_size

def vpype_layout(
    document: vp.Document,
    size: tuple[float, float],
    landscape: bool,
    margin: float | None,
    align: str,
    valign: str,
    no_bbox: bool,
) -> vp.Document:
    """Layout command"""

    size = _normalize_page_size(size, landscape)
    if no_bbox:
        page_size = document.page_size
        bounds: tuple[float, float, float, float] | None = (
            0.0,
            0.0,
            page_size[0],
            page_size[1],
        )
    else:
        bounds = document.bounds()

    tight = size == vp.PAGE_SIZES["tight"]

    # handle empty geometry special cases
    if bounds is None:
        if not tight:
            document.page_size = size
        return document

    min_x, min_y, max_x, max_y = bounds
    width = max_x - min_x
    height = max_y - min_y

    # handle "tight" special case
    if tight:
        extra = 2 * (margin or 0.0)
        size = width + extra, height + extra

    document.page_size = size

    if margin is not None:
        document.translate(-min_x, -min_y)
        scale = min((size[0] - 2 * margin) / width, (size[1] - 2 * margin) / height)
        document.scale(scale)
        min_x = min_y = 0.0
        width *= scale
        height *= scale
    else:
        margin = 0.0

    if align == "left":
        h_offset = margin - min_x
    elif align == "right":
        h_offset = size[0] - margin - width - min_x
    else:
        h_offset = margin + (size[0] - width - 2 * margin) / 2 - min_x

    if valign == "top":
        v_offset = margin - min_y
    elif valign == "bottom":
        v_offset = size[1] - margin - height - min_y
    else:
        v_offset = margin + (size[1] - height - 2 * margin) / 2 - min_y

    document.translate(h_offset, v_offset)
    return document