/**
 * Pricing Engine
 *
 * Catalog-based range pricing that takes a CabinetConfig
 * and returns a price range (low, estimate, high) with
 * plain-language breakdown.
 *
 * Returns RANGES not exact prices — manages expectations
 * that the final quote comes after a site measure.
 */

import type {
  CabinetConfig,
  ModuleType,
} from '@/types/configurator';

// ============================================================================
// OUTPUT TYPES
// ============================================================================

export interface PriceRange {
  lowCents: number;
  estimateCents: number;
  highCents: number;
}

export interface PriceBreakdownItem {
  category: string;       // "Cabinets", "Doors & panels", "Hardware", "Installation"
  label: string;          // Plain language: "8 cabinets including drawers and corner carousel"
  range: PriceRange;
}

export interface PricingResult {
  total: PriceRange;
  breakdown: PriceBreakdownItem[];
  formatted: {
    low: string;           // "$9,500"
    estimate: string;      // "$11,500"
    high: string;          // "$13,500"
    summary: string;       // "~$11,500"
    rangeLabel: string;    // "$9,500 – $13,500"
  };
  budgetFit: 'within' | 'slightly-over' | 'over' | 'under' | 'unknown';
  budgetMessage: string;   // "Within your $8–15K range" or "Slightly above — I can suggest where to save"
}

// ============================================================================
// CATALOG PRICES (cents) — fallback when product catalog not available
// These are typical Australian cabinetry prices as sensible defaults.
// ============================================================================

const MODULE_PRICES: Record<ModuleType, { lowCents: number; midCents: number; highCents: number }> = {
  // Base modules
  'standard':        { lowCents: 45000,  midCents: 65000,  highCents: 85000 },
  'sink-base':       { lowCents: 50000,  midCents: 75000,  highCents: 95000 },
  'drawer-stack':    { lowCents: 65000,  midCents: 90000,  highCents: 120000 },
  'pull-out-pantry': { lowCents: 80000,  midCents: 110000, highCents: 145000 },
  'corner-base':     { lowCents: 75000,  midCents: 100000, highCents: 130000 },
  'appliance-tower': { lowCents: 70000,  midCents: 95000,  highCents: 125000 },
  'open-shelving':   { lowCents: 30000,  midCents: 45000,  highCents: 60000 },
  // Overhead modules
  'standard-overhead': { lowCents: 35000,  midCents: 50000,  highCents: 70000 },
  'glass-door':        { lowCents: 45000,  midCents: 65000,  highCents: 85000 },
  'open-shelf':        { lowCents: 25000,  midCents: 35000,  highCents: 50000 },
  'rangehood-space':   { lowCents: 20000,  midCents: 30000,  highCents: 40000 },
  'lift-up-door':      { lowCents: 55000,  midCents: 75000,  highCents: 100000 },
};

/** Material price multiplier (applied to total cabinet cost) */
const MATERIAL_MULTIPLIERS: Record<string, number> = {
  'value':   0.85,  // Laminate, basic satin
  'mid':     1.00,  // Woodmatt, standard satin
  'premium': 1.25,  // Veneer, high-gloss
};

/** Installation estimate as percentage of cabinet + material cost */
const INSTALL_PERCENTAGE = { low: 0.15, mid: 0.20, high: 0.25 };

// ============================================================================
// AUD FORMATTER
// ============================================================================

const audFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatAud(cents: number): string {
  return audFormatter.format(Math.round(cents / 100));
}

// ============================================================================
// PRICING ENGINE
// ============================================================================

export interface PricingInput {
  config: CabinetConfig;
  budgetTier?: 'value' | 'mid' | 'premium' | 'unknown';
  budgetRange?: string;  // "under-8k" | "8-15k" | "15-25k" | "not-sure"
  includeInstallation?: boolean;
}

