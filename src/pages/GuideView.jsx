import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Printer, FilePlus2, Sparkles, Link2, Check, Eye, EyeOff } from 'lucide-react';
import { queryToParams, paramsToQuery, normalizeParams } from '../../lib/guides/dimensions.js';
import { composeGuide, guideToMarkdown } from '../../lib/guides/compose.js';
import { GuideRenderer } from '../components/guides/GuideFormats';
import { FORMATS } from '../components/guides/formats';
import { useIsCurator } from '../components/guides/useIsCurator';
import { useReport } from '../contexts/ReportContext';
import { useAssistant } from '../contexts/AssistantContext';
import { captureEvent } from '../lib/telemetry';
import './Guides.css';

export default function GuideView({ overrideParams }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isCurator = useIsCurator();
  const includeDrafts = isCurator && searchParams.get('drafts') === '1';
  
  const params = useMemo(() => {
    // If the URL has explicit query params, honor those. 
    // Otherwise, use the injected override (from the human-readable slug).
    if (searchParams.size > 0 || !overrideParams) {
      return queryToParams(searchParams, { includeDrafts });
    }
    return normalizeParams(overrideParams, { includeDrafts });
  }, [searchParams, overrideParams, includeDrafts]);
  
  const guide = useMemo(() => composeGuide(params, { includeDrafts }), [params, includeDrafts]);
  const format = FORMATS.some(f => f.id === searchParams.get('format')) ? searchParams.get('format') : 'report';
  const [showNotes, setShowNotes] = useState(true);
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToReport } = useReport();
  const { openAssistant } = useAssistant();

  useEffect(() => {
    document.title = `${guide.title} · The Accidental Intactivist\u2019s Guide`;
  }, [guide.title]);

  const setFormat = fmt => {
    const next = new URLSearchParams(searchParams);
    next.set('format', fmt);
    setSearchParams(next, { replace: true });
    captureEvent('guide_format_changed', { format: fmt });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
  };

  const sendToReport = () => {
    addToReport(guideToMarkdown(guide), guide.citations?.map(c => c.label) || []);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    captureEvent('guide_sent_to_report', { relationship: params.relationship });
  };

  const askGlenda = () => {
    const who = guide.audience || 'this reader';
    openAssistant(
      `I'm preparing to talk with: ${who}. Using the archive, what are the strongest additional receipts for this guide, and how should I handle their likely objections?`,
      [
        'Find archive testimony that fits this audience',
        'What objections might I be missing?',
        'Suggest a gentle opening line for this person',
      ],
    );
  };

  const builderLink = `/guides#gb-builder`;
  const visibleFormats = guide.mode === 'playbook' ? [] : FORMATS;

  return (
    <div className={`gd-page gv-page gv-format-${format}`}>
      <div className="gv-toolbar no-print" role="toolbar" aria-label="Guide tools">
        <Link to={builderLink} className="gd-btn gd-btn--ghost"><ArrowLeft size={16} /> Series & builder</Link>
        {visibleFormats.length > 0 && (
          <div className="gv-tabs" role="tablist">
            {visibleFormats.map(f => (
              <button key={f.id} type="button" role="tab" id={`fmt-${f.id}`} aria-selected={format === f.id} className={`gv-tab ${format === f.id ? 'is-on' : ''}`} onClick={() => setFormat(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        )}
        <div className="gv-actions">
          {format === 'report' && guide.mode === 'guide' && (
            <button type="button" className="gd-btn gd-btn--ghost" onClick={() => setShowNotes(s => !s)} title="Advocate's notes are never printed">
              {showNotes ? <EyeOff size={16} /> : <Eye size={16} />} Notes
            </button>
          )}
          <button type="button" id="guide-print" className="gd-btn gd-btn--ghost" onClick={() => window.print()}><Printer size={16} /> Print / PDF</button>
          <button type="button" id="guide-copy-link" className="gd-btn gd-btn--ghost" onClick={copyLink}>{copied ? <Check size={16} /> : <Link2 size={16} />} {copied ? 'Copied' : 'Link'}</button>
          <button type="button" id="guide-to-report" className="gd-btn gd-btn--ghost" onClick={sendToReport}>{added ? <Check size={16} /> : <FilePlus2 size={16} />} {added ? 'Added' : 'To Report'}</button>
          <button type="button" id="guide-ask-glenda" className="gd-btn gd-btn--primary" onClick={askGlenda}><Sparkles size={16} /> Ask Glenda</button>
        </div>
      </div>
      {includeDrafts && <div className="gd-draft-banner">DRAFT MODULES INCLUDED: not for distribution until reviewed.</div>}
      <main className="gv-stage gd-print-root">
        <GuideRenderer guide={guide} format={format} showAdvocateNotes={showNotes} />
      </main>
      <p className="gv-foot no-print gd-muted">Share: <code>/guides/view?{paramsToQuery(params, { format })}</code></p>
    </div>
  );
}
