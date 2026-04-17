import { useState } from "react";
import {
  META, PATHWAY, SPEC,
  ALL_QUESTIONS, MIRROR_PAIRS, QUOTE_GALLERIES,
  CURATED_SECTIONS
} from "./data.js";

/* ═════════════════════ PALETTE ═════════════════════ */
const P = {
  bg:"#0e0e10",panel:"#131316",card:"#18181c",cardHover:"#1e1e24",
  border:"#222228",borderLight:"#2a2a32",
  gold:"#d4a030",goldDim:"rgba(212,160,48,0.10)",goldBorder:"rgba(212,160,48,0.25)",
  red:"#cc2a2a",redDim:"rgba(204,42,42,0.08)",
  text:"#eeeef0",textSec:"#8a8a96",textMut:"#55555f",textGhost:"#333340",
};

const CATS = [...new Set(ALL_QUESTIONS.map(q=>q.cat))];

/* ═════════════════════ SVG PIE ═════════════════════ */
function Pie({ data, colors, size=150, hovered, onHover }) {
  const total = data.reduce((a,b)=>a+b,0);
  if (!total) return null;
  let cum = 0;
  const r=size/2-3, cx=size/2, cy=size/2;
  const rad=d=>(d-90)*Math.PI/180;
  return (
    <svg width={size} height={size} style={{display:"block"}}>
      {data.map((v,i)=>{
        if(v<=0) return null;
        const s=cum/total*360; cum+=v; const e=cum/total*360;
        const la=e-s>180?1:0;
        const x1=cx+r*Math.cos(rad(s)),y1=cy+r*Math.sin(rad(s));
        const x2=cx+r*Math.cos(rad(e)),y2=cy+r*Math.sin(rad(e));
        const active=hovered===i;
        return <path key={i}
          d={`M${cx},${cy}L${x1},${y1}A${r},${r} 0 ${la},1 ${x2},${y2}Z`}
          fill={colors[i%colors.length]} stroke={P.card} strokeWidth="1.5"
          opacity={hovered!==null&&!active?0.35:1}
          style={{transition:"opacity 0.15s,transform 0.15s",transformOrigin:`${cx}px ${cy}px`,transform:active?"scale(1.04)":"",cursor:"pointer"}}
          onMouseEnter={()=>onHover(i)} onMouseLeave={()=>onHover(null)} />;
      })}
      <circle cx={cx} cy={cy} r={r*0.4} fill={P.card}/>
    </svg>
  );
}

/* ═════════════════════ PATHWAY TOGGLE ═════════════════════ */
function PathwayToggle({ pathways, active, onChange, showCombined }) {
  const options = pathways.includes("circumcised") && pathways.includes("restoring") && showCombined
    ? ["born_circ",...pathways.filter(p=>p!=="observer"),...(pathways.includes("observer")?["observer"]:[])]
    : pathways;
  return (
    <div style={{display:"flex",gap:"0.25rem",flexWrap:"wrap",justifyContent:"center"}}>
      {options.map(p=>{
        const m=PATHWAY[p]; if(!m) return null;
        const on=active===p;
        return <button key={p} onClick={()=>onChange(p)} style={{
          padding:"0.2rem 0.55rem",borderRadius:"100px",cursor:"pointer",fontSize:"0.62rem",
          border:on?`1.5px solid ${m.color}`:`1px solid ${P.border}`,
          background:on?m.bg:"transparent",color:on?m.color:P.textMut,
          fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,letterSpacing:"0.03em",transition:"all 0.15s",
        }}>{m.emoji} {m.short}</button>;
      })}
    </div>
  );
}

/* ═════════════════════ COMBINED DATA ═════════════════════ */
function getCombinedData(q) {
  const cN=PATHWAY.circumcised.n, rN=PATHWAY.restoring.n, total=cN+rN;
  if(q.type==="avg") return (q.data.circumcised*cN+q.data.restoring*rN)/total;
  return q.data.circumcised.map((v,i)=>(v*cN+q.data.restoring[i]*rN)/total);
}

