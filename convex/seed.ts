import { mutation } from "./_generated/server";

// Seed data for materials (Polytec)
const materials = [
  {
    code: "POL-NOWM",
    name: "Natural Oak Woodmatt",
    supplier: "Polytec",
    category: "woodmatt",
    colorFamily: "oak",
    pricePerUnit: 89,
    active: true,
    sortOrder: 1,
  },
  {
    code: "POL-PRWM",
    name: "Prime Oak Woodmatt",
    supplier: "Polytec",
    category: "woodmatt",
    colorFamily: "oak",
    pricePerUnit: 89,
    active: true,
    sortOrder: 2,
  },
  {
    code: "POL-COWM",
    name: "Coastal Oak Woodmatt",
    supplier: "Polytec",
    category: "woodmatt",
    colorFamily: "oak",
    pricePerUnit: 89,
    active: true,
    sortOrder: 3,
  },
  {
    code: "POL-WOWM",
    name: "White Oak Woodmatt",
    supplier: "Polytec",
    category: "woodmatt",
    colorFamily: "oak",
    pricePerUnit: 89,
    active: true,
    sortOrder: 4,
  },
  {
    code: "POL-BLWM",
    name: "Blackbutt Woodmatt",
    supplier: "Polytec",
    category: "woodmatt",
    colorFamily: "oak",
    pricePerUnit: 89,
    active: true,
    sortOrder: 5,
  },
  {
    code: "POL-WHST",
    name: "White Satin",
    supplier: "Polytec",
    category: "satin",
    colorFamily: "white",
    pricePerUnit: 75,
    active: true,
    sortOrder: 6,
  },
  {
    code: "POL-SHGR",
    name: "Shadow Grey",
    supplier: "Polytec",
    category: "satin",
    colorFamily: "grey",
    pricePerUnit: 75,
    active: true,
    sortOrder: 7,
  },
  {
    code: "POL-MNTK",
    name: "Midnight",
    supplier: "Polytec",
    category: "satin",
    colorFamily: "black",
    pricePerUnit: 75,
    active: true,
    sortOrder: 8,
  },
];

// Seed data for hardware (Blum)
const hardware = [
  {
    code: "BLUM-CLIP-110",
    name: "Blum CLIP top 110",
    supplier: "Blum",
    category: "hinge",
    specs: { angle: 110, type: "soft-close" },
    pricePerUnit: 12,
    priceVariance: 5,
    active: true,
    sortOrder: 1,
  },
  {
    code: "BLUM-CLIP-155",
    name: "Blum CLIP top 155",
    supplier: "Blum",
    category: "hinge",
    specs: { angle: 155, type: "soft-close" },
    pricePerUnit: 18,
    priceVariance: 5,
    active: true,
    sortOrder: 2,
  },
  {
    code: "BLUM-TANDEM-450",
    name: "Blum TANDEM 450",
    supplier: "Blum",
    category: "drawer",
    specs: { length: 450, capacity: 30, type: "blumotion" },
    pricePerUnit: 65,
    priceVariance: 5,
    active: true,
    sortOrder: 3,
  },
  {
    code: "BLUM-TANDEM-500",
    name: "Blum TANDEM 500",
    supplier: "Blum",
    category: "drawer",
    specs: { length: 500, capacity: 30, type: "blumotion" },
    pricePerUnit: 68,
    priceVariance: 5,
    active: true,
    sortOrder: 4,
  },
  {
    code: "BLUM-TANDEM-550",
    name: "Blum TANDEM 550",
    supplier: "Blum",
    category: "drawer",
    specs: { length: 550, capacity: 30, type: "blumotion" },
    pricePerUnit: 72,
    priceVariance: 5,
    active: true,
    sortOrder: 5,
  },
  {
    code: "BLUM-LEGRA-500",
    name: "Blum LEGRABOX 500",
    supplier: "Blum",
    category: "drawer",
    specs: { length: 500, capacity: 40, type: "premium" },
    pricePerUnit: 145,
    priceVariance: 5,
    active: true,
    sortOrder: 6,
  },
  {
    code: "BLUM-SPACE-600",
    name: "Blum SPACE TOWER 600",
    supplier: "Blum",
    category: "organizer",
    specs: { width: 600, type: "pantry" },
    pricePerUnit: 890,
    priceVariance: 5,
    active: true,
    sortOrder: 7,
  },
  {
    code: "BLUM-AVENTOS-HK",
    name: "Blum AVENTOS HK-S",
    supplier: "Blum",
    category: "lift",
    specs: { type: "stay-lift", angle: 107 },
    pricePerUnit: 185,
    priceVariance: 5,
    active: true,
    sortOrder: 8,
  },
];

