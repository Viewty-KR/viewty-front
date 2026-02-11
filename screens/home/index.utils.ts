import { FALLBACK_IMAGE, LookItem, TrendingItem } from "./index.types";

export const extractProducts = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.content)) return payload.content;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

export const asNumber = (value: any): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const numeric = Number(value.replace(/[^0-9.-]/g, ""));
    if (Number.isFinite(numeric)) return numeric;
  }
  return 0;
};

export const mapToTrending = (item: any): TrendingItem => ({
  id: Number(item.id),
  title: item.name ?? "상품명 미확인",
  desc:
    item.manufacturer ?? item.shortDescription ?? "상세 정보를 확인해보세요.",
  image: item.imgUrl || FALLBACK_IMAGE,
  tag: item.category ?? "PRODUCT",
});

export const mapToLook = (item: any): LookItem => ({
  id: Number(item.id),
  title: item.name ?? "상품명 미확인",
  desc: item.manufacturer ?? item.shortDescription ?? "",
  price: asNumber(item.price),
  image: item.imgUrl || FALLBACK_IMAGE,
  color: "neutral",
});

export const formatPrice = (value: number): string =>
  value > 0 ? `₩${value.toLocaleString()}` : "View";
