"""Generate responsive WebP derivatives; originals are intentionally preserved.
Requires Pillow: pip install Pillow. Run from repository root.
"""
from pathlib import Path
from PIL import Image, ImageOps
out = Path('assets/optimized')
out.mkdir(exist_ok=True)
# Focal points checked against the supplied photographs, not a uniform centre crop.
focal = {'work-01': (0.50, 0.48), 'work-02': (0.50, 0.50),
         'work-03': (0.50, 0.48), 'work-04': (0.50, 0.40)}
for name in [*focal, 'service-split']:
    image = ImageOps.exif_transpose(Image.open(f'assets/{name}.jpg')).convert('RGB')
    if name in focal:
        # Consistent editorial landscape frames; a gentle 4% zoom for the bakkie.
        w = round(image.width * (0.96 if name == 'work-03' else 1))
        h = round(w * 3 / 4)
        x, y = focal[name]
        left = max(0, min(image.width-w, round(image.width*x-w/2)))
        top = max(0, min(image.height-h, round(image.height*y-h/2)))
        image = image.crop((left, top, left+w, top+h))
    for width in (480, 800, 1200):
        resized = image.resize((width, round(image.height*width/image.width)), Image.Resampling.LANCZOS)
        path = out / f'{name}-{width}.webp'
        resized.save(path, 'WEBP', quality=80, method=6)
        print(path, resized.size, path.stat().st_size)
