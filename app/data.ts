// ─── Design Tokens ───────────────────────────────────────────────
export const T = {
  bg: '#0A0E17', surface: '#0D1117', elevated: '#161B22', border: '#21262D',
  text: '#E6EDF3', textSec: '#8B949E', textTer: '#484F58',
  accent: '#6366F1', aether: '#7C3AED',
  green: '#3FB950', red: '#F85149', amber: '#D29922', blue: '#58A6FF', cyan: '#39D2C0',
};

export const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

export const PHASE_NAMES = ['The Problem', 'The .onto Engine', 'Live Tick', 'Deterministic AI'];

// ─── .onto Source Code ───────────────────────────────────────────
export const ONTO_FILE = `// ═══════════════════════════════════════════════════════════════
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
export const TICK1_OUTPUT = [
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

export const TICK2_OUTPUT = [
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
export const CHAT_MESSAGES = [
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
  {
    role: 'user' as const,
    text: 'What\'s the optimal hedge ratio for this scenario?',
    delay: 0,
  },
  {
    role: 'agent' as const,
    text: `Based on the compiled graph state and historical regime analysis:

**Recommended hedge ratio: 0.62× notional tech exposure**

1. **VIX call spread:** Buy Aug 20/30 call spread at **1.8:1 ratio**
   Current VIX at 14.2 → modeled fair value under carry unwind: 38-52
   → Provenance: VIX term structure node + 847 historical regime matches

2. **JPY/USD position:** Long Yen at **0.15× portfolio NAV**
   Yen carry unwind historically amplifies equity vol by 2.3×
   → Provenance: JPY_Vol → EquityVol edge, correlation 0.87

3. **De-gross tech longs by 40%** — breadth collapse implies distribution
   McClellan at -45 with index near highs = classic stealth distribution
   → Provenance: McClellan → TechBreadth → IndexDivergence path

**Expected P&L under scenario:** +3.2% portfolio vs -8.5% unhedged
**Confidence interval:** 89% (based on 31 connected nodes, 4-hop traversal)

[Execute Hedge] [Backtest This Scenario] [Export to OMS]`,
    delay: 1500,
  },
];
