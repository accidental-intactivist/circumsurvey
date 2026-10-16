import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useMediaList } from '../contexts/MediaListContext';
import { useReport } from '../contexts/ReportContext';
import { 
  Newspaper, BookOpen, Scale, Video, Headphones, Image as ImageIcon, 
  FileText, ChevronUp, ChevronDown, CheckSquare, PlusSquare, FilePlus, 
  Globe, Sparkles, Archive, Search, X, Layers, Grid, List, Bookmark, 
  ArrowRight, ExternalLink, ShieldCheck, Heart, Stethoscope, Copy, Check,
  Folder, Tag, Calendar
} from 'lucide-react';
import PDFThumbnail from '../components/PDFThumbnail';
import EntityLink from '../components/EntityLink';
import ThinkingSpirograph from '../components/ThinkingSpirograph';
import AutoEntityLinker from '../components/AutoEntityLinker';
import { generateFriendlySlug } from '../utils/slugs';
import { resolveCollectionName } from '../utils/collections';
import { captureEvent } from '../lib/telemetry';
import { shouldRunSemanticSearch } from '../utils/semanticSearch';
import { safeParseJson } from '../utils/json';
import LoomChoreography from '../components/GuidedTour/LoomChoreography';
import './DigitalLibrary.css';
import './AdminArchivePage.css';

// Curated Seminal Treasures for the High-Impact Stacks Shelf
const CURATED_TREASURES = [
  {
    id: 'treasure-1',
    title: 'The Value of the Foreskin',
    author: 'Dr. Hugh C. Thompson',
    date: '1965',
    type: 'medical_journal',
    formatLabel: 'Medical Journal',
    collection: 'UMass MS 1205: Medical Policy & Ethics',
    excerpt: 'One of the earliest modern medical whistleblower papers in American pediatrics, challenging the clinical orthodoxy of routine infant cutting and detailing natural foreskin function.',
    targetSlug: 'the-value-of-the-foreskin-1965',
    category: 'Pediatric Whistleblower',
    searchQuery: 'Hugh Thompson Value of the Foreskin'
  },
  {
    id: 'treasure-2',
    title: 'AWAKENINGS: A Preliminary Poll of Circumcised Men',
    author: 'Tim Hammond',
    date: '1999',
    type: 'physical_document',
    formatLabel: 'Empirical Survey',
    collection: 'UMass MS 1205: AWAKENINGS Research',
    excerpt: 'Foundational 1999 survey documenting the psychological trauma, somatic loss, and physical complications reported by adult circumcised men, initiating modern intactivism.',
    targetSlug: 'awakenings-preliminary-poll-of-circumcised-men',
    category: 'Men\'s Health Research',
    searchQuery: 'AWAKENINGS preliminary poll'
  },
  {
    id: 'treasure-3',
    title: 'Circumcision in America: Attitudes, Beliefs and Charges',
    author: 'Marilyn Fayre Milos, RN',
    date: '1998',
    type: 'medical_journal',
    formatLabel: 'Physician Survey',
    collection: 'UMass MS 1205: NOCIRC Archives',
    excerpt: 'Comprehensive study of U.S. physician practices, financial incentives, and knowledge deficits regarding neonatal foreskin anatomy and infant surgical trauma.',
    targetSlug: 'circumcision-in-america-in-1998',
    category: 'Institutional Economics',
    searchQuery: 'Circumcision in America 1998'
  },
  {
    id: 'treasure-4',
    title: 'Non-Therapeutic Circumcision of Male Minors Policy',
    author: 'Royal Dutch Medical Association (KNMG)',
    date: '2010',
    type: 'policy_guideline',
    formatLabel: 'Policy Guideline',
    collection: 'UMass MS 1205: International Law',
    excerpt: 'Landmark policy of the Royal Dutch Medical Association determining non-therapeutic infant circumcision to be medically unjustifiable and a violation of the child\'s right to bodily integrity.',
    targetSlug: 'knmg-non-therapeutic-circumcision-policy',
    category: 'International Consensus',
    searchQuery: 'KNMG Royal Dutch Medical Association'
  },
  {
    id: 'treasure-5',
    title: 'Fine-Touch Tactile Thresholds in the Adult Penis',
    author: 'Morris L. Sorrells, M.D. et al.',
    date: '2007',
    type: 'medical_journal',
    formatLabel: 'Clinical Trial',
    collection: 'UMass MS 1205: Medical Policy & Ethics',
    excerpt: 'Rigorous quantitative testing using Semmes-Weinstein monofilaments proving that the prepuce is the most sensitive portion of the adult intact human penis.',
    targetSlug: 'fine-touch-tactile-thresholds-sorrells',
    category: 'Sensory Histology',
    searchQuery: 'Sorrells tactile thresholds'
  },
  {
    id: 'treasure-6',
    title: 'Huff v. State of Colorado Civil Rights Action',
    author: 'Tristan Huff & Adam Schwartz',
    date: '2024',
    type: 'legal_document',
    formatLabel: 'Constitutional Brief',
    collection: 'UMass MS 1205: Legal Litigation',
    excerpt: 'Groundbreaking federal civil rights litigation asserting that state Medicaid funding and statutory carveouts for routine infant male circumcision violate the Equal Protection Clause.',
    targetSlug: 'huff-v-colorado-2024',
    category: 'Equal Protection',
    searchQuery: 'Huff v Colorado'
  }
];

// The 6 Thematic Pillars of the Movement
const THEMATIC_PILLARS = [
  {
    id: 'anatomy-histology',
    title: 'Clinical Anatomy & Sensation',
    desc: 'Prepuce micro-anatomy, fine-touch Meissner corpuscle innervation, vascularization, and reported physical complication rates.',
    icon: <Stethoscope size={24} color="#38bdf8" />,
    color: '#38bdf8',
    filterTag: 'bioethics',
    searchPreset: 'anatomy innervation sensation histology',
    tags: ['Nerve Endings', 'Histology', 'Sensation Thresholds', 'Meissner\'s Corpuscles']
  },
  {
    id: 'victorian-history',
    title: 'Victorian History & Reflex Neurosis',
    desc: 'The origins of American circumcision: Dr. Lewis Sayre (1870), Dr. John Harvey Kellogg (1888), anti-masturbatory hysteria, and medicalization.',
    icon: <BookOpen size={24} color="#facc15" />,
    color: '#facc15',
    filterTag: 'history',
    searchPreset: 'Lewis Sayre Kellogg reflex neurosis 1870',
    tags: ['Lewis Sayre 1870', 'Dr. Kellogg', 'Reflex Neurosis', 'Anti-Masturbation']
  },
  {
    id: 'constitutional-law',
    title: 'Human Rights & Constitutional Law',
    desc: 'State Medicaid subsidies, equal protection challenges, Huff v. Colorado, Hadachek v. Oregon, Prince v. Massachusetts, and UN CRC Article 24.3.',
    icon: <Scale size={24} color="#10b981" />,
    color: '#10b981',
    filterTag: 'human rights',
    searchPreset: 'constitutional equal protection medicaid law',
    tags: ['Huff v. Colorado', 'Hadachek v. Oregon', 'UN CRC', 'Equal Protection']
  },
  {
    id: 'global-policies',
    title: 'Global Medical Policies & Consensus',
    desc: 'Official pediatric guidelines from KNMG (Netherlands), BMA (UK), Canadian Paediatric Society, Australasian RACP, and European critiques of the AAP.',
    icon: <Globe size={24} color="#a855f7" />,
    color: '#a855f7',
    filterTag: 'pediatric',
    searchPreset: 'KNMG AAP European medical consensus policy',
    tags: ['KNMG Netherlands', 'AAP 2012 Critique', 'Canadian Paediatric', 'BMA']
  },
  {
    id: 'voices-of-the-cut',
    title: 'Psychological Testimony & AWAKENINGS',
    desc: 'First-person narratives, survey data from over 1,200 circumcised men, somatic grief, psychological harm, and the foreskin restoration movement.',
    icon: <Heart size={24} color="#f43f5e" />,
    color: '#f43f5e',
    filterTag: 'psychology',
    searchPreset: 'AWAKENINGS survey psychological grief restoration',
    tags: ['AWAKENINGS Survey', 'Psychological Trauma', 'Men\'s Testimony', 'Restoration']
  },
  {
    id: 'grassroots-movement',
    title: 'Movement History, Media & Periodicals',
    desc: 'Four decades of direct action: NOCIRC International Symposia, NOHARMM news releases, Bloodstained Men tours, talk show exposés, and clippings.',
    icon: <Newspaper size={24} color="#fb923c" />,
    color: '#fb923c',
    filterTag: 'activism',
    searchPreset: 'NOCIRC NOHARMM Bloodstained Men symposium',
    tags: ['NOCIRC 1985', 'NOHARMM 1992', 'Bloodstained Men', 'Newsletters']
  }
];