/**
 * Calculate a price range for a cabinet configuration.
 *
 * Returns ranges (low/estimate/high) because:
 * - Material costs vary by supplier stock
 * - Hardware prices have variance
 * - Installation depends on site conditions
 * - Final quote is after a professional site measure
 */
export function calculatePricing(input: PricingInput): PricingResult {
  const { config, budgetTier = 'mid', budgetRange, includeInstallation = true } = input;
  const breakdown: PriceBreakdownItem[] = [];

  // ── 1. Cabinet costs ──
  const cabinetResult = calculateCabinetCosts(config);
  breakdown.push(cabinetResult.item);

  // ── 2. Door & panel costs (material multiplier) ──
  const materialMultiplier = MATERIAL_MULTIPLIERS[budgetTier] ?? 1.0;
  const doorPanelRange: PriceRange = {
    lowCents: Math.round(cabinetResult.range.lowCents * materialMultiplier * 0.3),
    estimateCents: Math.round(cabinetResult.range.estimateCents * materialMultiplier * 0.35),
    highCents: Math.round(cabinetResult.range.highCents * materialMultiplier * 0.4),
  };

  const materialName = config.finishes.material || 'Standard finish';
  breakdown.push({
    category: 'Doors & panels',
    label: `${materialName} doors and matching panels`,
    range: doorPanelRange,
  });

  // ── 3. Hardware costs ──
  const moduleCount = Array.from(config.slots.values()).filter(s => s.module).length;
  const hardwareRange: PriceRange = {
    lowCents: moduleCount * 8000,    // ~$80 per module (basic)
    estimateCents: moduleCount * 12000,  // ~$120 per module (mid)
    highCents: moduleCount * 18000,  // ~$180 per module (premium)
  };
  breakdown.push({
    category: 'Hardware',
    label: `Handles, hinges, and drawer runners for ${moduleCount} cabinets`,
    range: hardwareRange,
  });

  // ── 4. Installation (optional) ──
  const subtotalRange: PriceRange = {
    lowCents: cabinetResult.range.lowCents + doorPanelRange.lowCents + hardwareRange.lowCents,
    estimateCents: cabinetResult.range.estimateCents + doorPanelRange.estimateCents + hardwareRange.estimateCents,
    highCents: cabinetResult.range.highCents + doorPanelRange.highCents + hardwareRange.highCents,
  };

  if (includeInstallation) {
    const installRange: PriceRange = {
      lowCents: Math.round(subtotalRange.lowCents * INSTALL_PERCENTAGE.low),
      estimateCents: Math.round(subtotalRange.estimateCents * INSTALL_PERCENTAGE.mid),
      highCents: Math.round(subtotalRange.highCents * INSTALL_PERCENTAGE.high),
    };
    breakdown.push({
      category: 'Installation',
      label: 'Professional installation and fitting',
      range: installRange,
    });
  }

  // ── Total ──
  const total: PriceRange = {
    lowCents: breakdown.reduce((sum, b) => sum + b.range.lowCents, 0),
    estimateCents: breakdown.reduce((sum, b) => sum + b.range.estimateCents, 0),
    highCents: breakdown.reduce((sum, b) => sum + b.range.highCents, 0),
  };

  // ── Budget comparison ──
  const { budgetFit, budgetMessage } = compareBudget(total, budgetRange);

  return {
    total,
    breakdown,
    formatted: {
      low: formatAud(total.lowCents),
      estimate: formatAud(total.estimateCents),
      high: formatAud(total.highCents),
      summary: `~${formatAud(total.estimateCents)}`,
      rangeLabel: `${formatAud(total.lowCents)} – ${formatAud(total.highCents)}`,
    },
    budgetFit,
    budgetMessage,
  };
}

// ============================================================================
// CABINET COST CALCULATION
// ============================================================================

