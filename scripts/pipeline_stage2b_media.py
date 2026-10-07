import os
import sys
import json
import argparse
import subprocess
import time
from google import genai
from google.genai import types

# Force UTF-8 encoding for Windows console
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Load .env.local if present
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env.local")
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                key, val = line.strip().split('=', 1)
                os.environ[key] = val

if "GEMINI_API_KEY" not in os.environ:
    print("Error: GEMINI_API_KEY environment variable is not set. Please add it to .env.local")
    sys.exit(1)

client = genai.Client()

MEDIA_EXTENSIONS = {'.mp4', '.mov', '.mpg', '.mpeg', '.mkv', '.avi', '.mp3', '.wav', '.m4a'}

def extract_audio(video_path, output_audio_path):
    """Uses ffmpeg to extract and compress audio from a video file."""
    print(f"    Extracting audio using ffmpeg...")
    # -y (overwrite), -vn (no video), -acodec libmp3lame (mp3 codec), -q:a 2 (good quality)
    command = [
        "ffmpeg", "-y", "-i", video_path,
        "-vn", "-acodec", "libmp3lame", "-q:a", "2",
        output_audio_path
    ]
    try:
        subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except subprocess.CalledProcessError as e:
        print(f"    [ERROR] ffmpeg failed: {e}")
        return False
    except FileNotFoundError:
        print(f"    [ERROR] ffmpeg is not installed or not in PATH.")
        return False

def transcribe_audio(audio_path):
    """Uploads audio to Gemini File API, waits for processing, and transcribes."""
    print(f"    Uploading audio to Gemini File API...")
    try:
        gemini_file = client.files.upload(file=audio_path)
        print(f"    Uploaded as {gemini_file.name}. Waiting for processing...")
        
        # Poll until active
        while True:
            gemini_file = client.files.get(name=gemini_file.name)
            if gemini_file.state.name == "ACTIVE":
                break
            elif gemini_file.state.name == "FAILED":
                print("    [ERROR] Gemini failed to process the audio file.")
                return None
            time.sleep(5)
            
        print(f"    File active. Requesting transcription...")
        prompt = "Transcribe this audio accurately. Do not include conversational filler like 'um' or 'uh'. Break it into logical paragraphs. If there is no spoken word, simply return '[No speech detected]'."
        
        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=[gemini_file, prompt]
        )
        
        print(f"    Transcription complete. Deleting file from Gemini...")
        client.files.delete(name=gemini_file.name)
        
        return response.text
    except Exception as e:
        print(f"    [ERROR] API Error during transcription: {e}")
        return None

def process_inventory(inventory_path, limit=None):
    if not os.path.exists(inventory_path):
        print(f"Error: Inventory not found at {inventory_path}")
        return

    with open(inventory_path, 'r', encoding='utf-8') as f:
        inventory = json.load(f)

    inventory_dir = os.path.dirname(inventory_path)
    staging_extracted_dir = os.path.join(os.path.dirname(inventory_dir), "extracted")
    extract_folder_name = os.path.basename(inventory_path).split('_inventory')[0]
    extract_dir = os.path.join(staging_extracted_dir, extract_folder_name)

    files_to_process = [f for f in inventory["files"] if f["extension"].lower() in MEDIA_EXTENSIONS and not f.get("is_exact_duplicate")]
    
    if limit:
        files_to_process = files_to_process[:limit]
        
    print(f"Found {len(files_to_process)} media files to process.")
    
    for idx, file_info in enumerate(files_to_process, 1):
        rel_path = file_info["relative_path"]
        filepath = os.path.join(extract_dir, rel_path)
        print(f"\n[{idx}/{len(files_to_process)}] Processing {rel_path}...")
        
        # Define paths
        temp_audio_path = os.path.join(extract_dir, f"temp_audio_{idx}.mp3")
        txt_rel_path = rel_path + ".txt"
        txt_abs_path = os.path.join(extract_dir, txt_rel_path)
        
        # 1. Extract Audio
        if not extract_audio(filepath, temp_audio_path):
            continue
            
        # 2. Transcribe
        transcript = transcribe_audio(temp_audio_path)
        
        # Cleanup temp audio
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
            
        if transcript:
            # 3. Save transcript
            with open(txt_abs_path, 'w', encoding='utf-8') as tf:
                tf.write(transcript)
                
            file_info["extracted_text_path"] = txt_rel_path.replace("\\", "/")
            # Also set the Cloudflare Stream URL placeholder for manual dashboard upload
            # Alternatively, if you want to use the API later, we can hook it here.
            file_info["cloudflare_stream_url"] = "PENDING_CLOUDFLARE_STREAM_UPLOAD"
            print(f"    -> Saved transcript ({len(transcript)} chars).")
        else:
            print(f"    -> Failed to transcribe.")

    # Save enriched inventory
    out_path = inventory_path.replace("_inventory", "_inventory_stage2b_media")
    # If the original didn't have "_inventory" as a clean suffix, just append
    if out_path == inventory_path:
        out_path = inventory_path.replace(".json", "_stage2b_media.json")
        
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(inventory, f, indent=2)

    print(f"\nStage 2B (Media Transcription) Complete!")
    print(f"Saved media inventory to: {out_path}")
    print("\nNext step: Run `python scripts/pipeline_stage3b_enrich.py` on this new JSON to extract metadata,")
    print("then `pipeline_stage3c_upload.py` to vectorize and insert into D1.")
    print("For the video files themselves, please upload them via your Cloudflare Stream dashboard,")
    print("and replace the 'PENDING_CLOUDFLARE_STREAM_UPLOAD' placeholder in the Digital Library UI.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract audio from large video files and transcribe using Gemini.")
    parser.add_argument("inventory_path", help="Path to the inventory.json file (e.g. pipeline_staging/inventory/...)")
    parser.add_argument("--limit", type=int, default=None, help="Process only first N files (for testing)")
    
    args = parser.parse_args()
    process_inventory(args.inventory_path, args.limit)
