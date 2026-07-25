// Pure data-shaping helpers for the redesigned Home screen.
//
// Most of the recommendation/ranking logic that used to live here (quick
// -service resolution, popularity grouping, garage ranking) has moved
// server-side — see docs/HOME_REDESIGN.md §6/§7/§8. The backend now returns
// already-ranked, already-capped, already-honest data for those sections, so
// this file is left with: (1) shared type contracts matching the live
// `/api/v1/...` responses, used across Home.tsx and its section components,
// and (2) the client-side search index, which still has no dedicated
// backend endpoint and remains a cheap client-side scan.

export interface ServiceCatalogItem {
  _id: string;
  name: string;
  image?: string;
  dealer_id?: {_id?: string; shopName?: string} | string;
}

export interface FeaturedCategoryItem {
  _id: string;
  categoryName: string;
  categoryImage: string;
  locationName?: string;
  serviceId?: {_id: string; name: string};
}

export interface DealerItem {
  _id: string;
  shopName: string;
  fullAddress?: string;
  address?: string;
  latitude: string | number;
  longitude: string | number;
  shopImages?: any[];
  averageRating?: number;
  isOpen?: boolean;
  pickupAndDrop?: boolean;
}

export interface BikeItem {
  _id: string;
  plate_number?: string;
  bike_cc?: string | number;
  companyName?: string;
  modelName?: string;
  name?: string;
  model?: string;
  variant_id?: string;
}

// ── Home v2 API response shapes ─────────────────────────────────────────
// `GET /api/v1/service-categories` — admin-managed taxonomy, replaces the
// old hardcoded SERVICE_CATEGORY_DEFS array entirely.
export interface ServiceCategoryItem {
  _id: string;
  id?: string;
  name: string;
  icon: string; // MaterialCommunityIcons glyph name
  sortOrder?: number;
  isActive?: boolean;
}

// Shared fields across the quick-services / recommended / most-booked
// service feeds (`/api/v1/home/...`).
export interface HomeServiceItem {
  serviceId: string;
  name: string;
  image?: string;
  description?: string;
  categoryId?: string;
  basePrice?: number;
  duration?: number;
  pickupAvailable?: boolean;
  warranty?: boolean;
}

// `GET /api/v1/home/quick-services?bikeId=&lat=&lng=`
export interface QuickServiceItem extends HomeServiceItem {
  popularityCount?: number;
  popularitySource?: string;
}

// `GET /api/v1/home/recommended?bikeId=&lat=&lng=`
export interface RecommendedServiceItem extends HomeServiceItem {
  score?: number;
  reasonCode?: 'popular' | 'nearby' | 'compatible_with_bike';
  reasonLabel?: string;
  popularityCount?: number;
  popularitySource?: string;
  nearestDealerDistanceKm?: number;
}

// `GET /api/v1/home/most-booked?lat=&lng=` — bookingCount is real
// booking-volume when available; when there's no booking history yet in the
// area the backend falls back to dealerCount (distinct dealers offering it)
// and sets isFallback true. Never infer one from the other on the client.
export interface MostBookedServiceItem extends HomeServiceItem {
  bookingCount?: number | null;
  dealerCount?: number | null;
  isFallback: boolean;
}

// `GET /api/v1/home/top-garages?lat=&lng=` — already sorted rating-then
// -distance and capped at 5 server-side, no client-side ranking needed.
export interface TopGarageItem {
  dealerId: string;
  shopName: string;
  city?: string;
  locality?: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  averageRating?: number;
  ratingCount?: number;
  shopImages?: string[];
}

// `GET /api/v1/services?categoryId=` — services within a tapped category.
export interface CategoryServiceItem {
  serviceId: string;
  name: string;
  image?: string;
  description?: string;
  category?: {id: string; name: string; icon: string} | null;
  basePrice?: number;
  duration?: number;
  pickupAvailable?: boolean;
  warranty?: boolean;
}

export type SearchResultType = 'service' | 'category' | 'garage' | 'bike';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  // Everything a tap needs to resolve the same "service -> nearby garages ->
  // compare -> book" flow the rest of the app already uses.
  serviceId?: string;
  dealerId?: string;
  categoryId?: string;
}

const normalize = (v?: string) => (v || '').trim().toLowerCase();

/** Case/whitespace-insensitive substring match — good enough for a client-side quick search over a few hundred rows. */
const fuzzyIncludes = (haystack: string, needle: string) =>
  normalize(haystack).includes(normalize(needle));

/**
 * Flattens services, admin-managed categories, garages, and the user's own
 * bikes into one searchable list so a single search bar can answer "garage,
 * service, bike brand, or category" the way Swiggy/Zomato-style search does,
 * without needing a dedicated backend search endpoint for v1.
 */
export function buildSearchIndex(
  services: ServiceCatalogItem[],
  categories: ServiceCategoryItem[],
  dealers: DealerItem[],
  bikes: BikeItem[],
): SearchResult[] {
  const index: SearchResult[] = [];
  const seenCategoryNames = new Set<string>();

  categories.forEach(c => {
    const key = normalize(c.name);
    if (!key || seenCategoryNames.has(key)) return;
    seenCategoryNames.add(key);
    index.push({
      type: 'category',
      id: c._id,
      title: c.name,
      subtitle: 'Service category',
      categoryId: c._id,
    });
  });

  services.forEach(s => {
    const key = normalize(s.name);
    if (!key || seenCategoryNames.has(key)) return;
    seenCategoryNames.add(key);
    index.push({
      type: 'service',
      id: s._id,
      title: s.name,
      subtitle: 'Service',
      image: s.image,
      serviceId: s._id,
    });
  });

  dealers.forEach(d => {
    index.push({
      type: 'garage',
      id: d._id,
      title: d.shopName,
      subtitle: d.fullAddress || d.address,
      image: d.shopImages?.[0],
      dealerId: d._id,
    });
  });

  const seenBikeBrands = new Set<string>();
  bikes.forEach(b => {
    const brand = b.companyName || b.name;
    const key = normalize(brand);
    if (!brand || key === '-' || seenBikeBrands.has(key)) return;
    seenBikeBrands.add(key);
    index.push({
      type: 'bike',
      id: b._id,
      title: brand,
      subtitle: b.modelName || b.model || 'Your bike',
    });
  });

  return index;
}

export function searchIndex(
  index: SearchResult[],
  query: string,
  limit = 8,
): SearchResult[] {
  const q = normalize(query);
  if (!q) return [];
  return index.filter(item => fuzzyIncludes(item.title, q) || fuzzyIncludes(item.subtitle || '', q)).slice(0, limit);
}

export const calcDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
