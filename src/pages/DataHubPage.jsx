import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe2, 
  BarChart3, 
  GitBranch, 
  Activity, 
  Network, 
  FileText, 
  Flame, 
  Calculator, 
  Scale, 
  Sparkles, 
  Layers, 
  Search, 
  ArrowRight, 
  Download, 
  Database, 
  ShieldCheck, 
  Users, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import './DataHubPage.css';

const DATA_CHANNELS = [
  {
    id: 'atlas',
    category: 'atlas',
    title: 'The Global Genital Integrity Atlas',
    route: '/atlas',
    icon: Globe2,
    accent: '#38bdf8',
    accentBg: 'rgba(56, 189, 248, 0.12)',
    accentBorder: 'rgba(56, 189, 248, 0.28)',
    badge: 'Interactive Geo Ledger',
    headline: 'Global Adult Prevalence vs. Inpatient Newborn Cutting',
    description: 'The definitive geographic intelligence map comparing adult prevalence with hospital newborn cutting across 195+ nations, revealing acute global divergence and WHO discrepancies.',
    statPills: [
      { label: 'Coverage', value: '195 Countries' },
      { label: 'Ledger Timeline', value: '1870–2026' },
      { label: 'U.S. Inpatient', value: '49.0%' },
      { label: 'U.S. Adult', value: '80.5%' }
    ],
    ctaText: 'Launch Global Atlas'
  },
  {
    id: 'us-rates',
    category: 'atlas',
    title: 'U.S. Circumcision Rates Tracker',
    route: '/rates',
    icon: BarChart3,
    accent: '#4ade80',
    accentBg: 'rgba(74, 222, 128, 0.12)',
    accentBorder: 'rgba(74, 222, 128, 0.28)',
    badge: '50-Year Hospital Series',
    headline: 'Regional Divergence & Medicaid Policy Impact',
    description: 'A 50-year empirical retrospective tracking the collapse of routine infant circumcision in the American West to 19.7% and the decisive correlation with Medicaid defunding.',
    statPills: [
      { label: 'West Region', value: '19.7%' },
      { label: 'Northeast', value: '51.8%' },
      { label: 'South', value: '55.4%' },
      { label: 'Midwest', value: '68.5%' }
    ],
    ctaText: 'Explore U.S. Rates'
  },
  {
    id: 'survey-findings',
    category: 'survey',
    title: 'The Circumcision Survey Exploration',
    route: '/explore',
    icon: GitBranch,
    accent: '#a78bfa',
    accentBg: 'rgba(167, 139, 250, 0.12)',
    accentBorder: 'rgba(167, 139, 250, 0.28)',
    badge: 'Empirical Study · n=542+',
    headline: 'Lived Experience & Qualitative Pathway Architecture',
    description: 'The movement’s foundational lived-experience study tracing awakening pathways, psychological fallout, parental grief, and demographic cross-tabulations across six cohorts.',
    statPills: [
      { label: 'Verified Cohort', value: '542+ Participants' },
      { label: 'Awakening Pathways', value: '5 Pathways' },
      { label: 'Resentment Index', value: '60%+' }
    ],
    ctaText: 'Open Survey Exploration'
  },
  {
    id: 'survey-stats',
    category: 'survey',
    title: 'Survey Stats & Telemetry Dashboard',
    route: '/survey-stats',
    icon: Activity,
    accent: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.12)',
    accentBorder: 'rgba(245, 158, 11, 0.28)',
    badge: 'Live Real-Time Telemetry',
    headline: 'Cohort Breakdown & Telemetry Pulse',
    description: 'Real-time telemetry measuring participant generational distribution (Millennials, Gen X, Gen Z, Boomers), political alignment, and dynamic computational spirograph telemetry.',
    statPills: [
      { label: 'Top Pathway', value: 'Human Rights (40%)' },
      { label: 'Generational Peak', value: 'Millennials (45%)' },
      { label: 'Secular / None', value: '57%' }
    ],
    ctaText: 'View Live Telemetry'
  },
  {
    id: 'global-graph',
    category: 'network',
    title: 'The Global Evidence & Entity Graph',
    route: '/graph',
    icon: Network,
    accent: '#06b6d4',
    accentBg: 'rgba(6, 182, 212, 0.12)',
    accentBorder: 'rgba(6, 182, 212, 0.28)',
    badge: '3D Spatial Knowledge Graph',
    headline: 'Litigation, Medical Associations & Precedents',
    description: 'An interactive 3D spatial network connecting legal plaintiffs, medical task forces, judicial rulings, and academic institutions in a searchable, high-resolution evidence graph.',
    statPills: [
      { label: 'Indexed Nodes', value: '5,000+ Entities' },
      { label: 'Graph Topology', value: '3D Force-Directed' },
      { label: 'Connections', value: '12,000+ Edges' }
    ],
    ctaText: 'Launch 3D Entity Graph'
  },
  {
    id: 'citation-web',
    category: 'network',
    title: 'The Medical & Legal Citation Web',
    route: '/citations',
    icon: FileText,
    accent: '#fb7185',
    accentBg: 'rgba(251, 113, 133, 0.12)',
    accentBorder: 'rgba(251, 113, 133, 0.28)',
    badge: 'Forensic Citation Genealogy',
    headline: 'Exposing Circular & Debunked Justifications',
    description: 'Forensic traceability unmasking circular AAP references, retracted UTI claims, and policy contortions, mapping medical claims directly to their primary evidentiary bedrock.',
    statPills: [
      { label: 'Citations Mapped', value: '2,500+ Verified' },
      { label: 'Fact-Check Gaps', value: '0 Unresolved' },
      { label: 'Court Filings', value: 'Federal & State' }
    ],
    ctaText: 'Inspect Citation Web'
  }
];

