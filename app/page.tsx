'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

// ─── Animated Counter Hook ───────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1500, start = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
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
        // Links row: [View X] [View Y]
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
        // Numbered list items
        if (/^\d+\.\s/.test(line)) {
          return <div key={i} style={{ paddingLeft: 8, marginTop: 4 }}>{renderInline(line)}</div>;
        }
        // Bullet items
        if (line.startsWith('- ')) {
          return <div key={i} style={{ paddingLeft: 12, marginTop: 2 }}>{renderInline('• ' + line.slice(2))}</div>;
        }
        // Empty line = spacer
        if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
        // Regular line with inline formatting
        return <div key={i} style={{ marginTop: 2 }}>{renderInline(line)}</div>;
      })}
    </>
  );
}

function renderInline(text: string) {
  // Split by **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── Subtle Grid Background ─────────────────────────────────────
function GridBackground() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundImage: `
        linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
    }}>
      {/* Radial glow at top */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '80%', height: 400,
        background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.06) 0%, transparent 70%)',
      }} />
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0E17', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#fff', margin: '0 auto 12px' }}>O</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#484F58' }}>Loading compiled graph...</div>
      </motion.div>
    </div>
  );
}

// ─── Design Tokens ───────────────────────────────────────────────
const T = {
  bg: '#0A0E17', surface: '#0D1117', elevated: '#161B22', border: '#21262D',
  text: '#E6EDF3', textSec: '#8B949E', textTer: '#484F58',
  accent: '#6366F1', aether: '#7C3AED',
  green: '#3FB950', red: '#F85149', amber: '#D29922', blue: '#58A6FF', cyan: '#39D2C0',
};

const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

// ─── .onto Source Code ───────────────────────────────────────────
const ONTO_FILE = `// ═══════════════════════════════════════════════════════════════
// domain: macro_risk_intelligence.onto
// Compiled Reasoning Engine — SentimenTrader × Ontos
// 3,100 indicators | 28,400 relationships | 847 rules
// ═══════════════════════════════════════════════════════════════

@metadata {
  name: "sentimentrader-macro-risk"
  version: "4.2.1"
  compiled_indicators: 3100
  relationships: 28400
  inference_rules: 847
}

class Indicator {
  extends: "foundation:Signal"
  properties {
    name            : String     @indexed
    category        : Enum(Sentiment, Breadth, Momentum,
                      Volatility, Flow, Options, Credit,
                      Bonds, Commodities, Currencies, Sectors)
    signal_type     : Enum(Contrarian, Confirming, Leading, Lagging)
    reading         : Float
    percentile      : Float      @min(0) @max(100)
    reliability     : Map<Regime, Float>   // regime-conditional
    decay_rate      : Float
  }
}

class Sector {
  extends: "foundation:Entity"
  properties {
    name            : String
    beta            : Float
    breadth_indicators : List<Reference<Indicator>>
    mcclellan_oscillator : Float
  }
}

class CurrencyPair {
  extends: "foundation:Entity"
  properties {
    pair            : String     // e.g. "JPY/USD"
    spot            : Float
    volatility_index : TimeSeries<Float>
  }
}

class MarketRegime {
  extends: "foundation:State"
  properties {
    status          : Enum(live, closed, halted)
    sentiment       : SentimentState
    sectors         : List<Reference<Sector>>
    currencies      : Map<String, Reference<CurrencyPair>>
    volatility      : VolatilityState
  }
}

@relationships {
  relationship confirms {
    from: Indicator → to: Indicator
    strength: Float
    regime_strength: Map<Regime, Float>
  }
  relationship contradicts {
    from: Indicator → to: Indicator
    strength: Float
    resolution: Enum(HigherReliability, RegimeDependent)
  }
  relationship leads {
    from: Indicator → to: Indicator
    avg_lead_days: Integer
    confidence_at_lag: List<Float>
  }
}

// ═══════════════════════════════════════════════════════════════
// rule: carry_trade_unwind_detection
// Cross-asset: Currencies × Sentiment × Breadth × Volatility
// ═══════════════════════════════════════════════════════════════

rule systemic_carry_unwind {

  match market: MarketRegime
  where market.status == "live"

    // 1. The SentimenTrader Core Setup (The Spread)
    //    Smart Money exiting while Dumb Money piles in
    and market.sentiment.smart_money_confidence < 30
    and market.sentiment.dumb_money_confidence > 80

    // 2. The Cross-Asset Trigger (Currency Volatility)
    //    Yen strengthening = carry trade unwinding
    and market.currencies.jpy_usd
      .volatility_index(lookback: 10d) > 1.5_sigma

    // 3. The Under-the-Hood Breadth Collapse
    //    Tech looks fine on the surface. McClellan says otherwise.
    and market.sectors.tech.mcclellan_oscillator < -40

    // 4. The Options Warning
    //    VIX term structure flattening = smart vol traders hedging
    and market.volatility.vix_term_structure == "flattening"

  then {
    flag: "severe_cross_asset_unwind",
    severity: "critical",
    confidence: calculate_graph_confidence(market.provenance),
    action: alert("quant_risk_desk", {
      regime_shift: "carry_trade_liquidation",
      implied_drawdown_risk: "high",
      suggested_action:
        "de-gross_tech_exposure_and_buy_vix_calls"
    })
  }
}`;

// ─── Terminal Output Lines ───────────────────────────────────────
// Two ticks: July 16 (no fire) and July 24 (fire)
const TICK1_OUTPUT = [
  { text: '$ ontos feed --source sentimentrader --tick 2024-07-16T15:59:00Z', color: T.text, delay: 0 },
  { text: '', color: T.textTer, delay: 100 },
  { text: '[ontos-rt] Loading compiled graph: macro_risk_intelligence.onto', color: T.textTer, delay: 200 },
  { text: '[ontos-rt] Graph loaded: 3,100 nodes, 28,400 edges, 847 rules', color: T.textTer, delay: 400 },
  { text: '[ontos-rt] Feeding tick: 2024-07-16 (S&P 500 all-time high: 5,667)', color: T.textTer, delay: 600 },
  { text: '', color: T.textTer, delay: 700 },
  { text: '[tick] Smart Money Confidence: 34% (↓ from 41%)', color: T.amber, delay: 800 },
  { text: '[tick] Dumb Money Confidence: 76% (↑ from 71%)', color: T.amber, delay: 950 },
  { text: '[tick] JPY/USD 10d volatility: 0.9σ', color: T.textSec, delay: 1100 },
  { text: '[tick] XLK McClellan Oscillator: +12', color: T.textSec, delay: 1250 },
  { text: '[tick] VIX Term Structure: contango (normal)', color: T.textSec, delay: 1400 },
  { text: '', color: T.textTer, delay: 1500 },
  { text: '[eval] Rule: systemic_carry_unwind', color: T.accent, delay: 1600 },
  { text: '[eval]   smart_money = 34%              →  < 30 ✗  (not yet)', color: T.red, delay: 1800 },
  { text: '[eval]   Rule NOT fired. Monitoring.', color: T.textTer, delay: 2000 },
  { text: '[ontos-rt] Tick processed in 0.31ms. No alerts.', color: T.textTer, delay: 2200 },
];

const TICK2_OUTPUT = [
  { text: '', color: T.textTer, delay: 0 },
  { text: '─── 8 days later ───', color: T.textTer, delay: 200 },
  { text: '', color: T.textTer, delay: 300 },
  { text: '$ ontos feed --source sentimentrader --tick 2024-07-24T14:02:00Z', color: T.text, delay: 400 },
  { text: '[ontos-rt] Feeding tick: 2024-07-24', color: T.textTer, delay: 600 },
  { text: '', color: T.textTer, delay: 700 },
  { text: '[tick] Smart Money Confidence: 28% (↓↓ from 34%)', color: T.amber, delay: 800 },
  { text: '[tick] Dumb Money Confidence: 84% (↑↑ from 76%)', color: T.amber, delay: 950 },
  { text: '[tick] JPY/USD 10d volatility: 1.8σ (SPIKE — BOJ rate hike speculation)', color: T.red, delay: 1100 },
  { text: '[tick] XLK McClellan Oscillator: -45 (COLLAPSE from +12)', color: T.red, delay: 1300 },
  { text: '[tick] VIX Term Structure: FLATTENING (front month catching back)', color: T.red, delay: 1500 },
  { text: '', color: T.textTer, delay: 1600 },
  { text: '[eval] Rule: systemic_carry_unwind', color: T.accent, delay: 1700 },
  { text: '[eval]   smart_money = 28%              →  < 30 ✓', color: T.green, delay: 1900 },
  { text: '[eval]   dumb_money = 84%               →  > 80 ✓', color: T.green, delay: 2100 },
  { text: '[eval]   jpy_vol = 1.8σ                 →  > 1.5σ ✓', color: T.green, delay: 2300 },
  { text: '[eval]   xlk_mcclellan = -45            →  < -40 ✓', color: T.green, delay: 2500 },
  { text: '[eval]   vix_term = flattening          →  == flattening ✓', color: T.green, delay: 2700 },
  { text: '', color: T.textTer, delay: 2800 },
  { text: '[eval]   ALL CONDITIONS MET. Computing graph confidence...', color: T.accent, delay: 2900 },
  { text: '[eval]   Traversing: SmartMoney → JPY_Vol → McClellan → VIX (4 hops, 31 nodes)', color: T.accent, delay: 3100 },
  { text: '[eval]   Cross-asset correlation: Sentiment × Currency × Breadth × Volatility', color: T.accent, delay: 3300 },
  { text: '', color: T.textTer, delay: 3400 },
  { text: '🔥 RULE FIRED: systemic_carry_unwind', color: T.red, delay: 3500 },
  { text: '', color: T.textTer, delay: 3600 },
  { text: '{', color: T.text, delay: 3700 },
  { text: '  "timestamp": "2024-07-24T14:02:01Z",', color: T.textSec, delay: 3750 },
  { text: '  "execution_time_ms": 0.42,', color: T.green, delay: 3800 },
  { text: '  "alert": "severe_cross_asset_unwind",', color: T.red, delay: 3850 },
  { text: '  "severity": "critical",', color: T.red, delay: 3900 },
  { text: '  "confidence": 0.94,', color: T.green, delay: 3950 },
  { text: '  "regime_shift": "carry_trade_liquidation",', color: T.amber, delay: 4000 },
  { text: '  "trigger_nodes": [', color: T.text, delay: 4050 },
  { text: '    "SentimenTrader_SmartMoney_28%",', color: T.cyan, delay: 4100 },
  { text: '    "SentimenTrader_DumbMoney_84%",', color: T.cyan, delay: 4150 },
  { text: '    "FX_JPY_Vol_Spike_1.8σ",', color: T.cyan, delay: 4200 },
  { text: '    "SentimenTrader_XLK_McClellan_-45",', color: T.cyan, delay: 4250 },
  { text: '    "VIX_TermStructure_Flattening"', color: T.cyan, delay: 4300 },
  { text: '  ],', color: T.text, delay: 4350 },
  { text: '  "provenance": {', color: T.text, delay: 4400 },
  { text: '    "sentiment": { "source": "SentimenTrader", "reliability": 0.93 },', color: T.cyan, delay: 4450 },
  { text: '    "currency": { "source": "SentimenTrader + BOJ", "reliability": 0.89 },', color: T.cyan, delay: 4500 },
  { text: '    "breadth": { "source": "SentimenTrader", "reliability": 0.87 },', color: T.cyan, delay: 4550 },
  { text: '    "volatility": { "source": "CBOE", "reliability": 0.91 }', color: T.cyan, delay: 4600 },
  { text: '  },', color: T.text, delay: 4650 },
  { text: '  "suggested_action": "de-gross_tech_exposure_and_buy_vix_calls",', color: T.accent, delay: 4700 },
  { text: '  "implied_drawdown_risk": "high"', color: T.red, delay: 4750 },
  { text: '}', color: T.text, delay: 4800 },
  { text: '', color: T.textTer, delay: 4900 },
  { text: '[ontos-rt] Execution time: 0.42ms', color: T.green, delay: 5000 },
  { text: '[ontos-rt] Alert dispatched to: quant_risk_desk, portfolio_mgr', color: T.green, delay: 5100 },
  { text: '[ontos-rt] AI agent context updated with deterministic state', color: T.green, delay: 5200 },
];

// ─── AI Chat Messages ────────────────────────────────────────────
const CHAT_MESSAGES = [
  {
    role: 'user' as const,
    text: 'Why did we just de-gross the tech portfolio and buy VIX calls?',
    delay: 0,
  },
  {
    role: 'agent' as const,
    text: `A severe cross-asset carry trade unwind was detected at 14:02 UTC on July 24. Confidence: **0.94**.

**4 simultaneous trigger conditions (cross-asset):**

1. SentimenTrader Smart Money Confidence: **28%** (threshold: <30%)
   Smart Money exiting while Dumb Money at **84%** (threshold: >80%)
   → Source: SentimenTrader Daily, reliability 0.93

2. JPY/USD 10-day volatility spiked to **1.8σ** (threshold: >1.5σ)
   BOJ rate hike speculation driving Yen carry trade unwinding
   → Source: SentimenTrader + BOJ, reliability 0.89

3. XLK McClellan Oscillator collapsed to **-45** (threshold: <-40)
   Tech breadth deteriorating under the surface despite index near highs
   → Source: SentimenTrader, reliability 0.87

4. VIX term structure **flattening** — front month catching back months
   Smart volatility traders already hedging
   → Source: CBOE, reliability 0.91

**Graph traversal:** SmartMoney → JPY_Vol → McClellan → VIX (4 hops, 31 connected nodes). Cross-asset correlation across Sentiment × Currency × Breadth × Volatility.

**What happened next:** On August 5th — 12 days later — VIX exploded to 65. S&P 500 dropped 8.5% in 3 sessions. The Yen strengthened 12% against USD. This alert fired with 0.94 confidence and 0.42ms execution time.

[View Graph Traversal Path] [View Provenance Chain] [View Full Event Timeline]`,
    delay: 1500,
  },
];

// ─── Phase Component ─────────────────────────────────────────────
const PHASE_NAMES = ['The Problem', 'The .onto Engine', 'Live Tick', 'Deterministic AI'];

function Header({ phase, setPhase }: { phase: number; setPhase: (p: number) => void }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      {/* Progress bar */}
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
        <div style={{ display: 'flex', gap: 2, order: isMobile ? 3 : 0, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-start' }}>
          {PHASE_NAMES.map((p, i) => (
            <button key={i} onClick={() => setPhase(i)} style={{
              padding: isMobile ? '6px 8px' : '6px 14px', borderRadius: 4, border: 'none', cursor: 'pointer', ...mono, fontSize: isMobile ? 10 : 11,
              background: phase === i ? T.accent : 'transparent',
              color: phase === i ? '#fff' : phase > i ? T.green : T.textTer,
              transition: 'all 0.2s ease', flex: isMobile ? 1 : 'none', textAlign: 'center',
            }}>
              {isMobile ? `${i + 1}` : `${i + 1}. ${p}`}
            </button>
          ))}
        </div>
        {!isMobile && (
          <div style={{ ...mono, fontSize: 11, color: T.aether, border: `1px solid ${T.aether}40`, borderRadius: 4, padding: '5px 12px' }}>
            AETHER / SENTIMENTRADER
          </div>
        )}
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

      {/* Animated stats banner */}
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
        {/* Current approach */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: isMobile ? 8 : '8px 0 0 8px', padding: isMobile ? 16 : 24 }}>
          <div style={{ ...mono, fontSize: 11, color: T.red, marginBottom: 16 }}>YOUR CURRENT STACK</div>
          <div style={{ ...mono, fontSize: 12, color: T.textSec, lineHeight: 2.2 }}>
            <div>1. Join sentiment tables with FX volatility data (different schemas)</div>
            <div>2. Align tick frequencies (sentiment=daily, FX=intraday, VIX=real-time)</div>
            <div>3. Execute <span style={{ color: T.red, fontWeight: 700 }}>cross-asset table joins</span> across 4 data domains</div>
            <div>4. Scan sector breadth arrays for hidden divergence</div>
            <div>5. Compute σ-scores with rolling windows on FX vol</div>
            <div>6. Check VIX term structure shape (custom curve logic)</div>
            <div>7. Aggregate into alertable signal with provenance</div>
          </div>
          <div style={{ marginTop: 20, padding: 12, background: `${T.red}10`, borderRadius: 6 }}>
            <div style={{ ...mono, fontSize: 18, fontWeight: 700, color: T.red }}>O(N<sup>k</sup>)</div>
            <div style={{ ...mono, fontSize: 11, color: T.textSec, marginTop: 4 }}>
              where k = number of indicator tables<br />
              Hours to code the pipeline. Minutes to execute.
            </div>
          </div>
        </div>

        {/* vs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...mono, fontSize: 14, color: T.textTer }}>vs.</div>
        </div>

        {/* Ontos */}
        <div style={{ background: T.surface, border: `1px solid ${T.accent}30`, borderRadius: isMobile ? 8 : '0 8px 8px 0', padding: isMobile ? 16 : 24 }}>
          <div style={{ ...mono, fontSize: 11, color: T.accent, marginBottom: 16 }}>ONTOS COMPILED GRAPH</div>
          <div style={{ ...mono, fontSize: 12, color: T.textSec, lineHeight: 2.2 }}>
            <div>1. All 3,100 indicators are <span style={{ color: T.accent }}>nodes in a compiled graph</span></div>
            <div>2. 28,400 relationships are <span style={{ color: T.accent }}>pre-computed edges</span></div>
            <div>3. <span style={{ color: T.accent }}>One rule</span> in .onto syntax replaces the entire pipeline</div>
            <div>4. Graph traversal evaluates all conditions simultaneously</div>
            <div>5. Confidence computed across connected nodes</div>
            <div>6. Provenance chain tracked automatically</div>
            <div>7. Fires proactively on every data tick</div>
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

  const colorizeLine = (line: string): React.ReactNode => {
    const trimmed = line.trim();
    // Comments — dim italic
    if (trimmed.startsWith('//')) return <span style={{ color: T.textTer, fontStyle: 'italic' }}>{line}</span>;
    // Decorators
    if (trimmed.startsWith('@')) return <span style={{ color: T.accent, fontWeight: 600 }}>{line}</span>;
    // Keywords: rule, class, relationship, extends
    if (/^\s*(rule|class|relationship)\s/.test(line)) {
      return highlightTokens(line, { keywords: [trimmed.split(/\s/)[0]], nameColor: T.text });
    }
    // Control flow: match, where, and, then
    if (/^\s*(match|where|then|and)\s/.test(line)) {
      return highlightTokens(line, { keywords: [trimmed.split(/\s/)[0]] });
    }
    // Lines with string literals
    if (line.includes('"')) return highlightStringsAndTypes(line);
    // Lines with types
    if (/\b(String|Float|Integer|List|Map|Enum|Boolean|TimeSeries|Reference)\b/.test(line)) return highlightStringsAndTypes(line);
    return <span style={{ color: T.textSec }}>{line}</span>;
  };

  const highlightTokens = (line: string, opts: { keywords: string[]; nameColor?: string }): React.ReactNode => {
    const keyword = opts.keywords[0];
    const idx = line.indexOf(keyword);
    const before = line.slice(0, idx);
    const after = line.slice(idx + keyword.length);
    const nameMatch = after.match(/^\s+(\w+)/);
    if (nameMatch) {
      const nameStart = after.indexOf(nameMatch[1]);
      return (
        <span style={{ color: T.textSec }}>
          {before}<span style={{ color: T.aether, fontWeight: 600 }}>{keyword}</span>
          {after.slice(0, nameStart)}<span style={{ color: opts.nameColor || T.cyan, fontWeight: 600 }}>{nameMatch[1]}</span>
          {highlightStringsAndTypes(after.slice(nameStart + nameMatch[1].length))}
        </span>
      );
    }
    return <span style={{ color: T.textSec }}>{before}<span style={{ color: T.accent, fontWeight: 600 }}>{keyword}</span>{highlightStringsAndTypes(after)}</span>;
  };

  const highlightStringsAndTypes = (text: string): React.ReactNode => {
    // Split on strings and type keywords
    const parts = text.split(/("(?:[^"\\]|\\.)*")/g);
    return (
      <span style={{ color: T.textSec }}>
        {parts.map((part, i) => {
          if (part.startsWith('"')) return <span key={i} style={{ color: T.green }}>{part}</span>;
          // Highlight type keywords within non-string parts
          const typeParts = part.split(/\b(String|Float|Integer|List|Map|Enum|Boolean|TimeSeries|Reference)\b/g);
          return typeParts.map((tp, j) => {
            if (/^(String|Float|Integer|List|Map|Enum|Boolean|TimeSeries|Reference)$/.test(tp)) {
              return <span key={`${i}-${j}`} style={{ color: T.amber }}>{tp}</span>;
            }
            // Highlight numbers
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

  // Highlight the contagion rule section
  const isRuleLine = (i: number) => {
    const ruleStart = codeLines.findIndex(l => l.includes('rule hidden_liquidity_drain'));
    return ruleStart >= 0 && i >= ruleStart && i < codeLines.length;
  };

  return (
    <div style={{ padding: isMobile ? '32px 16px' : '48px 64px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ ...mono, fontSize: 11, color: T.accent, letterSpacing: 2, marginBottom: 12 }}>PHASE 2</div>
      <h1 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 700, color: T.text, margin: 0, marginBottom: 8, lineHeight: 1.2 }}>
        The .onto Engine
      </h1>
      <p style={{ color: T.textSec, fontSize: 14, marginBottom: 24 }}>
        No SQL. No Python glue. One compiled specification that models your entire indicator universe — entities, relationships, and forward-reasoning rules.
      </p>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
        {/* Title bar */}
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

        {/* Code */}
        <div ref={codeRef} style={{ maxHeight: 580, overflowY: 'auto', padding: '12px 0' }}>
          {codeLines.slice(0, linesVisible).map((line, i) => (
            <div key={i} style={{
              display: 'flex', padding: '0 16px', lineHeight: 1.65,
              background: isRuleLine(i) ? `${T.accent}06` : 'transparent',
            }}>
              <span style={{ ...mono, fontSize: 12, color: T.textTer, width: 36, textAlign: 'right', marginRight: 16, userSelect: 'none', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ ...mono, fontSize: 12, whiteSpace: 'pre' }}>{colorizeLine(line)}</span>
            </div>
          ))}
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
      <p style={{ color: T.textSec, fontSize: isMobile ? 13 : 14, marginBottom: 24 }}>
        July 16, 2024: S&P 500 hits all-time high. Standard momentum models say &quot;Buy.&quot; Twelve days later, VIX explodes to 65 and tech craters. Two ticks. Watch what the .onto engine sees that your current stack doesn&apos;t.
      </p>

      {/* Terminal */}
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
          <span style={{ ...mono, fontSize: 10, color: 
            phase === 'done' ? T.green : 
            phase === 'between' ? T.amber :
            phase !== 'ready' ? T.amber : T.textTer
          }}>
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
              {/* Blinking cursor */}
              {(phase === 'tick1' || phase === 'tick2') && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ ...mono, fontSize: 12, color: T.green }}
                >▋</motion.span>
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
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: 16, textAlign: 'center' }}>
              <div style={{ ...mono, fontSize: 24, fontWeight: 700, color: T.green }}>0.42ms</div>
              <div style={{ ...mono, fontSize: 10, color: T.textTer }}>Execution time</div>
            </div>
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: 16, textAlign: 'center' }}>
              <div style={{ ...mono, fontSize: 24, fontWeight: 700, color: T.accent }}>0.94</div>
              <div style={{ ...mono, fontSize: 10, color: T.textTer }}>Confidence</div>
            </div>
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: 16, textAlign: 'center' }}>
              <div style={{ ...mono, fontSize: 24, fontWeight: 700, color: T.red }}>12 days</div>
              <div style={{ ...mono, fontSize: 10, color: T.textTer }}>Before VIX hit 65</div>
            </div>
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: 16, textAlign: 'center' }}>
              <div style={{ ...mono, fontSize: 24, fontWeight: 700, color: T.amber }}>4 assets</div>
              <div style={{ ...mono, fontSize: 10, color: T.textTer }}>Cross-domain detection</div>
            </div>
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

  const startChat = () => {
    setChatStep(1);
    setTimeout(() => {
      setTyping(true);
      // Variable speed typing simulation
      const fullText = CHAT_MESSAGES[1].text;
      let i = 0;
      const typeNext = () => {
        if (i >= fullText.length) {
          setTyping(false);
          setChatStep(2);
          return;
        }
        // Vary speed: faster for spaces/newlines, slower for start of words
        const char = fullText[i];
        const delay = char === '\n' ? 40 + Math.random() * 80
          : char === ' ' ? 10 + Math.random() * 20
          : char === '*' ? 5
          : 8 + Math.random() * 18;
        i++;
        setTypingText(fullText.slice(0, i));
        setTimeout(typeNext, delay);
      };
      typeNext();
    }, 800);
  };

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatStep, typing]);

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
        {/* Standard LLM */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24 }}>
          <div style={{ ...mono, fontSize: 11, color: T.red, marginBottom: 16 }}>STANDARD LLM (RAG)</div>
          <div style={{ ...mono, fontSize: 12, color: T.textSec, marginBottom: 12 }}>
            &gt; &quot;Why did we just hedge the tech portfolio?&quot;
          </div>
          <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7, fontStyle: 'italic', borderLeft: `2px solid ${T.red}30`, paddingLeft: 12 }}>
            &quot;Based on the available data, there are some concerning signs in the market. The Smart Money/Dumb Money spread has widened, and there has been increased volatility in the Japanese Yen. Some tech breadth indicators are showing weakness. Given these factors, it may be prudent to reduce tech exposure, though past performance is not indicative of future results. This should not be considered financial advice.&quot;
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['No numbers', 'No confidence', 'No provenance', 'Hedged language', 'Text similarity'].map(p => (
              <span key={p} style={{ ...mono, fontSize: 9, color: T.red, background: `${T.red}10`, padding: '3px 8px', borderRadius: 3 }}>{p}</span>
            ))}
          </div>
        </div>

        {/* Ontos Agent */}
        <div style={{ background: T.surface, border: `1px solid ${T.accent}30`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ ...mono, fontSize: 11, color: T.accent }}>ONTOS AGENT</div>
            <div style={{ ...mono, fontSize: 10, color: T.textTer }}>Powered by compiled .onto graph</div>
          </div>
          <div ref={chatRef} style={{ padding: 16, minHeight: 320, maxHeight: 400, overflowY: 'auto' }}>
            {chatStep === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
                <button onClick={startChat} style={{
                  ...mono, fontSize: 12, padding: '12px 28px', background: T.accent, color: '#fff',
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                }}>
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

            {typing && typingText && (
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
                <div style={{ background: `${T.accent}08`, border: `1px solid ${T.accent}20`, borderRadius: '12px 12px 12px 2px', padding: '14px 16px' }}>
                  <div style={{ fontSize: 13, color: T.text, lineHeight: 1.8 }}>
                    <RenderMarkdown text={CHAT_MESSAGES[1].text} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Closing */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: T.text, lineHeight: 1.6, maxWidth: 700, margin: '0 auto' }}>
          SentimenTrader gives you the raw signals.<br />
          <span style={{ color: T.accent, fontWeight: 700 }}>The .onto runtime</span> is the only technology that allows your AI agents to read, reason over, and execute on those 3,100 signals — <span style={{ color: T.green }}>deterministically, in milliseconds, without hallucinating.</span>
        </div>

        <div style={{ marginTop: 32 }}>
          <a
            href="https://cal.com/michael-walker-pamuoj/ontos"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', padding: '14px 40px', background: T.accent, color: '#fff',
              textDecoration: 'none', borderRadius: 6, fontWeight: 700, fontSize: 15,
            }}
          >
            See your indicators compiled → 48h, no cost
          </a>
          <div style={{ ...mono, fontSize: 11, color: T.textTer, marginTop: 10 }}>
            cal.com/michael-walker-pamuoj/ontos
          </div>
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
        <span style={{ ...mono, fontSize: 10, color: T.textTer }}>← → to navigate</span>
        {/* Phase dots */}
        <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
          {PHASE_NAMES.map((_, i) => (
            <button
              key={i}
              onClick={() => setPhase(i)}
              style={{
                width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
                background: phase === i ? T.accent : phase > i ? T.green : T.textTer,
                transition: 'all 0.2s ease',
              }}
            />
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
  const PhaseComponent = PHASES_COMPONENTS[phase];

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Smooth scroll to top on phase change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [phase]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setPhase(p => Math.min(p + 1, PHASE_NAMES.length - 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setPhase(p => Math.max(p - 1, 0));
    } else if (e.key >= '1' && e.key <= '4') {
      setPhase(parseInt(e.key) - 1);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!loaded) return <LoadingSkeleton />;

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, fontFamily: "'Inter', sans-serif", position: 'relative' }}>
      <GridBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Header phase={phase} setPhase={setPhase} />
        <AnimatePresence mode="wait">
          <motion.div key={phase} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
            <PhaseComponent />
          </motion.div>
        </AnimatePresence>
        <Footer phase={phase} setPhase={setPhase} />
      </div>
    </div>
  );
}
