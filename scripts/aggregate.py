#!/usr/bin/env python3
"""
CircumSurvey — aggregate.py
============================
Reads the raw Form Responses CSV → outputs src/data.js (ES module).

Usage:
    python3 scripts/aggregate.py data/raw/responses.csv src/data.js
    python3 scripts/aggregate.py data/raw/responses.csv   # stdout

Security: Raw CSV never ships. Only data.js is committed and deployed.
"""

import csv, sys, os, json
from collections import defaultdict, Counter
from datetime import datetime, timezone

COL_PATHWAY=65; COL_APPEARANCE=47; COL_SEX_BASE=48; COL_ORG_CONF=57
COL_LUBE=58; COL_ORG_DUR=56; COL_PRIDE=64; COL_REGRET=72
COL_RESENTMENT=103; COL_HOW_HANDLED=95; COL_FUTURE_SON=177
COL_AUTONOMY=178; COL_AESTHETICS=174; COL_MED_SUP=170; COL_NORM=150
COL_FATHER=112; COL_RESTORATION=110; COL_CURIOSITY_C=99; COL_CURIOSITY_I=81

SEX_LABELS=["Intensity of Orgasm","Duration of Orgasm","Ease of Reaching Orgasm",
            "Sensitivity to Light Touch","Pleasure from Mobile Skin / Gliding","Variety of Pleasurable Sensations"]
SEX_IDS=["intensity","duration_r","ease","light","mobile","variety"]

def get_pathway(row):
    if len(row)<=COL_PATHWAY: return None
    v=row[COL_PATHWAY].strip()
    if v=="Intact (Never circumcised)": return "intact"
    if v=="Circumcised": return "circumcised"
    if "restoring" in v.lower() or "restored" in v.lower(): return "restoring"
    if v=="": return "observer"
    return None

def dist(rows,col,min_n=5):
    counts=Counter()
    total=0
    for row in rows:
        if len(row)>col and row[col].strip():
            counts[row[col].strip()]+=1; total+=1
    if total<min_n: return [],0
    return sorted(counts.items(),key=lambda x:-x[1]),total

def mean_rating(rows,col):
    vals=[float(row[col].strip()) for row in rows if len(row)>col and row[col].strip() and row[col].strip().replace('.','').isdigit()]
    return round(sum(vals)/len(vals),2) if vals else None

