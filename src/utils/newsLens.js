// Shared vocabulary for the News Lens (keep in sync with functions/api/cron_news_ingest.js)

export const NEWS_CATEGORIES = [
  { key: 'Rates & Demographics',      short: 'Rates',      color: '#e0a845' },
  { key: 'Medical Policy & Guidance', short: 'Policy',     color: '#5aa9e6' },
  { key: 'Research & Studies',        short: 'Research',   color: '#8f7ee7' },
  { key: 'Legal & Legislative',       short: 'Legal',      color: '#e57a5a' },
  { key: 'Human Rights & Ethics',     short: 'Rights',     color: '#d16ba5' },
  { key: 'Movement & Activism',       short: 'Movement',   color: '#5cc8a1' },
  { key: 'Restoration & Recovery',    short: 'Restoration',color: '#7fcf6a' },
  { key: 'Culture & Media',           short: 'Culture',    color: '#a3a8b8' },
  { key: 'Global / VMMC',             short: 'Global',     color: '#4fc1c9' },
  { key: 'Pulse of the Movement',     short: 'Pulse',      color: '#f2c14e' },
];
export const categoryMeta = (key) =>
  NEWS_CATEGORIES.find(c => c.key === key) || { key: key || 'Uncategorized', short: key || 'General', color: '#8a8f9c' };

// Ordered from most pro-RIC to most intactivist so bars read left → right.
export const LEANS = [
  { key: 'pro_cutting',  label: 'Pro-Cutting',  color: '#c9604a', hint: 'Strongly promotes or defends routine infant circumcision' },
  { key: 'lean_cutting', label: 'Lean Cutting', color: '#e57a5a', hint: 'Favors circumcision, or fails to challenge it as medically unnecessary' },
  { key: 'neutral',      label: 'Neutral',      color: '#9aa0ad', hint: 'Genuinely balances both sides without assuming circumcision as a default' },
  { key: 'lean_intact',  label: 'Lean Intact',  color: '#5aa9e6', hint: 'Raises ethical, medical or rights concerns' },
  { key: 'pro_intact',   label: 'Pro-Intact',   color: '#5cc8a1', hint: 'Written from a genital-autonomy advocacy stance' },
];
export const leanMeta = (key) => LEANS.find(l => l.key === key) || LEANS[1];

export const ASSESSMENTS = {
  accurate:        { label: 'Accurate',        color: '#5cc8a1', icon: '✓' },
  missing_context: { label: 'Missing context', color: '#e0a845', icon: '◐' },
  disputed:        { label: 'Disputed',        color: '#e57a5a', icon: '⇄' },
  unsupported:     { label: 'Unsupported',     color: '#c9604a', icon: '✕' },
  needs_review:    { label: 'Needs review',    color: '#9aa0ad', icon: '?' },
};

export const OUTLET_TYPES = {
  mainstream: 'Mainstream media',
  medical_journal: 'Medical journal',
  advocacy: 'Advocacy organization',
  religious: 'Religious outlet',
  industry: 'Industry / commercial',
  government: 'Government',
  other: 'Other',
};

export const GENERALIZES = {
  yes:       { label: 'Applies to US newborns',        color: '#5cc8a1' },
  partially: { label: 'Partially applies to US newborns', color: '#e0a845' },
  no:        { label: 'Does not apply to US newborns', color: '#c9604a' },
  unclear:   { label: 'Applicability unclear',         color: '#9aa0ad' },
};

export function parseMeta(item) {
  try { return item?.metadata_json ? JSON.parse(item.metadata_json) || {} : {}; } catch { return {}; }
}

export function storyDate(item, meta = parseMeta(item)) {
  const d = item?.published_at || meta.date || item?.created_at;
  if (!d) return '';
  const parsed = new Date(String(d).includes('T') || String(d).length <= 10 ? d : String(d).replace(' ', 'T') + 'Z');
  if (Number.isNaN(parsed.getTime())) return String(d).split(/[T ]/)[0];
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function flaggedClaimCount(meta) {
  return (meta?.lens?.claims || []).filter(c => c.assessment !== 'accurate').length;
}

export function getFaviconUrl(url) {
  try {
    if (!url) return null;
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
}
