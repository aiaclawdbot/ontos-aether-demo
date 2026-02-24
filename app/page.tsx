'use client';

import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T, mono, PHASE_NAMES, ONTO_FILE, TICK1_OUTPUT, TICK2_OUTPUT, CHAT_MESSAGES } from './data';
import { ErrorBoundary } from './ErrorBoundary';

// ─── Responsive Hook ─────────────────────────────────────────────
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

// ─── Swipe Hook ──────────────────────────────────────────────────
function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
    }
    touchStart.current = null;
  }, [onSwipeLeft, onSwipeRight]);

  return { onTouchStart, onTouchEnd };
}

// ─── Animated Counter Hook ───────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1500, start = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, start]);
  return value;
}

// ─── Markdown Renderer ───────────────────────────────────────────
function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith('[')) {
          return (
            <div key={i} style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {line.match(/\[([^\]]+)\]/g)?.map((link, j) => (
                <span key={j} style={{ ...mono, fontSize: 10, color: T.accent, background: `${T.accent}15`, padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>
                  {link.replace(/[\[\]]/g, '')}
                </span>
              ))}
            </div>
          );
        }
        if (/^\d+\.\s/.test(line)) return <div key={i} style={{ paddingLeft: 8, marginTop: 4 }}>{renderInline(line)}</div>;
        if (line.startsWith('- ')) return <div key={i} style={{ paddingLeft: 12, marginTop: 2 }}>{renderInline('• ' + line.slice(2))}</div>;
        if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
        return <div key={i} style={{ marginTop: 2 }}>{renderInline(line)}</div>;
      })}
    </>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return <span key={i}>{part}</span>;
  });
}

// ─── Copy Button ─────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={handleCopy} title="Copy response" style={{
      ...mono, fontSize: 9, color: copied ? T.green : T.textTer, background: 'transparent',
      border: `1px solid ${copied ? T.green + '40' : T.border}`, borderRadius: 3,
      padding: '2px 6px', cursor: 'pointer', transition: 'all 0.2s ease', marginTop: 6, float: 'right' as const,
    }}>
      {copied ? '✓ Copied' : '⎘ Copy'}
    </button>
  );
}