SHORT={
    "Very Positive":"Very Positive","Positive":"Positive","Neutral":"Neutral",
    "Negative":"Negative","Very Negative":"Very Negative",
    "I don't really think about its appearance much":"Don't think about it",
    "Not at all confident, feels like something is missing":"Something is missing",
    "Moderately confident, seems pretty good":"Moderately confident",
    "Depends on the Partner/Situation":"Depends",
    "Confident. it generally feels great":"Confident",
    "Extremely confident, can't imagine it being better":"Extremely confident",
    "Never find it necessary; my body's natural lubrication (or saliva) is sufficient.":"Never",
    "Rarely find it necessary.":"Rarely",
    "Sometimes, depending on the situation or partner.":"Sometimes",
    "Often helpful for maximizing pleasure, but not strictly necessary for basic comfort.":"Often helpful",
    "Yes, it's always or almost always necessary for comfort and pleasure.":"Always/almost always",
    "Not applicable / No sexual experience of this kind.":"N/A",
    "0-5 seconds":"0–5 sec","6-15 seconds":"6–15 sec","16-30 seconds":"16–30 sec",
    "Up to 1 minute":"Up to 1 min","Longer than 1 minute":"1+ min",
    "The duration varies too much to give a typical answer":"Varies",
    "Unsure / Haven't thought about it in terms of time":"Unsure",
    "Very proud and satisfied":"Very proud","Generally proud and satisfied":"Generally proud",
    "Neutral or ambivalent":"Neutral","Somewhat dissatisfied":"Somewhat dissatisfied",
    "Very dissatisfied":"Very dissatisfied",
    "I don't really frame my feelings about it in terms of 'pride' or 'dissatisfaction'.":"No framework",
    "Yes, these feelings are or have been strong and frequent.":"Strong & frequent",
    "Yes, I experience some of these feelings sometimes.":"Sometimes",
    "Yes, but rarely.":"Rarely",
    "No, never; I have always been glad to be intact.":"No, never",
    "Yes, these feelings are or have been strong and frequent":"Strong & frequent",
    "Yes, I experience some of these feelings sometimes":"Sometimes",
    "Rarely":"Rarely","No, never":"No, never",
    "As a routine, almost automatic procedure included with standard newborn care (\"It's just what we do\").":"Routine / automatic",
    "I have no idea.":"No idea",
    "As a strong medical recommendation for health or hygiene.":"Strong medical rec.",
    "Likely not brought up by the doctor unless the parents requested it.":"Not brought up",
    "As a neutral choice for them to make, with pros and cons presented.":"Neutral pros & cons",
    "I would ensure my child remains intact.":"Keep intact",
    "I would choose to have my child circumcised.":"Circumcise",
    "I would be undecided and need more information":"Undecided",
    "This decision would primarily be up to my partner.":"Partner's choice",
    "Not applicable / I do not plan to have children.":"N/A",
    "The Child's Right to Bodily Autonomy: Prioritizing the principle that a person's body should not be permanently and non-consensually altered without a clear and present medical necessity, preserving their right to make that decision for themselves as an adult.":"Child's bodily autonomy",
    "The recommendation of Medical Authorities and Parental Discretion: Prioritizing the professional guidance given to parents and the right of parents to make preventative health and cultural choices they believe are in their child's best interest.":"Parental / medical discretion",
    "I strongly prefer the appearance of the intact (uncircumcised) penis.":"Strongly prefer intact",
    "I slightly prefer the appearance of the intact (uncircumcised) penis.":"Slightly prefer intact",
    "I have no aesthetic preference; both look equally normal/appealing to me.":"No preference",
    "I slightly prefer the appearance of the circumcised penis.":"Slightly prefer circ",
    "I strongly prefer the appearance of the circumcised penis.":"Strongly prefer circ",
    "The intact state (with normal hygiene) is significantly healthier.":"Intact significantly",
    "The intact state (with normal hygiene) is slightly healthier due to the protective function of the foreskin.":"Intact slightly",
    "There is no significant health or hygiene difference between the two states.":"No difference",
    "The circumcised state is slightly healthier/more hygienic.":"Circ slightly",
    "The circumcised state is significantly healthier/more due to specific medical benefits":"Circ significantly",
    "I am genuinely unsure which is considered healthier.":"Unsure",
    "It was the unquestioned norm; I believe nearly all boys were circumcised.":"Unquestioned norm",
    "It was very common, but not universal; there was some awareness of intact boys.":"Very common",
    "It was a 50/50 choice with no strong expectation either way.":"50/50",
    "It was uncommon; being left intact was the more typical path.":"Uncommon",
    "I'm not sure what the expectation was.":"Not sure",
    "He is circumcised.":"Circumcised","He is intact (not circumcised).":"Intact",
    "I don't know / I'm unsure.":"Don't know",
    "Not applicable / No father or primary male guardian in my upbringing.":"N/A",
    "Yes, I'm actively researching it":"Actively researching",
    "Yes, seriously considered it":"Seriously considered",
    "Yes, briefly considered it but decided against it":"Briefly considered",
    "No, never considered it / Happy as I am":"Never considered","No,":"No",
    "Unsure / Never heard of it":"Unsure/never heard",
    "Yes, I've often wondered":"Often wondered","Yes, I've occasionally wondered":"Occasionally",
    "No, I believe being intact is preferable":"Intact preferable",
    "Not really, I'm happy with my experience":"Happy as is",
    "I've never thought about it":"Never thought",
    "I experienced this before being circumcised":"Before being circ",
    "No, I believe being circumcised is preferable":"Circ preferable",
}
def s(label): return SHORT.get(label,label[:55])

