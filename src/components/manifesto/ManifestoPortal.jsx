import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Database, 
  FileText, 
  Scale, 
  CheckCircle2, 
  Share2, 
  ChevronRight,
  Eye,
  Activity,
  Heart,
  ExternalLink,
  Flame,
  Award
} from 'lucide-react';
import { FONT, C } from '../../styles/tokens';
import AutoEntityLinker from '../AutoEntityLinker';
import LoomChoreography from '../GuidedTour/LoomChoreography';

export const MANIFESTO_TRACKS = [
  {
    id: 'all',
    label: 'All 11 Sections',
    color: '#d4a030',
    description: 'Comprehensive 35,000-word treatise across all 11 analytical corridors and evidence exhibits.'
  },
  {
    id: 'awakening',
    label: 'Awakening & Anatomy',
    color: '#eab308',
    description: 'The discovery of the cultural glitch, the Transparent Monster thesis, and the specialized biomechanics of the prepuce.',
    sections: [1, 2]
  },
  {
    id: 'deceptions',
    label: 'Myths & Institutional Betrayal',
    color: '#ef4444',
    description: 'Deconstructing Victorian masturbation fallacies, hospital billing codes, and the systemic collapse of pediatric informed consent.',
    sections: [3, 4, 5]
  },
  {
    id: 'psychology',
    label: 'Cultural Psychology & Trauma',
    color: '#8b5cf6',
    description: 'American exceptionalism, cultivated blindness, the hidden orgasm gap, and long-term psychological disenfranchisement.',
    sections: [6, 7]
  },
  {
    id: 'uprising',
    label: 'The Resistance & Reform Roadmap',
    color: '#3b82f6',
    description: 'Grassroots direct action, Medicaid legislative decoupling, federal constitutional jurisprudence, and the path to integrity.',
    sections: [8, 9, 10]
  },
  {
    id: 'compendium',
    label: 'Archival Compendium',
    color: '#facc15',
    description: 'Primary source dossiers from the Tim Hammond Papers (UMass MS 1205), bioethics declarations, and support registries.',
    sections: [11]
  }
];

