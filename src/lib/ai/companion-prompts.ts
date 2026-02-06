/**
 * AI Companion Prompts
 *
 * System prompt, per-step context templates, and guide layer templates.
 * The AI acts as a design consultant — guides the process, only gives
 * recommendations when asked.
 */

// ============================================================================
// SYSTEM PROMPT (Core Identity)
// ============================================================================

export const COMPANION_SYSTEM_PROMPT = `You are the North South design companion — a calm, knowledgeable guide who helps homeowners design custom cabinetry for their homes.

IDENTITY:
- You represent North South, a premium Australian cabinetry company.
- You have the knowledge of a master joiner with 30+ years of experience.
- You are warm, concise, and confident.

ROLE:
- You are a GUIDE. The user is the decision-maker.
- You explain each step, confirm actions, and keep things moving.
- You do NOT offer opinions or recommendations unless ASKED.
- You NEVER use jargon. Always plain language.
- You NEVER use excessive praise ("Great choice!", "Love it!", "Perfect!")

PROACTIVE (do without being asked):
- Explain what the current step is about
- Confirm user actions ("Two walls selected, about 2.4m and 1.8m")
- Transition between steps ("Walls are set. Now, a few quick questions.")
- Flag genuine issues ("That wall seems very short — want to check?")
- Show time estimates where relevant

REACTIVE (only when asked):
- Give design recommendations
- Explain trade-offs between options
- Suggest alternatives or improvements
- Discuss budget optimisation
- Share expert joinery knowledge

TONE:
- Warm but concise. 1-2 sentences max when proactive.
- Confident — you've done this thousands of times.
- Conversational, not corporate.
- Never condescending. She doesn't know jargon and that's fine.
- Use her name occasionally (not every message).

LANGUAGE RULES:
- NEVER use millimetres. Always metres (e.g., "2.4m").
- NEVER say "module" — say "cabinet."
- NEVER say "slot" — say "space" or "position."
- NEVER say "slab" — say "flat" or "smooth."
- NEVER say "profile" — say "style."
- NEVER say "overhead" — say "wall cabinet."
- NEVER say "base module" — say "base cabinet."
- NEVER say "config" or "configuration" — say "design."
- NEVER mention AI, algorithms, or technology. You're a design consultant.
- NEVER validate choices with praise. Just confirm and move forward.
- NEVER rush the user. She decides the pace.

CURRENCY:
- Always AUD. Always round to nearest $100 for estimates.
- Use ranges: "around $11,000–$13,000" not exact amounts.
- For small differences: "adds about $400" not "$387.50."`;

// ============================================================================
// AI INTRODUCTION MESSAGE
// ============================================================================

export function getIntroductionMessage(userName: string): string {
  const firstName = userName.split(' ')[0] || 'there';
  return `Hi ${firstName} — I'm your design consultant from North South.

I'll guide you through designing your perfect kitchen, step by step. You don't need to know anything about cabinetry — that's my job.

All you need is a photo of your space and a few minutes. I'll handle the rest.

Ready?`;
}

// ============================================================================
// PER-STEP CONTEXT INJECTION
// ============================================================================

export type FlowStep =
  | 'intro'
  | 'photo'
  | 'walls'
  | 'discovery'
  | 'processing'
  | 'presentation'
  | 'fine-tuning'
  | 'review'
  | 'submission';

interface StepContext {
  behaviour: string;   // What the AI should do on this step
  constraints: string; // What the AI must NOT do
}

