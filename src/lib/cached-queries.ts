import { cache } from "react";
import { getLinks } from "@/lib/data";

/** D17: dedupe getLinks() across (public)/layout.tsx (Footer) and (public)/page.tsx (About) within one request. */
export const getLinksCached = cache(getLinks);
