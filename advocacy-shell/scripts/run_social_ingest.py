import urllib.request
import json

req = urllib.request.Request('https://www.reddit.com/r/Intactivism/new.json?limit=10', headers={'User-Agent': 'windows:org.intactivism.archive:v1.0 (by /u/apettit)'})
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())

posts = data['data']['children']
sql = []

for post in posts:
    p = post['data']
    if not p.get('selftext') and not p.get('url'):
        continue
    
    media_urls = []
    if p.get('url') and str(p['url']).lower().endswith(('.jpeg', '.jpg', '.gif', '.png')):
        media_urls.append(p['url'])
    elif p.get('thumbnail') and str(p['thumbnail']).startswith('http'):
        media_urls.append(p['thumbnail'])
        
    media_json = json.dumps(media_urls) if media_urls else 'NULL'
    
    import datetime
    date_iso = datetime.datetime.fromtimestamp(p['created_utc'], datetime.timezone.utc).isoformat().replace("+00:00", "Z")
    meta_json = json.dumps({
        'author': p.get('author'),
        'date': date_iso,
        'abstract': p.get('selftext', '')[:500]
    })
    
    def sqlstr(v):
        if v == 'NULL': return 'NULL'
        return "'" + str(v).replace("'", "''") + "'"
        
    media_val = sqlstr(media_json) if media_urls else 'NULL'
    meta_val = sqlstr(meta_json)
    
    q = f"""INSERT INTO archive_documents (id, title, source_collection, url, type, status, media_urls, metadata_json) VALUES ({sqlstr('reddit-'+p['id'])}, {sqlstr(p.get('title'))}, 'Social Media / Reddit', {sqlstr('https://reddit.com'+str(p.get('permalink')))}, 'social_post', 'pending', {media_val}, {meta_val}) ON CONFLICT(id) DO NOTHING;"""
    sql.append(q)

with open('reddit_ingest.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql))
print(f"Generated reddit_ingest.sql with {len(sql)} inserts")
