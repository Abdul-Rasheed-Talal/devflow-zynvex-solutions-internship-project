import os
from PIL import Image, ImageDraw, ImageFont

def draw_logo(size):
    """Draws the DevFlow vector-style logo on a square canvas of given size."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    scale = size / 512.0
    
    # Background rounded rect
    rx = int(112 * scale)
    draw.rounded_rectangle([0, 0, size, size], radius=rx, fill=(15, 23, 42, 255))
    
    # Subtle border
    border_w = max(1, int(16 * scale))
    draw.rounded_rectangle(
        [int(12 * scale), int(12 * scale), size - int(12 * scale), size - int(12 * scale)],
        radius=int(100 * scale),
        outline=(30, 41, 59, 255),
        width=border_w
    )
    
    # Points
    p_orig = (int(160 * scale), int(256 * scale))
    p_top = (int(256 * scale), int(176 * scale))
    p_bot = (int(256 * scale), int(336 * scale))
    p_dest = (int(352 * scale), int(256 * scale))
    
    line_w = max(2, int(26 * scale))
    
    # Connecting branches
    draw.line([p_orig, p_top], fill=(59, 130, 246, 255), width=line_w)
    draw.line([p_orig, p_bot], fill=(59, 130, 246, 255), width=line_w)
    draw.line([p_top, p_dest], fill=(96, 165, 250, 255), width=line_w)
    draw.line([p_bot, p_dest], fill=(96, 165, 250, 255), width=line_w)
    
    # Dashed center chord (draw 4 segments)
    chord_w = max(1, int(18 * scale))
    draw.line([p_top, p_bot], fill=(37, 99, 235, 255), width=chord_w)
    
    # Node 1: Origin
    r1 = max(4, int(42 * scale))
    draw.ellipse([p_orig[0]-r1, p_orig[1]-r1, p_orig[0]+r1, p_orig[1]+r1], fill=(30, 41, 59, 255), outline=(59, 130, 246, 255), width=max(1, int(14 * scale)))
    r1_in = max(2, int(18 * scale))
    draw.ellipse([p_orig[0]-r1_in, p_orig[1]-r1_in, p_orig[0]+r1_in, p_orig[1]+r1_in], fill=(255, 255, 255, 255))
    
    # Node 2: Top
    r2 = max(4, int(38 * scale))
    draw.ellipse([p_top[0]-r2, p_top[1]-r2, p_top[0]+r2, p_top[1]+r2], fill=(30, 41, 59, 255), outline=(96, 165, 250, 255), width=max(1, int(14 * scale)))
    r2_in = max(2, int(16 * scale))
    draw.ellipse([p_top[0]-r2_in, p_top[1]-r2_in, p_top[0]+r2_in, p_top[1]+r2_in], fill=(56, 189, 248, 255))
    
    # Node 3: Bottom
    draw.ellipse([p_bot[0]-r2, p_bot[1]-r2, p_bot[0]+r2, p_bot[1]+r2], fill=(30, 41, 59, 255), outline=(96, 165, 250, 255), width=max(1, int(14 * scale)))
    draw.ellipse([p_bot[0]-r2_in, p_bot[1]-r2_in, p_bot[0]+r2_in, p_bot[1]+r2_in], fill=(56, 189, 248, 255))
    
    # Node 4: Target Merge
    r4 = max(5, int(48 * scale))
    draw.ellipse([p_dest[0]-r4, p_dest[1]-r4, p_dest[0]+r4, p_dest[1]+r4], fill=(37, 99, 235, 255), outline=(147, 197, 253, 255), width=max(1, int(10 * scale)))
    
    # Arrow inside target
    arrow_poly = [
        (p_dest[0] - int(12 * scale), p_dest[1] - int(16 * scale)),
        (p_dest[0] + int(18 * scale), p_dest[1]),
        (p_dest[0] - int(12 * scale), p_dest[1] + int(16 * scale)),
    ]
    draw.polygon(arrow_poly, fill=(255, 255, 255, 255))
    
    return img

def create_og_image(out_path):
    """Creates a 1200x630 social media sharing preview card (OpenGraph)."""
    w, h = 1200, 630
    card = Image.new("RGB", (w, h), (15, 23, 42)) # Slate 900
    draw = ImageDraw.Draw(card)
    
    # Subtle architectural grid
    grid_spacing = 40
    for x in range(0, w, grid_spacing):
        draw.line([(x, 0), (x, h)], fill=(30, 41, 59, 120), width=1)
    for y in range(0, h, grid_spacing):
        draw.line([(0, y), (w, y)], fill=(30, 41, 59, 120), width=1)
        
    # Subtle border
    draw.rectangle([16, 16, w - 16, h - 16], outline=(51, 65, 85), width=2)
    
    # Paste DevFlow Logo
    logo = draw_logo(160)
    card.paste(logo, (80, 80), mask=logo)
    
    # Badges
    badge_bg = (30, 41, 59)
    badge_border = (59, 130, 246)
    draw.rounded_rectangle([270, 95, 520, 135], radius=6, fill=badge_bg, outline=badge_border, width=1)
    draw.text((285, 106), "AI-POWERED PLATFORM", fill=(147, 197, 253))
    
    draw.rounded_rectangle([535, 95, 730, 135], radius=6, fill=(30, 58, 138), outline=(96, 165, 250), width=1)
    draw.text((550, 106), "ENTERPRISE SAAS", fill=(219, 234, 254))
    
    # Brand Title
    draw.text((270, 150), "DevFlow", fill=(255, 255, 255))
    
    # Main Headline
    draw.text((80, 270), "Project management for software teams.", fill=(255, 255, 255))
    
    # Subtitle / Description
    desc_line1 = "High-velocity issue tracking, interactive Kanban workflows, GitHub sync,"
    desc_line2 = "and automated AI project health diagnostics for engineering teams."
    draw.text((80, 335), desc_line1, fill=(148, 163, 184))
    draw.text((80, 370), desc_line2, fill=(148, 163, 184))
    
    # Feature Badges Bar
    features = [
        "AI Health Engine",
        "Interactive Kanban",
        "GitHub Sync & PRs",
        "Role-Based Access (RBAC)",
        "Global Workspaces"
    ]
    cur_x = 80
    for feat in features:
        fw = len(feat) * 9 + 30
        draw.rounded_rectangle([cur_x, 440, cur_x + fw, 480], radius=8, fill=(30, 41, 59), outline=(71, 85, 105), width=1)
        draw.text((cur_x + 15, 452), feat, fill=(226, 232, 240))
        cur_x += fw + 16
        
    # Footer
    draw.line([(80, 540), (w - 80, 540)], fill=(51, 65, 85), width=1)
    draw.text((80, 560), "Built for Developers • Designed for Speed", fill=(100, 116, 139))
    draw.text((w - 280, 560), "devflow-frontend.vercel.app", fill=(96, 165, 250))
    
    card.save(out_path, "PNG", optimize=True)
    print(f"Generated {out_path}")

def main():
    public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public"))
    os.makedirs(public_dir, exist_ok=True)
    
    # 1. 180x180 Apple Touch Icon
    apple_icon = draw_logo(180)
    apple_path = os.path.join(public_dir, "apple-touch-icon.png")
    apple_icon.save(apple_path, "PNG")
    print(f"Generated {apple_path}")
    
    # 2. 32x32 Favicon PNG
    fav32 = draw_logo(32)
    fav32_path = os.path.join(public_dir, "favicon-32x32.png")
    fav32.save(fav32_path, "PNG")
    print(f"Generated {fav32_path}")

    # 3. 16x16 Favicon PNG
    fav16 = draw_logo(16)
    fav16_path = os.path.join(public_dir, "favicon-16x16.png")
    fav16.save(fav16_path, "PNG")
    print(f"Generated {fav16_path}")

    # 4. Multi-res favicon.ico (16, 32, 48, 64)
    ico_img = draw_logo(64)
    ico_path = os.path.join(public_dir, "favicon.ico")
    ico_img.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print(f"Generated {ico_path}")

    # 5. 1200x630 OpenGraph / Twitter Card Image
    og_path = os.path.join(public_dir, "og-image.png")
    create_og_image(og_path)
    print("All SEO visual assets created successfully!")

if __name__ == "__main__":
    main()
