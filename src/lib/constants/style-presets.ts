/**
 * Style Presets
 *
 * Maps discovery style signals to product catalog codes.
 * When the AI detects "coastal, light, warm" from Sarah's choices,
 * this maps those signals to actual materials, hardware, and doors.
 */

// ============================================================================
// STYLE THEMES
// ============================================================================

export interface StylePreset {
  id: string;
  name: string;            // Internal name
  label: string;           // What Sarah sees (never shown directly — AI uses it)
  signals: string[];       // Style signals that match this preset
  finishes: {
    material: string;      // Product catalog material code
    hardware: string;      // Product catalog hardware code
    doorProfile: string;   // Product catalog door profile code
  };
  budgetTier: 'value' | 'mid' | 'premium';
  description: string;     // For AI to describe the look
}

export const STYLE_PRESETS: StylePreset[] = [
  // ── Light & Warm ──
  {
    id: 'coastal-light',
    name: 'Coastal Light',
    label: 'Light and airy',
    signals: ['light', 'warm', 'coastal', 'beach', 'hamptons', 'relaxed'],
    finishes: {
      material: 'POL-NOWM',        // Natural Oak Woodmatt
      hardware: 'HW-BRASS-BAR',    // Brass bar handles
      doorProfile: 'DP-SHAKER',    // Classic shaker
    },
    budgetTier: 'mid',
    description: 'Light oak with brass handles and classic framed doors — warm, inviting, timeless.',
  },

  // ── Clean & Minimal ──
  {
    id: 'minimal-white',
    name: 'Minimal White',
    label: 'Clean and simple',
    signals: ['minimal', 'clean', 'white', 'simple', 'modern', 'bright'],
    finishes: {
      material: 'POL-CWSM',        // Classic White Satin
      hardware: 'HW-BLACK-BAR',    // Matte black bar
      doorProfile: 'DP-FLAT',      // Flat/slab panel
    },
    budgetTier: 'value',
    description: 'Crisp white with matte black handles and smooth flat doors — clean, modern, easy to maintain.',
  },

  // ── Dark & Moody ──
  {
    id: 'dark-timber',
    name: 'Dark Timber',
    label: 'Rich and moody',
    signals: ['dark', 'moody', 'timber', 'rich', 'dramatic', 'textured'],
    finishes: {
      material: 'POL-BTWM',        // Black Timber Woodmatt
      hardware: 'HW-BLACK-KNOB',   // Matte black knobs
      doorProfile: 'DP-SHAKER',    // Classic shaker
    },
    budgetTier: 'mid',
    description: 'Dark timber with black hardware and classic framed doors — sophisticated, bold, character-filled.',
  },

  // ── Classic Traditional ──
  {
    id: 'classic-cream',
    name: 'Classic Cream',
    label: 'Traditional and warm',
    signals: ['traditional', 'classic', 'cream', 'country', 'farmhouse', 'heritage'],
    finishes: {
      material: 'POL-ACSM',        // Antique Cream Satin
      hardware: 'HW-BRASS-KNOB',   // Brass knobs
      doorProfile: 'DP-RAISED',    // Raised panel
    },
    budgetTier: 'mid',
    description: 'Cream cabinetry with brass knobs and raised panel doors — classic, homey, elegant.',
  },

  // ── Scandinavian ──
  {
    id: 'scandi-pale',
    name: 'Scandinavian',
    label: 'Pale and natural',
    signals: ['scandi', 'scandinavian', 'pale', 'birch', 'natural', 'nordic'],
    finishes: {
      material: 'POL-PBWM',        // Pale Birch Woodmatt
      hardware: 'HW-WHITE-BAR',    // White bar handles
      doorProfile: 'DP-FLAT',      // Flat panel
    },
    budgetTier: 'value',
    description: 'Pale birch with white handles and flat doors — calm, airy, effortlessly modern.',
  },

  // ── Premium Dark ──
  {
    id: 'premium-charcoal',
    name: 'Premium Charcoal',
    label: 'High-end dark',
    signals: ['luxury', 'premium', 'charcoal', 'high-end', 'designer', 'sleek'],
    finishes: {
      material: 'POL-CGSM',        // Charcoal Grey Satin
      hardware: 'HW-BRASS-BAR',    // Brass bar handles
      doorProfile: 'DP-SLIMSHAKER', // Slimline shaker
    },
    budgetTier: 'premium',
    description: 'Charcoal with brass accents and slimline shaker doors — refined, contemporary, premium.',
  },

  // ── Two-Tone ──
  {
    id: 'two-tone-oak',
    name: 'Two-Tone',
    label: 'Mixed tones',
    signals: ['two-tone', 'mixed', 'contrast', 'variety'],
    finishes: {
      material: 'POL-NOWM',        // Natural Oak base, white overheads
      hardware: 'HW-BLACK-BAR',    // Matte black bar
      doorProfile: 'DP-SHAKER',    // Classic shaker
    },
    budgetTier: 'mid',
    description: 'Natural oak bases with white wall cabinets and black hardware — balanced, interesting, on-trend.',
  },
];

