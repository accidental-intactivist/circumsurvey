import os

folder = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\scratch\unpacked_mockup"

for filename in os.listdir(folder):
    filepath = os.path.join(folder, filename)
    size = os.path.getsize(filepath)
    
    with open(filepath, "rb") as f:
        head = f.read(50)
    
    print(f"File: {filename} (Size: {size} bytes)")
    print(f"  Head bytes: {head[:30]}")
    # try as text
    try:
        text = head.decode('utf-8', errors='ignore')
        print(f"  Head text: {repr(text)}")
    except Exception as e:
        print(f"  Text error: {e}")
    print("-" * 50)
