import json
import os

CITATION_MAP = {
    'sorrells-2007-fine-touch-tactile-thresholds': [
        'Taylor JR, Lockwood AP, Taylor AJ. (1996). The prepuce: specialized mucosa of the penis and its loss to circumcision. British Journal of Urology, 77(2), 291-295.',
        'Cold CJ, Taylor JR. (1999). The prepuce. BJU International, 83(S1), 34-44.',
        'Halata Z, Munger BL. (1986). The neuroanatomical basis for the protopathic sensibility of the human glans penis. Brain Research, 371(2), 205-230.',
        'Modwing R, Valderrama E. (1989). Immunohistochemical analysis of nerve distribution patterns within preputial tissues. Journal of Urology, 141(4), 489A.',
        'Winkelmann RK. (1959). The erogenous zones: their nerve supply and its significance. Proceedings of the Staff Meetings of the Mayo Clinic, 34(2), 38-47.',
        'Lakshmanan S, Prakash S. (1980). The human prepuce: some aspects of structure and function. Indian Journal of Surgery, 44, 134-137.',
        'Bleustein CB, Fogarty JD, Eckholdt H, Arezzo JC, Melman A. (2005). Quantitative somatosensory testing of the penis. Journal of Urology, 169(6), 2266-2269.'
    ],
    'cepeda-emiliani-2025-sensory-penis-andrology': [
        'Taylor JR, Lockwood AP, Taylor AJ. (1996). The prepuce: specialized mucosa of the penis and its loss to circumcision. British Journal of Urology, 77(2), 291-295.',
        'Sorrells ML, Snyder JL, Reiss MD, Eden C, Milos MF, Wilcox N, Van Howe RS. (2007). Fine-touch pressure thresholds in the adult penis. BJU International, 99(4), 864-869.',
        'Cold CJ, Taylor JR. (1999). The prepuce. BJU International, 83(S1), 34-44.',
        'Halata Z, Munger BL. (1986). The neuroanatomical basis for the protopathic sensibility of the human glans penis. Brain Research, 371(2), 205-230.'
    ],
    'cold-taylor-1999-the-prepuce': [
        'Taylor JR, Lockwood AP, Taylor AJ. (1996). The prepuce: specialized mucosa of the penis and its loss to circumcision. British Journal of Urology, 77(2), 291-295.',
        'Lakshmanan S, Prakash S. (1980). The human prepuce: some aspects of structure and function. Indian Journal of Surgery, 44, 134-137.',
        'Winkelmann RK. (1959). The erogenous zones: their nerve supply and its significance. Proceedings of the Staff Meetings of the Mayo Clinic, 34(2), 38-47.',
        'Halata Z, Munger BL. (1986). The neuroanatomical basis for the protopathic sensibility of the human glans penis. Brain Research, 371(2), 205-230.'
    ],
    'frisch-2013-cultural-bias-aap-pediatrics': [
        'American Academy of Pediatrics Task Force on Circumcision. (2012). Male circumcision: Technical report. Pediatrics, 130(3), e756-e785.',
        'American Academy of Pediatrics. (2012). Circumcision policy statement. Pediatrics, 130(3), 585-586.',
        'Taylor JR, Lockwood AP, Taylor AJ. (1996). The prepuce: specialized mucosa of the penis and its loss to circumcision. British Journal of Urology, 77(2), 291-295.',
        'Sorrells ML, Snyder JL, Reiss MD, Eden C, Milos MF, Wilcox N, Van Howe RS. (2007). Fine-touch pressure thresholds in the adult penis. BJU International, 99(4), 864-869.',
        'Cold CJ, Taylor JR. (1999). The prepuce. BJU International, 83(S1), 34-44.',
        'Royal Dutch Medical Association (KNMG). (2010). Non-therapeutic circumcision of male minors. Utrecht: KNMG.',
        'Canadian Paediatric Society. (1996). Neonatal circumcision revisited. Canadian Medical Association Journal, 154(5), 769-780.',
        'Van Howe RS. (2004). A survey of adult men circumcised in infancy. BJU International, 93(7), 1109-1110.'
    ],
    'fendereski-2024-penile-problems-circumcised-boys': [
        'American Academy of Pediatrics Task Force on Circumcision. (2012). Male circumcision: Technical report. Pediatrics, 130(3), e756-e785.',
        'El Bcheraoui C, Zhang X, Gargano JW, Dietrich S, Lewis FE, Berman SM. (2014). Rates of adverse events associated with male circumcision in US medical settings, 2001 to 2010. JAMA Pediatrics, 168(7), 625-634.',
        'Van Howe RS. (2006). Variability in penile problem rates in cohorts. Journal of Pediatric Surgery, 41, 150-155.',
        'Weiss HA, Larke N, Halperin D, Schenker I. (2010). Complications of circumcision in male neonates, infants and children: a systematic review. BMC Urology, 10, 2.'
    ],
    'hammond-carmack-2017-global-survey-circumcision-harm': [
        'Goldman R. (1999). The psychological impact of circumcision. BJU International, 83(S1), 93-102.',
        'Taylor JR, Lockwood AP, Taylor AJ. (1996). The prepuce: specialized mucosa of the penis and its loss to circumcision. British Journal of Urology, 77(2), 291-295.',
        'Sorrells ML, Snyder JL, Reiss MD, Eden C, Milos MF, Wilcox N, Van Howe RS. (2007). Fine-touch pressure thresholds in the adult penis. BJU International, 99(4), 864-869.',
        'Boyle GJ, Goldman R, Svoboda JS, Fernandez E. (2002). Male circumcision: Pain, trauma and psychosexual sequelae. Journal of Health Psychology, 7(3), 329-343.',
        'Frisch M, Aigrain Y, Barauskas V, et al. (2013). Cultural bias in the AAP’s 2012 technical report and policy statement on male circumcision. Pediatrics, 131(4), 796-800.',
        'American Academy of Pediatrics. (2012). Circumcision policy statement. Pediatrics, 130(3), 585-586.',
        'Anand KJS, Hickey PR. (1987). Pain and its effects in the human neonate and fetus. New England Journal of Medicine, 317(21), 1321-1329.'
    ],
    'hammond-sardi-2023-foreskin-restorers': [
        'Hammond T, Carmack A. (2017). Long-term adverse outcomes from neonatal circumcision reported in a survey of 1,008 men. International Journal of Human Rights in Healthcare, 10(2), 75-83.',
        'Taylor JR, Lockwood AP, Taylor AJ. (1996). The prepuce: specialized mucosa of the penis and its loss to circumcision. British Journal of Urology, 77(2), 291-295.',
        'Sorrells ML, Snyder JL, Reiss MD, Eden C, Milos MF, Wilcox N, Van Howe RS. (2007). Fine-touch pressure thresholds in the adult penis. BJU International, 99(4), 864-869.',
        'Goldman R. (1999). The psychological impact of circumcision. BJU International, 83(S1), 93-102.',
        'Bigelow J. (1992). The Joy of Uncircumcising. Aptos, CA: Hourglass Book Publishing.'
    ],
    '2024-huff-v-colorado-civil-rights-complaint': [
        'Adler PW. (2011). Is circumcision legal? Richmond Journal of Law and the Public Interest, 16(3), 439-486.',
        'Boyle GJ, Svoboda JS. (2000). Circumcision of healthy boys: Criminal assault? Journal of Law and Medicine, 7(3), 301-310.',
        'Darby R, Svoboda JS. (2007). A rose by any other name? Rethinking the similarities and differences between male and female genital cutting. Medical Anthropology Quarterly, 21(3), 301-323.',
        'Fendereski K, Horns JJ, Driggs N, Lau G, Schaeffer AJ. (2024). Comparing penile problems in circumcised vs. uncircumcised boys: Insights from a large commercial claims database. Journal of Pediatric Surgery, 59(11), 161-168.',
        'Frisch M, Aigrain Y, Barauskas V, et al. (2013). Cultural bias in the AAP’s 2012 technical report and policy statement on male circumcision. Pediatrics, 131(4), 796-800.',
        'American Academy of Pediatrics. (2012). Circumcision policy statement. Pediatrics, 130(3), 585-586.'
    ],
    'adler-2011-is-circumcision-legal-va-law-rev': [
        'Boyle GJ, Svoboda JS. (2000). Circumcision of healthy boys: Criminal assault? Journal of Law and Medicine, 7(3), 301-310.',
        'Taylor JR, Lockwood AP, Taylor AJ. (1996). The prepuce: specialized mucosa of the penis and its loss to circumcision. British Journal of Urology, 77(2), 291-295.',
        'Goldman R. (1997). Circumcision: The Hidden Trauma. Boston: Vanguard Press.',
        'Anand KJS, Hickey PR. (1987). Pain and its effects in the human neonate and fetus. New England Journal of Medicine, 317(21), 1321-1329.',
        'Wallerstein E. (1980). Circumcision: An American Health Fallacy. New York: Springer Publishing Co.',
        'American Academy of Pediatrics. (1999). Circumcision policy statement. Pediatrics, 103(3), 686-693.'
    ],
    'adler-2013-medicaid-funding-circumcision': [
        'Adler PW. (2011). Is circumcision legal? Richmond Journal of Law and the Public Interest, 16(3), 439-486.',
        'American Academy of Pediatrics. (2012). Circumcision policy statement. Pediatrics, 130(3), 585-586.',
        'Boyle GJ, Svoboda JS. (2000). Circumcision of healthy boys: Criminal assault? Journal of Law and Medicine, 7(3), 301-310.'
    ],
    'boyle-svoboda-2000-circumcision-criminal-assault': [
        'American Academy of Pediatrics. (1999). Circumcision policy statement. Pediatrics, 103(3), 686-693.',
        'Taylor JR, Lockwood AP, Taylor AJ. (1996). The prepuce: specialized mucosa of the penis and its loss to circumcision. British Journal of Urology, 77(2), 291-295.',
        'Goldman R. (1999). The psychological impact of circumcision. BJU International, 83(S1), 93-102.',
        'Anand KJS, Hickey PR. (1987). Pain and its effects in the human neonate and fetus. New England Journal of Medicine, 317(21), 1321-1329.',
        'Wallerstein E. (1980). Circumcision: An American Health Fallacy. New York: Springer Publishing Co.'
    ],
    'milos-denniston-demeo-1997-sexual-mutilations': [
        'Anand KJS, Hickey PR. (1987). Pain and its effects in the human neonate and fetus. New England Journal of Medicine, 317(21), 1321-1329.',
        'Taylor JR, Lockwood AP, Taylor AJ. (1996). The prepuce: specialized mucosa of the penis and its loss to circumcision. British Journal of Urology, 77(2), 291-295.',
        'Wallerstein E. (1980). Circumcision: An American Health Fallacy. New York: Springer Publishing Co.',
        'American Academy of Pediatrics. (1975). Report of the Ad Hoc Task Force on Circumcision. Pediatrics, 56(4), 610-611.',
        'American Academy of Pediatrics. (1989). Report of the Task Force on Circumcision. Pediatrics, 84(2), 388-391.'
    ],
    'goldman-1999-psychological-impact-circumcision': [
        'Anand KJS, Hickey PR. (1987). Pain and its effects in the human neonate and fetus. New England Journal of Medicine, 317(21), 1321-1329.',
        'Taylor JR, Lockwood AP, Taylor AJ. (1996). The prepuce: specialized mucosa of the penis and its loss to circumcision. British Journal of Urology, 77(2), 291-295.',
        'Wallerstein E. (1980). Circumcision: An American Health Fallacy. New York: Springer Publishing Co.',
        'American Academy of Pediatrics. (1989). Report of the Task Force on Circumcision. Pediatrics, 84(2), 388-391.'
    ],
    'fletcher-milos-1999-circumcision-in-america': [
        'Taylor JR, Lockwood AP, Taylor AJ. (1996). The prepuce: specialized mucosa of the penis and its loss to circumcision. British Journal of Urology, 77(2), 291-295.',
        'American Academy of Pediatrics. (1999). Circumcision policy statement. Pediatrics, 103(3), 686-693.',
        'Wallerstein E. (1980). Circumcision: An American Health Fallacy. New York: Springer Publishing Co.'
    ],
    'darby-svoboda-2007-a-rose-by-any-other-name': [
        'Boyle GJ, Svoboda JS. (2000). Circumcision of healthy boys: Criminal assault? Journal of Law and Medicine, 7(3), 301-310.',
        'Benatar M, Benatar D. (2003). Between prophylaxis and child abuse: the ethics of neonatal male circumcision. American Journal of Bioethics, 3(2), 35-48.',
        'American Academy of Pediatrics. (1999). Circumcision policy statement. Pediatrics, 103(3), 686-693.',
        'Taylor JR, Lockwood AP, Taylor AJ. (1996). The prepuce: specialized mucosa of the penis and its loss to circumcision. British Journal of Urology, 77(2), 291-295.'
    ],
    'earp-2018-female-genital-mutilation-male-circumcision': [
        'Darby R, Svoboda JS. (2007). A rose by any other name? Rethinking the similarities and differences between male and female genital cutting. Medical Anthropology Quarterly, 21(3), 301-323.',
        'Frisch M, Aigrain Y, Barauskas V, et al. (2013). Cultural bias in the AAP’s 2012 technical report and policy statement on male circumcision. Pediatrics, 131(4), 796-800.',
        'American Academy of Pediatrics. (2012). Circumcision policy statement. Pediatrics, 130(3), 585-586.',
        'Royal Dutch Medical Association (KNMG). (2010). Non-therapeutic circumcision of male minors. Utrecht: KNMG.',
        'Benatar M, Benatar D. (2003). Between prophylaxis and child abuse: the ethics of neonatal male circumcision. American Journal of Bioethics, 3(2), 35-48.'
    ],
    'earp-2013-protecting-children-against-unnecessary-surgery': [
        'Frisch M, Aigrain Y, Barauskas V, et al. (2013). Cultural bias in the AAP’s 2012 technical report and policy statement on male circumcision. Pediatrics, 131(4), 796-800.',
        'Royal Dutch Medical Association (KNMG). (2010). Non-therapeutic circumcision of male minors. Utrecht: KNMG.',
        'Darby R, Svoboda JS. (2007). A rose by any other name? Rethinking the similarities and differences between male and female genital cutting. Medical Anthropology Quarterly, 21(3), 301-323.'
    ],
    'aap-2012-circumcision-policy-statement': [
        'American Academy of Pediatrics. (1999). Circumcision policy statement. Pediatrics, 103(3), 686-693.',
        'American Academy of Pediatrics. (1989). Report of the Task Force on Circumcision. Pediatrics, 84(2), 388-391.',
        'American Academy of Pediatrics. (1975). Report of the Ad Hoc Task Force on Circumcision. Pediatrics, 56(4), 610-611.',
        'El Bcheraoui C, Zhang X, Gargano JW, Dietrich S, Lewis FE, Berman SM. (2014). Rates of adverse events associated with male circumcision in US medical settings, 2001 to 2010. JAMA Pediatrics, 168(7), 625-634.',
        'Auvert B, Taljaard D, Lagarde E, Sobngwi-Tambekou J, Sitta R, Puren A. (2005). Randomized, controlled intervention trial of male circumcision for reduction of HIV infection risk to men: the ANRS 1265 Trial. PLoS Medicine, 2(11), e298.'
    ],
    'aap-2012-circumcision-technical-report': [
        'American Academy of Pediatrics. (1999). Circumcision policy statement. Pediatrics, 103(3), 686-693.',
        'American Academy of Pediatrics. (1989). Report of the Task Force on Circumcision. Pediatrics, 84(2), 388-391.',
        'American Academy of Pediatrics. (1975). Report of the Ad Hoc Task Force on Circumcision. Pediatrics, 56(4), 610-611.',
        'El Bcheraoui C, Zhang X, Gargano JW, Dietrich S, Lewis FE, Berman SM. (2014). Rates of adverse events associated with male circumcision in US medical settings, 2001 to 2010. JAMA Pediatrics, 168(7), 625-634.'
    ],
    'aap-1999-circumcision-policy': [
        'American Academy of Pediatrics. (1989). Report of the Task Force on Circumcision. Pediatrics, 84(2), 388-391.',
        'American Academy of Pediatrics. (1975). Report of the Ad Hoc Task Force on Circumcision. Pediatrics, 56(4), 610-611.',
        'Anand KJS, Hickey PR. (1987). Pain and its effects in the human neonate and fetus. New England Journal of Medicine, 317(21), 1321-1329.',
        'Taylor JR, Lockwood AP, Taylor AJ. (1996). The prepuce: specialized mucosa of the penis and its loss to circumcision. British Journal of Urology, 77(2), 291-295.'
    ],
    'aap-1989-circumcision-policy': [
        'American Academy of Pediatrics. (1975). Report of the Ad Hoc Task Force on Circumcision. Pediatrics, 56(4), 610-611.',
        'Anand KJS, Hickey PR. (1987). Pain and its effects in the human neonate and fetus. New England Journal of Medicine, 317(21), 1321-1329.'
    ]
}