// Seed data for door profiles
const doorProfiles = [
  {
    code: "DOOR-FLAT",
    name: "Flat Panel",
    description: "Clean, modern flat panel door",
    pricePerDoor: 0,
    active: true,
    sortOrder: 1,
  },
  {
    code: "DOOR-SLIM-SHAKER",
    name: "Slimline Shaker",
    description: "Contemporary slim shaker profile",
    pricePerDoor: 25,
    active: true,
    sortOrder: 2,
  },
  {
    code: "DOOR-TRAD-SHAKER",
    name: "Traditional Shaker",
    description: "Classic shaker style profile",
    pricePerDoor: 35,
    active: true,
    sortOrder: 3,
  },
  {
    code: "DOOR-FLUTED",
    name: "Fluted/Reeded",
    description: "Textured fluted panel door",
    pricePerDoor: 55,
    active: true,
    sortOrder: 4,
  },
];

// Seed data for products
const products = [
  {
    code: "PROD-KITCHEN",
    name: "Kitchen",
    description: "Custom kitchen cabinetry",
    basePrice: 5000,
    active: true,
    sortOrder: 1,
  },
  {
    code: "PROD-LAUNDRY",
    name: "Laundry",
    description: "Laundry room cabinetry",
    basePrice: 2500,
    active: true,
    sortOrder: 2,
  },
  {
    code: "PROD-VANITY",
    name: "Vanity",
    description: "Bathroom vanity units",
    basePrice: 1500,
    active: true,
    sortOrder: 3,
  },
  {
    code: "PROD-WARDROBE",
    name: "Wardrobe",
    description: "Built-in wardrobes",
    basePrice: 3000,
    active: true,
    sortOrder: 4,
  },
];

// Seed data for base modules
const baseModules = [
  {
    code: "MOD-BASE-300",
    name: "Base Cabinet 300mm",
    productCode: "PROD-KITCHEN",
    category: "base",
    defaultWidth: 300,
    defaultHeight: 720,
    defaultDepth: 560,
    minWidth: 150,
    maxWidth: 450,
    pricePerUnit: 280,
    active: true,
    sortOrder: 1,
  },
  {
    code: "MOD-BASE-450",
    name: "Base Cabinet 450mm",
    productCode: "PROD-KITCHEN",
    category: "base",
    defaultWidth: 450,
    defaultHeight: 720,
    defaultDepth: 560,
    minWidth: 300,
    maxWidth: 600,
    pricePerUnit: 350,
    active: true,
    sortOrder: 2,
  },
  {
    code: "MOD-BASE-600",
    name: "Base Cabinet 600mm",
    productCode: "PROD-KITCHEN",
    category: "base",
    defaultWidth: 600,
    defaultHeight: 720,
    defaultDepth: 560,
    minWidth: 450,
    maxWidth: 900,
    pricePerUnit: 420,
    active: true,
    sortOrder: 3,
  },
  {
    code: "MOD-BASE-SINK",
    name: "Sink Base Cabinet",
    productCode: "PROD-KITCHEN",
    category: "base",
    defaultWidth: 900,
    defaultHeight: 720,
    defaultDepth: 560,
    minWidth: 600,
    maxWidth: 1200,
    pricePerUnit: 380,
    active: true,
    sortOrder: 4,
  },
  {
    code: "MOD-BASE-CORNER",
    name: "Corner Base Cabinet",
    productCode: "PROD-KITCHEN",
    category: "corner",
    defaultWidth: 900,
    defaultHeight: 720,
    defaultDepth: 900,
    pricePerUnit: 580,
    active: true,
    sortOrder: 5,
  },
  {
    code: "MOD-BASE-DRAWER",
    name: "Drawer Base Cabinet",
    productCode: "PROD-KITCHEN",
    category: "base",
    defaultWidth: 600,
    defaultHeight: 720,
    defaultDepth: 560,
    minWidth: 300,
    maxWidth: 900,
    pricePerUnit: 520,
    active: true,
    sortOrder: 6,
  },
  {
    code: "MOD-TALL-PANTRY",
    name: "Tall Pantry Cabinet",
    productCode: "PROD-KITCHEN",
    category: "tall",
    defaultWidth: 600,
    defaultHeight: 2100,
    defaultDepth: 560,
    minWidth: 450,
    maxWidth: 900,
    pricePerUnit: 890,
    active: true,
    sortOrder: 7,
  },
];

