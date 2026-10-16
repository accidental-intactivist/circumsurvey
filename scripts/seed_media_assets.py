import sqlite3
import glob
import os
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATTERN = os.path.join(ROOT, '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject', '*.sqlite')

ASSETS = [
    # Surgical Tools & Clamps Schematics
    {
        "id": "gomco-patent-1935",
        "doc_id": "umass-ms1205-raw-efbf6dd4",
        "doc_title": "Goldstein & Yellen Gomco Clamp (U.S. Patent 1,935,188)",
        "page_number": 1,
        "image_url": "/figures/gomco-clamp-schematic.svg",
        "caption": "Gomco Circumcision Clamp Engineering Schematic (1935): Illustrating metal bell, aperture plate, and 20,000 psi circumferential crush mechanism",
        "category": "diagram",
        "keywords": json.dumps(["gomco", "clamp", "patent", "yellen", "goldstein", "surgical", "tool", "crush", "hemostasis", "aperture"]),
        "is_sensitive": 0
    },
    {
        "id": "mogen-schematic-1954",
        "doc_id": "fda-mhn-2000-mogen",
        "doc_title": "Mogen Clamp Guillotine Slit & Blind Entrapment Cross-Section",
        "page_number": 1,
        "image_url": "/figures/mogen-clamp-schematic.svg",
        "caption": "Mogen Clamp Cross-Section: 2.5 mm blind slotted guillotine shield and glans entrapment hazard zone (FDA Public Health Notice 2000)",
        "category": "diagram",
        "keywords": json.dumps(["mogen", "clamp", "bronstein", "guillotine", "blind slit", "glans amputation", "iatrogenic", "fda", "tool"]),
        "is_sensitive": 0
    },
    {
        "id": "plastibell-schematic-1960",
        "doc_id": "plastibell-device-dossier",
        "doc_title": "Hollister Plastibell Circumcision Device Schematic",
        "page_number": 1,
        "image_url": "/figures/plastibell-device-schematic.svg",
        "caption": "Plastibell Circumcision Device: Ischemic necrosis ligature ring, snap-off handle, and proximal migration / impaction risk profile",
        "category": "diagram",
        "keywords": json.dumps(["plastibell", "hollister", "ligature", "ischemic necrosis", "strangulation", "ring migration", "device", "tool"]),
        "is_sensitive": 0
    },
    # Micrograph Specimens
    {
        "id": "8d5a920fe2bd9c7d",
        "doc_id": "8d5a920fe2bd9c7d",
        "doc_title": "Cepeda-Emiliani et al. (2025), Andrology",
        "page_number": 4,
        "image_url": "/figures/8d5a920fe2bd9c7d.webp",
        "caption": "Immunohistochemistry: S100, CD56, PGP9.5 & PAN-TRK demonstrating dense peripheral nerve bundles and Schwann cell sheaths in prepuce",
        "category": "histology",
        "keywords": json.dumps(["microscopy", "histology", "nerve", "s100", "cd56", "schwann", "innervation", "anatomy", "andrology"]),
        "is_sensitive": 0
    },
    {
        "id": "0bce81d4b2f610e3",
        "doc_id": "0bce81d4b2f610e3",
        "doc_title": "Cepeda-Emiliani et al. (2025), Andrology",
        "page_number": 5,
        "image_url": "/figures/0bce81d4b2f610e3.webp",
        "caption": "Fetal & Perinatal Nerve Architecture (NF / SOX10 / CD56): Dual-stain confocal showing complete and active peripheral innervation at birth",
        "category": "histology",
        "keywords": json.dumps(["fetal", "perinatal", "neurofilament", "sox10", "cd56", "confocal", "nerve", "anatomy", "histology"]),
        "is_sensitive": 0
    },
    {
        "id": "48ab95770483e073",
        "doc_id": "48ab95770483e073",
        "doc_title": "Cepeda-Emiliani et al. (2025), Andrology",
        "page_number": 6,
        "image_url": "/figures/48ab95770483e073.webp",
        "caption": "Subepithelial & Dermal Sensory Nerve Networks: High-power immunoreactivity showing delicate sensory web transducing mechanosensory touch",
        "category": "histology",
        "keywords": json.dumps(["subepithelial", "dermal", "sensory", "pgp9.5", "ngfr", "fine touch", "mechanoreceptor", "histology"]),
        "is_sensitive": 0
    },
    {
        "id": "0e26b020c7876475",
        "doc_id": "0e26b020c7876475",
        "doc_title": "Cepeda-Emiliani et al. (2025), Andrology",
        "page_number": 7,
        "image_url": "/figures/0e26b020c7876475.webp",
        "caption": "Frenular & Coronal Innervation Cross-Sections: Detailed micrographs of frenular nerve bundles and microvascular architecture",
        "category": "histology",
        "keywords": json.dumps(["frenulum", "coronal", "lymphatics", "innervation", "microscopy", "nerve", "erogenous", "histology"]),
        "is_sensitive": 0
    },
    {
        "id": "edd5e6e267a419cb",
        "doc_id": "edd5e6e267a419cb",
        "doc_title": "Cepeda-Emiliani et al. (2025), Andrology",
        "page_number": 8,
        "image_url": "/figures/edd5e6e267a419cb.webp",
        "caption": "Ontogenetic Progression of Penile Innervation: Progressive elongation of sensory fibers leading to mature encapsulated corpuscles",
        "category": "diagram",
        "keywords": json.dumps(["ontogenetic", "development", "corpuscle", "timeline", "innervation", "sensory", "biology"]),
        "is_sensitive": 0
    }
]

def seed_db(db_path):
    print(f"Connecting to: {os.path.basename(db_path)}")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      doc_id TEXT NOT NULL,
      doc_title TEXT,
      page_number INTEGER,
      bounding_box TEXT,
      image_url TEXT NOT NULL,
      caption TEXT,
      category TEXT,
      keywords TEXT,
      is_sensitive INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_media_doc_id ON media_assets(doc_id);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_media_category ON media_assets(category);")

    inserted = 0
    for a in ASSETS:
        cur.execute("""
        INSERT OR REPLACE INTO media_assets 
        (id, doc_id, doc_title, page_number, bounding_box, image_url, caption, category, keywords, is_sensitive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            a["id"], a["doc_id"], a["doc_title"], a["page_number"],
            None, a["image_url"], a["caption"], a["category"],
            a["keywords"], a["is_sensitive"]
        ))
        inserted += 1

    conn.commit()
    conn.close()
    print(f"  Inserted/Updated {inserted} media assets.")

def main():
    dbs = [f for f in glob.glob(DB_PATTERN) if 'metadata' not in f]
    if not dbs:
        print("No local D1 sqlite databases found.")
        return
    for db in dbs:
        seed_db(db)
    print("Seeding completed successfully.")

if __name__ == "__main__":
    main()