export const CURATED_SECTION_ROADMAP = [
  {
    number: 1,
    roman: 'I',
    title: 'The Price of Admission',
    subtitle: 'Waking from the American Dream',
    trackId: 'awakening',
    trackName: 'Awakening & Cultural Glitch',
    color: '#eab308',
    readingTime: '9 min',
    wordCount: '3,450 words',
    summary: 'Awakening to the "Transparent Monster" hiding in plain sight within American culture, deciphering the glitch from childhood, and the moral burden of the Accidental Anthropologist observing the ubiquitous price of admission.',
    curatedBlurb: 'How a kindergarten conversation and maternal clarity shattered the default American autopilot, revealing a pervasive moral tragedy accepted as everyday normal.',
    subsections: [
      'I.i. The Promises Assured the Land of the Free',
      'I.ii. Deciphering the Glitch: A Childhood Revelation',
      'I.iii. The Anthropologist\'s Burden: Ubiquity & The Unbearable Question',
      'I.iv. Unveiling the Monster: Hidden Costs & Betrayal of Trust',
      'I.v. The Fear and the Fire: From Observer to Intentional Intactivist',
      'I.vi. Interrupting the Default: A Path Towards Reckoning',
      'I.vii. The Roadmap: Navigating the Labyrinth'
    ],
    primaryEvidence: 'CircumSurvey Telemetry (1,200+ men) • AAP 1975 Historic Policy Reversal'
  },
  {
    number: 2,
    roman: 'II',
    title: 'The Myth of the Foreskin',
    subtitle: 'Deconstructing the Label, Understanding the Whole',
    trackId: 'awakening',
    trackName: 'Anatomical Truth & Science',
    color: '#06b6d4',
    readingTime: '11 min',
    wordCount: '3,820 words',
    summary: 'Reclaiming anatomical truth, revealing the elegant design and sensory function dismissed by cultural euphemisms as mere "foreskin."',
    curatedBlurb: 'Deconstructing the linguistic gaslighting that reduces a specialized, dynamic five-layer gliding organ endowed with thousands of Meissner’s corpuscles to disposable "excess skin."',
    subsections: [
      'II.i. The Power of Names: Euphemisms & Reductionism',
      'II.ii. The Architectural Masterpiece: Biomechanics & Sensation',
      'II.iii. The Five Specialized Layers & Innervation',
      'II.iv. The Mucocutaneous Junction & The Ridged Band',
      'II.v. Evolutionary Teleology: Why Nature Keeps the Prepuce',
      'II.vi. The Artificial Scar: Erasing the Gliding Mechanism'
    ],
    primaryEvidence: 'Cold & Taylor (1999) Prepuce Histology • Sorrells et al. (2007) Fine-Touch Thresholds'
  },
  {
    number: 3,
    roman: 'III',
    title: 'The Hygienic Hoax',
    subtitle: 'Soap, Water, and the Ghosts of Victorian Anxiety',
    trackId: 'deceptions',
    trackName: 'Medical Myths & History',
    color: '#10b981',
    readingTime: '12 min',
    wordCount: '4,100 words',
    summary: 'Debunking the flimsy, shifting health justifications and Victorian medical panaceas that continue to prop up the multibillion-dollar infant surgical industry.',
    curatedBlurb: 'Exposing how simple warm water hygiene was replaced by surgical amputation, and how 19th-century anti-masturbation crusaders rebranded puritanical fear as clinical preventive medicine.',
    subsections: [
      'III.i. The Phantom Menace: The Cleanliness Superstition',
      'III.ii. The Myth of the Unclean Organ: Normal Smegma vs. Pathogen',
      'III.iii. Moving the Goalposts: From Masturbation to Syphilis to UTI to HIV',
      'III.iv. The Number Needed to Treat (NNT) Fallacy Exposed',
      'III.v. European Pediatric Consensus vs. American Anomaly',
      'III.vi. The Soap-and-Water Alternative That Costs Nothing'
    ],
    primaryEvidence: 'KNMG Royal Dutch Medical Association Declaration (2010) • Frisch et al. UTI Statistical Breakdown'
  },
  {
    number: 4,
    roman: 'IV',
    title: 'Manufacturing Normal',
    subtitle: 'The Historic Journey Through Ritual, Religion, and Revival',
    trackId: 'deceptions',
    trackName: 'Cultural Normalization',
    color: '#f97316',
    readingTime: '14 min',
    wordCount: '4,650 words',
    summary: 'Tracing the bizarre historical roots, medicalization of moral panic, and institutional financial forces that normalized neonatal circumcision in the United States.',
    curatedBlurb: 'A deep-dive investigation from Dr. John Harvey Kellogg and Victorian asylum superintendents to postwar hospital delivery wards and commercial foreskin fibroblast supply chains.',
    subsections: [
      'IV.i. Ancient Covenant to Medicalized Routine',
      'IV.ii. Dr. Lewis Sayre, Reflex Neurosis, and Victorian Panic',
      'IV.iii. Dr. John Harvey Kellogg and the Anti-Pleasure Crusades',
      'IV.iv. The Post-WWII Hospital Boom & Assembly-Line Clamps',
      'IV.v. The Gomco and Mogen Industrialization of Neonatal Surgery',
      'IV.vi. The Modern Biomedical Tissue Pipeline: Foreskin as Commodity'
    ],
    primaryEvidence: 'UMass MS 1205 Historical Clamping Catalogs • Lewis Sayre (1870) Reflex Neuroses Case Records'
  },
  {
    number: 5,
    roman: 'V',
    title: 'The Betrayal of Informed Consent',
    subtitle: 'The Architects of Compliance and the Conspiracy of Silence',
    trackId: 'deceptions',
    trackName: 'Ethics & Institutional Betrayal',
    color: '#ef4444',
    readingTime: '13 min',
    wordCount: '4,280 words',
    summary: 'Exposing the systemic ethical failures, rushed postpartum signatures, and omission of anatomical risks that enable non-consensual surgery on healthy infants.',
    curatedBlurb: 'How vulnerable, sleep-deprived postpartum mothers are handed liability clipboards while pediatricians omit pain realities, neurological shock, and the lifetime loss of tissue.',
    subsections: [
      'V.i. The Anatomy of a Rushed Clipboard: The 24-Hour Postpartum Trap',
      'V.ii. The Deliberate Omission of Anatomical Function from Hospital Consent Forms',
      'V.iii. Inadequate Pain Management: The EMLA Myth and Infant Neurotrauma',
      'V.iv. Pediatricians as Profiteers: The CPT Code 54150 Financial Incentive',
      'V.v. The Nuremberg Code, Declaration of Helsinki, and Pediatric Bodily Autonomy',
      'V.vi. Breaking the Conspiracy of Silence in Modern Obstetrics'
    ],
    primaryEvidence: 'Nuremberg Code Principles • Anand et al. Neonatal Pain Neuroendocrinology'
  },
  {
    number: 6,
    roman: 'VI',
    title: 'The American Psyche',
    subtitle: 'The Cultivated Blindness of a Nation',
    trackId: 'psychology',
    trackName: 'Cultural Psychology & Denial',
    color: '#8b5cf6',
    readingTime: '10 min',
    wordCount: '3,550 words',
    summary: 'Exploring the unique cultural and psychological defense mechanisms—denial, projection, and father-son solidarity—fueling American exceptionalism in infant circumcision.',
    curatedBlurb: 'Why otherwise progressive, evidence-based parents fiercely defend a mutilative ritual: cognitive dissonance, paternal validation, and the dread of admitting what was done to them.',
    subsections: [
      'VI.i. The "Looks Like Daddy" Complex: Transgenerational Trauma as Bonding',
      'VI.ii. Locker Room Mythology: The Phantom Threat of Being "Different"',
      'VI.iii. Cognitive Dissonance: When Admitting Harm Threatens Self-Worth',
      'VI.iv. Maternal Complicity and the Reluctance to Cross the Father',
      'VI.v. Visual Censorship: Why Natural Anatomy Was Erased from Media',
      'VI.vi. Piercing the Fog: Waking Up from Collective Cultural Hypnosis'
    ],
    primaryEvidence: 'Tim Hammond Global Survey on Circumcision Grief (1999) • Psychological Dissociation Studies'
  },
  {
    number: 7,
    roman: 'VII',
    title: 'The Long Shadow of the Scalpel',
    subtitle: 'Physical Realities, Psychological Scars, and the Unacknowledged Toll',
    trackId: 'psychology',
    trackName: 'Physical & Psychological Harm',
    color: '#ec4899',
    readingTime: '15 min',
    wordCount: '4,900 words',
    summary: 'Shedding light on the often-hidden, lifelong physical, sexual, and psychological consequences—from keratinization and the orgasm gap to disenfranchised grief.',
    curatedBlurb: 'Documenting the silent physical and emotional devastation: keratinized glans, meatal stenosis, painful erections, severed nerve endings, and grief that culture commands men to swallow.',
    subsections: [
      'VII.i. The Physical Toll: Keratinization, Adhesions, and Meatal Stenosis',
      'VII.ii. The Biomechanical Loss: Lubrication, Glide, and Mechanical Friction',
      'VII.iii. The Orgasm Gap: The Chasm Between Altered Baseline and Intact Sensory Spectrum',
      'VII.iv. Disenfranchised Grief: Mourning a Stolen Part When Culture Tells You to Smile',
      'VII.v. Partner Experiences: The Unspoken Pain for Women and Gay Men',
      'VII.vi. Foreskin Restoration: Reclaiming Wholeness Against All Odds'
    ],
    primaryEvidence: 'Kim & Pang (2007) Sexual Function Reduction • CircumSurvey Cohort Analysis'
  },
  {
    number: 8,
    roman: 'VIII',
    title: 'The Intactivist Uprising',
    subtitle: 'Strategies for a Genital Revolution',
    trackId: 'uprising',
    trackName: 'The Resistance Movement',
    color: '#3b82f6',
    readingTime: '13 min',
    wordCount: '4,150 words',
    summary: 'Introducing the courageous grassroots movement fighting for bodily integrity, analyzing its history, its cultural milestones, and the fierce institutional resistance it faces.',
    curatedBlurb: 'From Marilyn Milos and the First International Symposium to the Bloodstained Men protests, Foregen biotechnological regeneration, and the digital intactivist revolution.',
    subsections: [
      'VIII.i. The Pioneers: Marilyn Milos, NOCIRC, and the First Symposia (1989)',
      'VIII.ii. Bloodstained Men: Radical Visibility on the Streets of America',
      'VIII.iii. The Academic Rebellion: Lawyers, Bioethicists, and Dissenting Pediatricians',
      'VIII.iv. Foregen and Regenerative Medicine: The Quest to Regrow the Prepuce',
      'VIII.v. The Tactics of Dismissal: How Mainstream Media Smears the Movement',
      'VIII.vi. Building Bridges: Uniting with Feminism, Queer Liberation, and Child Protection'
    ],
    primaryEvidence: 'NOCIRC Archives (UMass MS 1205) • Bloodstained Men National Tour Photographic Dossiers'
  },
  {
    number: 9,
    roman: 'IX',
    title: 'Reclaiming Our Birthright',
    subtitle: 'A Future of Integrity',
    trackId: 'uprising',
    trackName: 'Policy, Law & Roadmap',
    color: '#14b8a6',
    readingTime: '12 min',
    wordCount: '3,950 words',
    summary: 'Offering concrete strategic roadmaps for permanently dismantling routine infant circumcision through Medicaid decoupling, statutory reform, and cultural re-education.',
    curatedBlurb: 'The tactical policy playbook: defunding circumcision from state Medicaid programs, harmonizing female and male genital cutting statutes, and enforcing strict legal liability.',
    subsections: [
      'IX.i. Defunding the Scalpel: Ending Medicaid Reimbursements State by State',
      'IX.ii. Equal Protection in Law: Harmonizing FGM and MGM Criminal Statutes',
      'IX.iii. The Courtroom Assault: Malpractice, Battery, and Constitutional Civil Suits',
      'IX.iv. Hospital Disclosure Acts: Mandating Honest Pre-Natal Counseling',
      'IX.v. Re-educating Doctors: Integrating Intact Anatomy into Medical Curricula',
      'IX.vi. The Inevitable Tipping Point: Watching the National Rate Fall Below 30%'
    ],
    primaryEvidence: 'Hadachek v. Oregon Court Filings • Huff v. Colorado Denver District Court Filings'
  },
  {
    number: 10,
    roman: 'X',
    title: 'Transcending the Glitch',
    subtitle: 'From Accidental Anthropologist to Intentional Intactivist',
    trackId: 'uprising',
    trackName: 'Personal Awakening & Call to Action',
    color: '#f59e0b',
    readingTime: '10 min',
    wordCount: '3,250 words',
    summary: 'Reflecting on the personal and philosophical journey, grappling with collective cultural blindness, and issuing an impassioned, resolute call to action.',
    curatedBlurb: 'The concluding philosophical synthesis: why observation without action is moral surrender, and how each of us can choose to be the generation that ends this ancient harm forever.',
    subsections: [
      'X.i. Looking Back: The Journey of the Outlier',
      'X.ii. The Myth of Neutrality: Why Silence Is Complicity',
      'X.iii. The Secular Humanist Mandate: Bodily Integrity as the First Human Right',
      'X.iv. For the Boys Born Tomorrow: A Promise Kept',
      'X.v. The Final Call: Standing Up, Speaking Out, and Breaking the Chain'
    ],
    primaryEvidence: 'Accidental Intactivist Field Notes • Final Movement Ethical Charter'
  },
  {
    number: 11,
    roman: 'XI',
    title: 'Resources for Action & Defense',
    subtitle: 'Archival Compendium, Bioethics Declarations, Legal Strategy Dossiers, and Peer Support Networks',
    trackId: 'compendium',
    trackName: 'Archival Compendium & Action Registry',
    color: '#facc15',
    readingTime: 'Reference',
    wordCount: '9,800 words',
    summary: 'Comprehensive compendium of primary source archival materials, international bioethical declarations, courtroom filings, peer-support networks, and restorative care registries.',
    curatedBlurb: 'A 16-section archival treasury connecting readers directly to the 3,200+ documents in the Tim Hammond Collection at UMass Amherst, legal dockets, and verified intactivist organizations.',
    subsections: [
      'XI.1. The Tim Hammond Papers at UMass Amherst (MS 1205)',
      'XI.2. Key International Medical & Bioethical Declarations',
      'XI.3. Landmark Legal Dockets (Hadachek v. Oregon & Huff v. Colorado)',
      'XI.4. Organizations & Advocacy Groups (Intact Global, Bloodstained Men, Foregen)',
      'XI.5. Foreskin Restoration Communities & Peer Support Networks',
      'XI.6. Academic & Primary Source Literature Database'
    ],
    primaryEvidence: 'UMass MS 1205 Finding Aid • Intact Global Courtroom Filings • NOHARMM Survey Archive'
  }
];

