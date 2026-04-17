import { useState, useEffect } from "react";

/* ═════════════════════ PALETTE ═════════════════════ */
const P = {
  bg: "#0e0e10", panel: "#131316", card: "#18181c", cardHover: "#1e1e24",
  border: "#222228", borderLight: "#2a2a32",
  gold: "#d4a030", goldDim: "rgba(212,160,48,0.10)", goldBorder: "rgba(212,160,48,0.25)",
  red: "#cc2a2a", redDim: "rgba(204,42,42,0.08)",
  text: "#eeeef0", textSec: "#8a8a96", textMut: "#55555f", textGhost: "#333340",
};

/* ═════════════════════ PATHWAYS ═════════════════════ */
const PATHWAY = {
  intact:      { label: "The Intact Pathway",      short: "Intact",      n: 140, color: "#5b93c7", bg: "rgba(91,147,199,0.10)",  emoji: "🟢", desc: "Respondents who have always been intact" },
  circumcised: { label: "The Circumcised Pathway", short: "Circumcised", n: 210, color: "#d94f4f", bg: "rgba(217,79,79,0.10)",   emoji: "🔵", desc: "Respondents who are circumcised" },
  restoring:   { label: "The Restoration Pathway", short: "Restoring",   n: 109, color: "#e8c868", bg: "rgba(232,200,104,0.10)", emoji: "🟣", desc: "Respondents actively restoring or who consider themselves restored" },
  observer:    { label: "The Observer, Partner & Ally Pathway", short: "Observer", n: 37, color: "#a0a0a0", bg: "rgba(160,160,160,0.10)", emoji: "🟠", desc: "Partners, parents, healthcare professionals, and allies" },
  born_circ:   { label: "Born Circumcised (Combined)", short: "Born Circ.", n: 319, color: "#cc6855", bg: "rgba(204,104,85,0.10)", emoji: "🔵🟣", desc: "Combined: Circumcised + Restoring pathways" },
};

/* ═════════════════════ CURATED FINDINGS STRUCTURE ═════════════════════ */
const CURATED_SECTIONS = [
  { id: "pleasure_gap", title: "The Pleasure Gap", desc: "Self-reported sexual experience across pathways", question_ids: ["mobile","light","variety","ease","intensity","duration_r","confidence"] },
  { id: "lubrication", title: "The Lubrication Deficit", desc: "Functional self-sufficiency", question_ids: ["lube"] },
  { id: "resentment", title: "Resentment & Regret", desc: "The asymmetric weight of being chosen for vs born into", question_ids: ["resentment_mirror","pride"] },
  { id: "generational", title: "The Generational Break", desc: "Future-son intentions across pathways", question_ids: ["sons"] },
  { id: "autonomy_consensus", title: "Bodily Autonomy Consensus", desc: "Where all pathways converge", question_ids: ["autonomy"] },
  { id: "systemic", title: "The Systemic Failure", desc: "How decisions were actually made", question_ids: ["handled","norm"] },
  { id: "perception", title: "Cross-Pathway Perception", desc: "How each pathway sees the other", question_ids: ["curiosity_mirror","notice_mirror","aesthetics"] },
];