SPEC=["#d94f4f","#e8a44a","#e8c868","#8bb8d9","#5b93c7","#a0a0a0"]
COL_COLORS={
    COL_APPEARANCE:["#5b93c7","#8bb8d9","#e8c868","#e8a44a","#d94f4f","#a0a0a0"],
    COL_PRIDE:     ["#5b93c7","#8bb8d9","#e8c868","#e8a44a","#d94f4f","#a0a0a0"],
    COL_LUBE:      ["#5b93c7","#8bb8d9","#e8c868","#e8a44a","#d94f4f","#a0a0a0"],
    COL_FUTURE_SON:["#5b93c7","#d94f4f","#e8c868","#e8a44a","#a0a0a0"],
    COL_AUTONOMY:  ["#5b93c7","#d94f4f"],
    COL_HOW_HANDLED:["#d94f4f","#a0a0a0","#e8a44a","#8bb8d9","#5b93c7"],
}
def get_colors(col,n):
    base=COL_COLORS.get(col,SPEC)
    return base[:n]

def build_q(qid,col,cat,question,pathway_dists,note=None,sub=None):
    all_labels=[]
    for items,_ in pathway_dists.values():
        for lbl,_ in items:
            if lbl not in all_labels: all_labels.append(lbl)
    short_opts=[s(o) for o in all_labels]
    colors=get_colors(col,len(all_labels))
    data={}
    for pw,(items,n) in pathway_dists.items():
        if n<5: continue
        m=dict(items)
        data[pw]=[round(m.get(o,0),1) for o in all_labels]
    obj={"id":qid,"cat":cat,"q":question,"opts":short_opts,"colors":colors,"data":data}
    if note: obj["note"]=note
    if sub: obj["sub"]=sub
    pk=list(data.keys())
    if set(pk)!={"intact","circumcised","restoring","observer"}: obj["pathways"]=pk
    return obj

