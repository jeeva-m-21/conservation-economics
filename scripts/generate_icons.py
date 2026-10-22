#!/usr/bin/env python3
"""
Generate PWA icons (SVG and PNG) for NPTEL Quiz Platform — Conservation Economics.
"""
from PIL import Image, ImageDraw
import os

os.makedirs("public/icons", exist_ok=True)

# SVG Icon
svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f766e" />
      <stop offset="100%" stop-color="#115e59" />
    </linearGradient>
  </defs>
  <!-- Background squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bg)" />
  
  <!-- Outer accent ring -->
  <rect x="12" y="12" width="488" height="488" rx="100" fill="none" stroke="#2dd4bf" stroke-width="6" opacity="0.25" />

  <!-- Book & Leaf Motif in Clean White -->
  <g transform="translate(106, 116)" fill="none" stroke="#ffffff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round">
    <!-- Left Book Page -->
    <path d="M20 70 C 70 50, 120 50, 150 75 L 150 250 C 120 225, 70 225, 20 245 Z" fill="rgba(255,255,255,0.08)" />
    
    <!-- Right Book Page -->
    <path d="M280 70 C 230 50, 180 50, 150 75 L 150 250 C 180 225, 230 225, 280 245 Z" fill="rgba(255,255,255,0.08)" />
    
    <!-- Spine Center -->
    <line x1="150" y1="75" x2="150" y2="250" />
    
    <!-- Sprout / Leaf growing from the book center -->
    <path d="M150 170 C 150 110, 185 80, 215 80 C 215 120, 190 145, 150 170 Z" fill="#2dd4bf" stroke="#2dd4bf" stroke-width="12" />
    <path d="M150 140 C 150 95, 120 70, 95 70 C 95 105, 115 125, 150 140 Z" fill="#5eead4" stroke="#5eead4" stroke-width="12" />
  </g>
</svg>"""

with open("public/icons/icon.svg", "w") as f:
    f.write(svg_content)

with open("public/favicon.svg", "w") as f:
    f.write(svg_content)

def draw_png_icon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Scale factor
    s = size / 512.0
    radius = int(112 * s)

    # Background rounded rect
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=(15, 118, 110, 255))
    
    # Inner border
    pad = int(8 * s)
    draw.rounded_rectangle([pad, pad, size - 1 - pad, size - 1 - pad], radius=radius - pad, outline=(45, 212, 191, 70), width=int(4 * s))

    # Center motif
    # Center spine
    cx, cy = size // 2, size // 2
    w_line = max(2, int(16 * s))
    
    # Left page outline
    p1 = (int(cx - 90 * s), int(cy - 60 * s))
    p2 = (cx, int(cy - 40 * s))
    p3 = (cx, int(cy + 80 * s))
    p4 = (int(cx - 90 * s), int(cy + 60 * s))
    draw.polygon([p1, p2, p3, p4], outline=(255, 255, 255, 240), fill=(255, 255, 255, 25), width=max(2, int(10 * s)))

    # Right page outline
    pr1 = (int(cx + 90 * s), int(cy - 60 * s))
    pr2 = (cx, int(cy - 40 * s))
    pr3 = (cx, int(cy + 80 * s))
    pr4 = (int(cx + 90 * s), int(cy + 60 * s))
    draw.polygon([pr1, pr2, pr3, pr4], outline=(255, 255, 255, 240), fill=(255, 255, 255, 25), width=max(2, int(10 * s)))

    # Spine line
    draw.line([(cx, int(cy - 40 * s)), (cx, int(cy + 80 * s))], fill=(255, 255, 255, 255), width=max(2, int(12 * s)))

    # Central leaf sprout
    leaf_pts = [(cx, int(cy + 20 * s)), (int(cx + 45 * s), int(cy - 30 * s)), (cx, int(cy - 50 * s))]
    draw.polygon(leaf_pts, fill=(45, 212, 191, 255))

    return img

img_192 = draw_png_icon(192)
img_192.save("public/icons/icon-192.png", "PNG")

img_512 = draw_png_icon(512)
img_512.save("public/icons/icon-512.png", "PNG")

img_maskable = draw_png_icon(512)
img_maskable.save("public/icons/maskable-512.png", "PNG")

img_favicon = draw_png_icon(48)
img_favicon.save("public/favicon.ico", "ICO")

print("Generated PWA icons in public/icons and public/favicon.ico")