/* ═════════════════════ ALL QUESTIONS ═════════════════════ */
const ALL_QUESTIONS = [
  { id:"appearance", cat:"Body Image", q:"How do you generally feel about your penis's physical appearance?",
    opts:["Very Negative","Negative","Neutral","Positive","Very Positive"],
    colors:["#d94f4f","#e8a44a","#e8c868","#8bb8d9","#5b93c7"],
    data:{ intact:[1.4,7.2,13.7,28.8,48.9], circumcised:[21.0,25.1,16.7,25.8,9.7], restoring:[21.5,28.0,20.6,24.3,5.6] }},
  { id:"pride", cat:"Body Image", q:"Overall, how proud or satisfied are you with your penis?",
    sub: "Considering appearance, function, and pleasure",
    opts:["Very dissatisfied","Somewhat dissatisfied","Neutral","Generally proud","Very proud"],
    colors:["#d94f4f","#e8a44a","#e8c868","#8bb8d9","#5b93c7"],
    data:{ intact:[2.2,8.0,13.9,33.8,42.1], circumcised:[30.6,24.2,11.8,25.5,7.5], restoring:[23.9,38.0,11.9,16.7,7.6] }},

  { id:"mobile", cat:"Sexual Experience", q:"Pleasure from Mobile Skin / Gliding (1–5)", type:"avg",
    data:{ intact:4.47, circumcised:1.96, restoring:2.85 }},
  { id:"light", cat:"Sexual Experience", q:"Sensitivity to Light Touch (1–5)", type:"avg",
    data:{ intact:4.24, circumcised:2.24, restoring:2.49 }},
  { id:"variety", cat:"Sexual Experience", q:"Variety of Pleasurable Sensations (1–5)", type:"avg",
    data:{ intact:4.39, circumcised:2.46, restoring:2.68 }},
  { id:"ease", cat:"Sexual Experience", q:"Ease of Reaching Orgasm (1–5)", type:"avg",
    data:{ intact:4.04, circumcised:2.60, restoring:2.79 }},
  { id:"intensity", cat:"Sexual Experience", q:"Orgasm Intensity (1–5)", type:"avg",
    data:{ intact:4.25, circumcised:2.96, restoring:3.05 }},
  { id:"duration_r", cat:"Sexual Experience", q:"Orgasm Duration Rating (1–5)", type:"avg",
    data:{ intact:4.01, circumcised:2.65, restoring:2.66 }},
  { id:"confidence", cat:"Sexual Experience", q:"Confidence that orgasms are as good as they could be",
    opts:["Not at all — something is missing","Moderately","Depends","Confident","Extremely confident"],
    colors:["#d94f4f","#e8a44a","#e8c868","#8bb8d9","#5b93c7"],
    data:{ intact:[4.5,16.4,11.2,43.3,24.6], circumcised:[48.2,23.6,5.5,16.1,6.5], restoring:[59.6,18.3,7.7,8.7,5.8] }},
  { id:"lube", cat:"Sexual Experience", q:"Need for artificial lubrication",
    opts:["Never","Rarely","Sometimes","Often","Always"],
    colors:["#5b93c7","#8bb8d9","#e8c868","#e8a44a","#d94f4f"],
    data:{ intact:[55.5,18.2,19.7,5.1,1.5], circumcised:[5.5,14.5,20.0,18.0,39.0], restoring:[16.0,17.9,17.9,14.2,33.0] }},
  { id:"duration", cat:"Sexual Experience", q:"How long do orgasm sensations last?",
    opts:["0–5s","6–15s","16–30s","Up to 1 min","1+ min"],
    colors:["#d94f4f","#e8a44a","#e8c868","#8bb8d9","#5b93c7"],
    data:{ intact:[14.5,40.6,28.3,7.2,0.7], circumcised:[38.3,35.3,12.9,5.0,1.5], restoring:[39.0,37.1,9.5,3.8,1.9] }},

  { id:"sons", cat:"Autonomy & Ethics", q:"If you had a male child, what would you choose?",
    opts:["Keep intact","Circumcise","Undecided","Partner's choice","N/A"],
    colors:["#5b93c7","#d94f4f","#e8c868","#e8a44a","#a0a0a0"],
    data:{ intact:[88.8,0,1.5,1.5,8.2], circumcised:[78.1,8.5,3.5,3.0,6.0], restoring:[98.1,0,0,0,1.9], observer:[90.9,3.0,0,3.0,3.0] }},
  { id:"autonomy", cat:"Autonomy & Ethics", q:"Non-therapeutic irreversible surgery on a healthy infant — which principle takes priority?",
    opts:["Child's bodily autonomy","Parental / medical discretion"],
    colors:["#5b93c7","#d94f4f"],
    data:{ intact:[96.4,3.6], circumcised:[81.3,18.7], restoring:[100,0], observer:[97.0,3.0] }},

  { id:"handled", cat:"Decision & Consent", q:"How was circumcision handled at your birth?",
    pathways:["circumcised"],
    note:"This question is only asked of Circumcised Pathway respondents.",
    opts:["Routine / automatic","No idea","Strong medical rec.","Not brought up","Neutral pros & cons"],
    colors:["#d94f4f","#a0a0a0","#e8a44a","#8bb8d9","#5b93c7"],
    data:{ circumcised:[47.6,23.2,18.9,7.6,2.7] }},
  { id:"norm", cat:"Decision & Consent", q:"Community expectation for newborn boys",
    opts:["Unquestioned norm","Very common","50/50","Uncommon","Not sure"],
    colors:["#d94f4f","#e8a44a","#e8c868","#5b93c7","#a0a0a0"],
    data:{ intact:[17.1,17.9,7.1,47.9,10.0], circumcised:[60.0,22.4,7.8,3.9,5.9], restoring:[56.0,22.0,7.3,4.6,10.1], observer:[44.1,32.4,5.9,11.8,5.9] }},

  { id:"aesthetics", cat:"Beliefs & Perceptions", q:"Which appearance do you find more appealing?",
    opts:["Strongly prefer intact","Slightly prefer intact","No preference","Slightly prefer circ","Strongly prefer circ"],
    colors:["#5b93c7","#8bb8d9","#e8c868","#e8a44a","#d94f4f"],
    data:{ intact:[65.9,14.5,6.5,5.8,7.2], circumcised:[52.0,10.3,8.8,7.8,18.6], restoring:[90.7,1.9,3.7,1.9,0.9], observer:[48.5,12.1,18.2,15.2,6.1] }},
  { id:"med_superior", cat:"Beliefs & Perceptions", q:"Which state do you believe is medically superior?",
    opts:["Intact significantly","Intact slightly","No difference","Circ slightly","Circ significantly"],
    colors:["#5b93c7","#8bb8d9","#e8c868","#e8a44a","#d94f4f"],
    data:{ intact:[35.0,34.3,15.3,8.0,3.6], circumcised:[30.4,22.1,17.6,13.7,12.3], restoring:[48.1,28.3,14.2,5.7,2.8], observer:[48.5,15.2,24.2,6.1,3.0] }},
];

/* ═════════════════════ MIRROR PAIRS ═════════════════════ */
const MIRROR_PAIRS = [
  { id:"resentment_mirror", title:"Resentment vs Regret",
    note:"We use 'resentment' for the Circumcised Pathway because the procedure was done without their agency. We use 'regret' for the Intact Pathway because that's the language they could meaningfully apply to a state they grew into.",
    left:{ pathway:"circumcised", q:"Have you experienced resentment, loss, anger, or grief about your circumcision?",
      opts:["Strong & frequent","Sometimes","Rarely","No, never"],
      data:[54.6,16.1,8.3,21.0] },
    right:{ pathway:"intact", q:"Have you ever wished you were circumcised, or felt regret about being intact?",
      opts:["Strong & frequent","Sometimes","Rarely","No, never"],
      data:[8.6,11.5,18.0,61.9] },
    colors:["#d94f4f","#e8a44a","#e8c868","#5b93c7"],
  },
  { id:"curiosity_mirror", title:"Curiosity About the Other Anatomy",
    left:{ pathway:"circumcised", q:"Have you wondered what sex would be like with an intact penis?",
      opts:["Often wondered","Experienced before circ","Occasionally","Happy as is","Circ preferable","Never thought"],
      data:[67.8,15.1,10.7,3.9,2.0,0.5] },
    right:{ pathway:"intact", q:"Have you wondered what sex would be like circumcised?",
      opts:["Occasionally","Often wondered","Intact preferable","Happy as is","Never thought"],
      data:[41.7,27.3,20.1,7.9,2.9] },
    colors:["#d94f4f","#e8a44a","#e8c868","#8bb8d9","#5b93c7","#a0a0a0"],
  },
  { id:"notice_mirror", title:"Noticing Other Men's Status",
    sub: "How much do you notice when other men have a DIFFERENT status from your own?",
    left:{ pathway:"circumcised", q:"When seeing intact men",
      opts:["Almost always","Frequently","Sometimes","Rarely","Never","N/A"],
      data:[43.8,17.9,10.4,8.5,6.5,12.9] },
    right:{ pathway:"intact", q:"When seeing circumcised men",
      opts:["Almost always","Frequently","Sometimes","Rarely","Never","N/A"],
      data:[47.1,14.7,14.7,5.9,6.6,11.0] },
    colors:["#d94f4f","#e8a44a","#e8c868","#8bb8d9","#5b93c7","#a0a0a0"],
  },
];

