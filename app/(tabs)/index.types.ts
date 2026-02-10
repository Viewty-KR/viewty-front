export interface TrendingItem {
  id: number;
  title: string;
  desc: string;
  image: string;
  tag: string;
}

export interface LookItem {
  id: number;
  title: string;
  desc: string;
  price: number;
  image: string;
  color: "warm" | "cool" | "neutral";
}

export const FALLBACK_IMAGE = "https://via.placeholder.com/400x400.png?text=Product";