export default function ManifestoPortal({
  onSelectChapter,
  onOpenCompendium,
  onStartReading
}) {
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [isSectionIExpanded, setIsSectionIExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredSections = selectedTrack === 'all'
    ? CURATED_SECTION_ROADMAP
    : CURATED_SECTION_ROADMAP.filter(sec => sec.trackId === selectedTrack);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  return (
    <div className="manifesto-portal-root" style={{ fontFamily: FONT.body }}>
      {/* ── Top Portal Masthead Bar ── */}
      <div className="manifesto-portal-masthead-bar">
        <div className="manifesto-portal-masthead-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#d4a030',
              boxShadow: '0 0 10px #d4a030'
            }} />
            <span style={{
              fontFamily: FONT.condensed,
              fontWeight: 800,
              fontSize: '0.78rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#d4a030'
            }}>
              THE ACCIDENTAL INTACTIVIST'S MANIFESTO • PORTAL
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={handleShare}
              className="manifesto-pill-btn lux-hover-lift"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: copiedLink ? '#10b981' : '#ccc',
                borderColor: copiedLink ? '#10b981' : 'rgba(255, 255, 255, 0.12)'
              }}
            >
              <Share2 size={13} />
              <span>{copiedLink ? 'Link Copied!' : 'Share Manifesto'}</span>
            </button>
            <button
              onClick={() => onSelectChapter(0)}
              className="manifesto-pill-btn manifest-btn-primary lux-hover-lift"
              style={{
                background: 'linear-gradient(135deg, #d4a030, #eab308)',
                color: '#000',
                fontWeight: 800
              }}
            >
              <BookOpen size={14} />
              <span>Start Reading (Ch. I)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Grand Exhibition Hero ── */}
      <section className="manifesto-portal-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="no-print" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.2 }}>
          <LoomChoreography isInline={true} forceFormation="orbital" opacity={1} themeColor="manifesto" />
        </div>
        <div className="manifesto-portal-hero-container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="manifesto-hero-eyebrow">
            <span className="manifesto-eyebrow-pip" />
            <span>EXHIBITION PORTAL • 2025 ARCHIVAL COMPENDIUM EDITION</span>
          </div>

          <h1 className="manifesto-portal-main-title" style={{ fontFamily: FONT.display }}>
            The Accidental Intactivist's Manifesto
          </h1>
          <h2 className="manifesto-portal-sub-title">
            Exposing the Monster We Agree Not to See
          </h2>

          <div className="manifesto-portal-author-meta">
            <span>By <strong>Tone Pettit</strong></span>
            <span>•</span>
            <span>Accidental Anthropologist & Intentional Intactivist</span>
            <span>•</span>
            <span style={{ color: '#d4a030' }}>Curated with UMass MS 1205 Archival Citations</span>
          </div>

          <p className="manifesto-portal-lead-text">
            History is littered with the ghosts of transparent monsters: practices considered normal, even virtuous, for generations by entire societies, defended by intellectuals and institutions, only recognized as abhorrent atrocities after generations of struggle. Routine infant circumcision is precisely such a monster dwelling within modern American culture.
          </p>

          {/* Metric Badges */}
          <div className="manifesto-portal-metrics-grid">
            <div className="manifesto-metric-box">
              <span className="manifesto-metric-val">11</span>
              <span className="manifesto-metric-lbl">Curated Sections</span>
            </div>
            <div className="manifesto-metric-box">
              <span className="manifesto-metric-val">35,000+</span>
              <span className="manifesto-metric-lbl">Unabridged Words</span>
            </div>
            <div className="manifesto-metric-box">
              <span className="manifesto-metric-val">3,200+</span>
              <span className="manifesto-metric-lbl">Archival Receipts</span>
            </div>
            <div className="manifesto-metric-box">
              <span className="manifesto-metric-val">1,200+</span>
              <span className="manifesto-metric-lbl">Survey Data Telemetry</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="manifesto-portal-cta-row">
            <button
              onClick={() => onSelectChapter(0)}
              className="manifesto-portal-hero-btn primary lux-hover-lift"
            >
              <BookOpen size={16} />
              <span>Read Full Walkthrough (Chapters I – XI)</span>
            </button>
            <a
              href="#section-browser"
              className="manifesto-portal-hero-btn secondary lux-hover-lift"
            >
              <Layers size={16} />
              <span>Browse Subject Corridors & Sections</span>
            </a>
            <button
              onClick={onOpenCompendium}
              className="manifesto-portal-hero-btn tertiary lux-hover-lift"
            >
              <Database size={16} />
              <span>Inspect Section XI Compendium</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Featured Focus: Figure I.i & The "Transparent Monster" Concept ── */}
      <section className="manifesto-featured-concept-section">
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="manifesto-concept-card">
            <div className="manifesto-concept-card-glow" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <span className="manifesto-badge-pill" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', borderColor: 'rgba(234, 179, 8, 0.35)' }}>
                  <Eye size={12} />
                  FIGURE I.i // THE CORE THESIS
                </span>
                <span style={{ fontSize: '0.75rem', color: '#888', fontFamily: FONT.mono }}>
                  THE CONCEPTUAL ANCHOR
                </span>
              </div>

              <h3 style={{
                fontFamily: FONT.display,
                fontSize: 'clamp(1.35rem, 3vw, 1.85rem)',
                color: '#ffffff',
                fontWeight: 700,
                lineHeight: 1.3,
                marginBottom: '1rem'
              }}>
                The “Transparent Monster” — A Devastating Harm Woven into Accepted Normalcy
              </h3>

              <div style={{
                fontSize: '1.02rem',
                color: 'rgba(255, 255, 255, 0.88)',
                lineHeight: 1.7,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <p style={{ margin: 0 }}>
                  <em>"These are enormous moral problems, vast in scale and devastating in consequence, yet they walk mostly unseen among us. They are transparent not because they are small, but because they are woven into the very fabric of 'normal,' accepted as 'just how things are,' rationalized away, or defended as necessary or even beneficial."</em>
                </p>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.72)', fontSize: '0.94rem' }}>
                  From the kindergarten revelation to observing the "negative space" etched upon adult partners, Tone Pettit chronicles the journey of an accidental outlier who learned that questioning this default was like questioning reality itself—and why observation must inevitably yield to active obligation.
                </p>
              </div>

              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <button
                  onClick={() => setIsSectionIExpanded(!isSectionIExpanded)}
                  className="lux-hover-lift"
                  style={{
                    background: 'rgba(212, 160, 48, 0.12)',
                    border: '1px solid rgba(212, 160, 48, 0.35)',
                    color: '#facc15',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <BookOpen size={14} />
                  <span>{isSectionIExpanded ? 'Collapse Section I Lead Essay' : 'Read Section I Lead Essay Right Here ↓'}</span>
                </button>

                <button
                  onClick={() => onSelectChapter(0)}
                  className="lux-hover-lift"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#aaa',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span>Open in Full Interactive Reader Mode</span>
                  <ChevronRight size={15} color="#d4a030" />
                </button>
              </div>
            </div>
          </div>

          {/* ── In-line Section I Expanded Reading Module ── */}
          {isSectionIExpanded && (
            <div className="manifesto-section-one-lead-reader lux-glide-in">
              <div style={{
                padding: '2.5rem',
                background: 'rgba(15, 15, 22, 0.95)',
                border: '1px solid rgba(212, 160, 48, 0.3)',
                borderRadius: '16px',
                marginTop: '1.5rem',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)'
              }}>
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: FONT.mono, color: '#facc15', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    UNABRIDGED INTRODUCTORY ESSAY
                  </span>
                  <h3 style={{ fontFamily: FONT.display, fontSize: '2rem', color: '#fff', margin: '0.3rem 0' }}>
                    Section I: The Price of Admission – Waking from the American Dream
                  </h3>
                </div>

                <div className="manifesto-reading-body">
                  <h4 style={{ color: '#facc15', fontFamily: FONT.display, fontSize: '1.3rem', marginTop: '1.5rem' }}>
                    I.i. The Promises Assured the Land of the Free
                  </h4>
                  <p>
                    <AutoEntityLinker text="We Americans are masters of the comforting narrative. We wrap ourselves in stories about who we are: champions of Liberty, bastions of Freedom of Choice, fierce protectors of Individuality. We speak with reverence of the inviolable sanctity of the individual body." />
                  </p>
                  <p>
                    <AutoEntityLinker text="These aren't just platitudes; they are the load-bearing pillars of the American dream, the assumed reality we inhabit. We place faith in our institutions, trust in the arc of progress, and operate on a baseline assumption of shared rationality, especially concerning our physical selves." />
                  </p>
                  <p>
                    <AutoEntityLinker text="We expect doctors to be guided by evidence, parents to act in unwavering protection of their children, leaders to honor this, and society itself to shield the vulnerable. These are the silent promises undergirding a civilized world." />
                  </p>
                  <p>
                    <AutoEntityLinker text="But sometimes, if you dare to adjust your focus, if you resist the immense gravitational pull of the default narrative, you perceive something... off. A subtle inconsistency flickering at the edge of perception. A glitch in the matrix. A detail stubbornly refusing to compute, hidden in plain sight, yet so pervasive it dissolves into the background hum of accepted reality." />
                  </p>
                  <p>
                    <AutoEntityLinker text="This isn't just a minor error. It points towards something much larger, something akin to what philosophers and observers of history call a 'Transparent Monster.' These are enormous moral problems, vast in scale and devastating in consequence, yet they walk mostly unseen among us. They are transparent not because they are small, but because they are woven into the very fabric of 'normal,' accepted as 'just how things are,' rationalized away, or defended as necessary or even beneficial." />
                  </p>
                  <p>
                    <AutoEntityLinker text="History is littered with the ghosts of such monsters: slavery, the subjugation of women, the persecution of minorities – practices considered normal, even virtuous, for millennia by entire societies, defended by intellectuals and institutions, only recognized as abhorrent atrocities after generations of struggle by those few who first dared to see and speak out." />
                  </p>

                  <h4 style={{ color: '#facc15', fontFamily: FONT.display, fontSize: '1.3rem', marginTop: '2rem' }}>
                    I.ii. Deciphering the Glitch: A Childhood Revelation
                  </h4>
                  <p>
                    <AutoEntityLinker text="For me, the glitch arrived not as a sudden system crash, but as a coded message, painstakingly deciphered in childhood. Kindergarten. A classroom conversation, half-heard, initially misunderstood, later clarified by my mother with a startling, matter-of-fact frankness. She explained that some parents chose – chose – to have part of their baby boys' penises... cut off." />
                  </p>
                  <p>
                    <AutoEntityLinker text="Not in whispers, not cloaked in euphemism, but directly. 'Yes, they did that to your dad,' she stated, answering my brother's and his friend's blunt questions, 'but I thought that was unnecessary.' That casual dismissal – 'unnecessary' – delivered with the quiet authority of maternal conviction against an unspoken cultural mandate, planted a seed of profound, dissonant awareness." />
                  </p>
                  <p>
                    <AutoEntityLinker text="I grew up intact – meaning whole, complete, born with and retaining the natural genital anatomy designed by evolution, uncompromised by surgical alteration – increasingly conscious of my outlier status. From this slightly different shore, I became an Accidental Anthropologist, perpetually observing a ubiquitous cultural ritual I could not fathom." />
                  </p>

                  <h4 style={{ color: '#facc15', fontFamily: FONT.display, fontSize: '1.3rem', marginTop: '2rem' }}>
                    I.iii. The Anthropologist's Burden: Ubiquity, Dissociation, and the Unbearable Question
                  </h4>
                  <p>
                    <AutoEntityLinker text="Syndicated relationship expert Dan Savage famously speaks of the compromises we accept in partners as their 'price of admission,' a concept rooted in interpersonal acceptance; the term takes on a darker hue when applied societally. What if the unspoken, almost subconscious 'price of admission' for a male born in America hasn't been about accepting flaws, but about undergoing a physical subtraction, a ritualistic alteration deemed necessary for belonging?" />
                  </p>
                  <p>
                    <AutoEntityLinker text="It's like inhabiting a world where everyone casually accepts that newborns should have a perfectly functional, sensitive finger removed at birth, justified with some flimsy excuse about preventing rare finger-related infections decades later. As someone born with all ten fingers, which serve me exquisitely well, the very idea is insane. It forces the question that echoes through this entire manifesto: Why isn't it weird to more of us?" />
                  </p>

                  <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    background: 'rgba(212, 160, 48, 0.08)',
                    border: '1px solid rgba(212, 160, 48, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#facc15', fontSize: '1rem' }}>
                        Ready to Dive into the Full 10 Chapters?
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#bbb' }}>
                        Proceed directly into Section II: The Myth of the Foreskin with full archival receipts.
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectChapter(1)}
                      className="manifesto-pill-btn manifest-btn-primary lux-hover-lift"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                        color: '#fff',
                        fontWeight: 700,
                        padding: '0.6rem 1.25rem'
                      }}
                    >
                      <span>Read Section II: The Myth of the Foreskin</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Section Browser: Color-Coded Subject Corridors ── */}
      <section id="section-browser" className="manifesto-browser-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{
              fontSize: '0.72rem',
              fontFamily: FONT.mono,
              color: '#facc15',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 700
            }}>
              THE 11 CURATED SECTIONS
            </span>
            <h2 style={{
              fontFamily: FONT.display,
              fontSize: 'clamp(2rem, 4vw, 2.85rem)',
              color: '#ffffff',
              margin: '0.4rem 0 0.8rem 0'
            }}>
              Browse by Subject Corridor
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#aaa',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Explore the 11 chapters through color-coded thematic corridors, diving directly into anatomical science, historical deception, cultural psychology, or the reform playbook.
            </p>
          </div>

          {/* Track Filter Pills */}
          <div className="manifesto-track-pills-row">
            {MANIFESTO_TRACKS.map(track => {
              const isActive = selectedTrack === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(track.id)}
                  className={`manifesto-track-chip ${isActive ? 'active' : ''}`}
                  style={{
                    borderColor: isActive ? track.color : 'rgba(255, 255, 255, 0.1)',
                    background: isActive ? `${track.color}20` : 'rgba(20, 20, 26, 0.6)',
                    color: isActive ? '#fff' : '#aaa'
                  }}
                >
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: track.color,
                    boxShadow: isActive ? `0 0 8px ${track.color}` : 'none'
                  }} />
                  <span>{track.label}</span>
                </button>
              );
            })}
          </div>

          {/* 11 Section Cards Grid */}
          <div className="manifesto-cards-grid">
            {filteredSections.map(sec => {
              const isSectionXI = sec.number === 11;
              return (
                <div
                  key={sec.number}
                  className="manifesto-section-card lux-hover-lift"
                  style={{
                    borderTop: `3px solid ${sec.color}`,
                    background: 'rgba(15, 15, 22, 0.75)',
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  <div className="manifesto-card-top-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span 
                        className="manifesto-card-number-badge"
                        style={{
                          background: `${sec.color}20`,
                          color: sec.color,
                          border: `1px solid ${sec.color}45`
                        }}
                      >
                        SECTION {sec.roman}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: FONT.mono }}>
                        {sec.readingTime}
                      </span>
                    </div>

                    <span style={{
                      fontSize: '0.68rem',
                      fontFamily: FONT.mono,
                      color: sec.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 700
                    }}>
                      {sec.trackName}
                    </span>
                  </div>

                  <h3 className="manifesto-card-title" style={{ fontFamily: FONT.display }}>
                    {sec.title}
                  </h3>
                  <h4 className="manifesto-card-subtitle">
                    {sec.subtitle}
                  </h4>

                  <p className="manifesto-card-blurb">
                    {sec.curatedBlurb || sec.summary}
                  </p>

                  {/* Subsections Preview List */}
                  {sec.subsections && sec.subsections.length > 0 && (
                    <div className="manifesto-card-subsections-box">
                      <div className="manifesto-card-subsections-title">
                        Key Subsections & Arguments:
                      </div>
                      <div className="manifesto-card-subsections-chips">
                        {sec.subsections.slice(0, 3).map((sub, sIdx) => (
                          <span key={sIdx} className="manifesto-sub-chip">
                            {sub.split(':')[0]}
                          </span>
                        ))}
                        {sec.subsections.length > 3 && (
                          <span className="manifesto-sub-chip more">
                            +{sec.subsections.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Primary Evidence Receipt Preview */}
                  {sec.primaryEvidence && (
                    <div style={{
                      marginTop: '0.85rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '0.75rem',
                      color: '#bbb',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem'
                    }}>
                      <ShieldCheck size={13} color={sec.color} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sec.primaryEvidence}
                      </span>
                    </div>
                  )}

                  {/* Card Action Link */}
                  <div className="manifesto-card-footer">
                    <button
                      onClick={() => {
                        if (isSectionXI) {
                          onOpenCompendium();
                        } else {
                          onSelectChapter(sec.number - 1);
                        }
                      }}
                      className="manifesto-card-action-btn lux-hover-lift"
                      style={{
                        background: `${sec.color}15`,
                        borderColor: `${sec.color}40`,
                        color: sec.color
                      }}
                    >
                      <span>{isSectionXI ? 'Inspect Compendium (Section XI)' : `Read Section ${sec.roman}`}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Compendium Archival Highlights Banner ── */}
      <section className="manifesto-compendium-banner-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="manifesto-compendium-banner-card">
            <div style={{ flex: 1, minWidth: '300px' }}>
              <span className="manifesto-badge-pill" style={{ background: 'rgba(250, 204, 21, 0.15)', color: '#facc15', borderColor: 'rgba(250, 204, 21, 0.3)' }}>
                <Database size={13} />
                PRIMARY SOURCE PROVENANCE
              </span>
              <h3 style={{
                fontFamily: FONT.display,
                fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
                color: '#ffffff',
                margin: '0.5rem 0'
              }}>
                Section XI: The Archival Evidence Compendium
              </h3>
              <p style={{ color: '#bbb', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                Every ethical claim and medical critique in this manifesto is tethered to primary documentation: the 3,200+ dossiers of the <strong>Tim Hammond Papers (UMass MS 1205)</strong>, official AAP committee reversals, and active federal litigation dockets.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={onOpenCompendium}
                className="manifesto-portal-hero-btn primary lux-hover-lift"
                style={{
                  background: 'linear-gradient(135deg, #facc15, #eab308)',
                  color: '#000',
                  fontWeight: 800
                }}
              >
                <Layers size={16} />
                <span>Open Archival Compendium</span>
              </button>
              <Link
                to="/collections/tim-hammond-archive"
                className="manifesto-portal-hero-btn secondary lux-hover-lift"
              >
                <span>Visit Hammond Archive</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
