import { create } from "zustand";

// ============================================================================
// TYPES
// ============================================================================

export type FlowStep =
  | "intro"           // Screen 2: AI Introduction
  | "photo"           // Screen 3: Photo Capture
  | "walls"           // Screen 4a: Wall Confirmation
  | "dimensions"      // Screen 4b: Dimension Confirmation
  | "discovery-purpose"    // Screen 5 Q1: Purpose
  | "discovery-style"      // Screen 5 Q2: Style A/B
  | "discovery-priorities" // Screen 5 Q3: Priorities
  | "processing"      // Screen 6: AI Creates Design
  | "presentation"    // Screen 7: Design Presentation
  | "budget"          // Screen 7b: Budget question
  | "fine-tuning"     // Screen 8: Fine-Tuning
  | "review"          // Screen 9: Review & Share
  | "quote"           // Screen 10: Quote Request
  | "confirmation";   // Screen 11: Confirmation

export type RoomShape = "straight" | "l-shape" | "u-shape" | "galley";

export type Wall = {
  id: string;
  label: string;
  length: number; // in metres
};

export type StyleChoice = {
  round: number;
  choice: "a" | "b" | "skip";
};

export type BudgetResponse = "works" | "less" | "more" | "unsure";

export type DesignResult = {
  renders: string[];        // URLs to render images
  description: string;      // AI plain-language description
  priceRange: [number, number]; // e.g. [10000, 13000]
  cabinets: CabinetSummary[];
  doorStyle: string;
  handleStyle: string;
  wallCabinets: number;
};

export type CabinetSummary = {
  position: number;
  type: string;       // e.g. "Drawers", "Sink cabinet", "Corner carousel"
  label: string;      // plain language
  width: number;      // mm
};

export interface DesignFlowState {
  // Current step
  step: FlowStep;

  // Session data
  userName: string;
  photoUrl: string | null;
  roomShape: RoomShape | null;
  walls: Wall[];
  purpose: string | null;         // "kitchen" | "pantry" | "laundry" | "vanity" | "other"
  styleChoices: StyleChoice[];
  styleSummary: string | null;    // AI summary like "light, warm tones with a classic feel"
  priorities: string[];
  specificRequests: string[];
  freeText: string;
  budgetResponse: BudgetResponse | null;

  // Design result (from AI / mock)
  designResult: DesignResult | null;

  // Processing
  processingProgress: number;     // 0-100
  processingStep: string;

  // Quote
  quotePhone: string;
  quoteNotes: string;
  quoteSubmitted: boolean;

  // Actions
  setStep: (step: FlowStep) => void;
  setUserName: (name: string) => void;
  setPhotoUrl: (url: string | null) => void;
  setRoomShape: (shape: RoomShape) => void;
  setWalls: (walls: Wall[]) => void;
  updateWallLength: (wallId: string, length: number) => void;
  setPurpose: (purpose: string) => void;
  addStyleChoice: (choice: StyleChoice) => void;
  setStyleSummary: (summary: string) => void;
  setPriorities: (priorities: string[]) => void;
  setSpecificRequests: (requests: string[]) => void;
  setFreeText: (text: string) => void;
  setBudgetResponse: (response: BudgetResponse) => void;
  setDesignResult: (result: DesignResult) => void;
  setProcessingProgress: (progress: number, step: string) => void;
  setQuotePhone: (phone: string) => void;
  setQuoteNotes: (notes: string) => void;
  setQuoteSubmitted: (submitted: boolean) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
}

// ============================================================================
// STEP ORDER
// ============================================================================

const STEP_ORDER: FlowStep[] = [
  "intro",
  "photo",
  "walls",
  "dimensions",
  "discovery-purpose",
  "discovery-style",
  "discovery-priorities",
  "processing",
  "presentation",
  "budget",
  "fine-tuning",
  "review",
  "quote",
  "confirmation",
];

// ============================================================================
// STORE
// ============================================================================

const initialState = {
  step: "intro" as FlowStep,
  userName: "",
  photoUrl: null as string | null,
  roomShape: null as RoomShape | null,
  walls: [] as Wall[],
  purpose: null as string | null,
  styleChoices: [] as StyleChoice[],
  styleSummary: null as string | null,
  priorities: [] as string[],
  specificRequests: [] as string[],
  freeText: "",
  budgetResponse: null as BudgetResponse | null,
  designResult: null as DesignResult | null,
  processingProgress: 0,
  processingStep: "",
  quotePhone: "",
  quoteNotes: "",
  quoteSubmitted: false,
};

export const useDesignFlowStore = create<DesignFlowState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setUserName: (userName) => set({ userName }),
  setPhotoUrl: (photoUrl) => set({ photoUrl }),
  setRoomShape: (roomShape) => set({ roomShape }),
  setWalls: (walls) => set({ walls }),
  updateWallLength: (wallId, length) =>
    set((s) => ({
      walls: s.walls.map((w) => (w.id === wallId ? { ...w, length } : w)),
    })),
  setPurpose: (purpose) => set({ purpose }),
  addStyleChoice: (choice) =>
    set((s) => ({ styleChoices: [...s.styleChoices, choice] })),
  setStyleSummary: (styleSummary) => set({ styleSummary }),
  setPriorities: (priorities) => set({ priorities }),
  setSpecificRequests: (specificRequests) => set({ specificRequests }),
  setFreeText: (freeText) => set({ freeText }),
  setBudgetResponse: (budgetResponse) => set({ budgetResponse }),
  setDesignResult: (designResult) => set({ designResult }),
  setProcessingProgress: (processingProgress, processingStep) =>
    set({ processingProgress, processingStep }),
  setQuotePhone: (quotePhone) => set({ quotePhone }),
  setQuoteNotes: (quoteNotes) => set({ quoteNotes }),
  setQuoteSubmitted: (quoteSubmitted) => set({ quoteSubmitted }),

  next: () => {
    const { step } = get();
    const idx = STEP_ORDER.indexOf(step);
    if (idx < STEP_ORDER.length - 1) {
      set({ step: STEP_ORDER[idx + 1] });
    }
  },

  back: () => {
    const { step } = get();
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) {
      set({ step: STEP_ORDER[idx - 1] });
    }
  },

  reset: () => set(initialState),
}));