function calculateCabinetCosts(config: CabinetConfig): {
  range: PriceRange;
  item: PriceBreakdownItem;
} {
  let lowTotal = 0;
  let midTotal = 0;
  let highTotal = 0;
  let moduleCount = 0;
  const moduleLabels: string[] = [];

  for (const [, slot] of config.slots) {
    if (!slot.module) continue;

    const prices = MODULE_PRICES[slot.module.type];
    if (!prices) continue;

    lowTotal += prices.lowCents;
    midTotal += prices.midCents;
    highTotal += prices.highCents;
    moduleCount++;
  }

  // Build a descriptive label
  const baseCount = Array.from(config.slots.values())
    .filter(s => s.module && s.position === 'base').length;
  const overheadCount = Array.from(config.slots.values())
    .filter(s => s.module && s.position === 'overhead').length;

  const parts: string[] = [];
  if (baseCount > 0) parts.push(`${baseCount} base`);
  if (overheadCount > 0) parts.push(`${overheadCount} wall`);
  const label = parts.length > 0
    ? `${parts.join(' + ')} cabinets`
    : 'No cabinets selected';

  return {
    range: { lowCents: lowTotal, estimateCents: midTotal, highCents: highTotal },
    item: {
      category: 'Cabinets',
      label,
      range: { lowCents: lowTotal, estimateCents: midTotal, highCents: highTotal },
    },
  };
}

// ============================================================================
// BUDGET COMPARISON
// ============================================================================

const BUDGET_RANGES: Record<string, { lowCents: number; highCents: number }> = {
  'under-8k':  { lowCents: 0,        highCents: 800000 },
  '8-15k':     { lowCents: 800000,   highCents: 1500000 },
  '15-25k':    { lowCents: 1500000,  highCents: 2500000 },
};

function compareBudget(
  total: PriceRange,
  budgetRange?: string,
): { budgetFit: PricingResult['budgetFit']; budgetMessage: string } {
  if (!budgetRange || budgetRange === 'not-sure') {
    return { budgetFit: 'unknown', budgetMessage: '' };
  }

  const budget = BUDGET_RANGES[budgetRange];
  if (!budget) {
    return { budgetFit: 'unknown', budgetMessage: '' };
  }

  const estimate = total.estimateCents;
  const budgetLabel = budgetRange === 'under-8k' ? 'under $8K'
    : budgetRange === '8-15k' ? '$8–15K'
    : '$15–25K';

  if (estimate <= budget.highCents) {
    if (estimate < budget.lowCents) {
      return {
        budgetFit: 'under',
        budgetMessage: `Under your ${budgetLabel} range — room to upgrade if you'd like.`,
      };
    }
    return {
      budgetFit: 'within',
      budgetMessage: `Within your ${budgetLabel} range.`,
    };
  }

  // Over budget
  const overBy = estimate - budget.highCents;
  const overPercent = Math.round((overBy / budget.highCents) * 100);

  if (overPercent <= 15) {
    return {
      budgetFit: 'slightly-over',
      budgetMessage: `Slightly above your ${budgetLabel} range — I can suggest where to save.`,
    };
  }

  return {
    budgetFit: 'over',
    budgetMessage: `Above your ${budgetLabel} range. Want me to suggest a simpler option?`,
  };
}

// ============================================================================
// PRICE DELTA (for module swaps during fine-tuning)
// ============================================================================

/**
 * Calculate the price difference when swapping one module for another.
 * Returns a plain-language string like "Adds about $400" or "Saves about $200".
 */
export function calculateSwapDelta(
  currentType: ModuleType,
  newType: ModuleType,
): { deltaCents: number; label: string } {
  const current = MODULE_PRICES[currentType];
  const next = MODULE_PRICES[newType];

  if (!current || !next) return { deltaCents: 0, label: '' };

  const delta = next.midCents - current.midCents;

  if (Math.abs(delta) < 5000) {
    return { deltaCents: delta, label: 'About the same price' };
  }

  if (delta > 0) {
    return { deltaCents: delta, label: `Adds about ${formatAud(delta)}` };
  }

  return { deltaCents: delta, label: `Saves about ${formatAud(Math.abs(delta))}` };
}
