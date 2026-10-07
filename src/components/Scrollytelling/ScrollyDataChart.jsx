import React, { useRef, useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// ScrollyDataChart — Editorial-grade data visualization for the Special Report
//
// Design language: "Tomorrow's Bureau" — hairline precision, generous whitespace,
// Playfair Display headings over Barlow Condensed data labels. No fills except
// the bar colors themselves. The chart should feel like a page from a premium
// annual report, not a dashboard widget.
//
// Pathway ordering convention: Intact → Restoring → Circumcised (blue → gold → red)
// This mirrors the narrative arc: what nature provides → the response → what's lost.
// ═══════════════════════════════════════════════════════════════════════════

const TYPE = {
  title:    "clamp(1.2rem, 2vw, 1.5rem)",
  subtitle: "clamp(0.85rem, 1.1vw, 0.95rem)",
  value:    "clamp(0.8rem, 1vw, 0.9rem)",
  label:    "clamp(0.78rem, 1vw, 0.88rem)",
  legend:   "clamp(0.75rem, 0.95vw, 0.85rem)",
  axis:     "clamp(0.68rem, 0.85vw, 0.78rem)",
};

// Intersection observer hook for reveal animations
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export default function ScrollyDataChart({ 
  variant = 'stacked', 
  title, 
  subtitle, 
  data, 
  categories, 
  yDomain = [0, 100], 
  yTicks = 5,
  legendTitle,
  height = 380,
  accentColor,
  note,
  format,
}) {
  const accent = accentColor || categories?.[0]?.color || 'var(--c-gold)';

  return (
    <div style={{
      width: '100%',
      fontFamily: "var(--f-body, 'Barlow', sans-serif)",
      color: "var(--c-textBright)",
      position: 'relative',
      padding: '0 0 1.5rem',
      marginBottom: '1rem',
    }}>
      {/* Accent strip */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
        borderRadius: '3px 3px 0 0',
        marginBottom: '1.5rem',
      }} />

      {/* Title block */}
      {(title || subtitle) && (
        <div style={{ marginBottom: '1.2rem' }}>
          {title && (
            <div style={{
              fontSize: TYPE.title,
              fontWeight: 700,
              fontFamily: "var(--f-display, 'Playfair Display', serif)",
              lineHeight: 1.25,
              marginBottom: subtitle ? '0.35rem' : 0,
              color: 'var(--c-textBright)',
            }}>{title}</div>
          )}
          {subtitle && (
            <div style={{
              fontSize: TYPE.subtitle,
              color: 'var(--c-muted)',
              fontStyle: 'italic',
              lineHeight: 1.45,
            }}>{subtitle}</div>
          )}
        </div>
      )}

      {/* Legend — horizontal pills above the chart */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        alignItems: 'center',
      }}>
        {legendTitle && (
          <div style={{
            fontSize: TYPE.axis,
            color: 'var(--c-dim)',
            fontStyle: 'italic',
            marginRight: '0.5rem',
          }}>{legendTitle}</div>
        )}
        {categories.map(cat => (
          <div key={cat.key} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: cat.color,
              boxShadow: `0 0 6px ${cat.color}44`,
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: TYPE.legend,
              color: 'var(--c-text)',
              fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}>{cat.label}</span>
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div style={{ width: '100%', height: variant === 'horizontal' ? 'auto' : height }}>
        {variant === 'stacked' && <StackedChart data={data} categories={categories} height={height} />}
        {variant === 'grouped' && <GroupedChart data={data} categories={categories} yDomain={yDomain} yTicks={yTicks} height={height} format={format} />}
        {variant === 'horizontal' && <HorizontalChart data={data} categories={categories} format={format} />}
        {variant === 'mirror' && <MirrorChart data={data} categories={categories} format={format} />}
        {variant === 'diverging' && <DivergingChart data={data} categories={categories} format={format} />}
      </div>

      {/* Note */}
      {note && (
        <div style={{
          marginTop: '1rem',
          fontSize: TYPE.axis,
          color: 'var(--c-dim)',
          fontStyle: 'italic',
          lineHeight: 1.5,
          borderTop: '1px solid var(--c-ghost)',
          paddingTop: '0.75rem',
        }}>{note}</div>
      )}

      {/* Bottom rule */}
      <div style={{
        height: 1,
        background: 'var(--c-ghost)',
        marginTop: '1.5rem',
      }} />
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// STACKED 100% BAR CHART
// ═══════════════════════════════════════════════════════════════════════════

function StackedChart({ data, categories, height }) {
  const [ref, inView] = useInView();
  const chartH = height - 40;
  const groupW = 100 / data.length;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height }}>
      {/* Y Axis */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 40, width: 38,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        color: 'var(--c-dim)', fontSize: TYPE.axis,
        fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
        fontWeight: 600,
        alignItems: 'flex-end', paddingRight: '8px',
      }}>
        {[100, 80, 60, 40, 20, 0].map(v => <span key={v}>{v}%</span>)}
      </div>

      {/* Grid lines */}
      <div style={{ position: 'absolute', left: 38, right: 0, top: 0, bottom: 40 }}>
        {[0, 20, 40, 60, 80, 100].map(pct => (
          <div key={pct} style={{
            position: 'absolute', bottom: `${pct}%`, left: 0, right: 0,
            height: 1,
            background: pct === 0 ? 'var(--c-ghost)' : 'rgba(255,255,255,0.04)',
          }} />
        ))}
      </div>

      {/* SVG Bars */}
      <svg style={{
        position: 'absolute', left: 38, right: 0, top: 0,
        height: chartH, width: 'calc(100% - 38px)', overflow: 'visible',
      }}>
        {data.map((group, gi) => {
          let yOff = 0;
          const bw = groupW * 0.55;
          const cx = (gi + 0.5) * groupW;
          const bx = cx - bw / 2;

          return (
            <g key={group.group}>
              {categories.map(cat => {
                const val = group.values[cat.key] || 0;
                if (val === 0) return null;
                const h = (val / 100) * chartH;
                const y = yOff;
                yOff += h;
                const show = val > 4;

                return (
                  <g key={cat.key}>
                    <rect
                      x={`${bx}%`} y={y} width={`${bw}%`}
                      height={inView ? h : 0}
                      fill={cat.color}
                      rx="2"
                      style={{
                        transition: 'height 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                        transitionDelay: `${gi * 120}ms`,
                      }}
                    />
                    {show && inView && (
                      <text
                        x={`${cx}%`} y={y + h / 2}
                        fill={cat.textColor || '#fff'}
                        fontSize={TYPE.value}
                        fontFamily="'Barlow Condensed', sans-serif"
                        fontWeight="700"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.4s 0.6s' }}
                      >
                        {val}%
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* X Axis Labels */}
      <div style={{
        position: 'absolute', left: 38, right: 0, bottom: 0, height: 40,
        display: 'flex',
      }}>
        {data.map(group => (
          <div key={group.group} style={{
            flex: 1, textAlign: 'center',
            fontSize: TYPE.label,
            fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
            fontWeight: 700,
            color: 'var(--c-text)',
            paddingTop: '10px', lineHeight: 1.2,
          }}>
            {group.group}
          </div>
        ))}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// GROUPED VERTICAL BAR CHART
// ═══════════════════════════════════════════════════════════════════════════

function GroupedChart({ data, categories, yDomain, yTicks, height, format }) {
  const [ref, inView] = useInView();
  const chartH = height - 48;
  const groupW = 100 / data.length;
  const numCats = categories.length;
  const [minY, maxY] = yDomain;
  const range = maxY - minY;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height }}>
      {/* Y Axis */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 48, width: 32,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        color: 'var(--c-dim)', fontSize: TYPE.axis,
        fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
        fontWeight: 600,
        alignItems: 'flex-end', paddingRight: '8px',
      }}>
        {Array.from({ length: yTicks }).map((_, i) => {
          const val = maxY - (i * (range / (yTicks - 1)));
          return <span key={val}>{Number.isInteger(val) ? val : val.toFixed(1)}{format === 'percent' ? '%' : ''}</span>;
        })}
      </div>

      {/* Grid lines */}
      <div style={{ position: 'absolute', left: 32, right: 0, top: 0, bottom: 48 }}>
        {Array.from({ length: yTicks }).map((_, i) => {
          const pct = (i / (yTicks - 1)) * 100;
          return (
            <div key={pct} style={{
              position: 'absolute', bottom: `${pct}%`, left: 0, right: 0,
              height: 1,
              background: pct === 0 ? 'var(--c-ghost)' : 'rgba(255,255,255,0.04)',
            }} />
          );
        })}
      </div>

      {/* SVG Bars */}
      <svg style={{
        position: 'absolute', left: 32, right: 0, top: 0,
        height: chartH, width: 'calc(100% - 32px)', overflow: 'visible',
      }}>
        {data.map((group, gi) => {
          const cx = (gi + 0.5) * groupW;
          const clusterW = groupW * 0.7;
          const barW = clusterW / numCats;

          return (
            <g key={group.group}>
              {categories.map((cat, ci) => {
                const val = group.values[cat.key] || 0;
                const normVal = Math.max(0, val - minY);
                const hPx = (normVal / range) * chartH;
                const bx = cx - clusterW / 2 + ci * barW;

                return (
                  <g key={cat.key}>
                    <rect
                      x={`${bx}%`}
                      y={inView ? chartH - hPx : chartH}
                      width={`${barW}%`}
                      height={inView ? hPx : 0}
                      fill={cat.color}
                      rx="2"
                      style={{
                        transition: 'y 0.8s cubic-bezier(0.22, 1, 0.36, 1), height 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                        transitionDelay: `${gi * 80 + ci * 60}ms`,
                      }}
                    />
                    {inView && (
                      <text
                        x={`${bx + barW / 2}%`}
                        y={chartH - hPx - 8}
                        fill="var(--c-textBright)"
                        fontSize={TYPE.axis}
                        fontFamily="'Barlow Condensed', sans-serif"
                        fontWeight="700"
                        textAnchor="middle"
                        style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.4s 0.8s' }}
                      >
                        {val.toFixed(val % 1 === 0 ? 0 : 1)}{format === 'percent' ? '%' : ''}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* X Axis Labels */}
      <div style={{
        position: 'absolute', left: 32, right: 0, bottom: 0, height: 48,
        display: 'flex',
      }}>
        {data.map(group => (
          <div key={group.group} style={{
            flex: 1, textAlign: 'center',
            fontSize: TYPE.label,
            fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
            fontWeight: 700,
            color: 'var(--c-text)',
            paddingTop: '10px', lineHeight: 1.2,
          }}>
            {group.group.split(' ').map((word, i) => <div key={i}>{word}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// HORIZONTAL BAR CHART — the comparative workhorse
// Each data row shows all pathways side-by-side for instant comparison
// ═══════════════════════════════════════════════════════════════════════════

function HorizontalChart({ data, categories, format = 'percent' }) {
  const [ref, inView] = useInView(0.1);
  const maxVal = Math.max(...data.flatMap(d => categories.map(c => d.values[c.key] || 0)));
  const barMax = Math.ceil(maxVal / 10) * 10 || 100;

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {data.map((item, idx) => (
        <div key={idx}>
          {/* Row label */}
          <div style={{
            fontSize: TYPE.label,
            fontFamily: "var(--f-display, 'Playfair Display', serif)",
            fontWeight: 600,
            color: 'var(--c-textBright)',
            marginBottom: '0.5rem',
            lineHeight: 1.3,
          }}>
            {item.label}
          </div>

          {/* Bars for each pathway */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {categories.map(cat => {
              const val = item.values[cat.key] || 0;
              const widthPct = barMax > 0 ? (val / barMax) * 100 : 0;

              return (
                <div key={cat.key} style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                }}>
                  {/* Pathway label */}
                  <div style={{
                    width: '90px', flexShrink: 0,
                    fontSize: TYPE.axis,
                    fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                    fontWeight: 700,
                    color: cat.color,
                    textAlign: 'right',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {cat.label}
                  </div>

                  {/* Bar track */}
                  <div style={{
                    flex: 1,
                    height: 26,
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    {/* Fill */}
                    <div style={{
                      width: inView ? `${widthPct}%` : '0%',
                      height: '100%',
                      background: `linear-gradient(180deg, ${cat.color} 0%, ${cat.color}cc 100%)`,
                      borderRadius: 4,
                      transition: 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
                      transitionDelay: `${idx * 100 + categories.indexOf(cat) * 60}ms`,
                      position: 'relative',
                    }}>
                      {/* Sheen overlay */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
                        borderRadius: 4,
                      }} />
                    </div>
                  </div>

                  {/* Value */}
                  <div style={{
                    width: '50px', flexShrink: 0,
                    fontSize: TYPE.value,
                    fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                    fontWeight: 700,
                    color: 'var(--c-textBright)',
                    textAlign: 'left',
                    opacity: inView ? 1 : 0,
                    transition: 'opacity 0.4s 0.6s',
                  }}>
                    {val > 0 ? `${Number.isInteger(val) ? val : val.toFixed(1)}${format === 'percent' ? '%' : ''}` : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// MIRROR CHART — The Tornado Chart for direct comparisons
// ═══════════════════════════════════════════════════════════════════════════

function MirrorChart({ data, categories, format = 'percent' }) {
  const [ref, inView] = useInView(0.1);
  const leftCat = categories[0];
  const rightCat = categories[1];
  
  const maxVal = Math.max(...data.flatMap(d => [d.values[leftCat.key] || 0, d.values[rightCat.key] || 0]));
  const barMax = Math.ceil(maxVal / 10) * 10 || 100;

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
        <div style={{ flex: 1, textAlign: 'right', color: leftCat.color, fontWeight: 700, fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)", fontSize: TYPE.axis, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {leftCat.label}
        </div>
        <div style={{ width: '120px', flexShrink: 0 }} />
        <div style={{ flex: 1, textAlign: 'left', color: rightCat.color, fontWeight: 700, fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)", fontSize: TYPE.axis, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {rightCat.label}
        </div>
      </div>

      {data.map((item, idx) => {
        const lVal = item.values[leftCat.key] || 0;
        const rVal = item.values[rightCat.key] || 0;
        const lPct = barMax > 0 ? (lVal / barMax) * 100 : 0;
        const rPct = barMax > 0 ? (rVal / barMax) * 100 : 0;

        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.4s 0.6s', color: 'var(--c-textBright)', fontSize: TYPE.value, fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)", fontWeight: 700 }}>
                {lVal > 0 ? `${Number.isInteger(lVal) ? lVal : lVal.toFixed(1)}${format === 'percent' ? '%' : ''}` : '—'}
              </div>
              <div style={{ height: 24, width: '70%', background: 'rgba(255,255,255,0.04)', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', right: 0, top: 0, bottom: 0, width: inView ? `${lPct}%` : '0%',
                  background: `linear-gradient(270deg, ${leftCat.color} 0%, ${leftCat.color}cc 100%)`,
                  transition: 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: `${idx * 100}ms`, borderRadius: 4,
                }} />
              </div>
            </div>

            <div style={{ width: '120px', flexShrink: 0, textAlign: 'center', padding: '0 0.5rem', color: 'var(--c-textBright)', fontSize: TYPE.label, fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)", fontWeight: 600, lineHeight: 1.1 }}>
              {item.group || item.label}
            </div>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ height: 24, width: '70%', background: 'rgba(255,255,255,0.04)', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: inView ? `${rPct}%` : '0%',
                  background: `linear-gradient(90deg, ${rightCat.color} 0%, ${rightCat.color}cc 100%)`,
                  transition: 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: `${idx * 100 + 150}ms`, borderRadius: 4,
                }} />
              </div>
              <div style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.4s 0.6s', color: 'var(--c-textBright)', fontSize: TYPE.value, fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)", fontWeight: 700 }}>
                {rVal > 0 ? `${Number.isInteger(rVal) ? rVal : rVal.toFixed(1)}${format === 'percent' ? '%' : ''}` : '—'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DIVERGING STACKED BAR CHART
// ═══════════════════════════════════════════════════════════════════════════

function DivergingChart({ data, categories, format = 'percent' }) {
  const [ref, inView] = useInView(0.1);
  const neutralIdx = Math.floor(categories.length / 2);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
      <div style={{ position: 'absolute', left: 'calc(80px + (100% - 80px)/2)', top: -20, bottom: 0, width: 1, background: 'var(--c-ghost)', zIndex: 0 }} />

      {data.map((item, idx) => {
        const neutralVal = categories[neutralIdx] ? (item.values[categories[neutralIdx].key] || 0) : 0;
        let leftPos = 50 - (neutralVal / 4);
        let rightPos = 50 + (neutralVal / 4);

        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '80px', flexShrink: 0, textAlign: 'right', color: 'var(--c-textBright)', fontSize: TYPE.label, fontWeight: 600, fontFamily: "var(--f-display, 'Playfair Display', serif)" }}>
              {item.group || item.label}
            </div>
            <div style={{ flex: 1, position: 'relative', height: 28 }}>
              {categories.map((cat, ci) => {
                const val = item.values[cat.key] || 0;
                if (val === 0) return null;
                
                let x = 0;
                let w = val / 2;
                
                if (ci < neutralIdx) {
                  leftPos -= w;
                  x = leftPos;
                } else if (ci > neutralIdx) {
                  x = rightPos;
                  rightPos += w;
                } else {
                  x = 50 - w/2;
                }

                return (
                  <div key={cat.key} style={{
                    position: 'absolute', left: `${x}%`, width: inView ? `${w}%` : '0%', height: '100%',
                    background: cat.color, transition: 'width 0.8s ease-out', transitionDelay: `${idx * 100}ms`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 2
                  }}>
                    {val > 5 && inView && (
                      <span style={{ color: cat.textColor || '#fff', fontSize: '11px', fontWeight: 700, fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)" }}>
                        {val.toFixed(0)}{format === 'percent' ? '%' : ''}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
