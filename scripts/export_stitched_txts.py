import os
import json
import glob

def main():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    manifest_path = os.path.join(project_root, "scratch", "cia_foia_stitched_manifest.json")
    out_dir = os.path.join(project_root, "public", "documents", "cia_foia")
    os.makedirs(out_dir, exist_ok=True)

    if not os.path.exists(manifest_path):
        print(f"Error: manifest not found at {manifest_path}")
        return

    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    print(f"Exporting text files for {len(manifest)} dossiers to {out_dir}...")
    count = 0
    for doc in manifest:
        doc_id = doc.get("metadata_json")
        try:
            meta = json.loads(doc_id) if isinstance(doc_id, str) else {}
        except Exception:
            meta = {}
        foia_id = meta.get("foia_id") or doc.get("id", "").replace("umass-ms1205-cia-", "")
        if not foia_id:
            continue

        content = doc.get("content") or ""
        txt_path = os.path.join(out_dir, f"{foia_id}.txt")
        md_path = os.path.join(out_dir, f"{foia_id}.md")

        with open(txt_path, 'w', encoding='utf-8') as tf:
            tf.write(content)
        with open(md_path, 'w', encoding='utf-8') as mf:
            mf.write(f"# {doc.get('title', 'CIA FOIA Document')}\n\n" + content)
        count += 1

    print(f"Successfully exported {count} .txt and .md files to {out_dir}!")

if __name__ == "__main__":
    main()