const ANALYTICAL_EXHIBITS = [
  {
    title: 'The 36% Pleasure Gap',
    route: '/explore/pleasure-gap',
    icon: Flame,
    color: '#38bdf8',
    stat: '-36% Touch Sensitivity',
    description: 'Fine-touch threshold testing, Meissner corpuscle density, and erogenous surface area loss.'
  },
  {
    title: 'By The Numbers & Risk Math',
    route: '/explore/numbers',
    icon: Calculator,
    color: '#4ade80',
    stat: 'NNT ~111 vs 100% Harm',
    description: 'Mathematical reality of Number Needed to Treat, acute surgical hemorrhages, and meatal stenosis rates.'
  },
  {
    title: 'Cultural Alignment Diagnostic',
    route: '/explore/tools/cultural-alignment',
    icon: Scale,
    color: '#f59e0b',
    stat: '10 Decision Vectors',
    description: 'Interactive self-assessment evaluating moral clarity, cognitive dissonance, and social conformity pressure.'
  },
  {
    title: 'Restoration Journey Metrics',
    route: '/explore/restoration-journey',
    icon: Layers,
    color: '#a78bfa',
    stat: '1–5 Year Tracking',
    description: 'Longitudinal recovery data tracking tissue expansion, dekeratinization, and psychological closure.'
  },
  {
    title: 'Clinical Consent Thresholds',
    route: '/consent',
    icon: ShieldCheck,
    color: '#fb7185',
    stat: 'Recite-Back Protocol',
    description: 'The standard of true informed consent vs. institutional hospital administrative practices.'
  },
  {
    title: 'Retconned Medical Claims',
    route: '/retcons',
    icon: Sparkles,
    color: '#e8a44a',
    stat: '150-Year History',
    description: 'Documenting the shifting rationale from Victorian reflex neurosis to masturbation to HIV prophylaxis.'
  }
];

