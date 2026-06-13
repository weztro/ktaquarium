import shutil
import os

# Map from (source, destination)
copies = [
    # Fish
    ("public/fish/betta.jpg", "public/fish/discus.jpg"),
    ("public/fish/flowerhorn.jpg", "public/fish/oscar.jpg"),

    # Categories
    ("public/categories/freshwater.jpg", "public/categories/planted.jpg"),
    ("public/categories/reef.jpg", "public/categories/custom.jpg"),

    # Projects
    ("public/projects/reef-wall.jpg", "public/projects/corporate-reef.jpg"),
    ("public/gallery/aquascaping-2.jpg", "public/projects/zen-forest.jpg"),

    # Showcase
    ("public/gallery/aquascaping-2.jpg", "public/showcase/primeval-valley.jpg"),
    ("public/showcase/oceanic-cube.jpg", "public/showcase/atoll-reef.jpg"),

    # Gallery
    ("public/gallery/aquascaping-2.jpg", "public/gallery/aquascaping-1.jpg"),
    ("public/gallery/freshwater-1.jpg", "public/gallery/planted-1.jpg"),
    ("public/gallery/reef-1.jpg", "public/gallery/reef-2.jpg")
]

print("Starting asset fallback copies...")
for src, dest in copies:
    if not os.path.exists(src):
        print(f"Warning: Source {src} does not exist!")
        continue
    try:
        shutil.copy2(src, dest)
        print(f"Copied {src} -> {dest}")
    except Exception as e:
        print(f"Failed to copy {src} to {dest}: {e}")

print("Asset fallback copy completed.")
