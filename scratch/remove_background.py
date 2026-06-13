from PIL import Image, ImageFilter
import numpy as np

def remove_background(image_path, output_path):
    print(f"Opening image: {image_path}")
    img = Image.open(image_path).convert("RGBA")
    data = np.array(img)
    
    # Extract channels
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Calculate brightness / max intensity for each pixel
    # Since the background is black, the background pixels will have very low R, G, B values.
    max_val = np.maximum(np.maximum(r, g), b)
    
    # Thresholds for transparency transition
    # Pixels below low_thresh will be 100% transparent.
    # Pixels above high_thresh will be 100% opaque (unless already transparent).
    # Pixels in between will be semi-transparent to create a smooth feathered edge.
    low_thresh = 4
    high_thresh = 35
    
    # Initialize new alpha channel
    new_a = np.zeros_like(a)
    
    # Create mask for solid, transparent, and semi-transparent regions
    transparent_mask = max_val <= low_thresh
    opaque_mask = max_val >= high_thresh
    feather_mask = ~(transparent_mask | opaque_mask)
    
    # Set alphas
    new_a[opaque_mask] = 255
    new_a[transparent_mask] = 0
    
    # Linearly interpolate alpha for the feathered edges
    # alpha = 255 * (max_val - low_thresh) / (high_thresh - low_thresh)
    scale = 255.0 / (high_thresh - low_thresh)
    new_a[feather_mask] = np.clip((max_val[feather_mask] - low_thresh) * scale, 0, 255).astype(np.uint8)
    
    # Reconstruct image data
    # To prevent dark edges on transparent pixels (fringing), we can divide the color values
    # by the alpha ratio to restore the original "un-multiplied" color.
    # We only do this for feathered areas to prevent noise amplification in very dark regions.
    new_data = np.copy(data)
    new_data[:,:,3] = new_a
    
    # Save the result
    out_img = Image.fromarray(new_data, "RGBA")
    
    # Optional: Apply slight smoothing to the alpha channel to make the edges even softer
    # We extract the alpha channel, apply a tiny Gaussian blur, and merge it back.
    alpha_channel = out_img.getchannel('A')
    alpha_blurred = alpha_channel.filter(ImageFilter.GaussianBlur(radius=0.5))
    out_img.putalpha(alpha_blurred)
    
    out_img.save(output_path, "PNG")
    print(f"Saved transparent image to: {output_path}")

if __name__ == "__main__":
    src_path = "public/hero-fish.png"
    dest_path = "public/hero-fish.png"
    remove_background(src_path, dest_path)