// Seed data for overhead modules
const overheadModules = [
  {
    code: "MOD-OH-300",
    name: "Overhead Cabinet 300mm",
    productCode: "PROD-KITCHEN",
    category: "overhead",
    defaultWidth: 300,
    defaultHeight: 720,
    defaultDepth: 330,
    minWidth: 150,
    maxWidth: 450,
    pricePerUnit: 220,
    active: true,
    sortOrder: 10,
  },
  {
    code: "MOD-OH-450",
    name: "Overhead Cabinet 450mm",
    productCode: "PROD-KITCHEN",
    category: "overhead",
    defaultWidth: 450,
    defaultHeight: 720,
    defaultDepth: 330,
    minWidth: 300,
    maxWidth: 600,
    pricePerUnit: 280,
    active: true,
    sortOrder: 11,
  },
  {
    code: "MOD-OH-600",
    name: "Overhead Cabinet 600mm",
    productCode: "PROD-KITCHEN",
    category: "overhead",
    defaultWidth: 600,
    defaultHeight: 720,
    defaultDepth: 330,
    minWidth: 450,
    maxWidth: 900,
    pricePerUnit: 340,
    active: true,
    sortOrder: 12,
  },
  {
    code: "MOD-OH-RANGEHOOD",
    name: "Rangehood Cabinet",
    productCode: "PROD-KITCHEN",
    category: "overhead",
    defaultWidth: 900,
    defaultHeight: 720,
    defaultDepth: 330,
    minWidth: 600,
    maxWidth: 1200,
    pricePerUnit: 320,
    active: true,
    sortOrder: 13,
  },
  {
    code: "MOD-OH-CORNER",
    name: "Corner Overhead Cabinet",
    productCode: "PROD-KITCHEN",
    category: "corner",
    defaultWidth: 600,
    defaultHeight: 720,
    defaultDepth: 600,
    pricePerUnit: 420,
    active: true,
    sortOrder: 14,
  },
];