def aggregate(csv_path):
    with open(csv_path,encoding='utf-8-sig',newline='') as f:
        rows=list(csv.reader(f))
    data_rows=rows[1:]
    by_pw=defaultdict(list)
    for row in data_rows:
        p=get_pathway(row)
        if p: by_pw[p].append(row)
    nc={p:len(r) for p,r in by_pw.items()}
    total=sum(nc.values())
    print(f"[aggregate.py] {total} respondents: {nc}",file=sys.stderr)

    qs=[]
    qs.append(build_q("appearance",COL_APPEARANCE,"Body Image","How do you feel about your penis's physical appearance?",
        {"intact":dist(by_pw["intact"],COL_APPEARANCE),"circumcised":dist(by_pw["circumcised"],COL_APPEARANCE),"restoring":dist(by_pw["restoring"],COL_APPEARANCE)}))
    qs.append(build_q("pride",COL_PRIDE,"Body Image","Overall, how proud or satisfied are you with your penis?",
        {"intact":dist(by_pw["intact"],COL_PRIDE),"circumcised":dist(by_pw["circumcised"],COL_PRIDE),"restoring":dist(by_pw["restoring"],COL_PRIDE)},
        sub="Considering appearance, function, and pleasure"))
    for qid,col,label in zip(SEX_IDS,range(COL_SEX_BASE,COL_SEX_BASE+6),SEX_LABELS):
        qs.append({"id":qid,"cat":"Sexual Experience","q":f"{label} (1–5 scale)","type":"avg",
            "data":{p:mean_rating(by_pw[p],col) for p in["intact","circumcised","restoring"] if mean_rating(by_pw[p],col)}})
    qs.append(build_q("confidence",COL_ORG_CONF,"Sexual Experience","How confident are you that your orgasms are as good as they could be?",
        {"intact":dist(by_pw["intact"],COL_ORG_CONF),"circumcised":dist(by_pw["circumcised"],COL_ORG_CONF),"restoring":dist(by_pw["restoring"],COL_ORG_CONF)}))
    qs.append(build_q("lube",COL_LUBE,"Sexual Experience","How often do you need artificial lubrication?",
        {"intact":dist(by_pw["intact"],COL_LUBE),"circumcised":dist(by_pw["circumcised"],COL_LUBE),"restoring":dist(by_pw["restoring"],COL_LUBE)}))
    qs.append(build_q("duration",COL_ORG_DUR,"Sexual Experience","How long do the primary pleasurable sensations of your typical orgasm last?",
        {"intact":dist(by_pw["intact"],COL_ORG_DUR),"circumcised":dist(by_pw["circumcised"],COL_ORG_DUR),"restoring":dist(by_pw["restoring"],COL_ORG_DUR)}))
    qs.append(build_q("sons",COL_FUTURE_SON,"Autonomy & Ethics","If you were to have a male child, what would you choose regarding circumcision?",
        {"intact":dist(by_pw["intact"],COL_FUTURE_SON),"circumcised":dist(by_pw["circumcised"],COL_FUTURE_SON),"restoring":dist(by_pw["restoring"],COL_FUTURE_SON),"observer":dist(by_pw["observer"],COL_FUTURE_SON)}))
    qs.append(build_q("autonomy",COL_AUTONOMY,"Autonomy & Ethics","For a non-therapeutic irreversible procedure on a healthy infant — which principle takes priority?",
        {"intact":dist(by_pw["intact"],COL_AUTONOMY),"circumcised":dist(by_pw["circumcised"],COL_AUTONOMY),"restoring":dist(by_pw["restoring"],COL_AUTONOMY),"observer":dist(by_pw["observer"],COL_AUTONOMY)}))
    qs.append(build_q("handled",COL_HOW_HANDLED,"Decision & Consent","How was circumcision handled around the time of your birth?",
        {"circumcised":dist(by_pw["circumcised"],COL_HOW_HANDLED)},note="Asked of Circumcised Pathway respondents only."))
    qs.append(build_q("norm",COL_NORM,"Decision & Consent","In your community growing up, what was the general expectation for newborn boys?",
        {"intact":dist(by_pw["intact"],COL_NORM),"circumcised":dist(by_pw["circumcised"],COL_NORM),"restoring":dist(by_pw["restoring"],COL_NORM),"observer":dist(by_pw["observer"],COL_NORM)}))
    qs.append(build_q("father_status",COL_FATHER,"Decision & Consent","What is your father's circumcision state?",
        {"circumcised":dist(by_pw["circumcised"],COL_FATHER),"restoring":dist(by_pw["restoring"],COL_FATHER)},note="Asked of Circumcised and Restoring respondents."))
    qs.append(build_q("restoration_considered",COL_RESTORATION,"Decision & Consent","Have you ever considered or researched foreskin restoration?",
        {"circumcised":dist(by_pw["circumcised"],COL_RESTORATION)},note="Asked of Circumcised Pathway respondents only."))
    qs.append(build_q("aesthetics",COL_AESTHETICS,"Beliefs & Perceptions","Purely in terms of aesthetics, which look do you personally find more appealing?",
        {"intact":dist(by_pw["intact"],COL_AESTHETICS),"circumcised":dist(by_pw["circumcised"],COL_AESTHETICS),"restoring":dist(by_pw["restoring"],COL_AESTHETICS),"observer":dist(by_pw["observer"],COL_AESTHETICS)}))
    qs.append(build_q("med_superior",COL_MED_SUP,"Beliefs & Perceptions","Which state do you believe is medically or hygienically superior?",
        {"intact":dist(by_pw["intact"],COL_MED_SUP),"circumcised":dist(by_pw["circumcised"],COL_MED_SUP),"restoring":dist(by_pw["restoring"],COL_MED_SUP),"observer":dist(by_pw["observer"],COL_MED_SUP)}))

    def md(rows,col):
        items,n=dist(rows,col)
        return [s(l) for l,_ in items],[p for _,p in items],n

    c_opts,c_data,cn=md(by_pw["circumcised"],COL_RESENTMENT)
    i_opts,i_data,_=md(by_pw["intact"],COL_REGRET)
    r_opts,r_data,rn=md(by_pw["restoring"],COL_RESENTMENT)
    ci_opts,ci_data,_=md(by_pw["circumcised"],COL_CURIOSITY_C)
    ii_opts,ii_data,_=md(by_pw["intact"],COL_CURIOSITY_I)

    mirrors=[
        {"id":"resentment_mirror","title":"Resentment vs Regret",
         "note":"We use 'resentment' for the Circumcised Pathway because the procedure was performed without their agency. We use 'regret' for the Intact Pathway because that is the word that could meaningfully apply to a state they grew into. This distinction was shaped by community feedback.",
         "left":{"pathway":"circumcised","q":"Have you experienced resentment, loss, anger, or grief about your circumcision?","opts":c_opts,"data":c_data},
         "right":{"pathway":"intact","q":"Have you ever wished you were circumcised, or felt regret about being intact?","opts":i_opts,"data":i_data},
         "colors":["#d94f4f","#e8a44a","#e8c868","#5b93c7"]},
        {"id":"restoring_resentment","title":"Restoration Pathway: Resentment",
         "sub":f"Every restoring respondent reports negative feelings — 0% 'No, never' (n={rn})",
         "left":{"pathway":"restoring","q":"Have you experienced resentment, loss, anger, or grief about your circumcision?","opts":r_opts,"data":r_data},
         "right":{"pathway":"circumcised","q":"Have you experienced resentment, loss, anger, or grief about your circumcision?","opts":c_opts,"data":c_data},
         "colors":["#d94f4f","#e8a44a","#e8c868","#5b93c7"]},
        {"id":"curiosity_mirror","title":"Curiosity About the Other Anatomy",
         "left":{"pathway":"circumcised","q":"Have you wondered what sex would be like with an intact penis?","opts":ci_opts,"data":ci_data},
         "right":{"pathway":"intact","q":"Have you wondered what sex would be like if you were circumcised?","opts":ii_opts,"data":ii_data},
         "colors":["#d94f4f","#e8a44a","#e8c868","#8bb8d9","#5b93c7","#a0a0a0"]},
    ]

    curated=[
        {"id":"pleasure_gap","title":"The Pleasure Gap","desc":"Self-reported sexual experience ratings across pathways","question_ids":["mobile","light","variety","ease","intensity","duration_r","confidence"]},
        {"id":"lubrication","title":"The Lubrication Deficit","desc":"Functional self-sufficiency by pathway","question_ids":["lube","duration"]},
        {"id":"resentment","title":"Resentment & Regret","desc":"The asymmetric weight of being chosen for vs born into","question_ids":["resentment_mirror","restoring_resentment","pride"]},
        {"id":"generational","title":"The Generational Break","desc":"Future-son intentions across every pathway","question_ids":["sons","father_status"]},
        {"id":"autonomy_consensus","title":"Bodily Autonomy Consensus","desc":"Where all pathways converge","question_ids":["autonomy"]},
        {"id":"systemic","title":"The Systemic Failure","desc":"How decisions were actually made","question_ids":["handled","norm"]},
        {"id":"perception","title":"Cross-Pathway Perception","desc":"How each pathway sees the other and the aesthetic landscape","question_ids":["curiosity_mirror","aesthetics","med_superior"]},
    ]

    pathway_meta={
        "intact":     {"label":"The Intact Pathway","short":"Intact","n":nc.get("intact",0),"color":"#5b93c7","bg":"rgba(91,147,199,0.12)","emoji":"🟢"},
        "circumcised":{"label":"The Circumcised Pathway","short":"Circumcised","n":nc.get("circumcised",0),"color":"#d94f4f","bg":"rgba(217,79,79,0.12)","emoji":"🔵"},
        "restoring":  {"label":"The Restoration Pathway","short":"Restoring","n":nc.get("restoring",0),"color":"#e8c868","bg":"rgba(232,200,104,0.12)","emoji":"🟣"},
        "observer":   {"label":"The Observer, Partner & Ally Pathway","short":"Observer","n":nc.get("observer",0),"color":"#a0a0a0","bg":"rgba(160,160,160,0.12)","emoji":"🟠"},
        "born_circ":  {"label":"Born Circumcised (Combined)","short":"Born Circ.","n":nc.get("circumcised",0)+nc.get("restoring",0),"color":"#cc6855","bg":"rgba(204,104,85,0.12)","emoji":"🔵🟣"},
    }

    return {"meta":{"totalRespondents":total,"phase":"Phase 1 · Preliminary Findings",
                    "lastUpdated":datetime.now(timezone.utc).strftime("%Y-%m-%d"),"pathwayCounts":nc},
            "pathway":pathway_meta,"questions":qs,"mirrorPairs":mirrors,"curatedSections":curated}

