import os
import urllib.request

# Create folders
folders = [
    "public/fish",
    "public/categories",
    "public/projects",
    "public/showcase",
    "public/gallery",
    "public/avatars"
]

for folder in folders:
    os.makedirs(folder, exist_ok=True)

# List of assets to download (URL, Destination)
assets = [
    # Fish specimens
    ("https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80", "public/fish/betta.jpg"),
    ("https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?auto=format&fit=crop&w=800&q=80", "public/fish/arowana.jpg"),
    ("https://images.unsplash.com/photo-1544551763-7c97a552384a?auto=format&fit=crop&w=800&q=80", "public/fish/discus.jpg"),
    ("https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", "public/fish/flowerhorn.jpg"),
    ("https://images.unsplash.com/photo-1524704659698-92a31ef01068?auto=format&fit=crop&w=800&q=80", "public/fish/oscar.jpg"),
    ("https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80", "public/fish/goldfish.jpg"),

    # Categories
    ("https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80", "public/categories/freshwater.jpg"),
    ("https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", "public/categories/marine.jpg"),
    ("https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80", "public/categories/reef.jpg"),
    ("https://images.unsplash.com/photo-1572204179374-f3c9e6ca3a07?auto=format&fit=crop&w=800&q=80", "public/categories/planted.jpg"),
    ("https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80", "public/categories/monster.jpg"),
    ("https://images.unsplash.com/photo-1520301255226-bf5f14445124?auto=format&fit=crop&w=800&q=80", "public/categories/custom.jpg"),

    # Projects
    ("https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1200&q=80", "public/projects/reef-wall.jpg"),
    ("https://images.unsplash.com/photo-1516683018197-e8f4750b15c0?auto=format&fit=crop&w=1200&q=80", "public/projects/zen-forest.jpg"),
    ("https://images.unsplash.com/photo-1520301255226-bf5f14445124?auto=format&fit=crop&w=1200&q=80", "public/projects/corporate-reef.jpg"),

    # Showcase
    ("https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1000&q=80", "public/showcase/oceanic-cube.jpg"),
    ("https://images.unsplash.com/photo-1516683018197-e8f4750b15c0?auto=format&fit=crop&w=1000&q=80", "public/showcase/primeval-valley.jpg"),
    ("https://images.unsplash.com/photo-1520301255226-bf5f14445124?auto=format&fit=crop&w=1000&q=80", "public/showcase/atoll-reef.jpg"),

    # Gallery
    ("https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80", "public/gallery/freshwater-1.jpg"),
    ("https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", "public/gallery/marine-1.jpg"),
    ("https://images.unsplash.com/photo-1516683018197-e8f4750b15c0?auto=format&fit=crop&w=800&q=80", "public/gallery/aquascaping-1.jpg"),
    ("https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80", "public/gallery/reef-1.jpg"),
    ("https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?auto=format&fit=crop&w=800&q=80", "public/gallery/monster-1.jpg"),
    ("https://images.unsplash.com/photo-1572204179374-f3c9e6ca3a07?auto=format&fit=crop&w=800&q=80", "public/gallery/planted-1.jpg"),
    ("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80", "public/gallery/aquascaping-2.jpg"),
    ("https://images.unsplash.com/photo-1520301255226-bf5f14445124?auto=format&fit=crop&w=800&q=80", "public/gallery/reef-2.jpg"),
    ("https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80", "public/gallery/freshwater-2.jpg"),

    # Testimonials
    ("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", "public/avatars/avatar-1.jpg"),
    ("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", "public/avatars/avatar-2.jpg"),
    ("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80", "public/avatars/avatar-3.jpg"),
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}

print("Starting download of assets...")
for url, dest in assets:
    if os.path.exists(dest):
        print(f"Skipping {dest} (already exists)")
        continue
    try:
        print(f"Downloading {url} -> {dest}")
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            with open(dest, 'wb') as f:
                f.write(response.read())
        print(f"Successfully downloaded {dest}")
    except Exception as e:
        print(f"Failed to download {url}: {e}")

print("Assets download complete.")
