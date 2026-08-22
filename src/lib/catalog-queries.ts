import { queryOptions } from "@tanstack/react-query";
import { getCatalog, getTitle, searchTitles } from "./catalog.functions";
import type { CatalogType } from "./tmdb-catalog";

export const catalogQuery = (opts: {
  type: CatalogType;
  catalog: string;
  genre?: string;
  skip?: number;
}) =>
  queryOptions({
    queryKey: ["catalog", opts.type, opts.catalog, opts.genre ?? "", opts.skip ?? 0],
    queryFn: () => getCatalog({ data: opts }),
    staleTime: 5 * 60_000,
  });

export const titleQuery = (type: CatalogType, id: string) =>
  queryOptions({
    queryKey: ["title", type, id],
    queryFn: () => getTitle({ data: { type, id } }),
    staleTime: 30 * 60_000,
  });

export const searchQuery = (type: CatalogType, query: string) =>
  queryOptions({
    queryKey: ["search", type, query],
    queryFn: () => searchTitles({ data: { type, query } }),
    staleTime: 5 * 60_000,
    enabled: query.trim().length > 1,
  });
