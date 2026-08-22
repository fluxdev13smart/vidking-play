import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { catalogQuery } from "@/lib/catalog-queries";
import type { CatalogType } from "@/lib/tmdb-catalog";
import { PosterCard } from "./PosterCard";

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="px-6 text-xl font-semibold sm:px-10">{title}</h2>
      <div className="scrollbar-none mt-4 flex gap-4 overflow-x-auto px-6 pb-4 sm:px-10">
        {children}
      </div>
    </section>
  );
}

function Skeletons() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[2/3] w-[150px] shrink-0 animate-pulse rounded-2xl bg-secondary sm:w-[180px]"
        />
      ))}
    </>
  );
}

function ShelfBody({ type, catalog }: { type: CatalogType; catalog: string }) {
  const { data } = useSuspenseQuery(catalogQuery({ type, catalog }));
  if (data.error && data.items.length === 0) {
    return <p className="py-8 text-sm text-muted-foreground">{data.error}</p>;
  }
  return (
    <>
      {data.items.map((item) => (
        <PosterCard key={`${item.mediaType}-${item.id}`} item={item} />
      ))}
    </>
  );
}

export function Shelf({
  title,
  type,
  catalog,
}: {
  title: string;
  type: CatalogType;
  catalog: string;
}) {
  return (
    <Row title={title}>
      <Suspense fallback={<Skeletons />}>
        <ShelfBody type={type} catalog={catalog} />
      </Suspense>
    </Row>
  );
}