/* ═════════════════════ CURATED QUOTES ═════════════════════ */
const QUOTE_GALLERIES = {
  resentment_mirror: {
    title: "Voices on Resentment & Regret",
    intact: [
      { text: "In childhood and through college I was self conscious about this because all of my friends were cut and I only knew one other kid who was uncut along with my brother.", context: "On regret triggers" },
      { text: "Only as a teen/young adult due to stigma arising from movies, pop culture, etc.", context: "On the source of regret" },
      { text: "When I was becoming sexually active and wanted to 'fit in' with most men in America.", context: "On adolescent pressure" },
    ],
    circumcised: [
      { text: "Pain. Loss of pleasure. Loss of confidence. Loss of trust. Self hatred. Depression.", context: "On drawbacks of circumcision" },
      { text: "I, at 57 years old, have never had a normal intimate relationship... the mutilation is always there.", context: "On lifelong impact" },
      { text: "Negative impact to how I experience pleasure. Not being able to experience the build-up to orgasm from 0–10.", context: "On sensory experience" },
      { text: "Where my frenulum should attach usually hurts when I penetrate my partner.", context: "On physical complications" },
    ]
  },
  pride: {
    title: "Voices on Body Image",
    intact: [
      { text: "Felt awkward in highschool but never a concern.", context: "On growing up intact" },
      { text: "It was not easy in the 1970s to be intact. Very rare among my peers.", context: "On being an outlier" },
    ],
    circumcised: [
      { text: "Sexual problems, skin tearing, problematic erections with not enough skin to accommodate it, low self esteem, avoiding intimacy.", context: "On daily reality" },
      { text: "I don't get hard and cannot feel anything. I have never been able to use my penis for sex.", context: "On extreme outcomes" },
    ]
  },
};

const CATS = [...new Set(ALL_QUESTIONS.map(q=>q.cat))];

/* ═════════════════════ SVG PIE ═════════════════════ */
function Pie({ data, colors, size=150, hovered, onHover }) {
  const total = data.reduce((a,b)=>a+b,0);
  if (!total) return null;
  let cum = 0;
  const r = size/2 - 3, cx = size/2, cy = size/2;
  const rad = d => (d-90)*Math.PI/180;
  return (
    <svg width={size} height={size} style={{display:"block"}}>
      {data.map((v,i) => {
        if (v <= 0) return null;
        const s = cum/total*360; cum += v; const e = cum/total*360;
        const la = e-s > 180 ? 1 : 0;
        const x1=cx+r*Math.cos(rad(s)), y1=cy+r*Math.sin(rad(s));
        const x2=cx+r*Math.cos(rad(e)), y2=cy+r*Math.sin(rad(e));
        const active = hovered===i;
        return <path key={i}
          d={`M${cx},${cy}L${x1},${y1}A${r},${r} 0 ${la},1 ${x2},${y2}Z`}
          fill={colors[i%colors.length]} stroke={P.card} strokeWidth="1.5"
          opacity={hovered!==null&&!active?0.35:1}
          style={{transition:"opacity 0.15s,transform 0.15s",transformOrigin:`${cx}px ${cy}px`,transform:active?"scale(1.04)":"",cursor:"pointer"}}
          onMouseEnter={()=>onHover(i)} onMouseLeave={()=>onHover(null)} />;
      })}
      <circle cx={cx} cy={cy} r={r*0.4} fill={P.card} />
    </svg>
  );
}

/* ═════════════════════ PATHWAY TOGGLE ═════════════════════ */
function PathwayToggle({ pathways, active, onChange, showCombined }) {
  // For born-circumcised questions, offer combined view
  const options = pathways.includes("circumcised") && pathways.includes("restoring") && showCombined
    ? ["born_circ", ...pathways.filter(p => p !== "observer"), ...(pathways.includes("observer") ? ["observer"] : [])]
    : pathways;

  return (
    <div style={{display:"flex",gap:"0.25rem",flexWrap:"wrap",justifyContent:"center"}}>
      {options.map(p => {
        const m = PATHWAY[p]; if (!m) return null;
        const on = active===p;
        return <button key={p} onClick={()=>onChange(p)} style={{
          padding:"0.2rem 0.55rem",borderRadius:"100px",cursor:"pointer",fontSize:"0.62rem",
          border:on?`1.5px solid ${m.color}`:`1px solid ${P.border}`,
          background:on?m.bg:"transparent", color:on?m.color:P.textMut,
          fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,letterSpacing:"0.03em",transition:"all 0.15s",
        }}>{m.emoji} {m.short}</button>;
      })}
    </div>
  );
}

/* ═════════════════════ COMBINED PIE for born-circumcised ═════════════════════ */
function getCombinedData(q) {
  // For distribution questions, average circumcised and restoring weighted by n
  const cN = PATHWAY.circumcised.n;
  const rN = PATHWAY.restoring.n;
  const total = cN + rN;
  if (q.type === "avg") {
    return (q.data.circumcised * cN + q.data.restoring * rN) / total;
  }
  return q.data.circumcised.map((v, i) =>
    (v * cN + q.data.restoring[i] * rN) / total
  );
}

