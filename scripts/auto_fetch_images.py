import sqlite3
import json
import urllib.request
import urllib.parse
from urllib.error import HTTPError
import time

DB_PATH = r"c:\work\circumsurvey\advocacy-shell\.wrangler\state\v3\d1\miniflare-D1DatabaseObject\b962ca6cee646f5a39c9d0527da20677cf1aa06607b728bfd461c3b018e6109d.sqlite"

def get_wikipedia_image(name):
    # Try to search wikipedia for the person
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(name)}&prop=pageimages&format=json&pithumbsize=500"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        data = json.loads(res.read())
        pages = data.get('query', {}).get('pages', {})
        for page_id, page_data in pages.items():
            if 'thumbnail' in page_data:
                return page_data['thumbnail']['source']
    except Exception as e:
        pass
    return None

def get_favicon(url):
    if not url: return None
    try:
        domain = urllib.parse.urlparse(url).netloc
        if not domain:
            return None
        return f"https://www.google.com/s2/favicons?domain={domain}&sz=128"
    except Exception:
        return None

def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute("SELECT id, type, name, url, image_url FROM entities WHERE image_url IS NULL OR image_url = ''")
    rows = c.fetchall()
    
    print(f"Found {len(rows)} entities missing images.")
    
    updated_count = 0
    for i, row in enumerate(rows):
        ent_id, ent_type, name, url, img = row
        
        print(f"[{i}/{len(rows)}] Trying: {name}")
        
        if ent_type in ['organization', 'publication']:
            new_img = get_favicon(url)
        else:
            new_img = get_wikipedia_image(name)
        
        if new_img:
            print(f"Found image for {name}: {new_img}")
            c.execute("UPDATE entities SET image_url = ? WHERE id = ?", (new_img, ent_id))
            updated_count += 1
            conn.commit()
            
        time.sleep(0.3) # rate limit

        
    print(f"Successfully updated {updated_count} entities.")
    conn.close()

if __name__ == '__main__':
    main()
