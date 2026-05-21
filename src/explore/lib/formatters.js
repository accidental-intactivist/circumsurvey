// Helper functions for formatting and normalizing survey data

/**
 * Flattens and re-aggregates multi-select distributions that were grouped as single comma-separated strings.
 */
export const flattenMultiSelect = (distArray, q) => {
  if (!distArray || !Array.isArray(distArray)) return [];
  const newMap = new Map();
  let totalN = 0;

  let prefixes = null;
  const qId = q?.id;
  if (qId === "circ_parents_influences") {
    prefixes = [
      "Direct Medical Authority:",
      "Institutional Medical Norm:",
      "Family Tradition/Pressure:",
      "Paternal Influence (The \"Like Father\" Factor):",
      "Peer & Social Pressure (The \"Fitting In\" Factor):",
      "Religious Mandate/Tradition:",
      "Prevailing Health & Hygiene Beliefs:",
      "Popular Media & Parenting \"Experts\":",
      "Lack of Counter-Information:",
      "Aesthetic Preference:",
      "I have absolutely no idea what influenced them.",
      "Prevailing Moral Beliefs about Sexuality (e.g., concern over masturbation)."
    ];
  } else if (qId === "demo_ethnicity" || qId === "demo_race_ethnicity") {
    prefixes = [
      "Asian / Asian American (e.g., East Asian, South Asian, Southeast Asian)",
      "Black / African American / African / Afro-Caribbean",
      "Native American / Alaska Native / Indigenous / First Nations",
      "White / Caucasian / European American",
      "Hispanic / Latino / Latina / Latinx",
      "Native Hawaiian / Other Pacific Islander",
      "Middle Eastern / North African (MENA)",
      "Multiracial / Biracial",
      "Prefer not to say"
    ];
  } else if (qId === "restore_techniques_used") {
    prefixes = [
      "Manual tugging (Andre's method, etc)",
      "T-Tape",
      "O-rings / retaining cones",
      "Dual-tension devices (DTR, Mantis, etc)",
      "Air inflation devices (Foreskinned Air, HyperRestore, etc)",
      "Weights (PUD, stealth retainers with weights, etc)",
      "Surgical restoration / Foregen clinical trials",
      "I haven't started yet"
    ];
  } else if (qId === "observe_advocate_future_focus") {
    prefixes = [
      "Legal challenges and lawsuits (like the Equal Protection cases)",
      "Legislative action (e.g., defunding Medicaid for RIC)",
      "Direct outreach and education for expectant parents",
      "Reforming medical school curricula and hospital protocols",
      "High-visibility public protests and awareness campaigns",
      "Creating high-quality media (documentaries, articles)",
      "Supporting foreskin restoration and regeneration research",
      "Building broader coalitions with other human rights groups"
    ];
  }

  distArray.forEach(item => {
    if (!item || !item.label) return;
    const labelStr = String(item.label);
    const n = item.n;
    totalN += n;

    if (prefixes) {
      let remaining = labelStr;
      const found = [];
      prefixes.forEach(prefix => {
        if (remaining.indexOf(prefix) !== -1) {
          found.push(prefix);
          remaining = remaining.replace(prefix, "");
        }
      });

      if (found.length > 0) {
        if ((qId === "demo_ethnicity" || qId === "demo_race_ethnicity") && found.length > 1) {
          if (!found.includes("Multiracial / Biracial")) {
            found.push("Multiracial / Biracial");
          }
        }
        found.forEach(f => {
          newMap.set(f, (newMap.get(f) || 0) + n);
        });

        // Any leftover write-in text in remaining is consolidated to "Other"
        remaining = remaining.replace(/^[,\s]+|[,\s]+$/g, "").trim();
        if (remaining) {
          newMap.set("Other", (newMap.get("Other") || 0) + n);
        }
      } else {
        // No known prefix matched — pure write-in → "Other"
        newMap.set("Other", (newMap.get("Other") || 0) + n);
      }
    } else {
      let parts = [];
      if (/(?<=[.)]),\s/.test(labelStr)) {
        parts = labelStr.split(/(?<=[.)]),\s/);
      } else {
        parts = labelStr.split(/,\s/);
      }
      parts = parts.map(p => p.trim()).filter(Boolean);
      parts.forEach(p => {
        newMap.set(p, (newMap.get(p) || 0) + n);
      });
    }
  });

  return Array.from(newMap.entries())
    .map(([label, n]) => ({ label, n, pct: totalN > 0 ? (n / totalN) * 100 : 0 }))
    .sort((a, b) => b.n - a.n);
};

/**
 * Normalizes numeric values in a Likert scale distribution to human-readable strings.
 * E.g., '1.0' -> '1 - Extremely Important' (for importance questions)
 *       '3.0' -> '3'
 */
export const applyLikert = (distArray, q) => {
  if (!q || !distArray) return distArray || [];
  return distArray
    .filter(d => d.label && d.label.trim() !== "-" && d.label.trim() !== "—" && d.label.trim() !== "")
    .map(d => {
      let label = d.label;
      if (q.id.includes("importance")) {
        const num = parseFloat(label);
        if (num === 1) label = "1 - Extremely Important";
        else if (num === 5) label = "5 - Not Important At All";
        else if (!isNaN(num)) label = String(num);
      }
      return { ...d, label };
    });
};

/**
 * Normalizes user-input text strings for Geographic Heatmaps.
 */
export const normalizeName = (name) => {
  if (!name) return "Unknown";
  let n = String(name).trim().toLowerCase();
  
  if (n.match(/^[a-z]{2}\s-\s/)) {
    n = n.substring(5);
  }
  
  if (n === "united states of america (usa)" || n === "united states of america" || n === "usa" || n === "united states" || n === "us" || n === "u.s.") {
    return "United States";
  }
  if (n === "great britain" || n === "uk" || n === "england" || n === "scotland" || n === "wales" || n === "northern ireland" || n === "united kingdom") {
    return "United Kingdom";
  }
  if (n.includes("australia") || n === "perth/southern australia" || n === "nsw" || n === "victoria" || n === "queensland" || n === "tasmania") {
    return "Australia";
  }

  // Canada Provinces and Territories
  const caMap = {
    "ab": "Alberta",
    "bc": "British Columbia",
    "mb": "Manitoba",
    "nb": "New Brunswick",
    "nl": "Newfoundland and Labrador",
    "newfoundland": "Newfoundland and Labrador",
    "ns": "Nova Scotia",
    "nt": "Northwest Territories",
    "nwt": "Northwest Territories",
    "nu": "Nunavut",
    "on": "Ontario",
    "pe": "Prince Edward Island",
    "pei": "Prince Edward Island",
    "prince edward": "Prince Edward Island",
    "qc": "Quebec",
    "pq": "Quebec",
    "sk": "Saskatchewan",
    "yt": "Yukon",
    "yukon territory": "Yukon"
  };

  if (caMap[n]) return caMap[n];
  
  return n.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

/**
 * Aggregates a response distribution by normalizing its labels.
 */
export const rollUpDistribution = (distArray) => {
  if (!distArray || !Array.isArray(distArray)) return [];
  const map = {};
  for (const d of distArray) {
    if (!d.label) continue;
    const canon = normalizeName(d.label);
    if (!map[canon]) map[canon] = 0;
    map[canon] += d.n;
  }
  return Object.entries(map)
    .map(([label, n]) => ({ label, n }))
    .sort((a, b) => b.n - a.n);
};
