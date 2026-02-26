// screens/product/[id].types.ts

export interface Ingredient {
  name: string;
  isHarmful: boolean;
  division?: string;
  isCaution?: boolean;
  isAllergy?: boolean;
}

export interface ProductOption {
  id: number;
  optionName: string;
  price: number;
  colorCode?: string;
  isArAvailable?: boolean;
}

export interface ProductDetail {
  id: number;
  name: string;
  price: number;
  manufacturer: string;
  ingredients: Ingredient[];
  harmfulIngredientCount: number;
  options?: ProductOption[];
  img_url?: string;
  imgUrl?: string;
  capacity?: string;
  specifications?: string;
  expiryDate?: string;
  usageMethod?: string;
  country?: string;
  isFunctional?: string;
  precautions?: string;
  qa?: string;
  csNumber?: string;
  deliveryFee?: string;
  deliveryJejuFee?: string;
  allIngredients?: string;
}

export interface Review {
  id: number;
  userId?: string | number;
  name: string;
  content: string;
  rating: number;
  createdAt: string;
}