export default function DigitalLibrary() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { mediaLists, createList, addToList, addMultipleToList, removeFromList, getDefaultList } = useMediaList();
  const { addToReport } = useReport();
  const [searchParams, setSearchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag') || '';
  const categoryParam = searchParams.get('category') || '';
  const queryParam = searchParams.get('q') || searchParams.get('search') || '';
  const formatParam = searchParams.get('format') || '';
  const yearParam = searchParams.get('year') || '';
  const subjectParam = searchParams.get('subject') || '';
  const topicParam = searchParams.get('topic') || '';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedSubject, setSelectedSubject] = useState(subjectParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedFormat, setSelectedFormat] = useState(formatParam);
  const [selectedPublication, setSelectedPublication] = useState('');
  const [selectedYear, setSelectedYear] = useState(yearParam);
  const [showUnscanned, setShowUnscanned] = useState(false);

  // View Mode: 'stacks' (curated entrance), 'gallery' (visual cards), 'table' (dense data grid), 'reading-list'
  const hasInitialFilter = Boolean(categoryParam || tagFilter || queryParam || formatParam || yearParam || subjectParam || topicParam);
  const [viewMode, setViewMode] = useState(hasInitialFilter ? 'gallery' : 'stacks');

  // Semantic Search
  const [semanticResults, setSemanticResults] = useState(null);
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false);

  // Document Inspection Drawer
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [copiedCitation, setCopiedCitation] = useState(false);

  // Table & Selection
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showListModal, setShowListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);

  const searchInputRef = useRef(null);

  // Keyboard shortcut '/' to search and 'Escape' to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && selectedDoc) {
        setSelectedDoc(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDoc]);

  // Clean Publication Name
  const cleanPublicationName = (name) => {
    if (!name) return null;
    const lower = name.toLowerCase();
    if (lower.includes('nocirc newsletter')) return 'NOCIRC Newsletter';
    if (lower.includes('national organization of circumcision information resource centers')) return 'NOCIRC';
    if (lower.includes('noharmm news release')) return 'NOHARMM News Release';
    if (lower.includes('no harmm') || lower.includes('noharmm')) return 'NOHARMM';
    if (lower.includes('recap')) return 'RECAP';
    if (lower.includes('shop talk')) return 'Shop Talk';
    if (lower.includes('convention xxii proceedings')) return 'Convention XXII Proceedings';
    return name;
  };

  // Fetch Documents
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let data = [];
      try {
        const res = await fetch('/api/cms?limit=1000');
        if (res.ok) {
          const resData = await res.json();
          data = resData.data || resData;
        }
      } catch {
        // fallback
      }

      // Merge mock data for local dev & richer metadata
      try {
        const mockRes = await fetch('/api_mock.json');
        if (mockRes.ok) {
          const mockData = await mockRes.json();
          if (data.length === 0) {
            data = mockData;
          } else {
            const mockMapById = new Map();
            const mockMapByTitle = new Map();
            mockData.forEach(m => {
              if (m.id) mockMapById.set(m.id, m);
              const mMeta = safeParseJson(m.metadata_json);
              const t = (m.title || mMeta.title || '').toLowerCase().trim();
              if (t) mockMapByTitle.set(t, m);
            });

            // Merge richer metadata and collection details onto live documents
            data = data.map(doc => {
              const liveTitle = (doc.title || '').toLowerCase().trim();
              const liveMeta = safeParseJson(doc.metadata_json);
              const geminiTitle = (liveMeta.gemini_extracted_metadata?.title || '').toLowerCase().trim();
              
              const match = mockMapById.get(doc.id) || (liveTitle && mockMapByTitle.get(liveTitle)) || (geminiTitle && mockMapByTitle.get(geminiTitle));
              
              if (match) {
                const matchMeta = safeParseJson(match.metadata_json);
                const mergedSource = (match.source_collection && match.source_collection !== 'Bulk Ingest' && match.source_collection !== 'Uncategorized')
                  ? match.source_collection
                  : doc.source_collection;

                return {
                  ...match,
                  ...doc,
                  source_collection: mergedSource,
                  series: match.series || doc.series,
                  metadata_json: JSON.stringify({
                    ...matchMeta,
                    ...liveMeta,
                    gemini_extracted_metadata: liveMeta.gemini_extracted_metadata || matchMeta.gemini_extracted_metadata
                  })
                };
              }
              return doc;
            });

            // Append mock documents that are not already present in live data
            const existingIds = new Set(data.map(d => d.id));
            const existingTitles = new Set(data.map(d => (d.title || '').toLowerCase().trim()).filter(Boolean));
            const missingMock = mockData.filter(m => {
              if (existingIds.has(m.id)) return false;
              const t = (m.title || '').toLowerCase().trim();
              if (t && existingTitles.has(t)) return false;
              return true;
            });
            data = [...data, ...missingMock];
          }
        }
      } catch (e) {
        console.warn("Failed to merge mock data", e);
      }

      // Deduplicate extracted text files if the original PDF exists in the list
      const pdfBases = new Set(
        data.filter(d => d.url && d.url.toLowerCase().endsWith('.pdf'))
            .map(d => d.url.toLowerCase().replace(/\.pdf$/, ''))
      );
      const deduped = data.filter(d => {
        if (d.url && d.url.toLowerCase().endsWith('.txt')) {
          const base = d.url.toLowerCase().replace(/\.txt$/, '');
          if (pdfBases.has(base)) return false;
        }
        return true;
      });

      const enriched = deduped.map(d => {
        let subject = resolveCollectionName(d, 'The Tim Hammond Genital Autonomy Archive');
        d.source_collection = subject;
        let category = d.category || null;
        if (d.metadata_json) {
          try {
            const meta = safeParseJson(d.metadata_json);
            if (meta.category) {
              category = meta.category;
            }
            if (meta.source_publication) {
              meta.source_publication = cleanPublicationName(meta.source_publication);
              d.metadata_json = JSON.stringify(meta);
            }
          } catch {}
        }

        // Clean & normalize subject
        const titleLower = (d.title || '').toLowerCase();
        const sourceLower = (subject || '').toLowerCase();

        if (sourceLower.includes('awakenings') || titleLower.includes('awakenings') || titleLower.includes('survey microdata') || titleLower.includes('preliminary poll of circumcised men')) {
          subject = 'AWAKENINGS & Survey Microdata';
        } else if (sourceLower.includes('msu_clippings') || sourceLower.includes('msu clippings') || titleLower.includes('clippings, brochures and miscellanea') || titleLower.includes('changing men')) {
          subject = 'Clippings';
        } else if (sourceLower.includes('the accidental intactivist manifesto')) {
          subject = 'Manifesto Corpus';
        } else if (sourceLower.includes('wetransfer')) {
          subject = 'Scholarly Articles & Reviews';
        } else if (subject.includes(': ')) {
          subject = subject.split(': ')[1];
        }

        // Normalize video and audio documents
        const isVideo = Boolean(
          (d.url && d.url.match(/\.(mp4|mov|webm|ogg|mkv|avi|m4v)$/i)) ||
          (d.title && d.title.match(/\.(mp4|mov|webm|ogg|mkv|avi|m4v)$/i)) ||
          (d.metadata_json && d.metadata_json.match(/\.(mp4|mov|webm|ogg|mkv|avi|m4v)/i))
        );
        const isAudio = Boolean(
          (d.url && d.url.match(/\.(mp3|wav|m4a|aac|flac)$/i)) ||
          (d.title && d.title.match(/\.(mp3|wav|m4a|aac|flac)$/i)) ||
          (d.metadata_json && d.metadata_json.match(/\.(mp3|wav|m4a|aac|flac)/i)) ||
          (d.title && d.title.match(/\b(podcast|oral history|cassette|interview audio)\b/i))
        );
        const effectiveType = isVideo ? 'video' : (isAudio ? 'audio' : d.type);
        return { ...d, type: effectiveType, subject, category };
      });

      setDocuments(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Semantic Search Effect
  useEffect(() => {
    if (!shouldRunSemanticSearch(searchQuery)) {
      setSemanticResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSemantic(true);
      try {
        captureEvent("Performed Semantic Search", { query_text: searchQuery });
        const res = await fetch('/api/semantic-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        });
        if (res.ok) {
          const data = await res.json();
          setSemanticResults(data.matches || null);
        } else {
          setSemanticResults(null);
        }
      } catch {
        setSemanticResults(null);
      } finally {
        setIsSearchingSemantic(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Synchronize URL search params with local filters
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const q = searchParams.get('q') || searchParams.get('search') || '';
    const fmt = searchParams.get('format') || '';
    const yr = searchParams.get('year') || '';
    const sub = searchParams.get('subject') || '';
    const topic = searchParams.get('topic') || '';
    const tag = searchParams.get('tag') || '';

    let activeFmt = fmt;
    let activeCat = cat;
    let activeQ = q;

    if (topic) {
      if (topic === 'medical') {
        activeCat = 'Medical Research';
      } else if (topic === 'legislation') {
        activeFmt = 'legal_document,policy_guideline';
      } else if (topic === 'policy') {
        activeFmt = 'policy_guideline';
      } else if (topic === 'fgm-firewall') {
        activeQ = 'FGM';
      }
    }

    if (activeCat !== selectedCategory) setSelectedCategory(activeCat);
    if (activeQ !== searchQuery) setSearchQuery(activeQ);
    if (activeFmt !== selectedFormat) setSelectedFormat(activeFmt);
    if (yr !== selectedYear) setSelectedYear(yr);
    if (sub !== selectedSubject) setSelectedSubject(sub);

    // If any filter/search is active in URL, auto-switch to gallery view
    if (activeCat || activeQ || activeFmt || yr || sub || topic || tag) {
      setViewMode((prev) => (prev === 'stacks' ? 'gallery' : prev));
    }
  }, [searchParams]);

  // When searching or picking a facet, automatically switch out of 'stacks' into 'gallery'
  const handleQueryChange = (q) => {
    setSearchQuery(q);
    const newParams = new URLSearchParams(searchParams);
    if (q.trim()) newParams.set('q', q);
    else newParams.delete('q');
    setSearchParams(newParams);
    if (q.trim() && viewMode === 'stacks') {
      setViewMode('gallery');
    }
    setCurrentPage(1);
  };

  // Dedicated preset search for chips & pillars that clears conflicting facets
  const handlePresetSearch = (query) => {
    setSearchQuery(query);
    setSelectedSubject('');
    setSelectedCategory('');
    setSelectedFormat('');
    setSelectedPublication('');
    setSelectedYear('');
    const newParams = new URLSearchParams();
    if (query && query.trim()) newParams.set('q', query.trim());
    setSearchParams(newParams);
    setViewMode('gallery');
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSubject('');
    setSelectedCategory('');
    setSelectedFormat('');
    setSelectedPublication('');
    setSelectedYear('');
    setSearchParams(new URLSearchParams());
    setViewMode('stacks');
    setCurrentPage(1);
  };

  const handleRemoveCategory = () => {
    setSelectedCategory('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category');
    if (newParams.get('topic') === 'medical') newParams.delete('topic');
    setSearchParams(newParams);
  };

  const getYear = (doc) => {
    const meta = safeParseJson(doc.metadata_json);
    return meta.date || (doc.created_at ? doc.created_at.substring(0, 4) : null) || 'Unknown';
  };

  const years = useMemo(() => {
    return [...new Set(documents.map(d => {
      const y = getYear(d);
      if (!y || y === 'Unknown') return null;
      const parsed = parseInt(y, 10);
      return isNaN(parsed) ? null : parsed.toString();
    }).filter(Boolean))].sort((a,b) => b.localeCompare(a));
  }, [documents]);

  const subjects = useMemo(() => [...new Set(documents.map(d => d.subject).filter(Boolean))].sort(), [documents]);
  const categories = useMemo(() => {
    return [...new Set(documents.map(d => {
      const meta = safeParseJson(d.metadata_json);
      return d.category || meta.category;
    }).filter(Boolean))].sort();
  }, [documents]);
  const formats = useMemo(() => [...new Set(documents.map(d => d.type).filter(Boolean))].sort(), [documents]);
  const publications = useMemo(() => {
    return [...new Set(documents.map(d => {
      const meta = safeParseJson(d.metadata_json);
      return meta.source_publication;
    }).filter(Boolean))].sort();
  }, [documents]);

  const getCleanTitle = (d, m) => {
    if (m && m.academic_title) return m.academic_title;
    if (m && m.gemini_extracted_metadata?.title) return m.gemini_extracted_metadata.title;
    if (m && m.title) return m.title;
    let t = d.title || '';
    if (t.toLowerCase().endsWith('.pdf')) {
      t = t.replace(/\.pdf$/i, '')
           .replace(/\[.*?\]/g, '')
           .replace(/_/g, ' ')
           .replace(/page (\d+)/i, '- Page $1')
           .trim();
    }
    return t || 'Untitled Document';
  };

  const getDocumentIcon = (type, size = 18) => {
    switch ((type || '').toLowerCase()) {
      case 'newspaper_clipping': return <Newspaper size={size} />;
      case 'medical_journal': return <BookOpen size={size} />;
      case 'legal_document':
      case 'policy_guideline': return <Scale size={size} />;
      case 'multimedia':
      case 'video': return <Video size={size} />;
      case 'audio': return <Headphones size={size} />;
      case 'image': return <ImageIcon size={size} />;
      default: return <FileText size={size} />;
    }
  };

  // Filtered & Sorted Documents
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const meta = safeParseJson(doc.metadata_json);
      const hasRawFiles = meta.raw_files && meta.raw_files.length > 0;
      const isDigitized = doc.url || doc.status === 'ingested' || hasRawFiles;
      if (!showUnscanned && !isDigitized) return false;

      // Reading List View Filter
      if (viewMode === 'reading-list') {
        const defaultList = getDefaultList();
        if (!defaultList || !defaultList.items.includes(doc.id)) return false;
      }

      // Keyword match
      let matchesKeyword = false;
      if (!searchQuery) {
        matchesKeyword = true;
      } else {
        const queryLower = searchQuery.toLowerCase();
        const titleMatch = doc.title && doc.title.toLowerCase().includes(queryLower);
        const metaTitleMatch = meta.title && meta.title.toLowerCase().includes(queryLower);
        const authorMatch = meta.author && String(meta.author).toLowerCase().includes(queryLower);
        const descMatch = (meta.description || meta.abstract || '').toLowerCase().includes(queryLower);
        const pubMatch = (meta.source_publication || '').toLowerCase().includes(queryLower);
        
        matchesKeyword = titleMatch || metaTitleMatch || authorMatch || descMatch || pubMatch;

        // Date range match
        const rangeMatch = searchQuery.match(/^(\d{4})\s*-\s*(\d{4})$/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1]);
          const end = parseInt(rangeMatch[2]);
          const y = parseInt(getYear(doc));
          if (!isNaN(y) && y >= start && y <= end) {
            matchesKeyword = true;
          }
        }

        // Multi-word / token search fallback if strict substring doesn't match
        if (!matchesKeyword) {
          const stopWords = new Set(['and', 'the', 'for', 'with', 'from', 'into', 'that', 'this', 'about', 'survey', 'policy']);
          const tokens = queryLower
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length > 1 && !stopWords.has(t));

          if (tokens.length > 0) {
            const corpus = [
              doc.title,
              doc.source_collection,
              doc.series,
              meta.title,
              meta.author,
              meta.description,
              meta.abstract,
              meta.source_publication,
              ...(meta.tags || []),
              ...(meta.keywords || []),
              meta.gemini_extracted_metadata?.title,
              meta.academic_title
            ].filter(Boolean).join(' ').toLowerCase();

            const keyTokens = new Set(['sayre', 'kellogg', 'sorrells', 'knmg', 'awakenings', 'huff', 'nocirc', 'noharmm', 'meissner', 'innervation', 'histology', 'reflex', 'neurosis']);
            const matchedTokens = tokens.filter(t => corpus.includes(t));

            if (tokens.length <= 2) {
              matchesKeyword = matchedTokens.length === tokens.length || (matchedTokens.length >= 1 && matchedTokens.some(t => keyTokens.has(t)));
            } else {
              matchesKeyword = matchedTokens.length >= 2 || (matchedTokens.length >= 1 && matchedTokens.some(t => keyTokens.has(t)));
            }
          }
        }
      }

      // Semantic match
      let matchesSemantic = false;
      if (semanticResults && semanticResults.some(m => m.doc_id === doc.id)) {
        matchesSemantic = true;
      }

      if (searchQuery && !matchesKeyword && !matchesSemantic) return false;

      // Inclusive Subject Match with domain aliases
      if (selectedSubject) {
        const subLower = selectedSubject.toLowerCase();
        const docSubLower = (doc.subject || '').toLowerCase();
        const sourceLower = (doc.source_collection || '').toLowerCase();
        const seriesLower = (doc.series || '').toLowerCase();
        const titleLower = (doc.title || meta.title || '').toLowerCase();
        const descLower = (meta.description || meta.abstract || '').toLowerCase();
        const locLower = (meta.original_location || '').toLowerCase();

        let matchesSub = false;

        // Direct equality or substring inclusion
        if (docSubLower === subLower || (docSubLower && (docSubLower.includes(subLower) || subLower.includes(docSubLower)))) {
          matchesSub = true;
        }

        // Domain & box-specific aliases
        if (!matchesSub) {
          if (subLower.includes('awakening') || subLower.includes('microdata')) {
            matchesSub = titleLower.includes('awakening') || 
                         sourceLower.includes('awakening') || 
                         descLower.includes('awakening') ||
                         titleLower.includes('survey microdata') ||
                         titleLower.includes('preliminary poll') ||
                         locLower.includes('box 1');
          } else if (subLower.includes('international law') || subLower.includes('un crc') || subLower.includes('uncrc') || subLower.includes('human rights')) {
            matchesSub = docSubLower.includes('human rights') || 
                         docSubLower.includes('international law') || 
                         sourceLower.includes('international law') || 
                         seriesLower.includes('international ngo') || 
                         seriesLower.includes('ingocga') || 
                         titleLower.includes('un crc') || 
                         titleLower.includes('uncrc') || 
                         locLower.includes('box 4');
          } else if (subLower.includes('medical policy') || subLower.includes('aap')) {
            matchesSub = docSubLower.includes('medical policy') || 
                         sourceLower.includes('medical policy') || 
                         seriesLower.includes('american academy of pediatrics') || 
                         seriesLower.includes('aap') || 
                         titleLower.includes('medical policy') || 
                         titleLower.includes('aap critique') || 
                         locLower.includes('box 7');
          } else if (subLower.includes('clipping') || subLower.includes('msu') || subLower.includes('changing men')) {
            matchesSub = docSubLower.includes('clipping') || 
                         sourceLower.includes('clipping') || 
                         sourceLower.includes('msu') || 
                         titleLower.includes('clipping') || 
                         titleLower.includes('changing men') || 
                         locLower.includes('box 9');
          }
        }

        if (!matchesSub) return false;
      }
      if (selectedCategory) {
        const catLower = selectedCategory.toLowerCase();
        const docCat = (doc.category || meta.category || '').toLowerCase();
        if (docCat !== catLower && !docCat.includes(catLower) && !catLower.includes(docCat)) {
          return false;
        }
      }
      if (selectedFormat) {
        const fmts = selectedFormat.split(',');
        if (!fmts.includes(doc.type)) return false;
      }
      if (selectedPublication && meta.source_publication !== selectedPublication) return false;
      if (selectedYear) {
        const y = getYear(doc);
        if (!y || !y.includes(selectedYear)) return false;
      }
      if (tagFilter) {
        const tf = tagFilter.toLowerCase();
        const allTags = [
          ...(meta.tags || []),
          ...(meta.keywords || []),
          ...(meta.gemini_extracted_metadata?.keywords || [])
        ].map(t => typeof t === 'string' ? t.toLowerCase() : '');
        
        const hasMatch = allTags.some(t => t.includes(tf)) ||
          (doc.title && doc.title.toLowerCase().includes(tf)) ||
          (doc.subject && doc.subject.toLowerCase().includes(tf)) ||
          (doc.category && doc.category.toLowerCase().includes(tf)) ||
          (meta.author && String(meta.author).toLowerCase().includes(tf));
        
        if (!hasMatch) return false;
      }
      return true;
    });
  }, [documents, showUnscanned, viewMode, searchQuery, semanticResults, selectedSubject, selectedCategory, selectedFormat, selectedPublication, selectedYear, tagFilter, getDefaultList]);

  const sortedDocs = useMemo(() => {
    return [...filteredDocs].sort((a, b) => {
      let valA, valB;
      if (sortConfig.key === 'title') { 
        valA = a.title.toLowerCase(); 
        valB = b.title.toLowerCase(); 
      } else if (sortConfig.key === 'subject') { 
        valA = (a.subject || '').toLowerCase(); 
        valB = (b.subject || '').toLowerCase(); 
      } else if (sortConfig.key === 'type') { 
        valA = a.type || ''; 
        valB = b.type || ''; 
      } else if (sortConfig.key === 'date') {
        const metaA = safeParseJson(a.metadata_json);
        const metaB = safeParseJson(b.metadata_json);
        valA = metaA.date || '';
        valB = metaB.date || '';
      }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredDocs, sortConfig]);

  const totalPages = Math.ceil(sortedDocs.length / itemsPerPage);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedDocs = useMemo(() => {
    const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
    return sortedDocs.slice((validPage - 1) * itemsPerPage, validPage * itemsPerPage);
  }, [sortedDocs, currentPage, itemsPerPage, totalPages]);

  // Actions
  const handleToggleReadingList = (doc) => {
    let list = getDefaultList();
    if (!list) list = createList('My Research Queue');
    if (list.items.includes(doc.id)) {
      removeFromList(list.id, doc.id);
    } else {
      addToList(list.id, doc.id);
    }
  };

  const inReadingList = (doc) => {
    const list = getDefaultList();
    return list ? list.items.includes(doc.id) : false;
  };

  const handleAskAssistant = (doc) => {
    const meta = safeParseJson(doc.metadata_json);
    const title = getCleanTitle(doc, meta);
    const content = meta.abstract || meta.description || "No abstract available.";
    addToReport(`Reviewing ${title}:\n"${content}"\n\nQuery: `);
    navigate('/assistant');
  };

  const handleAddToReportDoc = (doc) => {
    const meta = safeParseJson(doc.metadata_json);
    const title = getCleanTitle(doc, meta);
    addToReport(`Reference: ${title}`, [doc.url || "Archive Copy"]);
  };

  const toggleRow = (e, id) => {
    e.stopPropagation();
    const newSet = new Set(selectedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRows(newSet);
  };

  const toggleAll = () => {
    if (selectedRows.size === sortedDocs.length && sortedDocs.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedDocs.map(d => d.id)));
    }
  };

  const handleBatchAddToReport = () => {
    const docs = documents.filter(d => selectedRows.has(d.id));
    const citations = docs.map(d => getCleanTitle(d, safeParseJson(d.metadata_json)));
    addToReport("Added references from Digital Library:", citations);
    setSelectedRows(new Set());
    navigate('/assistant');
  };

  const handleCopyCitation = (doc) => {
    const meta = safeParseJson(doc.metadata_json);
    const title = getCleanTitle(doc, meta);
    const author = meta.author || 'Unknown';
    const date = meta.date || 'n.d.';
    const text = `${author}. (${date}). ${title}. UMass Amherst Special Collections (MS 1205).`;
    navigator.clipboard.writeText(text);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const hasActiveFilters = Boolean(
    searchQuery || 
    selectedSubject || 
    selectedCategory || 
    selectedFormat || 
    selectedPublication || 
    selectedYear || 
    tagFilter
  );

  return (
    <div className="library-root">
      
      {/* Hero Masthead & Omni-Search Command */}
      <div className="library-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Confined Hero Underloom */}
        <div className="library-underloom" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.16 }}>
          <LoomChoreography isInline={true} forceFormation="quiet" opacity={1} themeColor="library" />
        </div>

        <div className="library-hero-badge" style={{ position: 'relative', zIndex: 1 }}>
          <Archive size={14} />
          <span>The Great Archive • UMass MS 1205 & MSU Collections</span>
        </div>

        <h1 className="library-hero-title">The Digital Stacks</h1>
        
        <p className="library-hero-subtitle">
          The living primary source repository of the genital autonomy movement. Browse over 195,000 cataloged records, seminal clinical research, Victorian medical treatises, and federal civil rights filings.
        </p>

        {/* Telemetry Strip */}
        <div className="library-telemetry-strip">
          <div className="library-stat-pill">
            <span className="library-stat-dot" />
            <span><strong>195,120+</strong> Cataloged Records</span>
          </div>
          <div className="library-stat-pill">
            <span className="library-stat-dot" />
            <span><strong>{documents.length > 0 ? documents.length.toLocaleString() : '4,700+'}</strong> Digitized Documents</span>
          </div>
          <div className="library-stat-pill">
            <span className="library-stat-dot" />
            <span><strong>150 Years</strong> (1870–Present)</span>
          </div>
          <div className="library-stat-pill">
            <span className="library-stat-dot" />
            <span><strong>UMass MS 1205</strong> Special Collections</span>
          </div>
        </div>

        {/* Featured Landmark Archive: Tim Hammond Archive Spotlight */}
        <div className="library-featured-banner">
          <div className="library-featured-eyebrow">
            <Archive size={14} />
            <span>Featured Landmark Archive • UMass Amherst MS 1205</span>
          </div>
          <h2 className="library-featured-title">The Tim Hammond Genital Autonomy Archive</h2>
          <p className="library-featured-desc">
            The defining primary-source repository of the movement. Spanning 53 linear feet and over 195,000 cataloged records, this collection preserves the founding papers of NOHARMM and NOCIRC, historical legal filings, and the groundbreaking 1999 AWAKENINGS empirical survey that inaugurated modern intactivism.
          </p>
          <div className="library-featured-actions">
            <Link to="/collections/tim-hammond-archive" className="library-featured-btn-primary">
              <Archive size={16} /> Explore Tim Hammond Archive (MS 1205) <ArrowRight size={15} />
            </Link>
            <Link to="/to/tim-hammond" className="library-featured-btn-secondary">
              Tim Hammond's Profile & Legacy
            </Link>
            <Link to="/collections" className="library-featured-btn-secondary">
              All Special Collections
            </Link>
          </div>
        </div>

        {/* Omni-Search Box */}
        <div className="library-search-box">
          <div className="library-search-input-wrapper">
            <Search size={22} className="library-search-icon-left" />
            <input 
              ref={searchInputRef}
              type="text"
              className="library-search-input"
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by keyword, author, legal case, or ask AI... (Press '/' to focus)"
            />
            <div className="library-search-icon-right">
              {searchQuery && (
                <button 
                  className="library-clear-search-btn"
                  onClick={() => handleQueryChange('')}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
              {isSearchingSemantic ? (
                <Sparkles size={18} color="#facc15" style={{ animation: 'spin 2s linear infinite' }} />
              ) : (
                <Sparkles 
                  size={18} 
                  color={semanticResults ? "#facc15" : "#64748b"} 
                  title={semanticResults ? "AI Concept Search Active" : "AI Semantic Search Enabled"} 
                />
              )}
            </div>
          </div>

          {/* Quick Exploratory Prompt Chips */}
          <div className="library-quick-prompts">
            <span className="library-quick-label">Key Topics:</span>
            <button className="library-quick-chip" onClick={() => handlePresetSearch("AAP 2012 Policy Critique")}>
              AAP 2012 Critique
            </button>
            <button className="library-quick-chip" onClick={() => handlePresetSearch("Lewis Sayre 1870 Reflex Neurosis")}>
              Victorian Reflex Neurosis
            </button>
            <button className="library-quick-chip" onClick={() => handlePresetSearch("Sorrells Tactile Sensitivity")}>
              Foreskin Sensation
            </button>
            <button className="library-quick-chip" onClick={() => handlePresetSearch("Huff v Colorado Medicaid")}>
              Huff v. Colorado
            </button>
            <button className="library-quick-chip" onClick={() => handlePresetSearch("AWAKENINGS survey")}>
              AWAKENINGS Survey
            </button>
            <button className="library-quick-chip" onClick={() => handlePresetSearch("KNMG Royal Dutch")}>
              KNMG Policy
            </button>
          </div>
        </div>
      </div>

      {/* View Switcher & Filter Control Bar */}
      <div className="library-view-control-bar">
        {/* View Mode Segmented Tabs */}
        <div className="library-view-tabs">
          <button 
            className={`library-view-tab ${viewMode === 'stacks' ? 'active' : ''}`}
            onClick={() => setViewMode('stacks')}
          >
            <Layers size={15} />
            <span>Curated Stacks</span>
          </button>

          <button 
            className={`library-view-tab ${viewMode === 'gallery' ? 'active' : ''}`}
            onClick={() => setViewMode('gallery')}
          >
            <Grid size={15} />
            <span>Visual Gallery ({filteredDocs.length.toLocaleString()})</span>
          </button>

          <button 
            className={`library-view-tab ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <List size={15} />
            <span>Master Index</span>
          </button>

          <button 
            className={`library-view-tab ${viewMode === 'reading-list' ? 'active' : ''}`}
            onClick={() => setViewMode('reading-list')}
          >
            <Bookmark size={15} />
            <span>Research Queue ({getDefaultList()?.items.length || 0})</span>
          </button>
        </div>

        {/* Facet Filters & Actions */}
        <div className="library-filter-actions">
          {hasActiveFilters && (
            <button 
              onClick={clearAllFilters}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <X size={13} /> Clear Filters
            </button>
          )}

          {/* Category Filter */}
          <select 
            className="library-filter-select"
            value={selectedCategory}
            onChange={(e) => { 
              const val = e.target.value;
              setSelectedCategory(val);
              const newParams = new URLSearchParams(searchParams);
              if (val) newParams.set('category', val);
              else newParams.delete('category');
              setSearchParams(newParams);
              if (viewMode === 'stacks') setViewMode('gallery');
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Subject Filter */}
          <select 
            className="library-filter-select"
            value={
              subjects.includes(selectedSubject)
                ? selectedSubject
                : (subjects.find(s => s.toLowerCase().includes(selectedSubject.toLowerCase()) || selectedSubject.toLowerCase().includes(s.toLowerCase())) || selectedSubject)
            }
            onChange={(e) => { 
              const val = e.target.value;
              setSelectedSubject(val);
              const newParams = new URLSearchParams(searchParams);
              if (val) newParams.set('subject', val);
              else newParams.delete('subject');
              setSearchParams(newParams);
              if (viewMode === 'stacks') setViewMode('gallery');
              setCurrentPage(1);
            }}
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Format Filter */}
          <select 
            className="library-filter-select"
            value={selectedFormat}
            onChange={(e) => { 
              setSelectedFormat(e.target.value); 
              if(viewMode === 'stacks') setViewMode('gallery'); 
              setCurrentPage(1);
            }}
          >
            <option value="">All Formats</option>
            {formats.map(f => <option key={f} value={f}>{f.replace('_', ' ').toUpperCase()}</option>)}
          </select>

          {/* Year Filter */}
          <select 
            className="library-filter-select"
            value={selectedYear}
            onChange={(e) => { 
              setSelectedYear(e.target.value); 
              if(viewMode === 'stacks') setViewMode('gallery'); 
              setCurrentPage(1);
            }}
          >
            <option value="">All Eras</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Unscanned Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#94a3b8', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showUnscanned}
              onChange={(e) => setShowUnscanned(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: '#facc15' }}
            />
            <span>Include Physical Records</span>
          </label>
        </div>
      </div>

      {/* Main Content Layout with Reading Room Inspector Drawer */}
      <div className="library-main-layout">
        
        {/* Primary Content View */}
        <div className="library-content-scroll">
          <div className="library-container-max">
            
            {loading ? (
              <div style={{ padding: '6rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ThinkingSpirograph text="Retrieving digital catalog records..." />
              </div>
            ) : viewMode === 'stacks' && !hasActiveFilters ? (
              /* =========================================================
                 1. CURATED STACKS VIEW (Editorial Museum Entrance)
                 ========================================================= */
              <div className="lux-glide-in">
                
                {/* A. Featured Provenance: The Tim Hammond Archive UMass MS 1205 */}
                <div className="library-featured-collection">
                  <div className="library-featured-header">
                    <div>
                      <div className="library-featured-badge">
                        <Archive size={13} />
                        Featured Archive Collection
                      </div>
                      <h2 className="library-featured-title">The Tim Hammond Genital Autonomy Archive</h2>
                      <p className="library-featured-desc">
                        Housed within Special Collections and University Archives (SCUA) at the University of Massachusetts Amherst (UMass MS 1205). The world’s defining physical and digital repository documenting fifty years of medical opposition, legal challenges, and international human rights advocacy.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <Link 
                        to="/collections/tim-hammond-archive"
                        className="lux-hover-lift"
                        style={{
                          background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
                          color: '#000',
                          padding: '0.75rem 1.25rem',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '0.9rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          boxShadow: '0 4px 18px rgba(250, 204, 21, 0.3)'
                        }}
                      >
                        <Archive size={16} />
                        Explore Collection (157 Items)
                        <ArrowRight size={15} />
                      </Link>

                      <Link 
                        to="/to/tim-hammond"
                        className="lux-hover-lift"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          padding: '0.75rem 1.25rem',
                          borderRadius: '10px',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem'
                        }}
                      >
                        Tim Hammond Dossier
                      </Link>
                    </div>
                  </div>

                  {/* Series & Box Fast Access */}
                  <div className="library-box-grid">
                    <div 
                      className="library-box-card"
                      onClick={() => {
                        setSelectedSubject('AWAKENINGS & Survey Microdata');
                        setSearchQuery('');
                        setSelectedCategory('');
                        setSelectedFormat('');
                        setSelectedYear('');
                        setViewMode('gallery');
                        setCurrentPage(1);
                        const newParams = new URLSearchParams();
                        newParams.set('subject', 'AWAKENINGS & Survey Microdata');
                        setSearchParams(newParams);
                      }}
                    >
                      <div>
                        <div className="library-box-tag">Series 1 • Box 1</div>
                        <h4 className="library-box-card-title">AWAKENINGS & Survey Microdata</h4>
                        <p className="library-box-card-desc">Original questionnaires, statistical breakdowns, and personal testimonials from the 1999 landmark inquiry.</p>
                      </div>
                    </div>

                    <div 
                      className="library-box-card"
                      onClick={() => {
                        setSelectedSubject('Human Rights & International Law');
                        setSearchQuery('');
                        setSelectedCategory('');
                        setSelectedFormat('');
                        setSelectedYear('');
                        setViewMode('gallery');
                        setCurrentPage(1);
                        const newParams = new URLSearchParams();
                        newParams.set('subject', 'Human Rights & International Law');
                        setSearchParams(newParams);
                      }}
                    >
                      <div>
                        <div className="library-box-tag">Series 2 • Box 4</div>
                        <h4 className="library-box-card-title">International Law & UN CRC</h4>
                        <p className="library-box-card-desc">INGOCGA petitions, United Nations Committee on the Rights of the Child submissions, and European treaty briefs.</p>
                      </div>
                    </div>

                    <div 
                      className="library-box-card"
                      onClick={() => {
                        setSelectedSubject('Medical Policy & Ethics');
                        setSearchQuery('');
                        setSelectedCategory('');
                        setSelectedFormat('');
                        setSelectedYear('');
                        setViewMode('gallery');
                        setCurrentPage(1);
                        const newParams = new URLSearchParams();
                        newParams.set('subject', 'Medical Policy & Ethics');
                        setSearchParams(newParams);
                      }}
                    >
                      <div>
                        <div className="library-box-tag">Series 3 • Box 7</div>
                        <h4 className="library-box-card-title">Medical Policy & AAP Critiques</h4>
                        <p className="library-box-card-desc">Fifty-year timeline of American Academy of Pediatrics position statements and counter-analyses by pediatric authorities.</p>
                      </div>
                    </div>

                    <div 
                      className="library-box-card"
                      onClick={() => {
                        setSelectedSubject('Clippings');
                        setSearchQuery('');
                        setSelectedCategory('');
                        setSelectedFormat('');
                        setSelectedYear('');
                        setViewMode('gallery');
                        setCurrentPage(1);
                        const newParams = new URLSearchParams();
                        newParams.set('subject', 'Clippings');
                        setSearchParams(newParams);
                      }}
                    >
                      <div>
                        <div className="library-box-tag">Series 4 • Box 9</div>
                        <h4 className="library-box-card-title">Changing Men & MSU Clippings</h4>
                        <p className="library-box-card-desc">Early gender studies clippings, Michigan State University archival records, and grassroots newsletters (1975–1995).</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* B. Curated Seminal Treasures Shelf */}
                <div style={{ marginBottom: '3.5rem' }}>
                  <div className="library-shelf-header">
                    <div className="library-shelf-title-group">
                      <h3>Curated Archival Treasures</h3>
                      <p>Hand-picked seminal manuscripts, whistleblowing disclosures, and landmark filings from the collection.</p>
                    </div>
                    <button 
                      onClick={() => setViewMode('gallery')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#facc15',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      View All Documents &rarr;
                    </button>
                  </div>

                  <div className="library-shelf-carousel">
                    {CURATED_TREASURES.map((item) => (
                      <div 
                        key={item.id}
                        className="library-treasure-card"
                        onClick={() => {
                          const realDoc = documents.find(d => 
                            d.title && d.title.toLowerCase().includes(item.title.toLowerCase().slice(0, 20))
                          );
                          setSelectedDoc(realDoc || {
                            id: item.id,
                            title: item.title,
                            type: item.type,
                            source_collection: item.collection,
                            metadata_json: JSON.stringify({
                              author: item.author,
                              date: item.date,
                              description: item.excerpt,
                              category: item.category
                            })
                          });
                        }}
                      >
                        <div className="library-treasure-top">
                          <span className="library-treasure-badge">{item.formatLabel}</span>
                          <span className="library-treasure-year">{item.date}</span>
                        </div>

                        <div className="library-treasure-body">
                          <div>
                            <h4 className="library-treasure-title">{item.title}</h4>
                            <div className="library-treasure-author">By <EntityLink entityName={item.author} /></div>
                            <p className="library-treasure-excerpt">{item.excerpt}</p>
                          </div>

                          <div className="library-treasure-footer">
                            <span>Inspect Archival Record</span>
                            <ArrowRight size={13} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* C. The 6 Thematic Pillars (Visual Stacks) */}
                <div style={{ marginBottom: '3.5rem' }}>
                  <div className="library-shelf-header">
                    <div className="library-shelf-title-group">
                      <h3>The 6 Thematic Pillars</h3>
                      <p>Explore the comprehensive evidence corpus organized by disciplinary domain.</p>
                    </div>
                  </div>

                  <div className="library-pillars-grid">
                    {THEMATIC_PILLARS.map((pillar) => (
                      <div 
                        key={pillar.id}
                        className="library-pillar-card"
                        onClick={() => {
                          handlePresetSearch(pillar.searchPreset);
                        }}
                      >
                        <div>
                          <div className="library-pillar-header">
                            <div className="library-pillar-icon-box">
                              {pillar.icon}
                            </div>
                            <span className="library-pillar-count">Explore Stack &rarr;</span>
                          </div>

                          <h4 className="library-pillar-title">{pillar.title}</h4>
                          <p className="library-pillar-desc">{pillar.desc}</p>

                          <div className="library-pillar-tags">
                            {pillar.tags.map((t, idx) => (
                              <span key={idx} className="library-pillar-tag-chip">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="library-pillar-action">
                          <span>Search Subject Pillar</span>
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* D. Format Explorer */}
                <div>
                  <div className="library-shelf-header">
                    <div className="library-shelf-title-group">
                      <h3>Format Vault</h3>
                      <p>Quickly isolate specific media types across the archives.</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[
                      { label: 'Academic & Medical Journals', format: 'medical_journal,academic_journal', icon: <BookOpen size={20} color="#38bdf8" /> },
                      { label: 'Legal Filings & Statutes', format: 'legal_document,policy_guideline', icon: <Scale size={20} color="#10b981" /> },
                      { label: 'Newsletters & Bulletins', format: 'newspaper_clipping,recap', icon: <Newspaper size={20} color="#fb923c" /> },
                      { label: 'Video & Documentary', format: 'multimedia,video', icon: <Video size={20} color="#f43f5e" /> },
                      { label: 'Audio & Oral History', format: 'audio', icon: <Headphones size={20} color="#a855f7" /> },
                      { label: 'Letters & Manuscripts', format: 'letter,physical_document', icon: <FileText size={20} color="#facc15" /> },
                    ].map((fmt, idx) => (
                      <div 
                        key={idx}
                        className="lux-hover-lift"
                        onClick={() => {
                          setSelectedFormat(fmt.format);
                          setSearchQuery('');
                          setSelectedSubject('');
                          setSelectedCategory('');
                          setSelectedYear('');
                          setViewMode('gallery');
                          setCurrentPage(1);
                          const newParams = new URLSearchParams();
                          newParams.set('format', fmt.format);
                          setSearchParams(newParams);
                        }}
                        style={{
                          background: 'rgba(18, 22, 38, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          padding: '1.25rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem'
                        }}
                      >
                        <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}>
                          {fmt.icon}
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#e2e8f0' }}>{fmt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : viewMode === 'gallery' ? (
              /* =========================================================
                 2. VISUAL GALLERY VIEW (Rich Document Cards)
                 ========================================================= */
              <div className="lux-glide-in">
                {/* Active Filter Chips Bar */}
                {hasActiveFilters && (
                  <div className="library-active-chips-bar" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Filters:</span>
                    {selectedCategory && (
                      <span className="library-active-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.35)', color: '#38bdf8', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        <Folder size={12} />
                        <span>Category: {selectedCategory}</span>
                        <button 
                          onClick={handleRemoveCategory}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Remove category filter"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {tagFilter && (
                      <span className="library-active-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(250, 204, 21, 0.15)', border: '1px solid rgba(250, 204, 21, 0.35)', color: '#facc15', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        <Tag size={12} />
                        <span>Tag: #{tagFilter}</span>
                        <button 
                          onClick={() => {
                            const newParams = new URLSearchParams(searchParams);
                            newParams.delete('tag');
                            setSearchParams(newParams);
                          }}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Remove tag filter"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="library-active-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#e2e8f0', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        <Search size={12} />
                        <span>Query: "{searchQuery}"</span>
                        <button 
                          onClick={() => handleQueryChange('')}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Clear search query"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {selectedSubject && (
                      <span className="library-active-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.35)', color: '#c084fc', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        <span>Subject: {selectedSubject}</span>
                        <button 
                          onClick={() => {
                            setSelectedSubject('');
                            const newParams = new URLSearchParams(searchParams);
                            newParams.delete('subject');
                            setSearchParams(newParams);
                          }}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {selectedFormat && (
                      <span className="library-active-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        <span>Format: {selectedFormat.replace('_', ' ').toUpperCase()}</span>
                        <button 
                          onClick={() => {
                            setSelectedFormat('');
                            const newParams = new URLSearchParams(searchParams);
                            newParams.delete('format');
                            setSearchParams(newParams);
                          }}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {selectedYear && (
                      <span className="library-active-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(251, 146, 60, 0.15)', border: '1px solid rgba(251, 146, 60, 0.35)', color: '#fb923c', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        <Calendar size={12} />
                        <span>Era: {selectedYear}</span>
                        <button 
                          onClick={() => {
                            setSelectedYear('');
                            const newParams = new URLSearchParams(searchParams);
                            newParams.delete('year');
                            setSearchParams(newParams);
                          }}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    <button 
                      onClick={clearAllFilters}
                      style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', padding: '0.2rem 0.4rem', marginLeft: 'auto' }}
                    >
                      Clear all
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                    Showing <strong>{sortedDocs.length.toLocaleString()}</strong> records {hasActiveFilters && <span>(Filtered)</span>}
                  </div>
                  {sortedDocs.length > itemsPerPage && (
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Page {currentPage} of {totalPages}
                    </div>
                  )}
                </div>

                {paginatedDocs.length === 0 ? (
                  <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
                    <Archive size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>No records found</h3>
                    <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>No documents matched your search criteria. Try broadening your keywords or clearing the active filters.</p>
                    <button 
                      onClick={clearAllFilters}
                      style={{ background: '#facc15', color: '#000', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="library-gallery-grid">
                    {paginatedDocs.map((doc) => {
                      const meta = safeParseJson(doc.metadata_json);
                      const isSelected = selectedDoc?.id === doc.id;
                      const title = getCleanTitle(doc, meta);
                      const isSaved = inReadingList(doc);
                      
                      return (
                        <div 
                          key={doc.id}
                          className={`library-doc-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedDoc(doc)}
                        >
                          <div className="library-doc-card-inner">
                            <div className="library-doc-header">
                              <span 
                                className="library-doc-type-badge"
                                style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#93c5fd' }}
                              >
                                {getDocumentIcon(doc.type, 14)}
                                <span>{(doc.type || 'document').replace('_', ' ')}</span>
                              </span>

                              <span className="library-doc-date">
                                {meta.date || getYear(doc)}
                              </span>
                            </div>

                            <h4 className="library-doc-title">{title}</h4>

                            {(meta.author || meta.gemini_extracted_metadata?.authors) && (
                              <div className="library-doc-author">
                                By <EntityLink entityName={meta.author || meta.gemini_extracted_metadata?.authors?.[0]} />
                              </div>
                            )}

                            <p className="library-doc-abstract">
                              {meta.description || meta.abstract || "Primary source document cataloged in the genital autonomy archives."}
                            </p>

                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#94a3b8' }}>
                                {doc.subject || 'Archive'}
                              </span>
                              {(doc.category || meta.category) && (
                                <span 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const cat = doc.category || meta.category;
                                    setSelectedCategory(cat);
                                    const newParams = new URLSearchParams(searchParams);
                                    newParams.set('category', cat);
                                    setSearchParams(newParams);
                                    setViewMode('gallery');
                                    setCurrentPage(1);
                                  }}
                                  style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#38bdf8', cursor: 'pointer' }}
                                  title="Filter by this Category"
                                >
                                  {doc.category || meta.category}
                                </span>
                              )}
                              {meta.source_publication && (
                                <span style={{ fontSize: '0.72rem', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#fde047' }}>
                                  {meta.source_publication}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="library-doc-footer">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }}
                              style={{ background: 'transparent', border: 'none', color: '#facc15', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <span>Quick Preview</span>
                              <ArrowRight size={13} />
                            </button>

                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleToggleReadingList(doc); }}
                                title={isSaved ? "Remove from Reading List" : "Save to Reading List"}
                                style={{ background: isSaved ? 'rgba(250,204,21,0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: isSaved ? '#facc15' : '#cbd5e1', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}
                              >
                                <Bookmark size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* =========================================================
                 3. MASTER INDEX / DATA GRID (High-Density Table)
                 ========================================================= */
              <div className="lux-glide-in">
                {/* Active Filter Chips Bar */}
                {hasActiveFilters && (
                  <div className="library-active-chips-bar" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Filters:</span>
                    {selectedCategory && (
                      <span className="library-active-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.35)', color: '#38bdf8', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        <Folder size={12} />
                        <span>Category: {selectedCategory}</span>
                        <button 
                          onClick={handleRemoveCategory}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Remove category filter"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {tagFilter && (
                      <span className="library-active-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(250, 204, 21, 0.15)', border: '1px solid rgba(250, 204, 21, 0.35)', color: '#facc15', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        <Tag size={12} />
                        <span>Tag: #{tagFilter}</span>
                        <button 
                          onClick={() => {
                            const newParams = new URLSearchParams(searchParams);
                            newParams.delete('tag');
                            setSearchParams(newParams);
                          }}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Remove tag filter"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="library-active-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#e2e8f0', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        <Search size={12} />
                        <span>Query: "{searchQuery}"</span>
                        <button 
                          onClick={() => handleQueryChange('')}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Clear search query"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {selectedSubject && (
                      <span className="library-active-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.35)', color: '#c084fc', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        <span>Subject: {selectedSubject}</span>
                        <button 
                          onClick={() => {
                            setSelectedSubject('');
                            const newParams = new URLSearchParams(searchParams);
                            newParams.delete('subject');
                            setSearchParams(newParams);
                          }}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {selectedFormat && (
                      <span className="library-active-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        <span>Format: {selectedFormat.replace('_', ' ').toUpperCase()}</span>
                        <button 
                          onClick={() => {
                            setSelectedFormat('');
                            const newParams = new URLSearchParams(searchParams);
                            newParams.delete('format');
                            setSearchParams(newParams);
                          }}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {selectedYear && (
                      <span className="library-active-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(251, 146, 60, 0.15)', border: '1px solid rgba(251, 146, 60, 0.35)', color: '#fb923c', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        <Calendar size={12} />
                        <span>Era: {selectedYear}</span>
                        <button 
                          onClick={() => {
                            setSelectedYear('');
                            const newParams = new URLSearchParams(searchParams);
                            newParams.delete('year');
                            setSearchParams(newParams);
                          }}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    <button 
                      onClick={clearAllFilters}
                      style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', padding: '0.2rem 0.4rem', marginLeft: 'auto' }}
                    >
                      Clear all
                    </button>
                  </div>
                )}

                <div style={{ background: 'rgba(18, 22, 38, 0.75)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead style={{ background: 'rgba(12, 14, 24, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', position: 'sticky', top: 0, zIndex: 5 }}>
                    <tr>
                      <th style={{ padding: '1rem', width: '40px' }}>
                        <div onClick={toggleAll} style={{ cursor: 'pointer' }}>
                          {selectedRows.size > 0 && selectedRows.size === sortedDocs.length ? (
                            <CheckSquare size={18} color="#facc15" />
                          ) : (
                            <div style={{ width: 16, height: 16, border: '2px solid #64748b', borderRadius: 3 }} />
                          )}
                        </div>
                      </th>
                      <th 
                        style={{ padding: '1rem', cursor: 'pointer', color: sortConfig.key === 'title' ? '#facc15' : '#e2e8f0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.75rem' }}
                        onClick={() => setSortConfig({ key: 'title', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                      >
                        Document Title {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.75rem' }}>Author / Creator</th>
                      <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.75rem' }}>Collection / Subject</th>
                      <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.75rem' }}>Category</th>
                      <th 
                        style={{ padding: '1rem', cursor: 'pointer', color: sortConfig.key === 'date' ? '#facc15' : '#e2e8f0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.75rem' }}
                        onClick={() => setSortConfig({ key: 'date', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                      >
                        Year {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.75rem' }}>Format</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDocs.map((doc) => {
                      const meta = safeParseJson(doc.metadata_json);
                      const isSelected = selectedDoc?.id === doc.id;
                      const isChecked = selectedRows.has(doc.id);
                      const title = getCleanTitle(doc, meta);

                      return (
                        <tr 
                          key={doc.id}
                          onClick={() => setSelectedDoc(doc)}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            background: isSelected ? 'rgba(250, 204, 21, 0.08)' : isChecked ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={(e) => { if (!isSelected && !isChecked) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                          onMouseLeave={(e) => { if (!isSelected && !isChecked) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <td style={{ padding: '1rem' }} onClick={(e) => toggleRow(e, doc.id)}>
                            {isChecked ? (
                              <CheckSquare size={18} color="#3b82f6" />
                            ) : (
                              <div style={{ width: 16, height: 16, border: '2px solid #64748b', borderRadius: 3 }} />
                            )}
                          </td>
                          <td style={{ padding: '1rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#fff' : '#f1f5f9', maxWidth: '320px' }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {title}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                            {(meta.author || meta.gemini_extracted_metadata?.authors?.[0]) ? (
                              <EntityLink entityName={meta.author || meta.gemini_extracted_metadata?.authors?.[0]} />
                            ) : (
                              <span style={{ color: '#64748b' }}>--</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', color: '#94a3b8' }}>
                            <span style={{ color: '#facc15', fontWeight: '500' }}>{doc.subject || 'General'}</span>
                          </td>
                          <td style={{ padding: '1rem', color: '#38bdf8', fontSize: '0.8rem' }}>
                            {doc.category || meta.category || '—'}
                          </td>
                          <td style={{ padding: '1rem', fontFamily: 'var(--f-mono, monospace)', color: '#cbd5e1' }}>
                            {meta.date || getYear(doc)}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: '#cbd5e1' }}>
                              {getDocumentIcon(doc.type, 13)}
                              <span>{(doc.type || 'doc').replace('_', ' ')}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {viewMode !== 'stacks' && totalPages > 1 && (
              <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem', background: 'rgba(18, 22, 38, 0.75)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedDocs.length)} of {sortedDocs.length} items
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: currentPage === 1 ? '#64748b' : '#fff',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Prev
                  </button>

                  <span style={{ fontSize: '0.88rem', color: '#f1f5f9', padding: '0 0.5rem' }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: currentPage === totalPages ? '#64748b' : '#fff',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Reading Room / Document Inspection Side Drawer */}
        {selectedDoc && (
          <div className="library-inspector-drawer">
            <div className="library-inspector-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ padding: '0.2rem 0.55rem', borderRadius: '4px', background: 'rgba(250, 204, 21, 0.15)', color: '#facc15', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Archival Record
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {selectedDoc.source_collection || "UMass MS 1205"}
                </span>
              </div>

              <button 
                className="library-inspector-close-btn"
                onClick={() => setSelectedDoc(null)}
                title="Close reading drawer (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            <div className="library-inspector-body">
              {(() => {
                const meta = safeParseJson(selectedDoc.metadata_json);
                const title = getCleanTitle(selectedDoc, meta);
                const isSaved = inReadingList(selectedDoc);

                return (
                  <>
                    <div>
                      <h2 style={{ fontFamily: 'var(--f-display, "Playfair Display", serif)', fontSize: '1.4rem', color: '#ffffff', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                        {title}
                      </h2>

                      {(meta.author || meta.gemini_extracted_metadata?.authors) && (
                        <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                          By <EntityLink entityName={meta.author || meta.gemini_extracted_metadata?.authors?.[0]} />
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', background: 'rgba(255, 255, 255, 0.08)', padding: '0.25rem 0.6rem', borderRadius: '6px', color: '#cbd5e1' }}>
                          {meta.date || getYear(selectedDoc)}
                        </span>
                        <span style={{ fontSize: '0.78rem', background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                          {(selectedDoc.type || 'document').replace('_', ' ').toUpperCase()}
                        </span>
                        {meta.source_publication && (
                          <span style={{ fontSize: '0.78rem', background: 'rgba(250, 204, 21, 0.1)', color: '#fde047', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                            {meta.source_publication}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* PDF Thumbnail or Visual Cover */}
                    {selectedDoc.url && selectedDoc.url.toLowerCase().endsWith('.pdf') ? (
                      <div style={{ width: '100%', height: '240px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                        <PDFThumbnail url={selectedDoc.url} />
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: '120px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.04)', border: '1px dashed rgba(255, 255, 255, 0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', gap: '0.5rem' }}>
                        {getDocumentIcon(selectedDoc.type, 32)}
                        <span style={{ fontSize: '0.8rem' }}>Physical or Scanned Manuscript</span>
                      </div>
                    )}

                    {/* Abstract / Text with AutoEntityLinker */}
                    <div>
                      <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#facc15', margin: '0 0 0.5rem 0' }}>
                        Historical Abstract & Summary
                      </h4>
                      <div style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6, maxHeight: '240px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        <AutoEntityLinker 
                          text={meta.description || meta.abstract || "Detailed primary source document housed in the collection archives."}
                          entities={[...(meta.key_people || []), ...(meta.organizations || [])]}
                        />
                      </div>
                    </div>

                    {/* Citation Box */}
                    <div style={{ background: 'rgba(10, 12, 20, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                          Academic Citation
                        </span>
                        <button 
                          onClick={() => handleCopyCitation(selectedDoc)}
                          style={{ background: 'transparent', border: 'none', color: copiedCitation ? '#10b981' : '#facc15', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          {copiedCitation ? <Check size={12} /> : <Copy size={12} />}
                          {copiedCitation ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.4 }}>
                        {meta.author || 'Unknown'}. ({meta.date || 'n.d.'}). {title}. UMass Amherst Special Collections (MS 1205).
                      </p>
                    </div>

                    {/* Action Toolbelt */}
                    <div className="library-inspector-actions">
                      <button 
                        onClick={() => navigate(`/library/${generateFriendlySlug(selectedDoc, meta)}`)}
                        className="library-btn-full-record"
                      >
                        <BookOpen size={16} />
                        Retrieve Full Document & Reader
                      </button>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleAskAssistant(selectedDoc)}
                          style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.35)', color: '#93c5fd', padding: '0.65rem 0.4rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Sparkles size={14} />
                          Ask AI
                        </button>

                        <button 
                          onClick={() => handleToggleReadingList(selectedDoc)}
                          style={{ background: isSaved ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: isSaved ? '#facc15' : '#fff', padding: '0.65rem 0.4rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Bookmark size={14} />
                          {isSaved ? 'Saved' : 'Save'}
                        </button>

                        <button 
                          onClick={() => handleAddToReportDoc(selectedDoc)}
                          style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.65rem 0.4rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <FilePlus size={14} />
                          Report
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

      </div>

      {/* Sticky Bottom Multi-Selection Action Bar */}
      {selectedRows.size > 0 && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(16, 20, 36, 0.95)', border: '1px solid rgba(250, 204, 21, 0.4)', borderRadius: '14px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 24px rgba(250, 204, 21, 0.2)', zIndex: 100, padding: '0.85rem 1.75rem',
          display: 'flex', alignItems: 'center', gap: '1.5rem', backdropFilter: 'blur(20px)'
        }}>
          <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.9rem' }}>
            {selectedRows.size} {selectedRows.size === 1 ? 'item' : 'items'} selected
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => setShowListModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#fff', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}
            >
              <PlusSquare size={14} /> Add to Research Queue
            </button>

            <button 
              onClick={handleBatchAddToReport}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
            >
              <FilePlus size={14} /> Add to Report
            </button>

            <button 
              onClick={() => setSelectedRows(new Set())}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Media List / Research Queue Modal */}
      {showListModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'rgba(20, 24, 40, 0.98)', border: '1px solid rgba(250, 204, 21, 0.3)', padding: '2rem', borderRadius: '16px', width: '420px', maxWidth: '90vw', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#ffffff', fontFamily: 'var(--f-display, "Playfair Display", serif)' }}>
              Add to Research Queue
            </h3>

            {mediaLists.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', fontWeight: '700' }}>
                  Existing Queues
                </div>
                {mediaLists.map(list => (
                  <button 
                    key={list.id} 
                    onClick={() => {
                      addMultipleToList(list.id, Array.from(selectedRows));
                      setShowListModal(false);
                      setSelectedRows(new Set());
                    }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', marginBottom: '0.5rem', cursor: 'pointer' }}
                  >
                    {list.name} <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>({list.items.length} items)</span>
                  </button>
                ))}
              </div>
            )}

            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', fontWeight: '700' }}>
              Create New Queue
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={newListName} 
                onChange={e => setNewListName(e.target.value)} 
                placeholder="e.g. Legal Precedents 2026" 
                style={{ flex: 1, padding: '0.75rem', background: 'rgba(10, 12, 20, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', outline: 'none' }} 
              />
              <button 
                onClick={() => {
                  if (!newListName) return;
                  const list = createList(newListName);
                  addMultipleToList(list.id, Array.from(selectedRows));
                  setNewListName('');
                  setShowListModal(false);
                  setSelectedRows(new Set());
                }}
                style={{ padding: '0.75rem 1.25rem', background: '#facc15', color: '#000', fontWeight: '700', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Create
              </button>
            </div>

            <button 
              onClick={() => setShowListModal(false)}
              style={{ display: 'block', width: '100%', padding: '0.75rem', marginTop: '1.5rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'center' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
