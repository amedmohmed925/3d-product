import cv2
import os

video_path = r"c:\Users\NewAdmin\Downloads\product_frames\product_frames\Orange_drink_bottle_commercial_1080p_20260917215823.mp4"
output_dir = r"d:\product3D\assets\frames"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Clear old frames first
for f in os.listdir(output_dir):
    if f.endswith('.webp') or f.endswith('.png'):
        os.remove(os.path.join(output_dir, f))

cap = cv2.VideoCapture(video_path)
frame_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # Save frame
    frame_count += 1
    # We pad the frame number with 3 zeros like frame_001.webp
    out_path = os.path.join(output_dir, f"frame_{frame_count:03d}.webp")
    # Using quality 80 for WebP (good balance between quality and size)
    cv2.imwrite(out_path, frame, [cv2.IMWRITE_WEBP_QUALITY, 80])

cap.release()
print(f"Extracted {frame_count} frames.")
