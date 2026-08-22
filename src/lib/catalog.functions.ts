import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  CATALOG_BASE,
  toCard,
  toDetail,
  type CatalogType,
  type TitleCard,
  type TitleDetail,
} from "./tmdb-catalog";

const typeSchema = z.enum(["movie", "series"]);

async function fetchJson(url: string, ms = 12_000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export const getCatalog = createServerFn({ method: "GET" })
  .inputValidator((raw) =>
    z
      .object({
        type: typeSchema,
        catalog: z.string(),
        genre: z.string().optional(),
        skip: z.number().int().min(0).optional(),
      })
      .parse(raw),
  )
  .handler(async ({ data }): Promise<{ items: TitleCard[]; error: string | null }> => {
    const extra: string[] = [];
    if (data.genre) extra.push(`genre=${encodeURIComponent(data.genre)}`);
    if (data.skip) extra.push(`skip=${data.skip}`);
    const path = extra.length
      ? `/catalog/${data.type}/${data.catalog}/${extra.join("&")}.json`
      : `/catalog/${data.type}/${data.catalog}.json`;

    try {
      const json = (await fetchJson(`${CATALOG_BASE}${path}`)) as { metas?: unknown[] };
      const metas = Array.isArray(json?.metas) ? json.metas : [];
      return {
        items: metas.map((m) => toCard(m as never, data.type as CatalogType)).filter((m) => m.id),
        error: null,
      };
    } catch (err) {
      console.error("catalog fetch failed", path, err);
      return { items: [], error: "This row couldn't load right now." };
    }
  });

export const getTitle = createServerFn({ method: "GET" })
  .inputValidator((raw) =>
    z.object({ type: typeSchema, id: z.string().regex(/^\d{1,9}$/) }).parse(raw),
  )
  .handler(async ({ data }): Promise<{ title: TitleDetail | null; error: string | null }> => {
    try {
      const json = (await fetchJson(
        `${CATALOG_BASE}/meta/${data.type}/tmdb:${data.id}.json`,
        20_000,
      )) as { meta?: unknown };
      if (!json?.meta) return { title: null, error: "We couldn't find that title." };
      const detail = toDetail(json.meta as never, data.type as CatalogType);
      return { title: { ...detail, id: detail.id || data.id }, error: null };
    } catch (err) {
      console.error("meta fetch failed", data, err);
      return { title: null, error: "Details couldn't load right now." };
    }
  });

export const searchTitles = createServerFn({ method: "GET" })
  .inputValidator((raw) => z.object({ type: typeSchema, query: z.string() }).parse(raw))
  .handler(async ({ data }): Promise<{ items: TitleCard[]; error: string | null }> => {
    const q = data.query.trim();
    if (!q) return { items: [], error: null };
    try {
      const json = (await fetchJson(
        `${CATALOG_BASE}/catalog/${data.type}/tmdb.search/search=${encodeURIComponent(q)}.json`,
        20_000,
      )) as { metas?: unknown[] };
      const metas = Array.isArray(json?.metas) ? json.metas : [];
      return {
        items: metas.map((m) => toCard(m as never, data.type as CatalogType)).filter((m) => m.id),
        error: null,
      };
    } catch (err) {
      console.error("search failed", q, err);
      return {
        items: [],
        error: "Search is unavailable at the moment. Browse by genre or paste a TMDB ID instead.",
      };
    }
  });