// ─── Floating Particles ──────────────────────────────────────────
function FloatingParticles() {
  const particles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * 10,
      opacity: 0.15 + Math.random() * 0.25,
    }))
  ).current;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: T.accent,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() > 0.5 ? 20 : -20, 0],
            opacity: [p.opacity, p.opacity * 0.4, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Grid Background with Parallax ───────────────────────────────
function GridBackground() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundImage: `linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)`,
      backgroundSize: '60px 60px',
      backgroundPosition: `0 ${scrollY * -0.15}px`,
      transition: 'background-position 0.05s linear',
    }}>
      <div style={{ position: 'absolute', top: scrollY * -0.3, left: '50%', transform: 'translateX(-50%)', width: '80%', height: 400,
        background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.06) 0%, transparent 70%)',
      }} />
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0E17', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#fff', margin: '0 auto 12px' }}>O</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#484F58' }}>Loading compiled graph...</div>
      </motion.div>
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────
function Header({ phase, setPhase, autoAdvance, setAutoAdvance }: { phase: number; setPhase: (p: number) => void; autoAdvance: boolean; setAutoAdvance: (v: boolean) => void }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ height: 3, background: T.border }}>
        <motion.div
          style={{ height: '100%', background: `linear-gradient(90deg, ${T.accent}, ${T.aether})`, borderRadius: '0 2px 2px 0' }}
          animate={{ width: `${((phase + 1) / PHASE_NAMES.length) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>
      <div style={{ background: 'rgba(10,14,23,0.97)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${T.border}`, padding: isMobile ? '10px 16px' : '10px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: isMobile ? 8 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 5, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#fff' }}>O</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>Ontos</span>
          {!isMobile && <span style={{ ...mono, fontSize: 11, color: T.textTer }}>Compiled Reasoning Engine</span>}
        </div>
        <nav role="navigation" aria-label="Demo phases" style={{ display: 'flex', gap: 2, order: isMobile ? 3 : 0, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-start' }}>
          {PHASE_NAMES.map((p, i) => (
            <button key={i} onClick={() => setPhase(i)} aria-label={`Phase ${i + 1}: ${p}`} aria-current={phase === i ? 'step' : undefined} style={{
              padding: isMobile ? '6px 8px' : '6px 14px', borderRadius: 4, border: 'none', cursor: 'pointer', ...mono, fontSize: isMobile ? 10 : 11,
              background: phase === i ? T.accent : 'transparent',
              color: phase === i ? '#fff' : phase > i ? T.green : T.textTer,
              transition: 'all 0.2s ease', flex: isMobile ? 1 : 'none', textAlign: 'center',
            }}>
              {isMobile ? `${i + 1}` : `${i + 1}. ${p}`}
            </button>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Auto-advance toggle */}
          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            title={autoAdvance ? 'Auto-advance ON' : 'Auto-advance OFF'}
            style={{
              ...mono, fontSize: 10, color: autoAdvance ? T.green : T.textTer,
              background: autoAdvance ? `${T.green}15` : 'transparent',
              border: `1px solid ${autoAdvance ? T.green + '40' : T.border}`,
              borderRadius: 4, padding: '4px 8px', cursor: 'pointer', transition: 'all 0.2s ease',
            }}
          >
            {autoAdvance ? '▶ AUTO' : '⏸ AUTO'}
          </button>
          {!isMobile && (
            <div style={{ ...mono, fontSize: 11, color: T.aether, border: `1px solid ${T.aether}40`, borderRadius: 4, padding: '5px 12px' }}>
              AETHER / SENTIMENTRADER
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Phase 1: The Mathematical Nightmare ─────────────────────────
function Phase1() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const indicatorCount = useAnimatedCounter(3100, 2000);
  const relationshipCount = useAnimatedCounter(28400, 2500);
  const ruleCount = useAnimatedCounter(847, 1800);

  return (
    <div style={{ padding: isMobile ? '32px 16px' : '48px 64px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ ...mono, fontSize: 11, color: T.accent, letterSpacing: 2, marginBottom: 12 }}>PHASE 1</div>
      <h1 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 700, color: T.text, margin: 0, marginBottom: 24, lineHeight: 1.2 }}>
        The Mathematical Nightmare
      </h1>

      <div style={{ display: 'flex', gap: isMobile ? 12 : 24, marginBottom: 24, justifyContent: 'center' }}>
        {[
          { value: indicatorCount.toLocaleString(), label: 'Indicators', color: T.accent },
          { value: relationshipCount.toLocaleString(), label: 'Relationships', color: T.blue },
          { value: ruleCount.toLocaleString(), label: 'Rules', color: T.amber },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ ...mono, fontSize: isMobile ? 20 : 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ ...mono, fontSize: 10, color: T.textTer }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: isMobile ? 16 : 28, marginBottom: 32 }}>
        <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 12 }}>THE QUERY</div>
        <div style={{ fontSize: isMobile ? 14 : 16, color: T.text, lineHeight: 1.7 }}>
          Detect a regime where Smart Money is abandoning equities while Dumb Money piles in, the Yen carry trade is unwinding, tech breadth is collapsing under the surface, <strong>AND</strong> the VIX term structure is flattening.
        </div>
        <div style={{ ...mono, fontSize: 12, color: T.textSec, marginTop: 12 }}>
          Cross-asset: Currencies × Sentiment × Breadth × Volatility. 3,100 indicators. Real-time.
        </div>
        <div style={{ ...mono, fontSize: 11, color: T.red, marginTop: 8 }}>
          August 2024 Yen Carry Trade Unwind — VIX hit 65. Most models missed it entirely.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 80px 1fr', gap: 0, marginBottom: 40 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: isMobile ? 8 : '8px 0 0 8px', padding: isMobile ? 16 : 24 }}>
          <div style={{ ...mono, fontSize: 11, color: T.red, marginBottom: 16 }}>YOUR CURRENT STACK</div>
          <div style={{ ...mono, fontSize: 12, color: T.textSec, lineHeight: 2.2 }}>
            {[
              <>1. Join sentiment tables with FX volatility data (different schemas)</>,
              <>2. Align tick frequencies (sentiment=daily, FX=intraday, VIX=real-time)</>,
              <>3. Execute <span style={{ color: T.red, fontWeight: 700 }}>cross-asset table joins</span> across 4 data domains</>,
              <>4. Scan sector breadth arrays for hidden divergence</>,
              <>5. Compute σ-scores with rolling windows on FX vol</>,
              <>6. Check VIX term structure shape (custom curve logic)</>,
              <>7. Aggregate into alertable signal with provenance</>,
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.15, duration: 0.4, ease: 'easeOut' }}>
                {step}
              </motion.div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: 12, background: `${T.red}10`, borderRadius: 6 }}>
            <div style={{ ...mono, fontSize: 18, fontWeight: 700, color: T.red }}>O(N<sup>k</sup>)</div>
            <div style={{ ...mono, fontSize: 11, color: T.textSec, marginTop: 4 }}>
              where k = number of indicator tables<br />
              Hours to code the pipeline. Minutes to execute.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${T.red}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${T.red}08` }}
          >
            <div style={{ ...mono, fontSize: 14, fontWeight: 700, color: T.red }}>vs</div>
          </motion.div>
          {/* Vertical connecting lines on desktop */}
          {!isMobile && (
            <>
              <div style={{ position: 'absolute', top: 0, left: '50%', width: 1, height: 'calc(50% - 30px)', background: `linear-gradient(to bottom, ${T.border}, ${T.red}40)`, transform: 'translateX(-50%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: '50%', width: 1, height: 'calc(50% - 30px)', background: `linear-gradient(to top, ${T.border}, ${T.red}40)`, transform: 'translateX(-50%)' }} />
            </>
          )}
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.accent}30`, borderRadius: isMobile ? 8 : '0 8px 8px 0', padding: isMobile ? 16 : 24 }}>
          <div style={{ ...mono, fontSize: 11, color: T.accent, marginBottom: 16 }}>ONTOS COMPILED GRAPH</div>
          <div style={{ ...mono, fontSize: 12, color: T.textSec, lineHeight: 2.2 }}>
            {[
              <>1. All 3,100 indicators are <span style={{ color: T.accent }}>nodes in a compiled graph</span></>,
              <>2. 28,400 relationships are <span style={{ color: T.accent }}>pre-computed edges</span></>,
              <>3. <span style={{ color: T.accent }}>One rule</span> in .onto syntax replaces the entire pipeline</>,
              <>4. Graph traversal evaluates all conditions simultaneously</>,
              <>5. Confidence computed across connected nodes</>,
              <>6. Provenance chain tracked automatically</>,
              <>7. Fires proactively on every data tick</>,
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.15, duration: 0.4, ease: 'easeOut' }}>
                {step}
              </motion.div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: 12, background: `${T.accent}10`, borderRadius: 6 }}>
            <div style={{ ...mono, fontSize: 18, fontWeight: 700, color: T.accent }}>O(V + E)</div>
            <div style={{ ...mono, fontSize: 11, color: T.textSec, marginTop: 4 }}>
              Linear graph traversal. Sub-millisecond execution.<br />
              Define the rule once. It runs forever.
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', ...mono, fontSize: 13, color: T.textSec }}>
        Let&apos;s see the rule.
      </div>
    </div>
  );
}