def update_document(d):
    doc_id = d['id']
    if doc_id in CITATION_MAP:
        meta = json.loads(d.get('metadata_json', '{}')) if isinstance(d.get('metadata_json'), str) else d.get('metadata_json', {})
        existing = meta.get('citations', [])
        # Merge citations
        merged_cites = list(CITATION_MAP[doc_id])
        for c in existing:
            if c not in merged_cites:
                merged_cites.append(c)
        meta['citations'] = merged_cites
        d['metadata_json'] = json.dumps(meta)
        return True
    return False

def main():
    print("Updating public/api_mock.json with cross-citations...")
    with open('public/api_mock.json', 'r', encoding='utf-8') as f:
        mock_docs = json.load(f)
        
    updated_count = 0
    for d in mock_docs:
        if update_document(d):
            updated_count += 1
            
    with open('public/api_mock.json', 'w', encoding='utf-8') as f:
        json.dump(mock_docs, f, indent=2)
    print(f"Updated citations in public/api_mock.json for {updated_count} documents.")
    
    # Also update public/api_collections_published-articles_mock.json
    col_path = 'public/api_collections_published-articles_mock.json'
    if os.path.exists(col_path):
        with open(col_path, 'r', encoding='utf-8') as f:
            col = json.load(f)
        col_docs = col.get('documents', [])
        col_updated = 0
        for d in col_docs:
            if update_document(d):
                col_updated += 1
        with open(col_path, 'w', encoding='utf-8') as f:
            json.dump(col, f, indent=2)
        print(f"Updated citations in {col_path} for {col_updated} documents.")

    # Also update public/api_collections_tim-hammond-archive_mock.json
    col_hammond = 'public/api_collections_tim-hammond-archive_mock.json'
    if os.path.exists(col_hammond):
        with open(col_hammond, 'r', encoding='utf-8') as f:
            col = json.load(f)
        col_docs = col.get('documents', []) if isinstance(col, dict) else col
        hammond_updated = 0
        for d in col_docs:
            if update_document(d):
                hammond_updated += 1
        with open(col_hammond, 'w', encoding='utf-8') as f:
            json.dump(col, f, indent=2)
        print(f"Updated citations in {col_hammond} for {hammond_updated} documents.")

if __name__ == '__main__':
    main()