// ============================================================================
// STYLE MATCHING
// ============================================================================

/**
 * Find the best style preset from user's style signals.
 * Style signals come from the visual preference questions in discovery.
 *
 * @param signals - Array of style keywords detected from user choices
 * @param budgetTier - User's stated budget tier
 * @returns The best matching preset, or the default (coastal light)
 */
export function matchStylePreset(
  signals: string[],
  budgetTier: 'value' | 'mid' | 'premium' | 'unknown' = 'unknown',
): StylePreset {
  const normalised = signals.map(s => s.toLowerCase().trim());

  let bestMatch: StylePreset | null = null;
  let bestScore = 0;

  for (const preset of STYLE_PRESETS) {
    let score = 0;

    // Count matching signals
    for (const signal of preset.signals) {
      if (normalised.includes(signal)) {
        score += 2;
      }
      // Partial match (signal appears in any user signal)
      if (normalised.some(n => n.includes(signal) || signal.includes(n))) {
        score += 1;
      }
    }

    // Bonus for budget tier match
    if (budgetTier !== 'unknown' && preset.budgetTier === budgetTier) {
      score += 1;
    }

    // Penalty for premium preset when budget is value
    if (budgetTier === 'value' && preset.budgetTier === 'premium') {
      score -= 3;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = preset;
    }
  }

  // Default to coastal light if no good match
  return bestMatch ?? STYLE_PRESETS[0];
}

// ============================================================================
// STYLE COMPARISON PAIRS (for discovery visual preference flow)
// ============================================================================

export interface StylePair {
  optionA: {
    presetId: string;
    imageKey: string;      // Key for the comparison image
    signals: string[];     // Signals this choice adds
  };
  optionB: {
    presetId: string;
    imageKey: string;
    signals: string[];
  };
}

/**
 * Visual comparison pairs for the discovery "which feels more like you" flow.
 * 3 rounds narrows down style precisely.
 */
export const STYLE_COMPARISON_PAIRS: StylePair[] = [
  // Round 1: Light vs Dark
  {
    optionA: { presetId: 'coastal-light', imageKey: 'compare-light-warm', signals: ['light', 'warm'] },
    optionB: { presetId: 'dark-timber',   imageKey: 'compare-dark-moody', signals: ['dark', 'moody'] },
  },
  // Round 2 (if light): Minimal vs Classic
  {
    optionA: { presetId: 'minimal-white', imageKey: 'compare-minimal-clean', signals: ['minimal', 'clean', 'modern'] },
    optionB: { presetId: 'classic-cream', imageKey: 'compare-classic-warm',  signals: ['classic', 'traditional', 'warm'] },
  },
  // Round 3 (if dark): Timber vs Sleek
  {
    optionA: { presetId: 'dark-timber',       imageKey: 'compare-dark-timber',    signals: ['timber', 'textured', 'natural'] },
    optionB: { presetId: 'premium-charcoal',  imageKey: 'compare-charcoal-sleek', signals: ['charcoal', 'sleek', 'premium'] },
  },
];