// ─── Phase 2: The .onto Engine ──────────────────────────────────
function Phase2() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [linesVisible, setLinesVisible] = useState(0);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const codeLines = ONTO_FILE.split('\n');
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLinesVisible(c => {
        if (c >= codeLines.length) { clearInterval(interval); return c; }
        return c + 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [codeLines.length]);

  useEffect(() => {
    if (codeRef.current) codeRef.current.scrollTop = codeRef.current.scrollHeight;
  }, [linesVisible]);

  // Identify collapsible sections
  const sections = (() => {
    const result: { name: string; keyword: string; startLine: number; endLine: number }[] = [];
    let braceDepth = 0;
    let currentSection: { name: string; keyword: string; startLine: number } | null = null;
    codeLines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!currentSection && /^(class|rule|@relationships|@metadata)\b/.test(trimmed)) {
        const keyword = trimmed.split(/[\s{]/)[0];
        const name = trimmed.replace(/\s*\{.*/, '');
        currentSection = { name, keyword, startLine: i };
        braceDepth = 0;
      }
      if (currentSection) {
        braceDepth += (line.match(/\{/g) || []).length;
        braceDepth -= (line.match(/\}/g) || []).length;
        if (braceDepth <= 0 && i > currentSection.startLine) {
          result.push({ ...currentSection, endLine: i });
          currentSection = null;
        }
      }
    });
    return result;
  })();

  const isLineHidden = (lineIdx: number) => {
    for (const sec of sections) {
      if (collapsed[sec.name] && lineIdx > sec.startLine && lineIdx <= sec.endLine) return true;
    }
    return false;
  };

  const getSectionAtLine = (lineIdx: number) => sections.find(s => s.startLine === lineIdx);

  const colorizeLine = (line: string): React.ReactNode => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) return <span style={{ color: T.textTer, fontStyle: 'italic' }}>{line}</span>;
    if (trimmed.startsWith('@')) return <span style={{ color: T.accent, fontWeight: 600 }}>{line}</span>;
    if (/^\s*(rule|class|relationship)\s/.test(line)) {
      const keyword = trimmed.split(/\s/)[0];
      return highlightTokens(line, keyword);
    }
    if (/^\s*(match|where|then|and)\s/.test(line)) {
      const keyword = trimmed.split(/\s/)[0];
      return highlightTokens(line, keyword);
    }
    if (line.includes('"') || /\b(String|Float|Integer|List|Map|Enum|Boolean|TimeSeries|Reference)\b/.test(line)) return highlightStringsAndTypes(line);
    return <span style={{ color: T.textSec }}>{line}</span>;
  };

  const highlightTokens = (line: string, keyword: string): React.ReactNode => {
    const idx = line.indexOf(keyword);
    const before = line.slice(0, idx);
    const after = line.slice(idx + keyword.length);
    const nameMatch = after.match(/^\s+(\w+)/);
    if (nameMatch) {
      const nameStart = after.indexOf(nameMatch[1]);
      return (
        <span style={{ color: T.textSec }}>
          {before}<span style={{ color: T.aether, fontWeight: 600 }}>{keyword}</span>
          {after.slice(0, nameStart)}<span style={{ color: T.cyan, fontWeight: 600 }}>{nameMatch[1]}</span>
          {highlightStringsAndTypes(after.slice(nameStart + nameMatch[1].length))}
        </span>
      );
    }
    return <span style={{ color: T.textSec }}>{before}<span style={{ color: T.accent, fontWeight: 600 }}>{keyword}</span>{highlightStringsAndTypes(after)}</span>;
  };

  const highlightStringsAndTypes = (text: string): React.ReactNode => {
    const parts = text.split(/("(?:[^"\\]|\\.)*")/g);
    return (
      <span style={{ color: T.textSec }}>
        {parts.map((part, i) => {
          if (part.startsWith('"')) return <span key={i} style={{ color: T.green }}>{part}</span>;
          const typeParts = part.split(/\b(String|Float|Integer|List|Map|Enum|Boolean|TimeSeries|Reference)\b/g);
          return typeParts.map((tp, j) => {
            if (/^(String|Float|Integer|List|Map|Enum|Boolean|TimeSeries|Reference)$/.test(tp)) return <span key={`${i}-${j}`} style={{ color: T.amber }}>{tp}</span>;
            const numParts = tp.split(/\b(\d+[\d._]*\w*)\b/g);
            return numParts.map((np, k) => {
              if (/^\d/.test(np)) return <span key={`${i}-${j}-${k}`} style={{ color: T.blue }}>{np}</span>;
              return <span key={`${i}-${j}-${k}`}>{np}</span>;
            });
          });
        })}
      </span>
    );
  };

  return (
    <div style={{ padding: isMobile ? '32px 16px' : '48px 64px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ ...mono, fontSize: 11, color: T.accent, letterSpacing: 2, marginBottom: 12 }}>PHASE 2</div>
      <h1 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 700, color: T.text, margin: 0, marginBottom: 8, lineHeight: 1.2 }}>
        The .onto Engine
      </h1>
      <p style={{ color: T.textSec, fontSize: 14, marginBottom: 24 }}>
        No SQL. No Python glue. One compiled specification that models your entire indicator universe — entities, relationships, and forward-reasoning rules. Click section headers to collapse.
      </p>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: `1px solid ${T.border}`, background: T.elevated }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F85149' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D29922' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3FB950' }} />
            </div>
            <span style={{ ...mono, fontSize: 12, color: T.textSec, marginLeft: 8 }}>sentimentrader-contagion.onto</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ ...mono, fontSize: 10, color: T.textTer }}>{Math.min(linesVisible, codeLines.length)}/{codeLines.length} lines</span>
            <span style={{ ...mono, fontSize: 10, color: linesVisible >= codeLines.length ? T.green : T.amber }}>
              {linesVisible >= codeLines.length ? '✓ Compiled' : '● Compiling...'}
            </span>
          </div>
        </div>

        {/* Compilation progress bar */}
        <div style={{ height: 3, background: T.border }}>
          <motion.div
            style={{ height: '100%', background: linesVisible >= codeLines.length ? T.green : `linear-gradient(90deg, ${T.accent}, ${T.aether})`, borderRadius: '0 2px 2px 0' }}
            animate={{ width: `${Math.min((linesVisible / codeLines.length) * 100, 100)}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <div style={{ padding: '4px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}` }}>
          <span style={{ ...mono, fontSize: 9, color: T.textTer }}>
            {linesVisible >= codeLines.length ? '✓ Compilation complete' : `Compiling: ${Math.round((linesVisible / codeLines.length) * 100)}%`}
          </span>
          <span style={{ ...mono, fontSize: 9, color: linesVisible >= codeLines.length ? T.green : T.amber }}>
            {linesVisible >= codeLines.length ? 'ontology.compiled → runtime' : `parsing line ${Math.min(linesVisible, codeLines.length)}...`}
          </span>
        </div>

        <div ref={codeRef} style={{ maxHeight: 580, overflowY: 'auto', padding: '12px 0' }}>
          {codeLines.slice(0, linesVisible).map((line, i) => {
            if (isLineHidden(i)) return null;
            const section = getSectionAtLine(i);
            const isCollapsed = section && collapsed[section.name];
            return (
              <div key={i} style={{ display: 'flex', padding: '0 16px', lineHeight: 1.65, cursor: section ? 'pointer' : 'default' }}
                onClick={section ? () => setCollapsed(c => ({ ...c, [section.name]: !c[section.name] })) : undefined}>
                <span style={{ ...mono, fontSize: 12, color: T.textTer, width: 36, textAlign: 'right', marginRight: 16, userSelect: 'none', flexShrink: 0 }}>{i + 1}</span>
                {section && (
                  <span style={{ ...mono, fontSize: 10, color: T.textTer, marginRight: 4, userSelect: 'none', width: 12, flexShrink: 0 }}>
                    {isCollapsed ? '▶' : '▼'}
                  </span>
                )}
                <span style={{ ...mono, fontSize: 12, whiteSpace: 'pre', marginLeft: section ? 0 : 12 }}>{colorizeLine(line)}</span>
                {isCollapsed && <span style={{ ...mono, fontSize: 10, color: T.textTer, marginLeft: 8 }}>…{section.endLine - section.startLine} lines</span>}
              </div>
            );
          })}
        </div>
      </div>

      {linesVisible >= codeLines.length && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 20, display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 12 }}>
          {[
            { label: 'Indicators', value: '3,100', color: T.accent },
            { label: 'Relationships', value: '28,400', color: T.blue },
            { label: 'Rules', value: '847', color: T.amber },
            { label: 'Compile', value: '<1ms', color: T.green },
          ].map(s => (
            <div key={s.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: '12px 16px', textAlign: 'center' }}>
              <div style={{ ...mono, fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ ...mono, fontSize: 10, color: T.textTer, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─── S&P 500 Sparkline ──────────────────────────────────────────
const SP500_DATA = [
  // Approximate S&P 500 daily close, Jul 1 – Aug 9, 2024
  { date: 'Jul 1', price: 5475 }, { date: 'Jul 3', price: 5510 }, { date: 'Jul 5', price: 5530 },
  { date: 'Jul 8', price: 5545 }, { date: 'Jul 10', price: 5570 }, { date: 'Jul 12', price: 5600 },
  { date: 'Jul 15', price: 5630 }, { date: 'Jul 16', price: 5667 }, { date: 'Jul 18', price: 5590 },
  { date: 'Jul 22', price: 5555 }, { date: 'Jul 24', price: 5522 }, { date: 'Jul 26', price: 5460 },
  { date: 'Jul 29', price: 5430 }, { date: 'Jul 31', price: 5390 }, { date: 'Aug 1', price: 5350 },
  { date: 'Aug 2', price: 5280 }, { date: 'Aug 5', price: 5186 },
];
const TICK1_IDX = 7; // Jul 16
const TICK2_IDX = 10; // Jul 24

function SparklineChart() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const w = isMobile ? 320 : 500;
  const h = 120;
  const pad = { top: 16, right: 12, bottom: 24, left: 40 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const minP = Math.min(...SP500_DATA.map(d => d.price));
  const maxP = Math.max(...SP500_DATA.map(d => d.price));
  const x = (i: number) => pad.left + (i / (SP500_DATA.length - 1)) * innerW;
  const y = (p: number) => pad.top + innerH - ((p - minP) / (maxP - minP)) * innerH;
  const path = SP500_DATA.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.price)}`).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="S&P 500 price chart from July to August 2024 showing decline after July 16 all-time high">
      {/* Y axis labels */}
      {[minP, maxP].map(p => (
        <text key={p} x={pad.left - 4} y={y(p) + 4} textAnchor="end" style={{ ...mono, fontSize: 8, fill: T.textTer }}>{p.toLocaleString()}</text>
      ))}
      {/* Price line */}
      <path d={path} fill="none" stroke={T.accent} strokeWidth={1.5} />
      {/* Area fill */}
      <path d={`${path} L${x(SP500_DATA.length - 1)},${h - pad.bottom} L${x(0)},${h - pad.bottom} Z`} fill={`${T.accent}10`} />
      {/* Tick 1 marker */}
      <line x1={x(TICK1_IDX)} y1={pad.top} x2={x(TICK1_IDX)} y2={h - pad.bottom} stroke={T.green} strokeWidth={1} strokeDasharray="3,3" />
      <circle cx={x(TICK1_IDX)} cy={y(SP500_DATA[TICK1_IDX].price)} r={4} fill={T.green} />
      <text x={x(TICK1_IDX)} y={h - 6} textAnchor="middle" style={{ ...mono, fontSize: 7, fill: T.green }}>Jul 16</text>
      {/* Tick 2 marker */}
      <line x1={x(TICK2_IDX)} y1={pad.top} x2={x(TICK2_IDX)} y2={h - pad.bottom} stroke={T.red} strokeWidth={1} strokeDasharray="3,3" />
      <circle cx={x(TICK2_IDX)} cy={y(SP500_DATA[TICK2_IDX].price)} r={4} fill={T.red} />
      <text x={x(TICK2_IDX)} y={h - 6} textAnchor="middle" style={{ ...mono, fontSize: 7, fill: T.red }}>Jul 24</text>
      {/* Aug 5 crash marker */}
      <circle cx={x(SP500_DATA.length - 1)} cy={y(SP500_DATA[SP500_DATA.length - 1].price)} r={3} fill={T.red} stroke={T.red} strokeWidth={1} />
      <text x={x(SP500_DATA.length - 1)} y={h - 6} textAnchor="middle" style={{ ...mono, fontSize: 7, fill: T.red }}>Aug 5</text>
    </svg>
  );
}

// ─── 4-Hop Graph Visualization ──────────────────────────────────
function GraphTraversal() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const nodes = [
    { id: 'sm', label: 'Smart Money', x: 0, color: T.accent },
    { id: 'jpy', label: 'JPY Vol', x: 1, color: T.amber },
    { id: 'mcc', label: 'McClellan', x: 2, color: T.blue },
    { id: 'vix', label: 'VIX Term', x: 3, color: T.red },
  ];
  const w = isMobile ? 300 : 440;
  const h = 80;
  const nodeR = 18;
  const spacing = (w - nodeR * 2) / 3;
  const cx = (i: number) => nodeR + i * spacing;
  const cy = h / 2;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="4-hop graph traversal: Smart Money to JPY Vol to McClellan to VIX Term Structure">
      {/* Edges with animated dash */}
      {nodes.slice(0, -1).map((n, i) => (
        <motion.line key={n.id} x1={cx(i) + nodeR} y1={cy} x2={cx(i + 1) - nodeR} y2={cy}
          stroke={T.accent} strokeWidth={2}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: i * 0.4 + 0.2 }}
        />
      ))}
      {/* Arrow heads */}
      {nodes.slice(0, -1).map((_, i) => (
        <motion.polygon key={`arr-${i}`}
          points={`${cx(i + 1) - nodeR - 2},${cy - 4} ${cx(i + 1) - nodeR + 4},${cy} ${cx(i + 1) - nodeR - 2},${cy + 4}`}
          fill={T.accent} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: i * 0.4 + 0.6 }}
        />
      ))}
      {/* Nodes */}
      {nodes.map((n, i) => (
        <motion.g key={n.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.4, type: 'spring', stiffness: 200 }}>
          <circle cx={cx(i)} cy={cy} r={nodeR} fill={`${n.color}20`} stroke={n.color} strokeWidth={1.5} />
          <text x={cx(i)} y={cy + 3} textAnchor="middle" style={{ ...mono, fontSize: 7, fill: n.color, fontWeight: 600 }}>
            {n.label.split(' ')[0]}
          </text>
          <text x={cx(i)} y={cy + nodeR + 12} textAnchor="middle" style={{ ...mono, fontSize: 6, fill: T.textTer }}>
            {n.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

// ─── Phase 3: Live Tick ─────────────────────────────────────────
function Phase3() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [phase, setPhase] = useState<'ready'|'tick1'|'between'|'tick2'|'done'>('ready');
  const [tick1Index, setTick1Index] = useState(0);
  const [tick2Index, setTick2Index] = useState(0);
  const termRef = useRef<HTMLDivElement>(null);

  const runSequence = (lines: typeof TICK1_OUTPUT, setIndex: (n: number) => void, onDone: () => void) => {
    let i = 0;
    const schedule = () => {
      if (i >= lines.length) { onDone(); return; }
      const delay = i === 0 ? 0 : lines[i].delay - lines[i - 1].delay;
      setTimeout(() => { setIndex(i + 1); i++; schedule(); }, delay);
    };
    schedule();
  };

  const replay = () => {
    setPhase('ready');
    setTick1Index(0);
    setTick2Index(0);
  };

  const startTick1 = () => {
    setPhase('tick1');
    runSequence(TICK1_OUTPUT, setTick1Index, () => setPhase('between'));
  };

  const startTick2 = () => {
    setPhase('tick2');
    runSequence(TICK2_OUTPUT, setTick2Index, () => setPhase('done'));
  };

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [tick1Index, tick2Index, phase]);

  const allLines = [
    ...TICK1_OUTPUT.slice(0, tick1Index),
    ...(phase === 'between' || phase === 'tick2' || phase === 'done' ? [{ text: '', color: T.textTer, delay: 0 }] : []),
    ...TICK2_OUTPUT.slice(0, tick2Index),
  ];

  return (
    <div style={{ padding: isMobile ? '32px 16px' : '48px 64px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ ...mono, fontSize: 11, color: T.accent, letterSpacing: 2, marginBottom: 12 }}>PHASE 3</div>
      <h1 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 700, color: T.text, margin: 0, marginBottom: 8, lineHeight: 1.2 }}>
        The Yen Carry Trade Unwind
      </h1>
      <p style={{ color: T.textSec, fontSize: isMobile ? 13 : 14, marginBottom: 16 }}>
        July 16, 2024: S&P 500 hits all-time high. Standard momentum models say &quot;Buy.&quot; Twelve days later, VIX explodes to 65 and tech craters. Two ticks. Watch what the .onto engine sees that your current stack doesn&apos;t.
      </p>

      {/* S&P 500 Sparkline */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ ...mono, fontSize: 10, color: T.textTer, marginBottom: 4 }}>S&P 500 — JUL–AUG 2024</div>
        <SparklineChart />
        <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
          <span style={{ ...mono, fontSize: 9, color: T.green }}>● Tick 1 (ATH 5,667)</span>
          <span style={{ ...mono, fontSize: 9, color: T.red }}>● Tick 2 (Alert fires)</span>
        </div>
      </div>

      <div style={{ background: '#010409', border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: `1px solid ${T.border}`, background: T.elevated }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F85149' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D29922' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3FB950' }} />
            </div>
            <span style={{ ...mono, fontSize: 12, color: T.textSec, marginLeft: 8 }}>terminal — ontos-runtime</span>
          </div>
          <span style={{ ...mono, fontSize: 10, color: phase === 'done' ? T.green : phase === 'between' ? T.amber : phase !== 'ready' ? T.amber : T.textTer }}>
            {phase === 'done' ? '🔥 ALERT — 0.42ms' : phase === 'between' ? '○ tick 1 clean — waiting' : phase !== 'ready' ? '● processing...' : '○ ready'}
          </span>
        </div>

        <div ref={termRef} style={{ padding: 16, minHeight: 420, maxHeight: 550, overflowY: 'auto' }}>
          {phase === 'ready' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400 }}>
              <div style={{ ...mono, fontSize: 13, color: T.textSec, marginBottom: 8 }}>
                Tick 1: July 16, 2024 — S&P 500 all-time high (5,667)
              </div>
              <div style={{ ...mono, fontSize: 11, color: T.textTer, marginBottom: 20 }}>
                Standard momentum model: &quot;Strong buy.&quot; Let&apos;s see what the .onto engine says.
              </div>
              <button onClick={startTick1} style={{
                ...mono, fontSize: 14, padding: '14px 40px', background: T.accent, color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
              }}>
                ▶ Push Tick 1 — July 16
              </button>
            </div>
          ) : (
            <>
              {allLines.map((line, i) => (
                <div key={i} style={{ ...mono, fontSize: 12, color: line.color, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {line.text || '\u00A0'}
                </div>
              ))}
              {(phase === 'tick1' || phase === 'tick2') && (
                <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }} style={{ ...mono, fontSize: 12, color: T.green }}>▋</motion.span>
              )}
              {phase === 'between' && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <div style={{ ...mono, fontSize: 12, color: T.textSec, marginBottom: 12 }}>
                    No alert on July 16. Smart Money declining but hasn&apos;t crossed threshold. The engine waits. No false positives.
                  </div>
                  <div style={{ ...mono, fontSize: 12, color: T.amber, marginBottom: 16 }}>
                    Now push July 24 — 8 days later. Tech earnings. BOJ rate hike rumors. The Yen starts moving.
                  </div>
                  <button onClick={startTick2} style={{
                    ...mono, fontSize: 14, padding: '14px 40px', background: T.red, color: '#fff',
                    border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
                    boxShadow: `0 0 20px ${T.red}40`,
                  }}>
                    ▶ Push Tick 2 — July 24
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {phase === 'done' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 12 }}>
            {[
              { value: '0.42ms', label: 'Execution time', color: T.green },
              { value: '0.94', label: 'Confidence', color: T.accent },
              { value: '12 days', label: 'Before VIX hit 65', color: T.red },
              { value: '4 assets', label: 'Cross-domain detection', color: T.amber },
            ].map(s => (
              <div key={s.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: 16, textAlign: 'center' }}>
                <div style={{ ...mono, fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ ...mono, fontSize: 10, color: T.textTer }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* 4-Hop Graph Traversal */}
          <div style={{ marginTop: 16, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div style={{ ...mono, fontSize: 10, color: T.accent, marginBottom: 8 }}>GRAPH TRAVERSAL — 4 HOPS, 31 CONNECTED NODES</div>
            <GraphTraversal />
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button onClick={replay} style={{ ...mono, fontSize: 11, color: T.textTer, background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 4, padding: '6px 16px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
              ↺ Replay Sequence
            </button>
          </div>
          <div style={{ marginTop: 16, background: T.surface, border: `1px solid ${T.red}30`, borderRadius: 8, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 15, color: T.text, lineHeight: 1.7 }}>
              On July 24th, <strong>12 days before the historic August 5th VIX spike</strong>, the .onto engine flags a 94% confidence structural break.
              It didn&apos;t need a quant to run a backtest. It didn&apos;t need a data engineer to join the FX tables with sentiment tables.
            </div>
            <div style={{ fontSize: 15, color: T.accent, marginTop: 12, fontWeight: 600 }}>
              If your risk desk had this context on July 24th, you wouldn&apos;t just have avoided the drawdown — you would have heavily monetized it.
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Phase 4: Deterministic AI ──────────────────────────────────
function Phase4() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [chatStep, setChatStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  const typeMessage = (msgIndex: number, nextStep: number) => {
    setTyping(true);
    setTypingText('');
    const fullText = CHAT_MESSAGES[msgIndex].text;
    let i = 0;
    const typeNext = () => {
      if (i >= fullText.length) { setTyping(false); setChatStep(nextStep); return; }
      const char = fullText[i];
      const delay = char === '\n' ? 40 + Math.random() * 80 : char === ' ' ? 10 + Math.random() * 20 : char === '*' ? 5 : 8 + Math.random() * 18;
      i++;
      setTypingText(fullText.slice(0, i));
      setTimeout(typeNext, delay);
    };
    typeNext();
  };

  const startChat = () => {
    setChatStep(1);
    setTimeout(() => typeMessage(1, 2), 800);
  };

  const askFollowUp = () => {
    setChatStep(3);
    setTimeout(() => typeMessage(3, 4), 800);
  };

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatStep, typingText]);

  return (
    <div style={{ padding: isMobile ? '32px 16px' : '48px 64px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ ...mono, fontSize: 11, color: T.accent, letterSpacing: 2, marginBottom: 12 }}>PHASE 4</div>
      <h1 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 700, color: T.text, margin: 0, marginBottom: 8, lineHeight: 1.2 }}>
        Deterministic AI
      </h1>
      <p style={{ color: T.textSec, fontSize: isMobile ? 13 : 14, marginBottom: 24, maxWidth: 800 }}>
        Everyone wants to use LLMs to trade. LLMs hallucinate on flat data. When an AI agent is plugged into Ontos, it doesn&apos;t guess based on text vectors — it receives a deterministic, mathematically verified state of the market with full provenance.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 16 : 24, marginBottom: 32 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24 }}>
          <div style={{ ...mono, fontSize: 11, color: T.red, marginBottom: 16 }}>STANDARD LLM (RAG)</div>
          <div style={{ ...mono, fontSize: 12, color: T.textSec, marginBottom: 12 }}>&gt; &quot;Why did we just hedge the tech portfolio?&quot;</div>
          <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7, fontStyle: 'italic', borderLeft: `2px solid ${T.red}30`, paddingLeft: 12 }}>
            &quot;Based on the available data, there are some concerning signs in the market. The Smart Money/Dumb Money spread has widened, and there has been increased volatility in the Japanese Yen. Some tech breadth indicators are showing weakness. Given these factors, it may be prudent to reduce tech exposure, though past performance is not indicative of future results. This should not be considered financial advice.&quot;
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['No numbers', 'No confidence', 'No provenance', 'Hedged language', 'Text similarity'].map(p => (
              <span key={p} style={{ ...mono, fontSize: 9, color: T.red, background: `${T.red}10`, padding: '3px 8px', borderRadius: 3 }}>{p}</span>
            ))}
          </div>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.accent}30`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ ...mono, fontSize: 11, color: T.accent }}>ONTOS AGENT</div>
            <div style={{ ...mono, fontSize: 10, color: T.textTer }}>Powered by compiled .onto graph</div>
          </div>
          <div ref={chatRef} style={{ padding: 16, minHeight: 320, maxHeight: 400, overflowY: 'auto' }}>
            {chatStep === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
                <button onClick={startChat} style={{ ...mono, fontSize: 12, padding: '12px 28px', background: T.accent, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                  Ask: &quot;Why did we hedge?&quot;
                </button>
              </div>
            )}
            {chatStep >= 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <div style={{ background: T.elevated, borderRadius: '12px 12px 2px 12px', padding: '10px 14px', maxWidth: '80%' }}>
                  <div style={{ fontSize: 13, color: T.text }}>{CHAT_MESSAGES[0].text}</div>
                </div>
              </div>
            )}
            {typing && chatStep === 1 && typingText && (
              <div style={{ background: `${T.accent}08`, border: `1px solid ${T.accent}20`, borderRadius: '12px 12px 12px 2px', padding: '14px 16px' }}>
                <div style={{ fontSize: 13, color: T.text, lineHeight: 1.8, whiteSpace: 'pre-wrap', opacity: 0.8 }}>
                  {typingText}
                  <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }} style={{ color: T.accent }}>▋</motion.span>
                </div>
              </div>
            )}
            {typing && !typingText && (
              <div style={{ display: 'flex', gap: 4, padding: '10px 14px' }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent }} />
                ))}
              </div>
            )}
            {chatStep >= 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ background: `${T.accent}08`, border: `1px solid ${T.accent}20`, borderRadius: '12px 12px 12px 2px', padding: '14px 16px', marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: T.text, lineHeight: 1.8 }}>
                    <RenderMarkdown text={CHAT_MESSAGES[1].text} />
                  </div>
                  <CopyButton text={CHAT_MESSAGES[1].text} />
                </div>
              </motion.div>
            )}
            {/* Follow-up question button */}
            {chatStep === 2 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button onClick={askFollowUp} style={{ ...mono, fontSize: 11, padding: '8px 16px', background: T.elevated, color: T.accent, border: `1px solid ${T.accent}30`, borderRadius: 20, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                  Ask: &quot;What&apos;s the optimal hedge ratio?&quot; →
                </button>
              </motion.div>
            )}
            {/* Follow-up user message */}
            {chatStep >= 3 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <div style={{ background: T.elevated, borderRadius: '12px 12px 2px 12px', padding: '10px 14px', maxWidth: '80%' }}>
                  <div style={{ fontSize: 13, color: T.text }}>{CHAT_MESSAGES[2].text}</div>
                </div>
              </div>
            )}
            {/* Follow-up agent typing */}
            {typing && chatStep === 3 && typingText && (
              <div style={{ background: `${T.accent}08`, border: `1px solid ${T.accent}20`, borderRadius: '12px 12px 12px 2px', padding: '14px 16px' }}>
                <div style={{ fontSize: 13, color: T.text, lineHeight: 1.8, whiteSpace: 'pre-wrap', opacity: 0.8 }}>
                  {typingText}
                  <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }} style={{ color: T.accent }}>▋</motion.span>
                </div>
              </div>
            )}
            {/* Follow-up agent response complete */}
            {chatStep >= 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ background: `${T.accent}08`, border: `1px solid ${T.accent}20`, borderRadius: '12px 12px 12px 2px', padding: '14px 16px' }}>
                  <div style={{ fontSize: 13, color: T.text, lineHeight: 1.8 }}>
                    <RenderMarkdown text={CHAT_MESSAGES[3].text} />
                  </div>
                  <CopyButton text={CHAT_MESSAGES[3].text} />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: T.text, lineHeight: 1.6, maxWidth: 700, margin: '0 auto' }}>
          SentimenTrader gives you the raw signals.<br />
          <span style={{ color: T.accent, fontWeight: 700 }}>The .onto runtime</span> is the only technology that allows your AI agents to read, reason over, and execute on those 3,100 signals — <span style={{ color: T.green }}>deterministically, in milliseconds, without hallucinating.</span>
        </div>
        <div style={{ marginTop: 32 }}>
          <a href="https://cal.com/michael-walker-pamuoj/ontos" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', padding: '14px 40px', background: T.accent, color: '#fff', textDecoration: 'none', borderRadius: 6, fontWeight: 700, fontSize: 15 }}>
            See your indicators compiled → 48h, no cost
          </a>
          <div style={{ ...mono, fontSize: 11, color: T.textTer, marginTop: 10 }}>cal.com/michael-walker-pamuoj/ontos</div>
        </div>
      </div>
    </div>
  );
}

