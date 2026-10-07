import sqlite3
db = sqlite3.connect('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/b962ca6cee646f5a39c9d0527da20677cf1aa06607b728bfd461c3b018e6109d.sqlite')
with open('batch_metadata.sql', 'r', encoding='utf-8') as f:
    db.executescript(f.read())
