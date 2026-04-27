// Helper functions for formatting and normalizing survey data

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