// Seed data for add-ons
const addons = [
  {
    code: "ADDON-LED-STRIP",
    name: "LED Strip Lighting",
    description: "Under-cabinet LED strip lighting",
    category: "lighting",
    pricePerUnit: 45,
    compatibleWith: ["MOD-OH-300", "MOD-OH-450", "MOD-OH-600"],
    active: true,
    sortOrder: 1,
  },
  {
    code: "ADDON-SCRIBE-FILLER",
    name: "Scribe Filler",
    description: "Wall scribe filler panel",
    category: "filler",
    pricePerUnit: 35,
    compatibleWith: ["MOD-BASE-300", "MOD-BASE-450", "MOD-BASE-600"],
    active: true,
    sortOrder: 2,
  },
  {
    code: "ADDON-WINE-RACK",
    name: "Wine Rack Insert",
    description: "Timber wine rack module",
    category: "storage",
    pricePerUnit: 120,
    compatibleWith: ["MOD-BASE-300", "MOD-BASE-450"],
    active: true,
    sortOrder: 3,
  },
  {
    code: "ADDON-CUTLERY-INSERT",
    name: "Cutlery Insert",
    description: "Drawer cutlery organizer insert",
    category: "organizer",
    pricePerUnit: 85,
    compatibleWith: ["MOD-BASE-DRAWER"],
    active: true,
    sortOrder: 4,
  },
  {
    code: "ADDON-SPICE-RACK",
    name: "Pull-out Spice Rack",
    description: "Narrow pull-out spice storage",
    category: "organizer",
    pricePerUnit: 165,
    compatibleWith: ["MOD-BASE-300"],
    active: true,
    sortOrder: 5,
  },
  {
    code: "ADDON-BIN-PULLOUT",
    name: "Bin Pull-out",
    description: "Integrated waste bin system",
    category: "storage",
    pricePerUnit: 195,
    compatibleWith: ["MOD-BASE-450", "MOD-BASE-600"],
    active: true,
    sortOrder: 6,
  },
  {
    code: "ADDON-SOFT-CLOSE",
    name: "Soft Close Upgrade",
    description: "Upgrade all hinges to soft-close",
    category: "hardware",
    pricePerUnit: 8,
    compatibleWith: ["PROD-KITCHEN", "PROD-LAUNDRY", "PROD-VANITY"],
    active: true,
    sortOrder: 7,
  },
];

// Seed data for styles
const styles = [
  {
    code: "STYLE-MODERN",
    name: "Modern",
    description: "Clean lines, minimal hardware, handleless options",
    category: "modern",
    active: true,
    sortOrder: 1,
  },
  {
    code: "STYLE-HAMPTONS",
    name: "Hamptons",
    description: "Coastal inspired, shaker profiles, light colors",
    category: "traditional",
    active: true,
    sortOrder: 2,
  },
  {
    code: "STYLE-SCANDI",
    name: "Scandinavian",
    description: "Light woods, clean design, functional",
    category: "modern",
    active: true,
    sortOrder: 3,
  },
  {
    code: "STYLE-INDUSTRIAL",
    name: "Industrial",
    description: "Dark finishes, metal accents, raw materials",
    category: "modern",
    active: true,
    sortOrder: 4,
  },
  {
    code: "STYLE-TRADITIONAL",
    name: "Traditional",
    description: "Classic profiles, ornate details",
    category: "traditional",
    active: true,
    sortOrder: 5,
  },
];

/**
 * Run this mutation once to populate all product catalog data
 */
export const runSeed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded by looking for any material
    const existingMaterial = await ctx.db
      .query("materials")
      .filter((q) => q.eq(q.field("code"), "POL-NOWM"))
      .first();

    if (existingMaterial) {
      return { success: false, message: "Database already seeded" };
    }

    // Seed materials
    for (const material of materials) {
      await ctx.db.insert("materials", material);
    }

    // Seed hardware
    for (const item of hardware) {
      await ctx.db.insert("hardware", item);
    }

    // Seed door profiles
    for (const profile of doorProfiles) {
      await ctx.db.insert("doorProfiles", profile);
    }

    // Seed products
    for (const product of products) {
      await ctx.db.insert("products", product);
    }

    // Seed modules (base + overhead)
    for (const mod of [...baseModules, ...overheadModules]) {
      await ctx.db.insert("modules", mod);
    }

    // Seed add-ons
    for (const addon of addons) {
      await ctx.db.insert("addons", addon);
    }

    // Seed styles
    for (const style of styles) {
      await ctx.db.insert("styles", style);
    }

    return {
      success: true,
      message: "Database seeded successfully",
      counts: {
        materials: materials.length,
        hardware: hardware.length,
        doorProfiles: doorProfiles.length,
        products: products.length,
        modules: baseModules.length + overheadModules.length,
        addons: addons.length,
        styles: styles.length,
      },
    };
  },
});
