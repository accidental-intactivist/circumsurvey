import os
import json
from bs4 import BeautifulSoup
import re
import glob
import zipfile
import hashlib

def parse_umass_html(html_path):
    print(f"Reading HTML from {html_path}")
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')
    archive_items = []
    series_containers = soup.find_all('div', class_='containment top-unit')
    print(f"Found {len(series_containers)} series in manifest.")
    
    for series_container in series_containers:
        series_id = series_container.get('id')
        series_title_span = series_container.find('div', class_='main-unit').find('span')
        series_title = series_title_span.text.strip() if series_title_span else ""
        
        item_divs = soup.find_all('div', id=re.compile(f'^{series_id}-\d+$'))
        for idx, item in enumerate(item_divs):
            item_id = item.get('id')
            main_unit = item.find('div', class_='main-unit')
            item_title = main_unit.find('span').text.strip() if main_unit and main_unit.find('span') else ""
            date_unit = item.find('div', class_='date-unit')
            item_date = date_unit.text.strip() if date_unit else ""
            loc_unit = item.find('div', class_='loc-unit')
            item_loc = loc_unit.text.strip() if loc_unit else ""
            
            formatted_id = f"umass-ms1205-{item_id}"
            
            record = {
                "id": formatted_id,
                "collection": "Tim Hammond Genital Autonomy Advocacy Collection",
                "series": series_title,
                "title": item_title,
                "date": item_date,
                "original_location": item_loc,
                "tags": ["Tim Hammond", "Genital Autonomy"],
                "raw_files": []
            }
            archive_items.append(record)
            
    return archive_items

def build_manifest_index(manifest_items):
    index = []
    for item in manifest_items:
        simple_title = re.sub(r'[^a-z0-9\s]', '', item['title'].lower()).strip()
        if len(simple_title) > 3: # Ignore very short titles to prevent false matches
            index.append((simple_title, item))
    return index

def fuzzy_match(filename, manifest_index):
    simple_name = re.sub(r'[^a-z0-9\s]', '', filename.lower())
    for simple_title, item in manifest_index:
        if simple_title in simple_name:
            return item
    return None

def get_base_name(filename):
    name, _ = os.path.splitext(filename)
    m = re.search(r'[-_]\d{1,4}$', name)
    if m:
        return name[:m.start()]
    return name

def process_raw_archives(raw_dir, manifest_items):
    all_records = list(manifest_items)
    manifest_index = build_manifest_index(manifest_items)
    
    zips = glob.glob(os.path.join(raw_dir, '*.zip'))
    videos = [f for f in os.listdir(raw_dir) if not f.endswith('.zip') and os.path.isfile(os.path.join(raw_dir, f))]
    
    print(f"Found {len(videos)} standalone files and {len(zips)} zip archives.")
    
    unmatched_groups = {}
    
    # Process videos
    for v in videos:
        match = fuzzy_match(v, manifest_index)
        file_meta = {"path": v, "source": "standalone"}
        if match:
            match["raw_files"].append(file_meta)
        else:
            base = get_base_name(v)
            if base not in unmatched_groups:
                unmatched_groups[base] = []
            unmatched_groups[base].append((v, "Uncategorized Videos", "", file_meta))

    # Process Zips
    for zpath in zips:
        zname = os.path.basename(zpath)
        print(f"Processing {zname}...")
        try:
            with zipfile.ZipFile(zpath, 'r') as z:
                for name in z.namelist():
                    if name.endswith('/'):
                        continue
                    
                    filename = os.path.basename(name)
                    folders = name.split('/')[:-1]
                    series_name = folders[1] if len(folders) > 1 else folders[0] if len(folders) > 0 else "Uncategorized"
                    
                    match = fuzzy_match(filename, manifest_index)
                    file_meta = {"path": name, "source": zname}
                    
                    if match:
                        match["raw_files"].append(file_meta)
                    else:
                        base = get_base_name(filename)
                        if base not in unmatched_groups:
                            unmatched_groups[base] = []
                        unmatched_groups[base].append((filename, series_name, " / ".join(folders), file_meta))
        except Exception as e:
            print(f"Error reading {zname}: {e}")

    # Build records from unmatched groups
    for base, files in unmatched_groups.items():
        # Sort files by filename so pages are in order
        files.sort(key=lambda x: x[0])
        
        # Take series and location from the first file
        _, series_name, location, _ = files[0]
        
        file_id = "umass-ms1205-raw-" + hashlib.md5(base.encode('utf-8')).hexdigest()[:8]
        
        all_records.append({
            "id": file_id,
            "collection": "Tim Hammond Genital Autonomy Advocacy Collection",
            "series": series_name,
            "title": f"Document {base}",
            "date": "",
            "original_location": location,
            "tags": ["Tim Hammond", "Genital Autonomy"],
            "raw_files": [f[3] for f in files]
        })

    return all_records

if __name__ == "__main__":
    html_file = r"C:\Users\v-apettit\.gemini\antigravity-ide\brain\d79444c3-7b41-4d0c-b191-ccf05ef5e55e\.system_generated\steps\32\content.md"
    raw_dir = r"C:\work\circumsurvey\advocacy-shell\raw_content\UMass Archives"
    output_file = r"c:\work\circumsurvey\advocacy-shell\src\data\archive_index.json"
    
    print("Parsing HTML Manifest...")
    manifest = parse_umass_html(html_file)
    
    print("Processing Raw Files and Fuzzy Matching...")
    final_records = process_raw_archives(raw_dir, manifest)
    
    print(f"Saving {len(final_records)} records to {output_file}...")
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_records, f, indent=2)
        
    print("Done!")