def to_js(obj):
    ts=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    data=json.dumps(obj,indent=2,ensure_ascii=False)
    return f"""// ═══════════════════════════════════════════════════════════════
// CircumSurvey — Auto-generated aggregate data
// Generated: {ts}
// DO NOT EDIT MANUALLY — regenerated by scripts/aggregate.py
// ═══════════════════════════════════════════════════════════════

const _data = {data};

export const META             = _data.meta;
export const PATHWAY          = _data.pathway;
export const ALL_QUESTIONS    = _data.questions;
export const MIRROR_PAIRS     = _data.mirrorPairs;
export const CURATED_SECTIONS = _data.curatedSections;

// ── Curated quotes — reviewed by Tone, never auto-generated ──
export const QUOTE_GALLERIES = {{
  resentment_mirror: {{
    circumcised: [
      {{ text: "Pain. Loss of pleasure. Loss of confidence. Loss of trust. Self hatred. Depression.", context: "On drawbacks" }},
      {{ text: "I, at 57 years old, have never had a normal intimate relationship... the mutilation is always there.", context: "On lifelong impact" }},
      {{ text: "Negative impact to how I experience pleasure. Not being able to experience the build-up to orgasm from 0–10.", context: "On sensory experience" }},
    ],
    intact: [
      {{ text: "In childhood and through college I was self conscious because all of my friends were cut and I only knew one other kid who was uncut.", context: "On regret triggers" }},
      {{ text: "Only as a teen/young adult due to stigma arising from movies, pop culture, etc.", context: "On the source of regret" }},
    ],
  }},
  pride: {{
    circumcised: [
      {{ text: "Sexual problems, skin tearing, not enough skin to accommodate it, low self esteem, avoiding intimacy.", context: "On daily reality" }},
    ],
    intact: [
      {{ text: "Felt awkward in high school but never a concern.", context: "On growing up intact" }},
    ],
  }},
}};
"""

if __name__=="__main__":
    if len(sys.argv)<2:
        print("Usage: python3 scripts/aggregate.py <input.csv> [output.js]",file=sys.stderr); sys.exit(1)
    if not os.path.exists(sys.argv[1]):
        print(f"Error: {sys.argv[1]} not found",file=sys.stderr); sys.exit(1)
    result=aggregate(sys.argv[1])
    js=to_js(result)
    if len(sys.argv)>=3:
        os.makedirs(os.path.dirname(sys.argv[2]) or ".",exist_ok=True)
        with open(sys.argv[2],"w",encoding="utf-8") as f: f.write(js)
        print(f"[aggregate.py] ✓ {sys.argv[2]} — n={result['meta']['totalRespondents']}",file=sys.stderr)
    else:
        print(js)