const STEP_CONTEXTS: Record<FlowStep, StepContext> = {
  intro: {
    behaviour: 'Introduce yourself warmly. Set expectations for what comes next. Keep it brief.',
    constraints: 'Do NOT discuss design, styles, or pricing yet. Do NOT ask any questions.',
  },
  photo: {
    behaviour: 'Help the user take a good photo. Reassure them that mess is fine. Give simple framing tips.',
    constraints: 'Do NOT analyse the photo yet. Do NOT discuss design options. Just help capture a usable photo.',
  },
  walls: {
    behaviour: 'Confirm detected walls and dimensions. Ask user to select which walls they want cabinetry on. If walls detected badly, offer to try again.',
    constraints: 'Do NOT discuss styles, materials, or layout yet. Focus only on walls and space.',
  },
  discovery: {
    behaviour: 'Guide through discovery questions one at a time. Acknowledge each answer briefly, then move to next question. If user is unsure, reassure them and offer to skip.',
    constraints: 'Do NOT give recommendations yet. Do NOT mention specific products. Keep momentum moving forward.',
  },
  processing: {
    behaviour: 'Keep user informed about progress. Manage expectations on timing. If user asks questions, answer briefly.',
    constraints: 'Do NOT reveal the design before it is ready. Keep responses brief — the wait is the experience.',
  },
  presentation: {
    behaviour: 'Present the design in plain language. Explain key choices without jargon. Show price with budget context. Offer to try a different direction.',
    constraints: 'Do NOT use module names or technical terms. Let the design speak — do NOT oversell.',
  },
  'fine-tuning': {
    behaviour: 'Explain that everything is changeable. Confirm swaps and price changes. If user seems overwhelmed, suggest focusing on one thing at a time.',
    constraints: 'Do NOT push changes. The user decides what to adjust. Only explain trade-offs when ASKED.',
  },
  review: {
    behaviour: 'Summarise the final design in plain language. Remind user they can come back to edit. Encourage sharing with partner/family.',
    constraints: 'Do NOT rush toward submission. This is her moment to feel proud of the design.',
  },
  submission: {
    behaviour: 'Guide through the form fields. Explain what happens after submission (2-3 day turnaround). Set expectations clearly.',
    constraints: 'Do NOT add pressure. This is a quote request, not a purchase.',
  },
};

/**
 * Build the full system prompt for a specific step, injecting user context.
 */
export function buildStepPrompt(params: {
  step: FlowStep;
  userName: string;
  userContext?: {
    purpose?: string;
    styleSignals?: string[];
    budgetRange?: string;
    priorities?: string[];
    specificRequests?: string[];
    concerns?: string[];
  };
  wallData?: {
    count: number;
    shape: string;
    totalLengthM: number;
  };
  designState?: {
    moduleCount: number;
    priceEstimate: string;
    finishDescription: string;
  };
}): string {
  const { step, userName, userContext, wallData, designState } = params;
  const stepCtx = STEP_CONTEXTS[step];

  const parts: string[] = [COMPANION_SYSTEM_PROMPT];

  // User identity
  parts.push(`\nUSER_NAME: ${userName}`);

  // Step context
  parts.push(`\nCURRENT_STEP: ${step}`);
  parts.push(`BEHAVIOUR_THIS_STEP: ${stepCtx.behaviour}`);
  parts.push(`CONSTRAINTS_THIS_STEP: ${stepCtx.constraints}`);

  // User context (from discovery)
  if (userContext) {
    parts.push('\nUSER_CONTEXT:');
    if (userContext.purpose) parts.push(`- Purpose: ${userContext.purpose}`);
    if (userContext.styleSignals?.length) parts.push(`- Style signals: ${userContext.styleSignals.join(', ')}`);
    if (userContext.budgetRange) parts.push(`- Budget: ${userContext.budgetRange}`);
    if (userContext.priorities?.length) parts.push(`- Priorities: ${userContext.priorities.join(', ')}`);
    if (userContext.specificRequests?.length) parts.push(`- Specific requests: ${userContext.specificRequests.join(', ')}`);
    if (userContext.concerns?.length) parts.push(`- Concerns: ${userContext.concerns.join(', ')}`);
  }

  // Wall data
  if (wallData) {
    parts.push(`\nSPACE_DATA: ${wallData.count} walls, ${wallData.shape}, total ${wallData.totalLengthM}m`);
  }

  // Design state
  if (designState) {
    parts.push('\nDESIGN_STATE:');
    parts.push(`- ${designState.moduleCount} cabinets`);
    parts.push(`- Estimated: ${designState.priceEstimate}`);
    parts.push(`- Finish: ${designState.finishDescription}`);
  }

  return parts.join('\n');
}

// ============================================================================
// GUIDE LAYER TEMPLATES (no LLM calls — string interpolation)
// ============================================================================

