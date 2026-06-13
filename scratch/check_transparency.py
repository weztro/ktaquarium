import os
from PIL import Image

def inspect_image(path):
    if not os.path.exists(path):
        print(f"File does not exist: {path}")
        return
    try:
        with Image.open(path) as img:
            print(f"--- {path} ---")
            print(f"Format: {img.format}")
            print(f"Mode: {img.mode}")
            print(f"Size: {img.size}")
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                alpha = img.getchannel('A')
                extrema = alpha.getextrema()
                print(f"Alpha channel extrema: {extrema} (min={extrema[0]}, max={extrema[1]})")
                # Count transparent/semi-transparent pixels
                alpha_data = list(alpha.getdata())
                transparent_count = sum(1 for a in alpha_data if a == 0)
                opaque_count = sum(1 for a in alpha_data if a == 255)
                semi_transparent_count = len(alpha_data) - transparent_count - opaque_count
                print(f"Pixel counts: Total={len(alpha_data)}, Transparent={transparent_count}, Opaque={opaque_count}, Semi-Transparent={semi_transparent_count}")
            else:
                print("No alpha channel present.")
    except Exception as e:
        print(f"Error inspecting {path}: {e}")

if __name__ == "__main__":
    inspect_image("public/heroMain.png")
    inspect_image("public/hero.png")
    
    # Check artifacts
    artifact_dir = "C:/Users/Hp/.gemini/antigravity/brain/a5889547-8e02-4341-a111-952ded4a7c94"
    inspect_image(os.path.join(artifact_dir, "media__1781199896831.png"))
    inspect_image(os.path.join(artifact_dir, "media__1781203067846.png"))