export default function DataHubPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    document.title = 'Movement Data & Analytics Hub — The Accidental Intactivist';
    fetch('/api/survey-stats')
      .then(r => r.json())
      .then(d => {
        if (d && !d.error) setLiveStats(d);
      })
      .catch(() => {});
  }, []);

  const filteredChannels = useMemo(() => {
    return DATA_CHANNELS.filter(item => {
      if (activeTab !== 'all' && item.category !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = `${item.title} ${item.headline} ${item.description} ${item.badge}`.toLowerCase();
        return haystack.includes(q);
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="dh-container">
      {/* Hero Header */}
      <section className="dh-hero">
        <div className="dh-hero-badge">
          <Database size={13} /> Empirical Ledger & Research Command
        </div>
        <h1 className="dh-hero-title">Movement Data & Analytics Hub</h1>
        <p className="dh-hero-subtitle">
          The movement's central empirical clearinghouse. From global epidemiology and 50-year hospital trends to 540+ qualitative survey pathways and 3D legal networks — exploring the unassailable evidence of bodily autonomy.
        </p>

        {/* Live Empirical Tickers */}
        <div className="dh-ticker-row">
          <div className="dh-ticker-card">
            <div className="dh-ticker-top">
              <span className="dh-ticker-label">Global Coverage</span>
              <Globe2 size={16} color="#38bdf8" />
            </div>
            <div className="dh-ticker-value" style={{ color: '#38bdf8' }}>195+</div>
            <div className="dh-ticker-sub">Countries cataloged in the Global Genital Integrity Atlas</div>
          </div>

          <div className="dh-ticker-card">
            <div className="dh-ticker-top">
              <span className="dh-ticker-label">U.S. Hospital Series</span>
              <BarChart3 size={16} color="#4ade80" />
            </div>
            <div className="dh-ticker-value" style={{ color: '#4ade80' }}>19.7%</div>
            <div className="dh-ticker-sub">Current Western US hospital rate after Medicaid defunding</div>
          </div>

          <div className="dh-ticker-card">
            <div className="dh-ticker-top">
              <span className="dh-ticker-label">Lived Experience</span>
              <Users size={16} color="#a78bfa" />
            </div>
            <div className="dh-ticker-value" style={{ color: '#a78bfa' }}>
              {liveStats?.total ? `${liveStats.total}+` : '542+'}
            </div>
            <div className="dh-ticker-sub">Verified qualitative survey participants across 6 cohorts</div>
          </div>

          <div className="dh-ticker-card">
            <div className="dh-ticker-top">
              <span className="dh-ticker-label">Entity Knowledge Graph</span>
              <Network size={16} color="#06b6d4" />
            </div>
            <div className="dh-ticker-value" style={{ color: '#06b6d4' }}>5,000+</div>
            <div className="dh-ticker-sub">Plaintiffs, litigators, courts & AAP task forces mapped</div>
          </div>
        </div>
      </section>

      {/* Controls & Filter Bar */}
      <section className="dh-controls-bar">
        <div className="dh-filter-tabs">
          {[
            { id: 'all', label: 'All Engines' },
            { id: 'atlas', label: 'Global & Regional Atlas' },
            { id: 'survey', label: 'Survey & Telemetry' },
            { id: 'network', label: 'Networks & Citations' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`dh-filter-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="dh-search-wrap">
          <Search size={14} className="dh-search-icon" />
          <input
            type="text"
            className="dh-search-input"
            placeholder="Filter data engines, metrics, or studies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Primary Data Engines Grid */}
      <section className="dh-grid">
        {filteredChannels.map(channel => {
          const IconComponent = channel.icon;
          return (
            <Link
              key={channel.id}
              to={channel.route}
              className="dh-card"
              style={{
                '--card-accent': channel.accent,
                '--card-accent-bg': channel.accentBg,
                '--card-accent-border': channel.accentBorder
              }}
            >
              <div>
                <div className="dh-card-header">
                  <div className="dh-card-icon-wrap">
                    <IconComponent size={22} />
                  </div>
                  <span className="dh-card-badge">{channel.badge}</span>
                </div>

                <h2 className="dh-card-title">{channel.title}</h2>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: channel.accent, marginBottom: '0.65rem' }}>
                  {channel.headline}
                </div>
                <p className="dh-card-desc">{channel.description}</p>

                <div className="dh-card-stats">
                  {channel.statPills.map((pill, i) => (
                    <span key={i} className="dh-card-stat-pill">
                      <span>{pill.label}:</span>
                      <strong>{pill.value}</strong>
                    </span>
                  ))}
                </div>
              </div>

              <div className="dh-card-footer">
                <span className="dh-card-cta">
                  {channel.ctaText} <ArrowRight size={14} />
                </span>
                <ExternalLink size={13} style={{ opacity: 0.6 }} />
              </div>
            </Link>
          );
        })}
      </section>

      {/* Curated Interactive Quantitative Exhibits */}
      <section style={{ marginBottom: '4rem' }}>
        <div className="dh-section-title-wrap">
          <div>
            <h2 className="dh-section-title">Analytical Deep Dives & Exhibits</h2>
            <p className="dh-section-sub">Granular specialized exhibits addressing surgical math, neurobiology, and clinical consent.</p>
          </div>
        </div>

        <div className="dh-exhibits-row">
          {ANALYTICAL_EXHIBITS.map((exhibit, idx) => {
            const ExhibitIcon = exhibit.icon;
            return (
              <Link key={idx} to={exhibit.route} className="dh-exhibit-tile">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${exhibit.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: exhibit.color }}>
                      <ExhibitIcon size={16} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: exhibit.color, background: `${exhibit.color}12`, padding: '0.15rem 0.5rem', borderRadius: 4, fontFamily: 'var(--f-condensed)' }}>
                      {exhibit.stat}
                    </span>
                  </div>
                  <h3 className="dh-exhibit-title">{exhibit.title}</h3>
                  <p className="dh-exhibit-desc">{exhibit.description}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: exhibit.color, fontSize: '0.78rem', fontWeight: 700, marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Explore Exhibit <ChevronRight size={13} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Direct Data Terminal & Report Builder Integration */}
      <section className="dh-terminal-card">
        <div className="dh-terminal-info">
          <h3>Evidence Terminal & Custom Report Builder</h3>
          <p>
            Every data point, survey cohort cross-tabulation, and atlas prevalence metric can be compiled directly into citable evidence dossiers for medical boards, legislative testimony, or academic citations.
          </p>
        </div>

        <div className="dh-terminal-actions">
          <Link to="/assistant" className="dh-btn-primary">
            <Sparkles size={15} /> Launch Report Builder
          </Link>
          <a href="/api/survey-stats" target="_blank" rel="noreferrer" className="dh-btn-secondary">
            <Download size={15} /> Raw Survey JSON
          </a>
          <Link to="/citations" className="dh-btn-secondary">
            <FileText size={15} /> Citation Ledger
          </Link>
        </div>
      </section>
    </div>
  );
}
