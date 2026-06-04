import { useEffect, useMemo, useState } from "react";
import { useTooltip, Tooltip } from "../explore/components/Tooltip";
import { C, FONT } from "../explore/styles/tokens";

// Helper to wrap long strings for Sankey labels
function wrapText(text, maxChars = 22) {
  if (!text) return [""];
  
  // Explicitly force generation dates to wrap to a new line
  if (text.includes(" (born")) {
    const parts = text.split(" (born");
    if (parts.length === 2) {
      return [parts[0], "(born" + parts[1]];
    }
  }
  
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  for (const w of words) {
    if ((currentLine + " " + w).length > maxChars && currentLine) {
      lines.push(currentLine);
      currentLine = w;
    } else {
      currentLine = currentLine ? currentLine + " " + w : w;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Consolidates messy write-ins and multi-select comma joins into clean buckets
function consolidateLabel(rawLabel, questionId) {
  if (!rawLabel) return "Unknown";
  const l = rawLabel.toLowerCase();
  
  if (questionId && questionId.includes("profession")) {
    if (l.includes("stay-at-home") || l.includes("homemaker")) return "Stay-at-Home Parent";
    if (l.includes("education") || l.includes("teacher") || l.includes("professor") || l.includes("academia")) return "Education / Academia";
    if (l.includes("healthcare") || l.includes("medicine") || l.includes("nurse") || l.includes("doctor") || l.includes("medical") || l.includes("therapist")) return "Healthcare / Medicine";
    if (l.includes("business") || l.includes("finance") || l.includes("management") || l.includes("hr director")) return "Business / Finance";
    if (l.includes("clerical") || l.includes("administrative") || l.includes("secretary") || l.includes("coordinator")) return "Clerical / Admin";
    if (l.includes("retail") || l.includes("customer service") || l.includes("hospitality")) return "Retail / Hospitality";
    if (l.includes("skilled trades") || l.includes("electrician") || l.includes("mechanic") || l.includes("hairstylist") || l.includes("seamstris")) return "Skilled Trades";
    if (l.includes("factory") || l.includes("manufacturing") || l.includes("general labor") || l.includes("odd jobs")) return "Factory / General Labor";
    if (l.includes("law") || l.includes("government") || l.includes("public service") || l.includes("military") || l.includes("civil servant")) return "Gov't / Law / Military";
    if (l.includes("arts") || l.includes("humanities") || l.includes("entertainment") || l.includes("artist") || l.includes("writer") || l.includes("striper") || l.includes("journalism")) return "Arts / Entertainment";
    if (l.includes("science") || l.includes("research")) return "Science / Research";
    if (l.includes("tech") || l.includes("software") || l.includes("coder") || l.includes("engineering") || l.includes("architect")) return "Tech / Engineering";
    if (l.includes("personal care") || l.includes("service")) return "Personal Care / Service";
    if (l.includes("transportation") || l.includes("telecommunications")) return "Transport / Telecom";
    return "Other / Mixed Profession";
  }
  
  if (questionId === "demo_education_self" || questionId === "family_mother_education" || questionId === "family_father_education") {
    if (l.includes("less than high school")) return "Less than High School";
    if (l.includes("high school")) return "High School / GED";
    if (l.includes("trade school") || l.includes("apprenticeship") || l.includes("journeyman")) return "Trade / Apprenticeship";
    if (l.includes("some college") || l.includes("associate")) return "Some College / Associate's";
    if (l.includes("bachelor")) return "Bachelor's Degree";
    if (l.includes("master")) return "Master's Degree";
    if (l.includes("professional") || l.includes("jd") || l.includes("md") || l.includes("pharmd") || l.includes("dds")) return "Professional Degree (MD, JD, etc)";
    if (l.includes("doctoral") || l.includes("phd") || l.includes("edd")) return "Doctoral Degree (PhD, etc)";
  }
  
  if (questionId === "demo_sexuality") {
    const isStraight = l.includes("straight") || l.includes("hetero");
    const isGayLesbian = l.includes("gay") || l.includes("lesbian") || l.includes("homosexual");
    const isBiPan = l.includes("bi") || l.includes("pansexual") || l.includes("fluid") || l.includes("heteroflexible");
    const isAsexual = l.includes("asexual") || l.includes("demisexual");
    const isQueer = l.includes("queer") || l.includes("questioning") || l.includes("curious");
    
    if ((isStraight && isGayLesbian) || isBiPan) return "Bisexual / Pansexual / Fluid";
    if (isGayLesbian) return "Gay / Lesbian";
    if (isQueer) return "Queer / Questioning";
    if (isStraight) return "Straight / Heterosexual";
    if (isAsexual) return "Asexual / Demisexual";
    
    return "Other / Write-in";
  }
  
  if (questionId === "demo_gender_identity") {
    if (l.includes("trans")) return "Transgender";
    if (l.includes("non-binary") || l.includes("nonbinary") || l.includes("queer") || l.includes("fluid") || l.includes("agender") || l.includes("enby")) return "Non-binary / Genderqueer";
    if (l.includes("female") || l.includes("woman")) return "Female";
    if (l.includes("male") || l.includes("man") || l.includes("masculine")) return "Male";
    return "Other / Write-in";
  }
  
  if (questionId === "demo_sex_assigned_at_birth") {
    if (l.includes("intersex")) return "Intersex";
    if (l.includes("female") || l.includes("afab")) return "Female (AFAB)";
    if (l.includes("male") || l.includes("amab")) return "Male (AMAB)";
  }
  
  if (questionId === "family_ses") {
    if (l.includes("lower income") || l.includes("struggled to")) return "Lower Income";
    if (l.includes("working class") || l.includes("lower-middle income")) return "Working Class / Lower-Middle";
    if (l.includes("middle income") || l.includes("generally comfortable")) return "Middle Income";
    if (l.includes("upper-middle income") || l.includes("financially secure")) return "Upper-Middle Income";
    if (l.includes("upper income") || l.includes("wealthy")) return "Upper Income / Wealthy";
  }
  
  // Specific Long-Form Survey Question overrides
  if (questionId === "family_upbringing_status") {
    if (l.includes("birth/biological")) return "Raised by Biological Parents";
    if (l.includes("infant")) return "Adopted as Infant";
    if (l.includes("child or teenager")) return "Adopted as Child/Teenager";
    if (l.includes("different family structure")) return "Other Family Structure";
  }
  
  if (questionId === "family_father_status") {
    if (l.includes("intact")) return "Intact";
    if (l.includes("circumcised")) return "Circumcised";
    if (l.includes("restoring")) return "Restoring";
    if (l.includes("unsure") || l.includes("don't know")) return "Unsure / Unknown";
  }
  
  if (questionId === "religion_is_significant") {
    if (l.includes("major role")) return "Major Role";
    if (l.includes("minor")) return "Minor Role";
    if (l.includes("not a significant part")) return "Not Significant";
  }
  
  if (questionId === "religion_primary_tradition") {
    if (l.includes("christianity")) return "Christianity";
    if (l.includes("judaism")) return "Judaism";
    if (l.includes("islam")) return "Islam";
    if (l.includes("atheist") || l.includes("agnostic")) return "Atheist / Agnostic";
  }
  
  if (questionId === "culture_primary_view_of_circ") {
    if (l.includes("expected and considered")) return "Expected Standard";
    if (l.includes("cosmetic preference")) return "Cosmetic Preference";
    if (l.includes("medical necessity")) return "Medical Necessity";
    if (l.includes("religious requirement")) return "Religious Requirement";
    if (l.includes("private family choice")) return "Private Choice";
    if (l.includes("questioned, but ultimately")) return "Questioned Standard";
    if (l.includes("actively opposed")) return "Actively Opposed";
  }
  
  if (questionId === "culture_social_pressure_role") {
    if (l.includes("significant factor")) return "Significant Factor";
    if (l.includes("minor factor")) return "Minor Factor";
    if (l.includes("not a factor")) return "Not a Factor";
    if (l.includes("don't know")) return "Unknown";
  }
  
  if (questionId === "family_cultural_background") {
    if (l.includes(",")) return "Mixed / Multi-Cultural";
    if (l.includes("christian")) return "Christian";
    if (l.includes("jewish") || l.includes("judaism")) return "Jewish";
    if (l.includes("islam") || l.includes("muslim")) return "Islamic";
    if (l.includes("buddhism") || l.includes("buddhist")) return "Buddhism";
    if (l.includes("hinduism") || l.includes("hindu")) return "Hinduism";
    if (l.includes("atheist") || l.includes("agnostic") || l.includes("secular")) return "Secular / Non-Religious";
  }
  
  if (questionId === "final_social_norm_perception" || questionId === "culture_community_expectation") {
    // String variants for different questions
    if (l.includes("overwhelmingly seen as the normal and expected")) {
      if (l.includes("intact state is overwhelmingly")) return "Intact Overwhelmingly Normal";
      if (l.includes("circumcised state is overwhelmingly")) return "Circumcised Overwhelmingly Normal";
    }
    if (l.includes("generally seen as more normal")) {
      if (l.includes("intact state is generally")) return "Intact Generally Normal";
      if (l.includes("circumcised state is generally")) return "Circumcised Generally Normal";
    }
    
    // Community Expectations variants
    if (l.includes("uncommon; being left intact")) return "Intact was the Norm";
    if (l.includes("50/50 choice")) return "50/50 Choice";
    if (l.includes("very common")) return "Very Common";
    if (l.includes("unquestioned norm; i believe nearly all boys")) return "Circumcised was the Norm";
    if (l.includes("not sure what the expectation was")) return "Unsure / Unknown";
    
    if (l.includes("equally normal and acceptable")) return "Both Equally Normal";
    if (l.includes("private, almost taboo")) return "Private / Taboo";
    if (l.includes("active debate")) return "Active Debate";
    if (l.includes("unquestioned default")) return "Unquestioned Default";
  }
  
  // Clean up any remaining parentheticals for un-caught labels
  let cleaned = rawLabel.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (cleaned.length > 40) {
    // If STILL too long, try to take just the first sentence or first clause before a comma
    cleaned = cleaned.split(".")[0].split(",")[0].trim();
  }
  
  return cleaned;
}

// Heuristics to rank Likert/Ordinal labels logically instead of alphabetically
function getSortScore(label) {
  const l = label.toLowerCase();
  
  // Politics
  if (l.includes("very conservative") || l.includes("right-leaning") || l.includes("right-wing")) return 1;
  if (l.includes("conservative") && !l.includes("very")) return 2;
  if (l.includes("centrist") || l.includes("moderate")) return 3;
  if (l.includes("liberal") && !l.includes("very")) return 4;
  if (l.includes("very liberal") || l.includes("left-leaning") || l.includes("left-wing")) return 5;
  if (l.includes("libertarian")) return 6;
  if (l.includes("apolitical")) return 7;
  
  // Significance
  if (l.includes("not at all significant")) return 10;
  if (l.includes("culturally") || l.includes("slightly significant")) return 11;
  if (l.includes("somewhat significant")) return 12;
  if (l.includes("very significant") || l.includes("moderately significant") || l.includes("yes")) return 13;
  if (l.includes("extremely significant")) return 14;
  
  // SES
  if (l.includes("lower income") || l.includes("struggled to")) return 20;
  if (l.includes("working class") || l.includes("lower-middle income")) return 21;
  if (l.includes("middle income") || l.includes("generally comfortable")) return 22;
  if (l.includes("upper-middle income") || l.includes("financially secure")) return 23;
  if (l.includes("upper income") || l.includes("wealthy")) return 24;
  
  // Education
  if (l.includes("less than high school")) return 30;
  if (l.includes("high school") && !l.includes("less than")) return 31;
  if (l.includes("trade school") || l.includes("apprenticeship") || l.includes("journeyman")) return 32;
  if (l.includes("some college") || l.includes("associate")) return 33;
  if (l.includes("bachelor")) return 34;
  if (l.includes("master")) return 35;
  if (l.includes("professional") || l.includes("jd") || l.includes("md")) return 36;
  if (l.includes("doctoral") || l.includes("phd")) return 37;
  
  // Generations
  if (l.includes("silent")) return 38;
  if (l.includes("boomer")) return 39;
  if (l.includes("gen x") || l.includes("generation x")) return 40;
  if (l.includes("xennial") || l.includes("oregon trail")) return 40.5;
  if (l.includes("millennial") || l.includes("gen y")) return 41;
  if (l.includes("gen z") || l.includes("generation z")) return 42;
  if (l.includes("alpha")) return 43;
  
  // Feelings / Regret / Satisfaction
  if (l.includes("strongly wish i had not") || l.includes("very dissatisfied") || l.includes("very negative") || l.includes("these feelings are or have been strong")) return 50;
  if (l.includes("somewhat wish i had not") || l.includes("somewhat dissatisfied") || l.includes("negative") && !l.includes("very") || l.includes("experience some of these feelings")) return 51;
  if (l.includes("neutral") || l.includes("no strong feeling") || l.includes("doesn't bother me") || l.includes("don't really think about") || l.includes("rarely") || l.includes("but rarely") || l.includes("don't really frame my feelings")) return 52;
  if (l.includes("somewhat glad") || l.includes("somewhat satisfied") || l.includes("positive") && !l.includes("very") || l.includes("generally proud")) return 53;
  if (l.includes("very glad") || l.includes("extremely satisfied") || l.includes("very satisfied") || l.includes("very positive") || l.includes("never") || l.includes("always been glad") || l.includes("very proud")) return 54;
  
  // View of circ (nominal, but rough order Pro -> Anti)
  if (l.includes("expected and considered the normal") || l.includes("cosmetic preference")) return 60;
  if (l.includes("medical necessity")) return 61;
  if (l.includes("religious requirement")) return 62;
  if (l.includes("private family choice")) return 63;
  if (l.includes("questioned, but ultimately")) return 64;
  if (l.includes("actively opposed")) return 65;
  
  // Community Expectations / Norms
  if (l.includes("intact was the norm") || l.includes("uncommon; being left intact")) return 70;
  if (l.includes("50/50 choice")) return 71;
  if (l.includes("very common")) return 72;
  if (l.includes("circumcised was the norm") || l.includes("unquestioned norm; i believe nearly all boys")) return 73;

  return 9999;
}

// Helper to generate a color sequence
const COLORS = [C.blue, C.red, C.gold, C.green, C.ltBlue, C.dim, C.muted];
function getColor(index) {
  return COLORS[index % COLORS.length];
}

// ── Residual math ──────────────────────────────────────────────────────────
export function computeResiduals(observed, xOptions, yOptions) {
  const rowTotals = {};
  const colTotals = {};
  let N = 0;
  for (const p of yOptions) {
    rowTotals[p.key] = 0;
    for (const c of xOptions) {
      const v = observed[p.key]?.[c.key] || 0;
      rowTotals[p.key] += v;
      colTotals[c.key] = (colTotals[c.key] || 0) + v;
      N += v;
    }
  }
  const cells = {};
  for (const p of yOptions) {
    cells[p.key] = {};
    for (const c of xOptions) {
      const obs = observed[p.key]?.[c.key] || 0;
      const exp = N > 0 && rowTotals[p.key] > 0 && colTotals[c.key] > 0
        ? (rowTotals[p.key] * colTotals[c.key]) / N
        : 0;
      const residual = obs - exp;
      const z = exp > 0 ? residual / Math.sqrt(exp) : 0;
      cells[p.key][c.key] = { obs, exp, residual, z };
    }
  }
  return { rowTotals, colTotals, N, cells };
}

// Convert aggregate API response → observed matrix
export function aggregateToObserved(aggregateResults, xOptions, yOptions) {
  const observed = {};
  for (const p of yOptions) observed[p.key] = {};
  
  for (const [resKey, val] of Object.entries(aggregateResults || {})) {
    const rawKey = resKey === "unknown" || resKey == null ? "observer" : resKey;
    
    for (const d of val.distribution || []) {
      // We don't know if rawKey is X or Y, and if d.label is X or Y.
      // We must test them against the options.
      let yMatch = yOptions.find(r => r.key === rawKey || r.match === rawKey);
      let xMatch = xOptions.find(c => c.key === d.label || c.match === d.label);
      
      if (!yMatch || !xMatch) {
        // Try swapping them
        yMatch = yOptions.find(r => r.key === d.label || r.match === d.label);
        xMatch = xOptions.find(c => c.key === rawKey || c.match === rawKey);
      }
      
      if (yMatch && xMatch) {
        observed[yMatch.key][xMatch.key] = (observed[yMatch.key][xMatch.key] || 0) + d.n;
      }
    }
  }
  return observed;
}

// ── Color scale (diverging: gold = over, red = under) ──────────────────────
function bubbleStyle(z) {
  const abs = Math.abs(z);
  if (abs < 0.5) return { fill: C.ghost, opacity: 0.3, glow: false };
  if (z > 0) {
    if (abs >= 1.5) return { fill: C.goldBright, opacity: 0.9, glow: true }; 
    return { fill: C.gold, opacity: 0.6, glow: false };
  } else {
    if (abs >= 1.5) return { fill: C.red, opacity: 0.9, glow: false }; 
    return { fill: C.red, opacity: 0.5, glow: false };
  }
}

// ── Auto-story generation (used in interactive/explore mode) ───────────────
export function generateStories(residualsData, xOptions, yOptions) {
  const { cells } = residualsData;
  const all = [];
  for (const p of yOptions) {
    for (const c of xOptions) {
      if (!cells[p.key] || !cells[p.key][c.key]) continue;
      const cell = cells[p.key][c.key];
      if (cell.obs < 3) continue; // skip tiny cells — not interesting
      all.push({ pathway: p, column: c, ...cell });
    }
  }
  all.sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
  return all.slice(0, 3).map((s) => ({
    pathway: s.pathway.key,
    columnKey: s.column.key,
    headline: `${s.obs} respondents: "${s.pathway.label}" × "${s.column.short}"`,
    body: s.z > 0
      ? `Overrepresented by ${Math.abs(s.residual).toFixed(0)} people vs chance (z = +${s.z.toFixed(2)}). Expected ~${s.exp.toFixed(0)}.`
      : `Underrepresented by ${Math.abs(s.residual).toFixed(0)} people vs chance (z = ${s.z.toFixed(2)}). Expected ~${s.exp.toFixed(0)}.`,
    direction: s.z > 0 ? "over" : "under",
  }));
}

// ── Main component ────────────────────────────────────────────────────────
export default function UniversalMatrix({
  xOptions,
  yOptions,
  observed: observedProp,
  fetchUrl,
  cohortLabel,
  autoStories = true,
  title = "Correlation Matrix",
  subtitle = "Cross-tabulation showing over/under-representation vs pure chance.",
  eyebrow = "Analysis",
  showLegend = true,
  stories: storiesProp,
  dynamicY = false,
  leftLabel = "Independent Variable",
  rightLabel = "Dependent Variable",
  activeXId = null,
}) {
  const [fetched, setFetched] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(!!fetchUrl && !observedProp);
  const [discoveredY, setDiscoveredY] = useState(null);
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  useEffect(() => {
    if (!fetchUrl || observedProp) return;
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    fetch(fetchUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        
        // 1. Consolidate results to merge messy/write-in/multi-select answers
        const consolidatedResults = {};
        for (const [pathwayKey, val] of Object.entries(data.results || {})) {
          consolidatedResults[pathwayKey] = { ...val, distribution: [] };
          const distMap = new Map();
          for (const d of val.distribution || []) {
            const lower = d.label.toLowerCase();
            if (lower.includes("prefer not to say") || 
                lower.includes("unsure") || 
                lower.includes("i don't know") || 
                lower.includes("unknown") ||
                lower.includes("not applicable") ||
                lower === "n/a") {
              continue;
            }
            const cleanLabel = consolidateLabel(d.label, activeXId);
            if (!distMap.has(cleanLabel)) distMap.set(cleanLabel, { label: cleanLabel, n: 0 });
            distMap.get(cleanLabel).n += d.n;
          }
          consolidatedResults[pathwayKey].distribution = Array.from(distMap.values());
        }

        let finalYOptions = yOptions;
        if (dynamicY) {
          const dynMap = new Map();
          for (const val of Object.values(consolidatedResults)) {
            for (const d of val.distribution) {
              const l = d.label.toLowerCase();
              if (l.includes("frame my feelings") || l.includes("i don't think of it this way")) continue;
              
              if (!dynMap.has(d.label)) {
                dynMap.set(d.label, { key: d.label, match: d.label, label: d.label, short: d.label, color: C.gold });
              }
            }
          }
          finalYOptions = Array.from(dynMap.values());
          // Sort by Likert heuristics first, then alphabetically
          finalYOptions.sort((a, b) => {
            const scoreA = getSortScore(a.label);
            const scoreB = getSortScore(b.label);
            if (scoreA !== scoreB) return scoreA - scoreB;
            return a.label.localeCompare(b.label);
          });
          setDiscoveredY(finalYOptions);
        }
        
        setFetched(aggregateToObserved(consolidatedResults, xOptions, finalYOptions));
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setFetchError(e.message || String(e));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [fetchUrl, observedProp, xOptions, yOptions]);

  const observed = observedProp || fetched;

  const activeYOptions = dynamicY && discoveredY ? discoveredY : yOptions;

  const residuals = useMemo(() => {
    if (!observed || !xOptions || !activeYOptions) return null;
    return computeResiduals(observed, xOptions, activeYOptions);
  }, [observed, xOptions, activeYOptions]);

  const stories = useMemo(() => {
    if (storiesProp) return storiesProp;
    if (autoStories && residuals) return generateStories(residuals, xOptions, activeYOptions);
    return [];
  }, [autoStories, residuals, xOptions, activeYOptions, storiesProp]);

  // Compute Sankey Geometry
  const sankey = useMemo(() => {
    if (!residuals) return null;
    
    const chartWidth = 820;
    let chartHeight = 540;
    
    const maxNodes = Math.max(xOptions.length, activeYOptions.length);
    
    // Dynamically expand the chart height if there are dozens of nodes (like professions)
    // to prevent the labels from overlapping vertically.
    const minRequiredHeight = maxNodes * 45 + 100;
    if (minRequiredHeight > chartHeight) {
      chartHeight = minRequiredHeight;
    }
    
    const nodeWidth = 8;
    
    const N = residuals.N;
    if (N === 0) return null;
    
    let nodePadding = 30;
    // Prevent padding from eating up all the vertical space and causing negative ribbon heights
    if (maxNodes > 1 && (maxNodes - 1) * nodePadding > chartHeight * 0.7) {
      nodePadding = (chartHeight * 0.7) / (maxNodes - 1);
    }
    
    // Left side is yOptions (Origin Predictor)
    const totalLeftPadding = (activeYOptions.length - 1) * nodePadding;
    // Right side is xOptions (Destination Pathway)
    const totalRightPadding = (xOptions.length - 1) * nodePadding;
    
    const maxPadding = Math.max(totalLeftPadding, totalRightPadding);
    
    const ky = (chartHeight - maxPadding) / Math.max(N, 1);
    
    const leftTotalHeight = (N * ky) + totalLeftPadding;
    const rightTotalHeight = (N * ky) + totalRightPadding;
    
    const leftStartY = (chartHeight - leftTotalHeight) / 2;
    const rightStartY = (chartHeight - rightTotalHeight) / 2;
    
    const leftNodes = {};
    let cyL = leftStartY;
    for (const p of activeYOptions) {
      const h = residuals.rowTotals[p.key] * ky;
      leftNodes[p.key] = { ...p, y: cyL, h, offset: cyL };
      cyL += h + nodePadding;
    }
    
    const rightNodes = {};
    let cyR = rightStartY;
    for (const c of xOptions) {
      const h = residuals.colTotals[c.key] * ky;
      rightNodes[c.key] = { ...c, y: cyR, h, offset: cyR };
      cyR += h + nodePadding;
    }
    
    const links = [];
    for (const c of xOptions) {
      for (const p of activeYOptions) {
        const cell = residuals.cells[p.key][c.key];
        const obs = cell.obs;
        if (obs === 0) continue;
        
        const h = obs * ky;
        const y0 = leftNodes[p.key].offset;
        const y1 = rightNodes[c.key].offset;
        
        leftNodes[p.key].offset += h;
        rightNodes[c.key].offset += h;
        
        links.push({ source: p, target: c, cell, y0, y1, h });
      }
    }
    
    return { leftNodes: Object.values(leftNodes), rightNodes: Object.values(rightNodes), links, x0: 185, x1: chartWidth - 165, chartHeight, nodeWidth };
  }, [residuals, xOptions, activeYOptions]);

  if (!xOptions || !activeYOptions) return null;

  return (
    <div style={{
      fontFamily: FONT.body,
      color: C.text,
      background: "transparent",
      maxWidth: 820,
      margin: "0 auto",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,400&family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
      `}</style>

      {/* Eyebrow + title */}
      {eyebrow && (
        <div style={{
          fontFamily: FONT.condensed,
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: C.gold,
          marginBottom: "0.35rem",
        }}>★ {eyebrow} ★</div>
      )}
      {title && (
        <h2 style={{
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
          color: C.textBright,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          marginBottom: "0.4rem",
        }}>{title}</h2>
      )}
      {subtitle && (
        <p style={{
          fontFamily: FONT.body,
          fontSize: "0.92rem",
          color: C.muted,
          lineHeight: 1.55,
          marginBottom: "1.5rem",
          maxWidth: 720,
        }}>{subtitle}</p>
      )}

      {/* Cohort badge */}
      {cohortLabel && (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.45rem",
          padding: "0.3rem 0.7rem",
          background: "rgba(212,160,48,0.1)",
          border: `1px solid rgba(212,160,48,0.35)`,
          borderRadius: 999,
          fontFamily: FONT.condensed,
          fontSize: "0.72rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: C.goldBright,
          marginBottom: "1.25rem",
        }}>
          <span style={{ opacity: 0.7 }}>Cohort</span>
          <span style={{ fontWeight: 700 }}>{cohortLabel}</span>
        </div>
      )}

      {/* Loading / error states */}
      {loading && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "4.5rem 2rem",
          background: C.bgSoft,
          border: `1px solid ${C.ghost}`,
          borderRadius: 12,
          minHeight: "360px",
          gap: "1.5rem",
        }}>
          {/* Concentric spinning rings with subtle glow */}
          <div style={{ position: "relative", width: 56, height: 56 }}>
            {/* Outer ring */}
            <div style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `3.5px solid transparent`,
              borderTopColor: "var(--c-goldBright)",
              borderBottomColor: "var(--c-goldBright)",
              animation: "bureauRotate 1.2s linear infinite",
              boxShadow: "0 0 15px rgba(232, 184, 64, 0.15)",
            }} />
            {/* Inner ring (rotates counter-clockwise) */}
            <div style={{
              position: "absolute",
              inset: 8,
              borderRadius: "50%",
              border: `3.5px solid transparent`,
              borderLeftColor: "var(--c-blue)",
              borderRightColor: "var(--c-blue)",
              animation: "bureauRotate 0.8s linear infinite reverse",
            }} />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.45rem", textAlign: "center" }}>
            <span style={{
              fontFamily: FONT.condensed,
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              color: "var(--c-goldBright)",
              animation: "bureauPulse 1.8s ease-in-out infinite",
            }}>
              Computing Correlation Matrix
            </span>
            <span style={{
              fontFamily: FONT.body,
              fontSize: "0.8rem",
              color: "var(--c-muted)",
              letterSpacing: "0.02em",
            }}>
              Cross-tabulating predictor variables...
            </span>
          </div>
        </div>
      )}
      {fetchError && (
        <div style={{
          padding: "1rem 1.2rem",
          background: "rgba(217,79,79,0.08)",
          border: `1px solid rgba(217,79,79,0.3)`,
          borderRadius: 8,
          color: C.red,
          fontFamily: FONT.mono,
          fontSize: "0.82rem",
        }}>
          <strong>Matrix unavailable:</strong> {fetchError}
        </div>
      )}

      {/* Flow Chart View */}
      {!loading && !fetchError && residuals && sankey && (
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", padding: "0 145px 0 115px", fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.dim }}>
            <span>{leftLabel}</span>
            <span>{rightLabel}</span>
          </div>

          <svg viewBox={`0 0 820 ${sankey.chartHeight}`} style={{ width: "100%", height: "auto", overflow: "visible", paddingBottom: "1rem" }}>
            {/* Links */}
            {sankey.links.map((link, i) => {
              const { x0, x1 } = sankey;
              const { y0, y1, h, cell, source, target } = link;
              const ribbonColor = target.color;
              const baseOpacity = 0.35;
              const cp = (x1 - x0) / 2;
              const d = `
                M ${x0} ${y0}
                C ${x0 + cp} ${y0}, ${x1 - cp} ${y1}, ${x1} ${y1}
                L ${x1} ${y1 + h}
                C ${x1 - cp} ${y1 + h}, ${x0 + cp} ${y0 + h}, ${x0} ${y0 + h}
                Z
              `;
              
              return (
                <path 
                  key={i} d={d} fill={ribbonColor} opacity={baseOpacity}
                  style={{ cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = 0.85;
                    showTooltip(e, `From: ${source.short || source.label}\nTo: ${target.label}\n\nObserved: ${cell.obs} (Expected: ${cell.exp.toFixed(1)})\nZ-Score: ${cell.z >= 0 ? "+" : ""}${cell.z.toFixed(2)}`);
                  }}
                  onMouseMove={moveTooltip}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = baseOpacity;
                    hideTooltip();
                  }}
                />
              );
            })}

            {/* Left Nodes */}
            {sankey.leftNodes.map((n) => {
              const lines = n.sankeyLines || wrapText(n.short || n.label, 26);
              const maxLines = Math.min(3, lines.length);
              const displayLines = lines.slice(0, maxLines);
              if (lines.length > 3) displayLines[2] = displayLines[2] + "...";
              
              return (
              <g key={n.key} transform={`translate(${sankey.x0 - sankey.nodeWidth}, ${n.y})`}>
                <rect width={sankey.nodeWidth} height={Math.max(2, n.h)} fill={C.ghost} rx={2} />
                <text textAnchor="end">
                  {n.labelGroup && (
                    <tspan x={-14} y={n.h / 2 - (displayLines.length * 7)} style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "9px", fill: C.dim, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                      {n.labelGroup}
                    </tspan>
                  )}
                  
                  {displayLines.map((line, idx) => (
                    <tspan key={idx} x={-14} y={n.h / 2 + (idx * 14) - ((displayLines.length - 2) * 7)} style={{ fontFamily: FONT.condensed, fontWeight: idx === 0 ? 600 : 500, fontSize: idx === 0 ? "12px" : "11px", fill: idx === 0 ? C.textBright : C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {line.toUpperCase()}
                    </tspan>
                  ))}
                </text>
              </g>
            )})}

            {/* Right Nodes */}
            {sankey.rightNodes.map((n) => (
              <g key={n.key} transform={`translate(${sankey.x1}, ${n.y})`}>
                <rect width={sankey.nodeWidth} height={Math.max(2, n.h)} fill={n.color} rx={2} />
                <text x={sankey.nodeWidth + 14} y={(n.h / 2) - 4} textAnchor="start" alignmentBaseline="middle" style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "14px", fill: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {n.label}
                </text>
                <text x={sankey.nodeWidth + 14} y={(n.h / 2) + 12} textAnchor="start" style={{ fontFamily: FONT.mono, fontSize: "10px", fill: C.dim }}>
                  n={residuals.colTotals[n.key]}
                </text>
              </g>
            ))}
          </svg>
        <div style={{
          marginTop: "1.5rem",
          display: "flex",
          justifyContent: "center",
          fontFamily: FONT.mono,
          fontSize: "0.85rem",
          color: C.dim,
          letterSpacing: "0.05em"
        }}>
          N={residuals.N}
        </div>
        </div>
      )}

      {/* Story callouts */}
      {stories.length > 0 && (
        <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          {stories.map((s, i) => (
            <StoryCard key={i} story={s} residuals={residuals} />
          ))}
        </div>
      )}
      
      <Tooltip {...tooltip} />
    </div>
  );
}

function LegendSwatch({ color, label, glow, opacity = 1 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", opacity }}>
      <div style={{ width: 12, height: 12, borderRadius: 6, background: color, boxShadow: glow ? `0 0 8px ${color}` : "none" }} />
      <span>{label}</span>
    </div>
  );
}

function StoryCard({ story, residuals }) {
  const accent = story.direction === "over" ? "#0f6e56" : story.direction === "under" ? "#a32d2d" : C.gold;
  return (
    <div style={{ background: C.bgSoft, border: `1px solid ${C.ghost}`, borderLeft: `4px solid ${accent}`, borderRadius: 8, padding: "1rem 1.2rem", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
      {story.label && (
        <div style={{ fontFamily: FONT.condensed, fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, color: accent, marginBottom: "0.35rem" }}>
          {story.label}
        </div>
      )}
      <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", fontWeight: 500, color: C.textBright, lineHeight: 1.4, marginBottom: "0.4rem" }}>
        {story.headline}
      </div>
      <div style={{ fontFamily: FONT.body, fontSize: "0.83rem", color: C.muted, lineHeight: 1.55 }}>
        {story.body}
      </div>
    </div>
  );
}