// ─── Footer ──────────────────────────────────────────────────────
function Footer({ phase, setPhase }: { phase: number; setPhase: (p: number) => void }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <div style={{ borderTop: `1px solid ${T.border}`, padding: isMobile ? '16px' : '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 48, flexWrap: isMobile ? 'wrap' : 'nowrap', gap: isMobile ? 12 : 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 20, height: 20, borderRadius: 4, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 10, color: '#fff' }}>O</div>
        <span style={{ ...mono, fontSize: 11, color: T.textTer }}>Built with .onto — Compiled Reasoning Engine</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {phase > 0 && (
          <button onClick={() => setPhase(0)} style={{ ...mono, fontSize: 11, color: T.textTer, background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 4, padding: '5px 12px', cursor: 'pointer' }}>
            ↺ Restart Demo
          </button>
        )}
        {phase < PHASE_NAMES.length - 1 && (
          <button onClick={() => setPhase(phase + 1)} style={{ ...mono, fontSize: 11, color: '#fff', background: T.accent, border: 'none', borderRadius: 4, padding: '5px 12px', cursor: 'pointer' }}>
            Next: {PHASE_NAMES[phase + 1]} →
          </button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ ...mono, fontSize: 10, color: T.textTer }}>← → or swipe</span>
        <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
          {PHASE_NAMES.map((_, i) => (
            <button key={i} onClick={() => setPhase(i)} style={{
              width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
              background: phase === i ? T.accent : phase > i ? T.green : T.textTer,
              transition: 'all 0.2s ease',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────
const PHASES_COMPONENTS = [Phase1, Phase2, Phase3, Phase4];

export default function Page() {
  const [phase, setPhase] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const PhaseComponent = PHASES_COMPONENTS[phase];

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [phase]);

  // Auto-advance: move to next phase every 15 seconds
  useEffect(() => {
    if (!autoAdvance) return;
    const interval = setInterval(() => {
      setPhase(p => {
        if (p >= PHASE_NAMES.length - 1) {
          setAutoAdvance(false);
          return p;
        }
        return p + 1;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [autoAdvance]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setPhase(p => Math.min(p + 1, PHASE_NAMES.length - 1)); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setPhase(p => Math.max(p - 1, 0)); }
    else if (e.key >= '1' && e.key <= '4') setPhase(parseInt(e.key) - 1);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Swipe gestures
  const swipeHandlers = useSwipe(
    useCallback(() => setPhase(p => Math.min(p + 1, PHASE_NAMES.length - 1)), []),
    useCallback(() => setPhase(p => Math.max(p - 1, 0)), []),
  );

  if (!loaded) return <LoadingSkeleton />;

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, fontFamily: "'Inter', sans-serif", position: 'relative' }}
      {...swipeHandlers}>
      {/* Skip to content link for accessibility */}
      <a href="#main-content" style={{ position: 'absolute', left: -9999, top: 'auto', width: 1, height: 1, overflow: 'hidden', zIndex: 100 }}
        onFocus={(e) => { e.currentTarget.style.left = '16px'; e.currentTarget.style.top = '16px'; e.currentTarget.style.width = 'auto'; e.currentTarget.style.height = 'auto'; e.currentTarget.style.overflow = 'visible'; }}
        onBlur={(e) => { e.currentTarget.style.left = '-9999px'; e.currentTarget.style.width = '1px'; e.currentTarget.style.height = '1px'; e.currentTarget.style.overflow = 'hidden'; }}>
        Skip to content
      </a>
      <GridBackground />
      <FloatingParticles />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Header phase={phase} setPhase={setPhase} autoAdvance={autoAdvance} setAutoAdvance={setAutoAdvance} />
        <main id="main-content" role="main" aria-label={`Phase ${phase + 1}: ${PHASE_NAMES[phase]}`}>
        <AnimatePresence mode="wait">
          <motion.div key={phase} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
            <ErrorBoundary phaseName={PHASE_NAMES[phase]}>
              <PhaseComponent />
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
        </main>
        <Footer phase={phase} setPhase={setPhase} />
      </div>
    </div>
  );
}
