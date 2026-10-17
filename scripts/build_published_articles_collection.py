import json
import re
import os

def classify_series(doc_id, title, author, category):
    combined = f"{doc_id} {title} {author} {category}".lower()
    
    # 1. Clinical Anatomy & Histology
    if any(k in combined for k in [
        'taylor', 'sorrells', 'cold', 'cepeda', 'lakshmanan', 'ridged band',
        'meissner', 'innervation', 'histolog', 'mucosa', 'anatomy', 'nerve', 'somatosensory'
    ]) and not any(k in combined for k in ['huff', 'adler', 'law', 'complaint']):
        return 'Clinical Anatomy & Histology'
        
    # 2. Neonatal Pain & Neurobiology
    if any(k in combined for k in [
        'anand', 'taddio', 'gunnar', 'dixon', 'pain in infant', 'stress response',
        'neurobiology', 'analgesia', 'behavioural depression', 'cortisol'
    ]):
        return 'Neonatal Pain & Neurobiology'
        
    # 3. Constitutional Law & Impact Litigation
    if any(k in combined for k in [
        'huff', 'adler', 'law', 'litigat', 'legal', 'criminal assault', 'constitutional',
        'tort', 'complaint', 'jurisprudence', 'medicaid', 'attorney', 'court', 'equal protection'
    ]):
        return 'Constitutional Law & Impact Litigation'
        
    # 4. Psychological Trauma & Awakenings
    if any(k in combined for k in [
        'goldman', 'hammond-carmack', 'global survey', 'trauma', 'psychological',
        'ptsd', 'harm', 'loss', 'grief', 'restorer', 'sardi', 'rhoden', 'sexual mutilation'
    ]) and not any(k in combined for k in ['denniston', 'symposium']):
        return 'Psychological Trauma & Awakenings'
        
    # 5. Pediatric Complications & Epidemiology
    if any(k in combined for k in [
        'fendereski', 'frisch', 'complication', 'epidemiology', 'cohort', 'claims',
        'van howe', 'vanhowe', 'meatal stenosis', 'infection', 'adverse', 'el bcheraoui',
        'bcheraoui', 'autism', 'adhd', 'risk'
    ]):
        return 'Pediatric Complications & Epidemiology'
        
    # 6. Movement Symposia & Restoration
    if any(k in combined for k in [
        'milos', 'denniston', 'symposi', 'conference', 'restoration', 'fletcher',
        'bigelow', 'uncircumcising', 'tissue expansion', 'proceedings', 'norm'
    ]):
        return 'Movement Symposia & Restoration'
        
    # 7. Medical Policy & Bioethics (Default for guidelines, ethics, statements)
    return 'Medical Policy & Bioethics'

def main():
    print("Loading public/api_mock.json...")
    with open('public/api_mock.json', 'r', encoding='utf-8') as f:
        mock_docs = json.load(f)
        
    canon_docs = []
    other_docs = []
    
    for d in mock_docs:
        meta = json.loads(d.get('metadata_json', '{}')) if isinstance(d.get('metadata_json'), str) else d.get('metadata_json', {})
        is_canon = (
            meta.get('curated_seed') or 
            meta.get('archive_source') or 
            'taylor-lockwood' in d['id'] or 
            'sorrells' in d['id'] or
            d.get('series') == 'Canon Research & Bioethics' or
            d.get('series') == 'Clinical Anatomy'
        )
        if is_canon:
            canon_docs.append(d)
        else:
            other_docs.append(d)
            
    print(f"Identified {len(canon_docs)} canon documents.")
    
    series_counts = {}
    updated_canon = []
    
    for d in canon_docs:
        meta = json.loads(d.get('metadata_json', '{}')) if isinstance(d.get('metadata_json'), str) else d.get('metadata_json', {})
        author = meta.get('author', '')
        title = d.get('title', '')
        cat = meta.get('category', '')
        
        series = classify_series(d['id'], title, author, cat)
        series_counts[series] = series_counts.get(series, 0) + 1
        
        d['series'] = series
        d['source_collection'] = f"Published Canon: {series}"
        if d.get('type') not in ['medical_journal', 'legal_filing', 'academic_journal', 'book']:
            if 'law' in series.lower() or 'legal' in series.lower():
                d['type'] = 'legal_filing'
            else:
                d['type'] = 'medical_journal'
                
        meta['series'] = series
        meta['collection'] = 'Curated Published Articles & Legal Filings'
        d['metadata_json'] = json.dumps(meta)
        updated_canon.append(d)
        
    print("\nSeries distribution for Curated Published Articles:")
    for s, count in sorted(series_counts.items()):
        print(f"  - {s}: {count} papers")
        
    # Build collection object
    collection_obj = {
        "collection": {
            "id": "published-articles",
            "slug": "published-articles",
            "canonicalSlug": "published-articles",
            "title": "Curated Published Articles & Legal Filings",
            "subtitle": "Medical Journals, Clinical Cohorts & Constitutional Briefs (1975–2026)",
            "institution": "Peer-Reviewed Medical Literature & Legal Records",
            "curator": "Tim Hammond, Tone Pettit & Research Contributors",
            "itemCount": f"{len(updated_canon)} peer-reviewed papers & filings",
            "description": "The premier digital collection of seminal peer-reviewed medical papers, histological micro-anatomy discoveries (Taylor 1996, Sorrells 2007, Cepeda 2025), neonatal pain science (Anand 1987), large-scale epidemiological cohorts (Fendereski 2024), European pediatric whistleblower rebuttals (Frisch 2013), and landmark federal equal protection litigation (Huff v. Colorado).",
            "created_at": "2026-10-16 17:15:00"
        },
        "documents": updated_canon,
        "total": len(updated_canon)
    }
    
    # Save public/api_collections_published-articles_mock.json
    output_path = 'public/api_collections_published-articles_mock.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(collection_obj, f, indent=2)
    print(f"\nWrote {output_path} with {len(updated_canon)} documents.")
    
    # Update public/api_mock.json with updated canon docs
    merged_all = updated_canon + other_docs
    with open('public/api_mock.json', 'w', encoding='utf-8') as f:
        json.dump(merged_all, f, indent=2)
    print(f"Updated public/api_mock.json (total {len(merged_all)} records).")

if __name__ == '__main__':
    main()