export interface GuideTemplateVars {
  userName?: string;
  wallCount?: number;
  shapeDescription?: string;
  totalLengthM?: number;
  moduleCount?: number;
  priceEstimate?: string;
  priceDelta?: string;
  stepName?: string;
  [key: string]: string | number | undefined;
}

/**
 * Guide layer messages — these are client-side templates, NOT LLM calls.
 * Used for the guide pill (the one-line bar above the bottom bar).
 */
const GUIDE_TEMPLATES: Record<string, string> = {
  // Photo step
  'photo.helper':        'Stand back so we can see the full area.',
  'photo.captured':      'Got it. Analysing your space...',
  'photo.retry':         'That one was a bit blurry — try holding steady.',

  // Wall detection
  'walls.detected':      'I can see {wallCount} walls — {shapeDescription}.',
  'walls.confirm':       'Tap the walls where you want cabinetry.',
  'walls.confirmed':     '{wallCount} walls selected, about {totalLengthM}m total.',

  // Discovery
  'discovery.start':     'A few quick questions about what you want.',
  'discovery.purpose':   'What are you looking to create in this space?',
  'discovery.style':     'Which of these feels more like you?',
  'discovery.budget':    'Roughly what range are you thinking?',
  'discovery.priorities': 'What matters most to you?',
  'discovery.extras':    'Anything else I should know?',
  'discovery.done':      'Got everything I need. Designing your kitchen now...',

  // Processing
  'processing.start':    'Designing your kitchen... this usually takes about 30 seconds.',
  'processing.analysing': 'Analysing your space...',
  'processing.styling':  'Matching your style...',
  'processing.layout':   'Creating your layout...',
  'processing.rendering': 'Rendering your kitchen...',

  // Presentation
  'presentation.reveal': 'Here\'s what I\'ve put together for your kitchen.',
  'presentation.price':  'Estimated cost: {priceEstimate}',

  // Fine-tuning
  'fine-tuning.start':   'This is your kitchen. Tap anything to change it.',
  'fine-tuning.swap':    '{priceDelta}',
  'fine-tuning.budget':  'Getting close to your budget — want me to suggest where to save?',

  // Review
  'review.summary':      'Here\'s your final design — take a look and make sure you\'re happy.',
  'review.share':        'Want to share this with someone?',

  // Submission
  'submission.form':     'Nearly there — just a few details so we can get your quote sorted.',
  'submission.done':     'You\'re all set. You\'ll get an email within 2–3 days with your formal quote.',
};

/**
 * Get a guide layer message with variable interpolation.
 * Returns the template string with {variables} replaced.
 */
export function getGuideMessage(
  templateKey: string,
  vars: GuideTemplateVars = {},
): string | null {
  const template = GUIDE_TEMPLATES[templateKey];
  if (!template) return null;

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = vars[key];
    return value !== undefined ? String(value) : match;
  });
}

// ============================================================================
// WELCOME BACK MESSAGES (interruption recovery)
// ============================================================================

export function getWelcomeBackMessage(params: {
  userName: string;
  lastStep: FlowStep;
  minutesAway: number;
}): string {
  const { userName, lastStep, minutesAway } = params;
  const firstName = userName.split(' ')[0] || 'there';

  // Quick return (< 30 min) — no message needed, just resume
  if (minutesAway < 30) return '';

  const stepDescriptions: Record<FlowStep, string> = {
    intro: 'getting started',
    photo: 'taking a photo of your space',
    walls: 'setting up your walls',
    discovery: 'answering a few questions',
    processing: 'your kitchen is being designed',
    presentation: 'looking at your design',
    'fine-tuning': 'customising your kitchen',
    review: 'reviewing your final design',
    submission: 'submitting your quote request',
  };

  const stepDesc = stepDescriptions[lastStep] || 'your kitchen design';

  if (minutesAway < 60 * 24) {
    return `Welcome back, ${firstName} — you were ${stepDesc}. Want to pick up where you left off?`;
  }

  return `Welcome back, ${firstName}. Last time you were ${stepDesc} — your design is saved and ready whenever you are.`;
}
