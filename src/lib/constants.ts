export const CATEGORIES = {
  women: [
    "Banarasi Saree",
    "Silk Saree",
    "Cotton Saree",
    "Chiffon Saree",
    "Georgette Saree",
    "Designer Saree",
    "Kurti",
    "Kurti Set (Kurti + Pant + Dupatta)",
    "Lehenga Choli",
    "Salwar Suit",
  ],
  men: [
    "Kurta Pajama",
    "Sherwani",
    "Casual Shirt",
  ],
} as const;

export const GENDERS = ["Women", "Men"] as const;
export type Gender = (typeof GENDERS)[number];
export type WomenCategory = (typeof CATEGORIES.women)[number];
export type MenCategory = (typeof CATEGORIES.men)[number];
export type Category = WomenCategory | MenCategory;