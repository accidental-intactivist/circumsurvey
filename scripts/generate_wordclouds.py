import pandas as pd
import json
import re
from collections import Counter

df = pd.read_excel("The Accidental Intactivist's Inquiry (Responses).xlsx")

status_cols = [c for c in df.columns if 'circumcision state' in c.lower() and 'male/amab' in c.lower()]
if not status_cols:
    status_cols = [c for c in df.columns if 'circumcision state' in c.lower()]
status_col = status_cols[0]

text_cols = [c for c in df.columns if df[c].dtype == 'object' and len(df[c].dropna()) > 0 and isinstance(df[c].dropna().iloc[0], str)]

stop_words = set(['the','and','to','of','a','i','in','that','it','my','for','is','with','on','was','as','this','have','but','not','be','about','are','you','or','an','they','me','so','at','from','just','like','would','what','if','all','has','when','do','can','more','we','very','out','one','who','there','been','some','than','up','how','their','had','which','by','were','because','them','only','other','any','also','could','much','no','those','then','being','will','am','even','after','these','did','should','its','into','too','now','many','most','does','where','our','well','get','know','think','see','way','make','going','really','say','feel','time','people','circumcision','circumcised','intact','foreskin','penis', 'he', 'his', 'him'])

def get_words(df_subset):
    words = []
    # Only use columns that are clearly long-form text (average length > 50 chars)
    for col in text_cols:
        sample = df_subset[col].dropna().astype(str)
        if len(sample) > 0 and sample.str.len().mean() > 50:
            for text in sample:
                text_words = re.findall(r'\b[a-z]{3,}\b', text.lower())
                words.extend([w for w in text_words if w not in stop_words])
    return words

circ_df = df[df[status_col].astype(str).str.contains('Circumcised', na=False, case=False)]
intact_df = df[df[status_col].astype(str).str.contains('Intact', na=False, case=False)]

circ_counts = Counter(get_words(circ_df)).most_common(60)
intact_counts = Counter(get_words(intact_df)).most_common(60)

max_circ = circ_counts[0][1] if circ_counts else 1
max_intact = intact_counts[0][1] if intact_counts else 1

circ_formatted = [[w, round(c/max_circ, 2)] for w, c in circ_counts]
intact_formatted = [[w, round(c/max_intact, 2)] for w, c in intact_counts]

with open('word_frequencies.json', 'w', encoding='utf-8') as f:
    json.dump({'circ': circ_formatted, 'intact': intact_formatted}, f, indent=2)

print('Successfully generated word_frequencies.json')