/* ═════════════════════ QUESTION CARD ═════════════════════ */
function QCard({ q, defaultPathway }) {
  const pathways=q.pathways||(q.data?Object.keys(q.data).filter(k=>k!=="born_circ"):Object.keys(PATHWAY).filter(p=>p!=="born_circ"));
  const canCombine=pathways.includes("circumcised")&&pathways.includes("restoring");
  const [ac,setAc]=useState(defaultPathway||(canCombine?"born_circ":pathways[0]));
  const [hov,setHov]=useState(null);
  const [showShare,setShowShare]=useState(false);
  const isAvg=q.type==="avg";
  const currentData=ac==="born_circ"?getCombinedData(q):q.data[ac];
  const currentMeta=PATHWAY[ac];
  const gallery=QUOTE_GALLERIES[q.id];

  return (
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:"12px",padding:"1.25rem",marginBottom:"0.75rem"}}>
      <div style={{display:"flex",gap:"1.25rem",alignItems:"flex-start",flexWrap:"wrap"}}>
        <div style={{width:"165px",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:"0.5rem"}}>
          {isAvg?(
            <div style={{width:160,height:140,display:"flex",alignItems:"flex-end",justifyContent:"center",gap:"0.5rem",paddingBottom:"0.3rem"}}>
              {pathways.map(p=>{
                const v=q.data[p],m=PATHWAY[p],h=(v/5)*110;
                return <div key={p} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.15rem"}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.58rem",fontWeight:700,color:m.color}}>{v.toFixed(2)}</span>
                  <div style={{width:"22px",height:`${h}px`,background:m.color,borderRadius:"3px 3px 0 0",transition:"height 0.4s"}}/>
                  <span style={{fontSize:"0.45rem",color:P.textMut}}>{m.emoji}</span>
                </div>;
              })}
            </div>
          ):(
            <>
              <Pie data={currentData||[]} colors={q.colors} hovered={hov} onHover={setHov}/>
              <PathwayToggle pathways={pathways} active={ac} onChange={setAc} showCombined={canCombine}/>
            </>
          )}
        </div>

        <div style={{flex:1,minWidth:"180px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"0.5rem",marginBottom:"0.3rem"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:"0.55rem",color:P.gold,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.1rem"}}>{q.cat}</div>
              <div style={{fontSize:"0.85rem",fontWeight:600,lineHeight:1.3}}>{q.q}</div>
              {q.sub&&<div style={{fontSize:"0.65rem",color:P.textMut,fontStyle:"italic",marginTop:"0.15rem"}}>{q.sub}</div>}
            </div>
            <button onClick={()=>setShowShare(!showShare)}
              style={{background:"none",border:`1px solid ${P.border}`,borderRadius:"4px",color:P.textMut,cursor:"pointer",padding:"0.2rem 0.4rem",fontSize:"0.62rem",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,whiteSpace:"nowrap"}}>↗ Share</button>
          </div>

          {q.note&&<div style={{fontSize:"0.62rem",color:P.gold,fontStyle:"italic",marginBottom:"0.5rem",padding:"0.3rem 0.5rem",background:P.goldDim,borderRadius:"3px",borderLeft:`2px solid ${P.gold}`}}>{q.note}</div>}

          {isAvg?(
            <div style={{fontSize:"0.72rem",color:P.textSec,lineHeight:1.65}}>
              {pathways.map(p=>{const m=PATHWAY[p];return <div key={p}>{m.emoji} <strong style={{color:m.color}}>{q.data[p].toFixed(2)}</strong> <span style={{color:P.textMut}}>— {m.label}</span></div>;})}
              {q.data.intact&&q.data.circumcised&&<div style={{marginTop:"0.3rem",fontSize:"0.62rem",color:P.gold}}>Δ {(q.data.intact-q.data.circumcised).toFixed(2)} ({((q.data.intact-q.data.circumcised)/q.data.intact*100).toFixed(0)}% drop, intact → circumcised)</div>}
            </div>
          ):(
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.3rem"}}>
                <span style={{fontSize:"0.62rem",color:currentMeta.color,fontWeight:600}}>{currentMeta.emoji} {currentMeta.label} <span style={{color:P.textMut,fontWeight:400}}>(n={currentMeta.n})</span></span>
                {ac==="born_circ"&&<span style={{fontSize:"0.55rem",color:P.textMut,fontStyle:"italic"}}>Weighted avg: Circ + Restoring</span>}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"0.15rem"}}>
                {(q.opts||[]).map((opt,i)=>{
                  const val=currentData?.[i]??0; const isH=hov===i;
                  return <div key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
                    style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.1rem 0",opacity:hov!==null&&!isH?0.35:1,transition:"opacity 0.12s",cursor:"default"}}>
                    <span style={{width:9,height:9,borderRadius:2,background:q.colors[i%q.colors.length],flexShrink:0}}/>
                    <span style={{fontSize:"0.7rem",color:P.textSec,flex:1}}>{opt}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.68rem",fontWeight:700,color:isH?"#fff":P.textSec}}>{val.toFixed(1)}%</span>
                  </div>;
                })}
              </div>
            </>
          )}

          {showShare&&(
            <div style={{marginTop:"0.6rem",padding:"0.5rem 0.65rem",background:P.goldDim,border:`1px solid ${P.goldBorder}`,borderRadius:"4px",fontSize:"0.62rem",color:P.text}}>
              <div style={{fontWeight:600,marginBottom:"0.2rem",color:P.gold}}>Share this finding:</div>
              <div style={{color:P.textSec,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.6rem"}}>circumsurvey.online/findings#{q.id}</div>
              <div style={{marginTop:"0.3rem",color:P.textMut,fontStyle:"italic"}}>"From The Accidental Intactivist's Inquiry, {META.phase}, n={META.totalRespondents}"</div>
            </div>
          )}
        </div>
      </div>

      {gallery&&(
        <div style={{marginTop:"1rem",paddingTop:"1rem",borderTop:`1px solid ${P.border}`}}>
          <div style={{fontSize:"0.55rem",color:P.gold,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.6rem"}}>Voices from the Survey</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"0.6rem"}}>
            {Object.entries(gallery).map(([pathway,quotes])=>{
              const m=PATHWAY[pathway];
              return quotes.map((qt,i)=>(
                <div key={`${pathway}-${i}`} style={{background:m.bg,borderLeft:`3px solid ${m.color}`,padding:"0.6rem 0.75rem",borderRadius:"0 4px 4px 0"}}>
                  <div style={{fontSize:"0.7rem",color:P.text,lineHeight:1.45,fontStyle:"italic",marginBottom:"0.35rem"}}>"{qt.text}"</div>
                  <div style={{fontSize:"0.55rem",color:m.color,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>— {m.short} Pathway · {qt.context}</div>
                </div>
              ));
            })}
          </div>
          <div style={{fontSize:"0.55rem",color:P.textMut,marginTop:"0.5rem",fontStyle:"italic"}}>Anonymous quotes from open-ended responses. All identifying details removed.</div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════ MIRROR CARD ═════════════════════ */
function MirrorCard({ pair }) {
  const gallery=QUOTE_GALLERIES[pair.id];
  return (
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:"12px",padding:"1.25rem",marginBottom:"0.75rem"}}>
      <div style={{textAlign:"center",marginBottom:"0.75rem"}}>
        <div style={{fontSize:"0.55rem",color:P.gold,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.15rem"}}>Mirror Comparison</div>
        <div style={{fontSize:"0.95rem",fontWeight:600}}>{pair.title}</div>
        {pair.sub&&<div style={{fontSize:"0.7rem",color:P.textSec,marginTop:"0.15rem"}}>{pair.sub}</div>}
      </div>
      {pair.note&&<div style={{fontSize:"0.62rem",color:P.gold,fontStyle:"italic",marginBottom:"0.75rem",padding:"0.4rem 0.6rem",background:P.goldDim,borderRadius:"3px",borderLeft:`2px solid ${P.gold}`}}>📋 {pair.note}</div>}
      <div style={{display:"flex",gap:"1.25rem",flexWrap:"wrap"}}>
        {[pair.left,pair.right].map((side,si)=>{
          const m=PATHWAY[side.pathway];
          return <div key={si} style={{flex:1,minWidth:"200px"}}>
            <div style={{fontSize:"0.7rem",fontWeight:600,color:m.color,marginBottom:"0.1rem"}}>{m.emoji} {m.label}</div>
            <div style={{fontSize:"0.62rem",color:P.textMut,marginBottom:"0.5rem",lineHeight:1.4,fontStyle:"italic"}}>{side.q}</div>
            {side.opts.map((opt,i)=>{
              const v=side.data[i]||0;
              return <div key={i} style={{display:"flex",alignItems:"center",gap:"0.35rem",marginBottom:"0.25rem"}}>
                <div style={{flex:1,height:"16px",background:"rgba(255,255,255,0.03)",borderRadius:"3px",overflow:"hidden"}}>
                  <div style={{width:`${v}%`,height:"100%",background:pair.colors[i%pair.colors.length],borderRadius:"3px",transition:"width 0.5s",display:"flex",alignItems:"center",paddingLeft:"4px",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.5rem",fontWeight:700,color:"rgba(0,0,0,0.65)"}}>
                    {v>12?`${v.toFixed(1)}%`:""}
                  </div>
                </div>
                <span style={{fontSize:"0.58rem",color:P.textSec,width:"95px",flexShrink:0}}>{opt}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.58rem",fontWeight:700,color:P.textSec,width:"36px",textAlign:"right"}}>{v.toFixed(1)}%</span>
              </div>;
            })}
          </div>;
        })}
      </div>
      {gallery&&(
        <div style={{marginTop:"1rem",paddingTop:"1rem",borderTop:`1px solid ${P.border}`}}>
          <div style={{fontSize:"0.55rem",color:P.gold,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.6rem"}}>Voices from the Survey</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"0.6rem"}}>
            {Object.entries(gallery).map(([pathway,quotes])=>{
              const m=PATHWAY[pathway];
              return quotes.map((qt,i)=>(
                <div key={`${pathway}-${i}`} style={{background:m.bg,borderLeft:`3px solid ${m.color}`,padding:"0.6rem 0.75rem",borderRadius:"0 4px 4px 0"}}>
                  <div style={{fontSize:"0.7rem",color:P.text,lineHeight:1.45,fontStyle:"italic",marginBottom:"0.35rem"}}>"{qt.text}"</div>
                  <div style={{fontSize:"0.55rem",color:m.color,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>— {m.short} Pathway · {qt.context}</div>
                </div>
              ));
            })}
          </div>
          <div style={{fontSize:"0.55rem",color:P.textMut,marginTop:"0.5rem",fontStyle:"italic"}}>Anonymous quotes from open-ended responses. All identifying details removed.</div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════ OBSERVER SECTION ═════════════════════ */
function ObserverSection() {
  const observerQs=ALL_QUESTIONS.filter(q=>q.data&&q.data.observer);
  const m=PATHWAY.observer;
  return (
    <div>
      <div style={{background:m.bg,border:`1px solid ${m.color}40`,borderRadius:"12px",padding:"1.5rem",marginBottom:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem"}}>
          <span style={{fontSize:"1.5rem"}}>{m.emoji}</span>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",fontWeight:700,color:m.color,margin:0}}>The Witnesses</h2>
        </div>
        <div style={{fontSize:"0.7rem",color:m.color,fontWeight:600,marginBottom:"0.6rem"}}>The Observer, Partner & Ally Pathway · n = {m.n}</div>
        <p style={{fontSize:"0.85rem",color:P.textSec,lineHeight:1.55,marginBottom:"0.5rem"}}>Partners, parents, healthcare professionals, and allies who have observed the impact of circumcision in others' lives. Their independent witness perspective — without a personal anatomical stake — makes their answers striking.</p>
        <p style={{fontSize:"0.78rem",color:P.text,lineHeight:1.55,fontStyle:"italic",marginTop:"0.6rem"}}><strong style={{color:m.color}}>97% prioritize bodily autonomy. 90.9% would keep their sons intact. 48.5% strongly prefer the intact aesthetic.</strong></p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
        {observerQs.map(q=><QCard key={q.id} q={q} defaultPathway="observer"/>)}
      </div>
    </div>
  );
}

/* ═════════════════════ SIDEBAR ═════════════════════ */
function Sidebar({ open, onClose, onSelect, activeId }) {
  const [search,setSearch]=useState("");
  const [expanded,setExpanded]=useState(new Set(["Curated Findings"]));
  const toggle=cat=>setExpanded(prev=>{const n=new Set(prev);n.has(cat)?n.delete(cat):n.add(cat);return n;});
  const sections=[
    {cat:"Curated Findings",color:P.gold,items:CURATED_SECTIONS.map(s=>({id:`section-${s.id}`,label:s.title,isSection:true}))},
    {cat:"Mirror Pairs",color:PATHWAY.circumcised.color,items:MIRROR_PAIRS.map(p=>({id:p.id,label:p.title}))},
    {cat:"Observer Pathway",color:PATHWAY.observer.color,items:[{id:"section-observer",label:"The Witnesses (n=37)",isSection:true}]},
    ...CATS.map(cat=>({cat,color:P.textSec,items:ALL_QUESTIONS.filter(q=>q.cat===cat).map(q=>({id:q.id,label:q.q}))})),
  ];
  const matchesSearch=item=>!search||item.label.toLowerCase().includes(search.toLowerCase());
  return (
    <div style={{position:"fixed",top:0,left:0,bottom:0,width:"310px",background:P.panel,borderRight:`1px solid ${P.border}`,zIndex:200,transform:open?"translateX(0)":"translateX(-100%)",transition:"transform 0.25s ease",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"0.75rem 1rem",borderBottom:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.8rem",fontWeight:700,color:P.gold,textTransform:"uppercase",letterSpacing:"0.06em"}}>Navigate</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:P.textMut,cursor:"pointer",fontSize:"1.2rem",padding:"0.2rem"}}>✕</button>
      </div>
      <div style={{padding:"0.5rem 0.75rem"}}>
        <input type="text" placeholder="Search all questions..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{width:"100%",padding:"0.4rem 0.65rem",background:"rgba(255,255,255,0.03)",border:`1px solid ${P.border}`,borderRadius:"5px",color:P.text,fontSize:"0.72rem",fontFamily:"'Barlow',sans-serif",outline:"none",boxSizing:"border-box"}}/>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 0.5rem 1rem"}}>
        {sections.map(sec=>{
          const visible=sec.items.filter(matchesSearch);
          if(search&&visible.length===0) return null;
          const isOpen=expanded.has(sec.cat)||!!search;
          return <div key={sec.cat} style={{marginBottom:"0.25rem"}}>
            <button onClick={()=>toggle(sec.cat)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.4rem 0.5rem",background:"none",border:"none",cursor:"pointer",color:sec.color,fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.7rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",textAlign:"left",borderRadius:"4px"}}>
              <span>{sec.cat} ({visible.length})</span>
              <span style={{fontSize:"0.6rem",transition:"transform 0.15s",transform:isOpen?"rotate(180deg)":""}}>▾</span>
            </button>
            {isOpen&&visible.map(item=>{
              const isActive=activeId===item.id;
              return <button key={item.id} onClick={()=>onSelect(item.id)}
                style={{display:"block",width:"100%",textAlign:"left",padding:"0.3rem 0.5rem 0.3rem 1.25rem",background:isActive?P.goldDim:"none",border:"none",cursor:"pointer",color:isActive?P.gold:P.textMut,fontSize:"0.65rem",lineHeight:1.35,borderRadius:"3px",borderLeft:isActive?`2px solid ${P.gold}`:"2px solid transparent",transition:"all 0.1s",fontFamily:"'Barlow',sans-serif"}}>
                {item.label.length>60?item.label.substring(0,57)+"...":item.label}
              </button>;
            })}
          </div>;
        })}
      </div>
      <div style={{padding:"0.5rem 0.75rem",borderTop:`1px solid ${P.border}`,fontSize:"0.55rem",color:P.textMut,textAlign:"center"}}>
        {ALL_QUESTIONS.length + MIRROR_PAIRS.length} items · {META.totalRespondents} respondents
      </div>
    </div>
  );
}

/* ═════════════════════ METHODOLOGY MODAL ═════════════════════ */
function MethodologyModal({ open, onClose }) {
  if(!open) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:"12px",padding:"2rem",maxWidth:"500px",width:"100%",maxHeight:"80vh",overflowY:"auto",position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:"0.75rem",right:"0.75rem",background:"none",border:"none",color:P.textMut,cursor:"pointer",fontSize:"1.3rem"}}>✕</button>
        <div style={{fontSize:"0.55rem",color:P.gold,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.3rem"}}>About This Inquiry</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",fontWeight:700,marginBottom:"0.75rem",color:P.text}}>Methodology & Ethics</h2>
        <div style={{fontSize:"0.78rem",color:P.textSec,lineHeight:1.6}}>
          <p style={{marginBottom:"0.75rem",fontStyle:"italic",color:P.gold}}>"We are not telling people how to feel. We are creating a platform for them to anonymously share how they actually feel and what they actually experience."</p>
          <p style={{marginBottom:"0.6rem"}}><strong style={{color:P.text}}>Anonymous & voluntary.</strong> No emails, IPs, or personal identifiers collected. Every question optional.</p>
          <p style={{marginBottom:"0.6rem"}}><strong style={{color:P.text}}>Designed to reduce framing bias.</strong> Sexual experience questions appear before pathway assignment, gathering less biased comparative data.</p>
          <p style={{marginBottom:"0.6rem"}}><strong style={{color:P.text}}>All perspectives welcome.</strong> The survey actively solicits satisfied circumcised experiences alongside those who feel harmed. Observer Pathway captures partners, parents, and HCPs.</p>
          <p style={{marginBottom:"0.6rem"}}><strong style={{color:P.text}}>Independent research.</strong> Led by Tone Pettit, Seattle-based independent researcher. No formal IRB, but designed with ethical research principles throughout.</p>
          <p style={{marginBottom:"0.6rem"}}><strong style={{color:P.text}}>Language.</strong> "Resentment" (not regret) for circumcised respondents — they did not have agency. "Pathways" not cohorts. "Respondents" throughout, reflecting the full demographic range.</p>
          <p style={{marginBottom:"1rem"}}><strong style={{color:P.text}}>Limitations.</strong> Self-selection bias is inherent to anonymous online surveys. Results reflect experiences of those who chose to participate. Descriptive, not inferential statistics.</p>
          <a href="https://circumsurvey.online/about" target="_blank" rel="noreferrer" style={{display:"inline-block",padding:"0.5rem 1rem",background:P.gold,color:P.bg,textDecoration:"none",fontWeight:700,borderRadius:"4px",fontSize:"0.75rem",textTransform:"uppercase",letterSpacing:"0.04em"}}>Read Full Methodology →</a>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════ MAIN APP ═════════════════════ */
export default function App() {
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [methodologyOpen,setMethodologyOpen]=useState(false);
  const [activeId,setActiveId]=useState(null);
  const [view,setView]=useState("curated");

  const handleSelect=id=>{
    if(id.startsWith("section-")){
      const sectionId=id.replace("section-","");
      if(sectionId==="observer") setView("observer");
      else setView("curated");
      setActiveId(null);
      setTimeout(()=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});},100);
    }else if(MIRROR_PAIRS.find(p=>p.id===id)){
      setView("mirror");setActiveId(id);
    }else{
      setView("all");setActiveId(id);
    }
    setSidebarOpen(false);
  };

  const currentQ=ALL_QUESTIONS.find(q=>q.id===activeId);
  const currentM=MIRROR_PAIRS.find(p=>p.id===activeId);
  const bg=P.bg;

  return (
    <div style={{fontFamily:"'Barlow',sans-serif",background:bg,color:P.text,minHeight:"100vh"}}>
      <Sidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)} onSelect={handleSelect} activeId={activeId}/>
      {sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:150}}/>}
      <MethodologyModal open={methodologyOpen} onClose={()=>setMethodologyOpen(false)}/>

      {/* ── Nav ── */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(14,14,16,0.95)",backdropFilter:"blur(8px)",borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",padding:"0.5rem 1rem",gap:"0.6rem",flexWrap:"wrap"}}>
        <button onClick={()=>setSidebarOpen(true)} style={{background:"none",border:`1px solid ${P.border}`,borderRadius:"4px",color:P.textSec,cursor:"pointer",padding:"0.3rem 0.5rem",fontSize:"0.75rem",display:"flex",alignItems:"center",gap:"0.3rem"}}>
          <span style={{fontSize:"1rem"}}>☰</span>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.62rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em"}}>Navigate</span>
        </button>
        <a href="https://circumsurvey.online" target="_blank" rel="noreferrer" style={{fontFamily:"'Playfair Display',serif",fontSize:"0.82rem",fontWeight:700,color:P.gold,textDecoration:"none",flex:1,minWidth:"160px"}}>
          The Accidental Intactivist's Inquiry
        </a>
        <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap"}}>
          {[{id:"curated",l:"Curated"},{id:"all",l:"All Questions"},{id:"mirror",l:"Mirror Pairs"},{id:"observer",l:"Witnesses"}].map(t=>
            <button key={t.id} onClick={()=>{setView(t.id);setActiveId(null);}} style={{
              padding:"0.2rem 0.55rem",borderRadius:"100px",cursor:"pointer",fontSize:"0.58rem",
              border:view===t.id?`1.5px solid ${P.gold}`:`1px solid ${P.border}`,
              background:view===t.id?P.goldDim:"transparent",color:view===t.id?P.gold:P.textMut,
              fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,textTransform:"uppercase",
            }}>{t.l}</button>
          )}
        </div>
        <button onClick={()=>setMethodologyOpen(true)} style={{background:"none",border:"none",color:P.textSec,cursor:"pointer",fontSize:"0.62rem",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em"}}>📋 Methodology</button>
        <a href="https://forms.gle/FQ8o9g7j1yU3Cw7n7" target="_blank" rel="noreferrer" style={{fontSize:"0.55rem",fontWeight:700,color:P.bg,background:P.gold,padding:"0.25rem 0.6rem",borderRadius:"3px",textDecoration:"none",textTransform:"uppercase",letterSpacing:"0.03em"}}>Take Survey</a>
      </nav>

      {/* ── Hero ── */}
      {!activeId&&(
        <header style={{padding:"3rem 1.25rem 2rem",textAlign:"center",borderBottom:`1px solid ${P.border}`}}>
          <div style={{fontSize:"0.55rem",letterSpacing:"0.12em",textTransform:"uppercase",color:P.gold,fontWeight:700,marginBottom:"0.6rem"}}>{META.phase}</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.5rem,3vw,2.2rem)",fontWeight:700,lineHeight:1.15,marginBottom:"0.6rem"}}>
            Six Pathways. {META.totalRespondents} Voices. The Data.
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

      {/* ── Content ── */}
      <div style={{maxWidth:"840px",margin:"0 auto",padding:"1.5rem 1.25rem 3rem"}}>

        {activeId&&currentQ&&<QCard q={currentQ}/>}
        {activeId&&currentM&&<MirrorCard pair={currentM}/>}

        {view==="curated"&&!activeId&&(
          <>
            {CURATED_SECTIONS.map(sec=>(
              <div key={sec.id} id={`section-${sec.id}`} style={{marginBottom:"2rem",scrollMarginTop:"4rem"}}>
                <div style={{borderBottom:`1px solid ${P.border}`,paddingBottom:"0.5rem",marginBottom:"0.75rem"}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",fontWeight:700,color:P.text,margin:0}}>{sec.title}</h3>
                  <div style={{fontSize:"0.7rem",color:P.textSec,marginTop:"0.15rem"}}>{sec.desc}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
                  {sec.question_ids.map(id=>{
                    const q=ALL_QUESTIONS.find(x=>x.id===id);
                    const m=MIRROR_PAIRS.find(x=>x.id===id);
                    if(q) return <QCard key={id} q={q}/>;
                    if(m) return <MirrorCard key={id} pair={m}/>;
                    return null;
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {view==="all"&&!activeId&&(
          <>
            {CATS.map(cat=>(
              <div key={cat} style={{marginBottom:"1.5rem"}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"1rem",fontWeight:700,marginBottom:"0.5rem",color:P.gold,borderBottom:`1px solid ${P.border}`,paddingBottom:"0.25rem"}}>{cat}</h3>
                <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
                  {ALL_QUESTIONS.filter(q=>q.cat===cat).map(q=><QCard key={q.id} q={q}/>)}
                </div>
              </div>
            ))}
          </>
        )}

        {view==="mirror"&&!activeId&&(
          <>
            <div style={{fontSize:"0.55rem",color:P.gold,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.3rem"}}>Mirror Comparisons</div>
            <p style={{fontSize:"0.78rem",color:P.textSec,marginBottom:"1.25rem",lineHeight:1.55}}>
              The same conceptual question, asked from opposite pathway perspectives. The parallel structure surfaces asymmetries in awareness, curiosity, resentment, and social attention.
            </p>
            {MIRROR_PAIRS.map(p=><MirrorCard key={p.id} pair={p}/>)}
          </>
        )}

        {view==="observer"&&!activeId&&<ObserverSection/>}
      </div>

      {/* ── CTA ── */}
      <div style={{background:P.goldDim,borderTop:`1px solid ${P.goldBorder}`,padding:"2.5rem 1.25rem",textAlign:"center"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.15rem",fontWeight:700,marginBottom:"0.4rem"}}>Add Your Voice</div>
        <p style={{fontSize:"0.78rem",color:P.textSec,maxWidth:"380px",margin:"0 auto 1rem"}}>Every perspective strengthens this dataset. 30–90 min, fully anonymous, all questions optional.</p>
        <a href="https://forms.gle/FQ8o9g7j1yU3Cw7n7" target="_blank" rel="noreferrer" style={{display:"inline-block",padding:"0.55rem 1.5rem",background:P.gold,color:P.bg,fontWeight:700,textDecoration:"none",borderRadius:"4px",fontSize:"0.8rem",textTransform:"uppercase",letterSpacing:"0.03em"}}>Take the Survey</a>
      </div>

      {/* ── Footer ── */}
      <footer style={{padding:"1.5rem",textAlign:"center",fontSize:"0.58rem",color:"#444",borderTop:`1px solid ${P.border}`,lineHeight:1.8}}>
        <a href="https://circumsurvey.online" style={{color:P.gold,textDecoration:"none"}}>circumsurvey.online</a> · {META.phase} · n={META.totalRespondents} · By Tone Pettit · <a href="mailto:tone@circumsurvey.online" style={{color:P.gold,textDecoration:"none"}}>tone@circumsurvey.online</a>
        <br/><a href="https://circumsurvey.online/about" target="_blank" rel="noreferrer" style={{color:"#666",textDecoration:"none"}}>Methodology</a> · <a href="https://theaccidentalintactivist.substack.com" target="_blank" rel="noreferrer" style={{color:"#666",textDecoration:"none"}}>Substack</a>
        <br/>Strategic partners: Intact Global · GALDEF · DOC · WIBM
      </footer>
    </div>
  );
}