/* ═════════════════════ QUESTION CARD ═════════════════════ */
function QCard({ q, defaultPathway }) {
  const pathways = q.pathways || (q.data ? Object.keys(q.data) : Object.keys(PATHWAY).filter(p=>p!=="born_circ"));
  // Check if combined view is meaningful (both circ and restoring exist)
  const canCombine = pathways.includes("circumcised") && pathways.includes("restoring");

  const initialPathway = defaultPathway || (canCombine ? "born_circ" : pathways[0]);
  const [ac, setAc] = useState(initialPathway);
  const [hov, setHov] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const isAvg = q.type === "avg";

  // Get the right data based on selection
  const currentData = ac === "born_circ" ? getCombinedData(q) : q.data[ac];
  const currentMeta = PATHWAY[ac];
  const gallery = QUOTE_GALLERIES[q.id];

  return (
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:"12px",padding:"1.25rem",marginBottom:"0.75rem"}}>
      <div style={{display:"flex",gap:"1.25rem",alignItems:"flex-start",flexWrap:"wrap"}}>
        {/* LEFT: Chart */}
        <div style={{width:"165px",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:"0.5rem"}}>
          {isAvg ? (
            <div style={{width:160,height:140,display:"flex",alignItems:"flex-end",justifyContent:"center",gap:"0.5rem",paddingBottom:"0.3rem"}}>
              {pathways.map(p => {
                const v=q.data[p], m=PATHWAY[p], h=(v/5)*110;
                return <div key={p} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.15rem"}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.58rem",fontWeight:700,color:m.color}}>{v.toFixed(1)}</span>
                  <div style={{width:"22px",height:`${h}px`,background:m.color,borderRadius:"3px 3px 0 0",transition:"height 0.4s"}} />
                  <span style={{fontSize:"0.45rem",color:P.textMut}}>{m.emoji}</span>
                </div>;
              })}
            </div>
          ) : (
            <>
              <Pie data={currentData||[]} colors={q.colors} hovered={hov} onHover={setHov} />
              <PathwayToggle pathways={pathways} active={ac} onChange={setAc} showCombined={canCombine} />
            </>
          )}
        </div>

        {/* RIGHT: Content */}
        <div style={{flex:1,minWidth:"180px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"0.5rem",marginBottom:"0.3rem"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:"0.55rem",color:P.gold,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.1rem"}}>{q.cat}</div>
              <div style={{fontSize:"0.85rem",fontWeight:600,lineHeight:1.3}}>{q.q}</div>
              {q.sub && <div style={{fontSize:"0.65rem",color:P.textMut,fontStyle:"italic",marginTop:"0.15rem"}}>{q.sub}</div>}
            </div>
            <button onClick={()=>setShowShare(!showShare)} title="Share this finding"
              style={{background:"none",border:`1px solid ${P.border}`,borderRadius:"4px",color:P.textMut,cursor:"pointer",padding:"0.2rem 0.4rem",fontSize:"0.62rem",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,whiteSpace:"nowrap"}}>↗ Share</button>
          </div>

          {q.note && <div style={{fontSize:"0.62rem",color:P.gold,fontStyle:"italic",marginBottom:"0.5rem",padding:"0.3rem 0.5rem",background:P.goldDim,borderRadius:"3px",borderLeft:`2px solid ${P.gold}`}}>{q.note}</div>}

          {isAvg ? (
            <div style={{fontSize:"0.72rem",color:P.textSec,lineHeight:1.65}}>
              {pathways.map(p=>{const m=PATHWAY[p];return <div key={p}>{m.emoji} <strong style={{color:m.color}}>{q.data[p].toFixed(2)}</strong> <span style={{color:P.textMut}}>— {m.label}</span></div>;})}
              <div style={{marginTop:"0.3rem",fontSize:"0.62rem",color:P.gold}}>Δ {(q.data.intact-q.data.circumcised).toFixed(2)} ({((q.data.intact-q.data.circumcised)/q.data.intact*100).toFixed(0)}% drop, intact → circumcised)</div>
            </div>
          ) : (
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.3rem"}}>
                <span style={{fontSize:"0.62rem",color:currentMeta.color,fontWeight:600}}>{currentMeta.emoji} {currentMeta.label} <span style={{color:P.textMut,fontWeight:400}}>(n={currentMeta.n})</span></span>
                {ac === "born_circ" && <span style={{fontSize:"0.55rem",color:P.textMut,fontStyle:"italic"}}>Weighted average of Circ + Restoring</span>}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"0.15rem"}}>
                {(q.opts||[]).map((opt,i)=>{
                  const val = currentData?.[i] ?? 0; const isH=hov===i;
                  return <div key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
                    style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.1rem 0",opacity:hov!==null&&!isH?0.35:1,transition:"opacity 0.12s",cursor:"default"}}>
                    <span style={{width:9,height:9,borderRadius:2,background:q.colors[i%q.colors.length],flexShrink:0}} />
                    <span style={{fontSize:"0.7rem",color:P.textSec,flex:1}}>{opt}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.68rem",fontWeight:700,color:isH?"#fff":P.textSec}}>{val.toFixed(1)}%</span>
                  </div>;
                })}
              </div>
            </>
          )}

          {showShare && (
            <div style={{marginTop:"0.6rem",padding:"0.5rem 0.65rem",background:P.goldDim,border:`1px solid ${P.goldBorder}`,borderRadius:"4px",fontSize:"0.62rem",color:P.text}}>
              <div style={{fontWeight:600,marginBottom:"0.2rem",color:P.gold}}>Share this finding:</div>
              <div style={{color:P.textSec,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.6rem"}}>circumsurvey.online/findings#{q.id}</div>
              <div style={{marginTop:"0.3rem",color:P.textMut,fontStyle:"italic"}}>"From The Accidental Intactivist's Inquiry, n = 496"</div>
            </div>
          )}
        </div>
      </div>

      {/* QUOTE GALLERY (if available) */}
      {gallery && (
        <div style={{marginTop:"1rem",paddingTop:"1rem",borderTop:`1px solid ${P.border}`}}>
          <div style={{fontSize:"0.55rem",color:P.gold,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.6rem"}}>Voices from the Survey</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:"0.6rem"}}>
            {Object.entries(gallery).filter(([k])=>k!=="title").map(([pathway, quotes]) => {
              const m = PATHWAY[pathway];
              return quotes.map((qt, i) => (
                <div key={`${pathway}-${i}`} style={{background:m.bg,borderLeft:`3px solid ${m.color}`,padding:"0.6rem 0.75rem",borderRadius:"0 4px 4px 0"}}>
                  <div style={{fontSize:"0.7rem",color:P.text,lineHeight:1.45,fontStyle:"italic",marginBottom:"0.35rem"}}>"{qt.text}"</div>
                  <div style={{fontSize:"0.55rem",color:m.color,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>— {m.short} Pathway · {qt.context}</div>
                </div>
              ));
            })}
          </div>
          <div style={{fontSize:"0.55rem",color:P.textMut,marginTop:"0.5rem",fontStyle:"italic"}}>Anonymous quotes selected from open-ended responses. All identifying details removed.</div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════ MIRROR CARD ═════════════════════ */
function MirrorCard({ pair }) {
  const gallery = QUOTE_GALLERIES[pair.id];
  return (
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:"12px",padding:"1.25rem",marginBottom:"0.75rem"}}>
      <div style={{textAlign:"center",marginBottom:"0.75rem"}}>
        <div style={{fontSize:"0.55rem",color:P.gold,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.15rem"}}>Mirror Comparison</div>
        <div style={{fontSize:"0.95rem",fontWeight:600}}>{pair.title}</div>
        {pair.sub && <div style={{fontSize:"0.7rem",color:P.textSec,marginTop:"0.15rem"}}>{pair.sub}</div>}
      </div>

      {pair.note && <div style={{fontSize:"0.62rem",color:P.gold,fontStyle:"italic",marginBottom:"0.75rem",padding:"0.4rem 0.6rem",background:P.goldDim,borderRadius:"3px",borderLeft:`2px solid ${P.gold}`}}>📋 {pair.note}</div>}

      <div style={{display:"flex",gap:"1.25rem",flexWrap:"wrap"}}>
        {[pair.left,pair.right].map((side,si) => {
          const m = PATHWAY[side.pathway];
          return <div key={si} style={{flex:1,minWidth:"200px"}}>
            <div style={{fontSize:"0.7rem",fontWeight:600,color:m.color,marginBottom:"0.1rem"}}>{m.emoji} {m.label}</div>
            <div style={{fontSize:"0.62rem",color:P.textMut,marginBottom:"0.5rem",lineHeight:1.4,fontStyle:"italic"}}>{side.q}</div>
            {side.opts.map((opt,i) => {
              const v = side.data[i]||0;
              return <div key={i} style={{display:"flex",alignItems:"center",gap:"0.35rem",marginBottom:"0.25rem"}}>
                <div style={{flex:1,height:"16px",background:"rgba(255,255,255,0.03)",borderRadius:"3px",overflow:"hidden"}}>
                  <div style={{width:`${v}%`,height:"100%",background:pair.colors[i%pair.colors.length],borderRadius:"3px",transition:"width 0.5s",display:"flex",alignItems:"center",paddingLeft:"4px",
                    fontFamily:"'JetBrains Mono',monospace",fontSize:"0.5rem",fontWeight:700,color:"rgba(0,0,0,0.65)"}}>
                    {v>12?`${v}%`:""}
                  </div>
                </div>
                <span style={{fontSize:"0.58rem",color:P.textSec,width:"95px",flexShrink:0}}>{opt}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.58rem",fontWeight:700,color:P.textSec,width:"30px",textAlign:"right"}}>{v}%</span>
              </div>;
            })}
          </div>;
        })}
      </div>

      {/* QUOTE GALLERY */}
      {gallery && (
        <div style={{marginTop:"1rem",paddingTop:"1rem",borderTop:`1px solid ${P.border}`}}>
          <div style={{fontSize:"0.55rem",color:P.gold,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.6rem"}}>Voices from the Survey</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:"0.6rem"}}>
            {Object.entries(gallery).filter(([k])=>k!=="title").map(([pathway, quotes]) => {
              const m = PATHWAY[pathway];
              return quotes.map((qt, i) => (
                <div key={`${pathway}-${i}`} style={{background:m.bg,borderLeft:`3px solid ${m.color}`,padding:"0.6rem 0.75rem",borderRadius:"0 4px 4px 0"}}>
                  <div style={{fontSize:"0.7rem",color:P.text,lineHeight:1.45,fontStyle:"italic",marginBottom:"0.35rem"}}>"{qt.text}"</div>
                  <div style={{fontSize:"0.55rem",color:m.color,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>— {m.short} Pathway · {qt.context}</div>
                </div>
              ));
            })}
          </div>
          <div style={{fontSize:"0.55rem",color:P.textMut,marginTop:"0.5rem",fontStyle:"italic"}}>Anonymous quotes selected from open-ended responses. All identifying details removed.</div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════ SIDEBAR ═════════════════════ */
function Sidebar({ open, onClose, onSelect, activeId, onNavigate }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(new Set(["Curated Findings"]));

  const toggle = (cat) => setExpanded(prev => {
    const n = new Set(prev); n.has(cat)?n.delete(cat):n.add(cat); return n;
  });

  const sections = [
    { cat: "Curated Findings", color: P.gold, items: CURATED_SECTIONS.map(s => ({ id: `section-${s.id}`, label: s.title, isSection: true })) },
    { cat: "Mirror Pairs", color: PATHWAY.circumcised.color, items: MIRROR_PAIRS.map(p => ({ id: p.id, label: p.title })) },
    { cat: "Observer Pathway", color: PATHWAY.observer.color, items: [{id:"section-observer",label:"The Witnesses (n=37)", isSection:true}] },
    ...CATS.map(cat => ({ cat, color: P.textSec, items: ALL_QUESTIONS.filter(q=>q.cat===cat).map(q=>({id:q.id,label:q.q})) })),
  ];

  const matchesSearch = (item) => !search || item.label.toLowerCase().includes(search.toLowerCase());

  return (
    <div style={{
      position:"fixed",top:0,left:0,bottom:0,width:"310px",background:P.panel,borderRight:`1px solid ${P.border}`,
      zIndex:200,transform:open?"translateX(0)":"translateX(-100%)",transition:"transform 0.25s ease",
      display:"flex",flexDirection:"column",overflow:"hidden",
    }}>
      <div style={{padding:"0.75rem 1rem",borderBottom:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.8rem",fontWeight:700,color:P.gold,textTransform:"uppercase",letterSpacing:"0.06em"}}>Navigate</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:P.textMut,cursor:"pointer",fontSize:"1.2rem",padding:"0.2rem"}}>✕</button>
      </div>

      <div style={{padding:"0.5rem 0.75rem"}}>
        <input type="text" placeholder="Search all questions..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{width:"100%",padding:"0.4rem 0.65rem",background:"rgba(255,255,255,0.03)",border:`1px solid ${P.border}`,borderRadius:"5px",color:P.text,fontSize:"0.72rem",fontFamily:"'Barlow',sans-serif",outline:"none",boxSizing:"border-box"}} />
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"0 0.5rem 1rem"}}>
        {sections.map(sec => {
          const visible = sec.items.filter(matchesSearch);
          if (search && visible.length === 0) return null;
          const isOpen = expanded.has(sec.cat) || !!search;

          return <div key={sec.cat} style={{marginBottom:"0.25rem"}}>
            <button onClick={()=>toggle(sec.cat)} style={{
              width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"0.4rem 0.5rem",background:"none",border:"none",cursor:"pointer",
              color: sec.color,
              fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.7rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",textAlign:"left",borderRadius:"4px",
            }}>
              <span>{sec.cat} ({visible.length})</span>
              <span style={{fontSize:"0.6rem",transition:"transform 0.15s",transform:isOpen?"rotate(180deg)":""}}>▾</span>
            </button>

            {isOpen && visible.map(item => {
              const isActive = activeId === item.id;
              return <button key={item.id} onClick={()=>onSelect(item.id)}
                style={{
                  display:"block",width:"100%",textAlign:"left",padding:"0.3rem 0.5rem 0.3rem 1.25rem",
                  background:isActive?P.goldDim:"none",border:"none",cursor:"pointer",
                  color:isActive?P.gold:P.textMut,fontSize:"0.65rem",lineHeight:1.35,
                  borderRadius:"3px",borderLeft:isActive?`2px solid ${P.gold}`:"2px solid transparent",
                  transition:"all 0.1s",fontFamily:"'Barlow',sans-serif",
                }}>
                {item.label.length > 60 ? item.label.substring(0,57)+"..." : item.label}
              </button>;
            })}
          </div>;
        })}
      </div>

      <div style={{padding:"0.5rem 0.75rem",borderTop:`1px solid ${P.border}`,fontSize:"0.55rem",color:P.textMut,textAlign:"center"}}>
        {ALL_QUESTIONS.length + MIRROR_PAIRS.length} items · 496 respondents
      </div>
    </div>
  );
}

/* ═════════════════════ METHODOLOGY MODAL ═════════════════════ */
function MethodologyModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:"12px",padding:"2rem",maxWidth:"500px",width:"100%",maxHeight:"80vh",overflowY:"auto",position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:"0.75rem",right:"0.75rem",background:"none",border:"none",color:P.textMut,cursor:"pointer",fontSize:"1.3rem"}}>✕</button>
        <div style={{fontSize:"0.55rem",color:P.gold,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.3rem"}}>About This Inquiry</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",fontWeight:700,marginBottom:"0.75rem",color:P.text}}>Methodology & Ethics</h2>

        <div style={{fontSize:"0.78rem",color:P.textSec,lineHeight:1.6}}>
          <p style={{marginBottom:"0.75rem",fontStyle:"italic",color:P.gold}}>"We are not telling people how to feel. We are creating a platform for them to anonymously share how they actually feel and what they actually experience."</p>

          <p style={{marginBottom:"0.6rem"}}><strong style={{color:P.text}}>Anonymous & voluntary.</strong> No emails, IPs, or personal identifiers are collected with responses. Every question is optional.</p>

          <p style={{marginBottom:"0.6rem"}}><strong style={{color:P.text}}>Designed to reduce framing bias.</strong> The survey asks about lived sexual experience <em>before</em> revealing anatomical status, gathering less biased comparative data.</p>

          <p style={{marginBottom:"0.6rem"}}><strong style={{color:P.text}}>All perspectives welcome.</strong> The survey actively solicits experiences from those who are satisfied with circumcision alongside those who feel harmed. The Observer Pathway captures partners, parents, and healthcare professionals.</p>

          <p style={{marginBottom:"0.6rem"}}><strong style={{color:P.text}}>Independent research.</strong> No formal IRB oversight, but designed with core ethical principles at the forefront. Led by Tone Pettit, Seattle-based independent researcher.</p>

          <p style={{marginBottom:"0.6rem"}}><strong style={{color:P.text}}>Branching pathway logic.</strong> Six distinct pathways (🟢 Intact, 🔵 Circumcised, 🟣 Restoring, 🟠 Observer, 🔴 Trans, ⚪ Intersex) ensure respondents only see relevant questions.</p>

          <p style={{marginBottom:"1rem"}}><strong style={{color:P.text}}>Limitations.</strong> Self-selection bias is inherent to anonymous online surveys. Results reflect the experiences of those who chose to participate. Quantitative data is descriptive, not inferential.</p>

          <a href="https://circumsurvey.online/about" target="_blank" style={{display:"inline-block",padding:"0.5rem 1rem",background:P.gold,color:P.bg,textDecoration:"none",fontWeight:700,borderRadius:"4px",fontSize:"0.75rem",textTransform:"uppercase",letterSpacing:"0.04em"}}>Read Full Methodology →</a>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════ OBSERVER PATHWAY SECTION ═════════════════════ */
function ObserverSection() {
  const observerQs = ALL_QUESTIONS.filter(q => q.data && q.data.observer);
  const m = PATHWAY.observer;
  return (
    <div>
      <div style={{background:m.bg,border:`1px solid ${m.color}40`,borderRadius:"12px",padding:"1.5rem",marginBottom:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem"}}>
          <span style={{fontSize:"1.5rem"}}>{m.emoji}</span>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",fontWeight:700,color:m.color,margin:0}}>The Witnesses</h2>
        </div>
        <div style={{fontSize:"0.7rem",color:m.color,fontWeight:600,marginBottom:"0.6rem"}}>The Observer, Partner & Ally Pathway · n = 37</div>
        <p style={{fontSize:"0.85rem",color:P.textSec,lineHeight:1.55,marginBottom:"0.5rem"}}>Partners, parents, healthcare professionals, and allies who have observed the impact of circumcision in others' lives. This pathway provides an independent witness perspective — people without a personal anatomical stake who answered the cross-cutting attitudinal questions.</p>
        <p style={{fontSize:"0.78rem",color:P.text,lineHeight:1.55,fontStyle:"italic",marginTop:"0.6rem"}}>Their answers are striking: <strong style={{color:m.color}}>97% prioritize bodily autonomy. 90.9% would keep their own sons intact. 48.5% strongly prefer the intact aesthetic.</strong></p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
        {observerQs.map(q => <QCard key={q.id} q={q} defaultPathway="observer" />)}
      </div>
    </div>
  );
}

/* ═════════════════════ MAIN APP ═════════════════════ */
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState("curated"); // curated | all | mirror | observer

  // Show methodology on first visit (simulated with state)
  const [hasSeenMethodology, setHasSeenMethodology] = useState(true); // set false to auto-show

  const handleSelect = (id) => {
    if (id.startsWith("section-")) {
      const sectionId = id.replace("section-","");
      if (sectionId === "observer") setView("observer");
      else setView("curated");
      setActiveId(null);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({behavior:"smooth", block:"start"});
      }, 100);
    } else if (MIRROR_PAIRS.find(p=>p.id===id)) {
      setView("mirror");
      setActiveId(id);
    } else {
      setView("all");
      setActiveId(id);
    }
    setSidebarOpen(false);
  };

  const currentQ = ALL_QUESTIONS.find(q=>q.id===activeId);
  const currentM = MIRROR_PAIRS.find(p=>p.id===activeId);

  return (
    <div style={{fontFamily:"'Barlow',sans-serif",background:P.bg,color:P.text,minHeight:"100vh"}}>
      <Sidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)} onSelect={handleSelect} activeId={activeId} />
      {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:150}} />}
      <MethodologyModal open={methodologyOpen} onClose={()=>setMethodologyOpen(false)} />

      {/* Top nav */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(14,14,16,0.95)",backdropFilter:"blur(8px)",borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",padding:"0.5rem 1rem",gap:"0.6rem",flexWrap:"wrap"}}>
        <button onClick={()=>setSidebarOpen(true)} style={{background:"none",border:`1px solid ${P.border}`,borderRadius:"4px",color:P.textSec,cursor:"pointer",padding:"0.3rem 0.5rem",fontSize:"0.75rem",display:"flex",alignItems:"center",gap:"0.3rem"}}>
          <span style={{fontSize:"1rem"}}>☰</span>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.62rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em"}}>Navigate</span>
        </button>
        <a href="https://circumsurvey.online" target="_blank" style={{fontFamily:"'Playfair Display',serif",fontSize:"0.82rem",fontWeight:700,color:P.gold,textDecoration:"none",flex:1,minWidth:"160px"}}>
          The Accidental Intactivist's Inquiry
        </a>
        <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap"}}>
          {[{id:"curated",l:"Curated"},{id:"all",l:"All"},{id:"mirror",l:"Mirror"},{id:"observer",l:"Witnesses"}].map(t =>
            <button key={t.id} onClick={()=>{setView(t.id);setActiveId(null);}} style={{
              padding:"0.2rem 0.55rem",borderRadius:"100px",cursor:"pointer",fontSize:"0.58rem",
              border:view===t.id?`1.5px solid ${P.gold}`:`1px solid ${P.border}`,
              background:view===t.id?P.goldDim:"transparent",color:view===t.id?P.gold:P.textMut,
              fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,textTransform:"uppercase",
            }}>{t.l}</button>
          )}
        </div>
        <button onClick={()=>setMethodologyOpen(true)} style={{background:"none",border:"none",color:P.textSec,cursor:"pointer",fontSize:"0.62rem",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em"}}>📋 Methodology</button>
        <a href="https://forms.gle/FQ8o9g7j1yU3Cw7n7" target="_blank" style={{fontSize:"0.55rem",fontWeight:700,color:P.bg,background:P.gold,padding:"0.25rem 0.6rem",borderRadius:"3px",textDecoration:"none",textTransform:"uppercase",letterSpacing:"0.03em"}}>Take Survey</a>
      </nav>

      {/* Hero */}
      {!activeId && (
        <header style={{padding:"3rem 1.25rem 2rem",textAlign:"center",borderBottom:`1px solid ${P.border}`}}>
          <div style={{fontSize:"0.55rem",letterSpacing:"0.12em",textTransform:"uppercase",color:P.gold,fontWeight:700,marginBottom:"0.6rem"}}>Phase 1 · Preliminary Findings</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.5rem,3vw,2.2rem)",fontWeight:700,lineHeight:1.15,marginBottom:"0.6rem"}}>
            Six Pathways. 496 Voices. The Data.
          </h1>
          <p style={{fontSize:"0.8rem",color:P.textSec,maxWidth:"500px",margin:"0 auto 1rem",lineHeight:1.55}}>
            Browse comparative findings across pathways. Toggle perspectives. See mirror questions side by side. Read voices from the survey itself. The data speaks for itself.
          </p>
          <div style={{display:"flex",justifyContent:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1.25rem"}}>
            {Object.entries(PATHWAY).filter(([k])=>k!=="born_circ").map(([k,m])=>
              <span key={k} style={{display:"inline-flex",alignItems:"center",gap:"0.2rem",background:m.bg,border:`1px solid ${m.color}30`,borderRadius:"5px",padding:"0.2rem 0.5rem",fontSize:"0.62rem"}}>
                {m.emoji} <strong style={{color:m.color}}>n={m.n}</strong> <span style={{color:P.textMut}}>{m.short}</span>
              </span>
            )}
          </div>
          <div style={{fontSize:"0.6rem",color:P.gold,fontStyle:"italic",maxWidth:"480px",margin:"0 auto"}}>"We are not telling people how to feel. We are creating a platform for them to anonymously share how they actually feel and what they actually experience."</div>
        </header>
      )}

      {/* Content */}
      <div style={{maxWidth:"840px",margin:"0 auto",padding:"1.5rem 1.25rem 3rem"}}>

        {activeId && currentQ && <QCard q={currentQ} />}
        {activeId && currentM && <MirrorCard pair={currentM} />}

        {view === "curated" && !activeId && (
          <>
            {CURATED_SECTIONS.map(sec => (
              <div key={sec.id} id={`section-${sec.id}`} style={{marginBottom:"2rem",scrollMarginTop:"4rem"}}>
                <div style={{borderBottom:`1px solid ${P.border}`,paddingBottom:"0.5rem",marginBottom:"0.75rem"}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",fontWeight:700,color:P.text,margin:0}}>{sec.title}</h3>
                  <div style={{fontSize:"0.7rem",color:P.textSec,marginTop:"0.15rem"}}>{sec.desc}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
                  {sec.question_ids.map(id => {
                    const q = ALL_QUESTIONS.find(x=>x.id===id);
                    const m = MIRROR_PAIRS.find(x=>x.id===id);
                    if (q) return <QCard key={id} q={q} />;
                    if (m) return <MirrorCard key={id} pair={m} />;
                    return null;
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {view === "all" && !activeId && (
          <>
            {CATS.map(cat => (
              <div key={cat} style={{marginBottom:"1.5rem"}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"1rem",fontWeight:700,marginBottom:"0.5rem",color:P.gold,borderBottom:`1px solid ${P.border}`,paddingBottom:"0.25rem"}}>{cat}</h3>
                <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
                  {ALL_QUESTIONS.filter(q=>q.cat===cat).map(q => <QCard key={q.id} q={q} />)}
                </div>
              </div>
            ))}
          </>
        )}

        {view === "mirror" && !activeId && (
          <>
            <div style={{fontSize:"0.55rem",color:P.gold,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.3rem"}}>Mirror Comparisons</div>
            <p style={{fontSize:"0.78rem",color:P.textSec,marginBottom:"1.25rem",lineHeight:1.55}}>
              The same conceptual question, asked from opposite pathways. The parallel structure surfaces asymmetries — in awareness, curiosity, regret, and social attention.
            </p>
            {MIRROR_PAIRS.map(p => <MirrorCard key={p.id} pair={p} />)}
          </>
        )}

        {view === "observer" && !activeId && <ObserverSection />}
      </div>

      {/* CTA */}
      <div style={{background:P.goldDim,borderTop:`1px solid ${P.goldBorder}`,padding:"2.5rem 1.25rem",textAlign:"center"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.15rem",fontWeight:700,marginBottom:"0.4rem"}}>Add Your Voice</div>
        <p style={{fontSize:"0.78rem",color:P.textSec,maxWidth:"380px",margin:"0 auto 1rem"}}>Every perspective strengthens this dataset. 15–60 min, fully anonymous, all questions optional.</p>
        <a href="https://forms.gle/FQ8o9g7j1yU3Cw7n7" target="_blank" style={{display:"inline-block",padding:"0.55rem 1.5rem",background:P.gold,color:P.bg,fontWeight:700,textDecoration:"none",borderRadius:"4px",fontSize:"0.8rem",textTransform:"uppercase",letterSpacing:"0.03em"}}>Take the Survey</a>
      </div>

      {/* Footer */}
      <footer style={{padding:"1.5rem",textAlign:"center",fontSize:"0.58rem",color:"#444",borderTop:`1px solid ${P.border}`,lineHeight:1.8}}>
        <a href="https://circumsurvey.online" style={{color:P.gold,textDecoration:"none"}}>circumsurvey.online</a> · Phase 1 · n=496 · By Tone Pettit · <a href="mailto:tone@circumsurvey.online" style={{color:P.gold,textDecoration:"none"}}>tone@circumsurvey.online</a>
        <br/><a href="https://circumsurvey.online/about" target="_blank" style={{color:"#666",textDecoration:"none"}}>Methodology</a> · <a href="https://circumsurvey.online/faq" target="_blank" style={{color:"#666",textDecoration:"none"}}>FAQ</a> · <a href="https://theaccidentalintactivist.substack.com" target="_blank" style={{color:"#666",textDecoration:"none"}}>Substack</a>
        <br/>Strategic partners: Intact Global · GALDEF · DOC · WIBM
      </footer>
    </div>
  );
}
