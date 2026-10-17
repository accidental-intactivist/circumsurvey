import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Play, 
  Maximize2, 
  ExternalLink, 
  X, 
  Film, 
  Volume2, 
  ShieldCheck, 
  Video, 
  Clock,
  Sparkles,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { C, FONT } from '../styles/tokens';
import { captureEvent } from '../lib/telemetry';

// Known YouTube video IDs that are 18+ age-restricted or embed-restricted
export const KNOWN_AGE_RESTRICTED_VIDEOS = new Set([
  'v_ht2CRTdbo', // Frankfurt Symposium 2015 (Global Survey of Circumcision Harm)
]);

export const KNOWN_EMBED_BLOCKED_VIDEOS = new Set([
  'Mdh5IYg7A9E', // Post-Conference Interview #2
]);

/**
 * Universal media URL parser for YouTube, Vimeo, and direct archival video/audio.
 */
export function parseMediaUrl(url) {
  if (!url) return null;
  const str = String(url).trim();

  // YouTube detection (youtube.com, youtu.be, shorts, embed)
  const ytMatch = str.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch) {
    const videoId = ytMatch[1];
    let startSeconds = 0;
    const timeMatch = str.match(/[?&]t=(\d+)s?/i);
    if (timeMatch) {
      startSeconds = parseInt(timeMatch[1], 10);
    }
    const isAgeRestricted = KNOWN_AGE_RESTRICTED_VIDEOS.has(videoId);
    const isEmbedBlocked = KNOWN_EMBED_BLOCKED_VIDEOS.has(videoId);

    return {
      platform: 'youtube',
      label: isAgeRestricted ? 'YouTube (18+ Age-Restricted)' : 'YouTube (Privacy Mode)',
      videoId,
      startSeconds,
      isAgeRestricted,
      isEmbedBlocked,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0${startSeconds ? `&start=${startSeconds}` : ''}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      originalUrl: str
    };
  }

  // Vimeo detection (vimeo.com/ID, player.vimeo.com/video/ID)
  const vimeoMatch = str.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return {
      platform: 'vimeo',
      label: 'Vimeo (DNT Mode)',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&dnt=1`,
      thumbnailUrl: null,
      originalUrl: str
    };
  }

  // Direct HTML5 Video (.mp4, .webm, .mkv, .mov)
  if (str.match(/\.(mp4|webm|mkv|mov|m4v)$/i)) {
    return {
      platform: 'direct_video',
      label: str.match(/\.mkv$/i) ? 'Matroska (.mkv) Video' : 'Archival Video Stream',
      embedUrl: str,
      thumbnailUrl: null,
      originalUrl: str
    };
  }

  // Direct HTML5 Audio (.mp3, .wav, .m4a, .aac, .flac)
  if (str.match(/\.(mp3|wav|m4a|aac|flac|oga|opus)$/i)) {
    return {
      platform: 'direct_audio',
      label: 'Archival Audio Recording',
      embedUrl: str,
      thumbnailUrl: null,
      originalUrl: str
    };
  }

  // Fallback for external links (e.g. American Archive of Public Broadcasting, Library of Congress)
  return {
    platform: 'external',
    label: 'External Media Repository',
    embedUrl: null,
    thumbnailUrl: null,
    originalUrl: str
  };
}

/**
 * MediaEmbed Component:
 * Embeds responsive, privacy-preserving video and audio with a lightweight facade and theater mode.
 */
export default function MediaEmbed({
  url,
  mirrorUrl = null,
  title,
  host,
  year,
  aspectRatio = '16/9',
  autoplay = false,
  isAgeRestricted: isAgeRestrictedProp = false,
  mode = 'inline', // 'inline' | 'card'
  className = '',
  style = {}
}) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isTheaterOpen, setIsTheaterOpen] = useState(false);
  const [activeUrl, setActiveUrl] = useState(url);
  const [attemptDirectEmbed, setAttemptDirectEmbed] = useState(false);

  React.useEffect(() => {
    setActiveUrl(url);
    setAttemptDirectEmbed(false);
  }, [url]);

  const parsed = parseMediaUrl(activeUrl);
  const mirrorParsed = mirrorUrl ? parseMediaUrl(mirrorUrl) : null;
  const isAgeGated = Boolean((isAgeRestrictedProp || parsed?.isAgeRestricted || parsed?.isEmbedBlocked) && parsed?.platform === 'youtube');

  const handleStartPlaying = () => {
    setIsPlaying(true);
    if (parsed) {
      captureEvent('media_play_started', {
        platform: parsed.platform,
        title: title || 'Archival Media Item',
        year: year || null,
        videoId: parsed.videoId || null
      });
    }
  };

  const handleOpenTheater = () => {
    setIsTheaterOpen(true);
    if (parsed) {
      captureEvent('media_theater_opened', {
        platform: parsed.platform,
        title: title || 'Archival Media Item',
        year: year || null
      });
    }
  };

  const renderAgeGatedAdvisory = (isTheater = false) => (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at center, #171d2b 0%, #030712 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isTheater ? '2rem' : '0.85rem 1rem',
      textAlign: 'center',
      zIndex: 5,
      overflow: 'hidden'
    }}>
      <div style={{
        width: isTheater ? '54px' : '36px',
        height: isTheater ? '54px' : '36px',
        borderRadius: '50%',
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: isTheater ? '0.75rem' : '0.35rem',
        boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)',
        flexShrink: 0
      }}>
        <Lock size={isTheater ? 24 : 16} color="#fbbf24" />
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: isTheater ? '0.72rem' : '0.65rem',
        fontFamily: FONT.mono,
        color: '#fbbf24',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '0.25rem'
      }}>
        <AlertTriangle size={isTheater ? 12 : 10} />
        YouTube Age-Restricted
      </div>

      <h3 style={{
        margin: '0 0 0.35rem',
        fontSize: isTheater ? '1.25rem' : '0.92rem',
        color: '#fff',
        fontFamily: FONT.display,
        maxWidth: isTheater ? '650px' : '360px',
        lineHeight: 1.25,
        display: '-webkit-box',
        WebkitLineClamp: isTheater ? 2 : 1,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {title || 'Archival Video Stream'}
      </h3>

      <p style={{
        margin: isTheater ? '0 0 1.25rem' : '0 0 0.65rem',
        fontSize: isTheater ? '0.85rem' : '0.72rem',
        color: '#94a3b8',
        lineHeight: 1.35,
        maxWidth: isTheater ? '560px' : '340px'
      }}>
        {isTheater 
          ? "YouTube disables third-party embedded playback for this recording under its platform 18+ policy. Watch directly on YouTube where your signed-in verified account applies, or stream an archival mirror."
          : "YouTube blocks embedded playback for this 18+ recording. Watch directly on YouTube or open an archival mirror."}
      </p>

      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        <a
          href={parsed?.originalUrl || url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => captureEvent('media_age_restricted_external_watch', { url: parsed?.originalUrl || url, title })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: isTheater ? '0.6rem 1.25rem' : '0.45rem 0.85rem',
            borderRadius: '6px',
            background: 'var(--c-goldBright)',
            color: '#000',
            fontWeight: 700,
            fontSize: isTheater ? '0.84rem' : '0.74rem',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(212, 160, 48, 0.3)'
          }}
        >
          <ExternalLink size={isTheater ? 14 : 12} />
          <span>Watch on YouTube (18+ Verified)</span>
        </a>

        {mirrorUrl && (
          <button
            onClick={() => {
              setActiveUrl(mirrorUrl);
              setAttemptDirectEmbed(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: isTheater ? '0.6rem 1.15rem' : '0.45rem 0.8rem',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#fff',
              fontWeight: 600,
              fontSize: isTheater ? '0.84rem' : '0.74rem',
              cursor: 'pointer'
            }}
          >
            <Film size={isTheater ? 14 : 12} />
            <span>Mirror Stream</span>
          </button>
        )}
      </div>

      <button
        onClick={() => setAttemptDirectEmbed(true)}
        style={{
          marginTop: isTheater ? '0.85rem' : '0.4rem',
          background: 'transparent',
          border: 'none',
          color: '#64748b',
          fontSize: '0.68rem',
          cursor: 'pointer',
          textDecoration: 'underline'
        }}
      >
        Attempt embedded player anyway
      </button>
    </div>
  );

  if (!parsed) return null;

  // External repository link fallback (e.g. Library of Congress, AAPB)
  if (parsed.platform === 'external') {
    return (
      <div 
        className={`media-external-fallback ${className}`}
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--c-ghost)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          ...style
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              fontSize: '0.72rem',
              fontFamily: FONT.mono,
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              background: 'rgba(212, 160, 48, 0.15)',
              color: 'var(--c-goldBright)',
              textTransform: 'uppercase'
            }}>
              {year || 'Archival'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--c-dim)' }}>
              {parsed.label}
            </span>
          </div>
          <h4 style={{ margin: '0 0 0.25rem', color: 'var(--c-textBright)', fontFamily: FONT.display, fontSize: '1.05rem' }}>
            {title || 'Archival Media Item'}
          </h4>
          {host && <div style={{ fontSize: '0.82rem', color: 'var(--c-muted)' }}>{host}</div>}
        </div>

        <a
          href={parsed.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => captureEvent('media_external_opened', { originalUrl: parsed.originalUrl, title })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1.15rem',
            borderRadius: '8px',
            background: 'var(--c-goldBright)',
            color: '#000',
            fontWeight: 700,
            fontSize: '0.82rem',
            textDecoration: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          <span>Open External Archive</span>
          <ExternalLink size={13} />
        </a>
      </div>
    );
  }

  // Direct Audio Rendering
  if (parsed.platform === 'direct_audio') {
    return (
      <div 
        className={`media-audio-player ${className}`}
        style={{
          padding: '1.25rem',
          borderRadius: '12px',
          background: 'rgba(168, 85, 247, 0.08)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          ...style
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Volume2 size={16} color="#c084fc" />
            <span style={{ fontSize: '0.75rem', fontFamily: FONT.mono, color: '#c084fc', textTransform: 'uppercase' }}>
              {year ? `${year} Recording` : 'Audio Recording'}
            </span>
          </div>
          {host && <span style={{ fontSize: '0.75rem', color: 'var(--c-dim)' }}>{host}</span>}
        </div>
        {title && <h4 style={{ margin: 0, color: 'var(--c-textBright)', fontSize: '1rem', fontFamily: FONT.display }}>{title}</h4>}
        <audio 
          src={parsed.embedUrl} 
          controls 
          style={{ width: '100%', height: '36px' }}
        >
          Your browser does not support the audio player.
        </audio>
      </div>
    );
  }

  // Video Rendering (YouTube, Vimeo, HTML5 Video)
  return (
    <>
      <div 
        className={`media-embed-container ${className}`}
        style={{
          position: 'relative',
          borderRadius: '14px',
          overflow: 'hidden',
          background: '#020617',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          ...style
        }}
      >
        {isPlaying ? (
          /* Active Playing State */
          <div style={{ position: 'relative', width: '100%', aspectRatio, background: '#000' }}>
            {isAgeGated && !attemptDirectEmbed ? (
              renderAgeGatedAdvisory()
            ) : parsed.platform === 'direct_video' ? (
              <video
                src={parsed.embedUrl}
                controls
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              >
                <source src={parsed.embedUrl} type="video/mp4" />
                <source src={parsed.embedUrl} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <iframe
                src={parsed.embedUrl}
                title={title || 'Embedded Media Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            )}

            {/* Quick Controls Overlay */}
            <div style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              display: 'flex',
              gap: '0.35rem',
              zIndex: 10
            }}>
              <button
                onClick={handleOpenTheater}
                title="Expand to Theater Mode"
                style={{
                  padding: '0.35rem 0.55rem',
                  borderRadius: '6px',
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <Maximize2 size={12} />
                <span>Theater</span>
              </button>
            </div>
          </div>
        ) : (
          /* Facade Preview State (Fast, Zero Cookie Tracking, High Aesthetic) */
          <div 
            onClick={handleStartPlaying}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio,
              background: '#090d16',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              group: 'media-facade'
            }}
          >
            {/* Background Thumbnail if available */}
            {parsed.thumbnailUrl ? (
              <img 
                src={parsed.thumbnailUrl} 
                alt={title || 'Video Thumbnail'}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.65,
                  transition: 'transform 0.4s ease, opacity 0.4s ease'
                }}
              />
            ) : (
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.8) 0%, rgba(2, 6, 23, 0.95) 100%)'
                }}
              />
            )}

            {/* Ambient Dark Scrim */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)'
            }} />

            {/* Top Bar Badges */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              padding: '0.85rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontFamily: FONT.mono,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '5px',
                  background: 'rgba(212, 160, 48, 0.2)',
                  border: '1px solid rgba(212, 160, 48, 0.4)',
                  color: 'var(--c-goldBright)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <Video size={11} />
                  {year || 'ARCHIVE'}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontFamily: FONT.mono,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1'
                }}>
                  {parsed.platform === 'youtube' ? 'YouTube' : parsed.platform === 'vimeo' ? 'Vimeo' : 'Archival Video'}
                </span>
                {isAgeGated && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontFamily: FONT.mono,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: '#fbbf24',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontWeight: 600
                  }}>
                    <Lock size={10} />
                    <span>18+ Age Gated</span>
                  </span>
                )}
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.68rem',
                color: '#94a3b8',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px'
              }}>
                <ShieldCheck size={11} color="#34d399" />
                <span>Zero Tracking Mode</span>
              </div>
            </div>

            {/* Center Glowing Play Button */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1
            }}>
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: isAgeGated ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'var(--c-goldBright)',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isAgeGated ? '0 0 35px rgba(245, 158, 11, 0.5), 0 4px 15px rgba(0,0,0,0.5)' : '0 0 35px rgba(250, 204, 21, 0.6), 0 4px 15px rgba(0,0,0,0.5)',
                  transition: 'all 0.25s ease'
                }}
              >
                {isAgeGated ? (
                  <Lock size={24} style={{ fill: 'currentColor' }} />
                ) : (
                  <Play size={26} style={{ marginLeft: '4px', fill: 'currentColor' }} />
                )}
              </div>
            </div>

            {/* Bottom Info Bar */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              padding: '0.85rem 1.15rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(5, 7, 15, 0.8)',
              backdropFilter: 'blur(8px)'
            }}>
              <h4 style={{
                margin: '0 0 0.25rem',
                color: '#fff',
                fontFamily: FONT.display,
                fontSize: '1.05rem',
                lineHeight: 1.3
              }}>
                {title || 'Play Archival Video Recording'}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {host ? (
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{host}</span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Click to stream presentation</span>
                )}

                <span style={{ 
                  fontSize: '0.72rem', 
                  color: isAgeGated ? '#fbbf24' : 'var(--c-goldBright)', 
                  fontWeight: 700 
                }}>
                  {isAgeGated ? 'Age-Gated // Options Available' : 'Click to Stream'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Theater Lightbox Modal */}
      {isTheaterOpen && typeof document !== 'undefined' && createPortal(
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setIsTheaterOpen(false)}
        >
          {/* Theater Header */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: FONT.mono, color: 'var(--c-goldBright)', textTransform: 'uppercase' }}>
                ARCHIVAL SCREENING ROOM // {year || 'HISTORICAL'}
              </div>
              <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: '0.2rem 0 0', fontFamily: FONT.display }}>
                {title || 'Archival Video'}
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <a
                href={parsed.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                <ExternalLink size={13} />
                <span>Open Source Link</span>
              </a>

              <button
                onClick={() => setIsTheaterOpen(false)}
                style={{
                  padding: '0.45rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer'
                }}
                title="Close Theater"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Theater Stage Viewport */}
          <div 
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem 0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '100%',
              maxWidth: '1100px',
              aspectRatio: '16/9',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: '#000',
              position: 'relative'
            }}>
              {isAgeGated && !attemptDirectEmbed ? (
                renderAgeGatedAdvisory(true)
              ) : parsed.platform === 'direct_video' ? (
                <video
                  src={parsed.embedUrl}
                  controls
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                >
                  <source src={parsed.embedUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  src={parsed.embedUrl}
                  title={title || 'Theater Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              )}
            </div>
          </div>

          {/* Theater Bottom Host / Provenance */}
          {host && (
            <div 
              style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.85rem',
                paddingTop: '0.5rem'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {host}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
