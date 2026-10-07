import pandas as pd
df = pd.read_excel("The Accidental Intactivist's Inquiry (Responses).xlsx")
with open('columns.txt', 'w', encoding='utf-8') as f:
    f.write(str(df.columns.tolist()))
