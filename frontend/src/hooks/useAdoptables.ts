// src/hooks/useAdoptables.ts
import { useEffect, useState } from "react";
import { Adoptable } from "../types";
import { fetchAdoptables } from "../api/adoptables";

export function useAdoptables() {
  const [adoptables, setAdoptables] = useState<Adoptable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchAdoptables({ page, ...filters });
        setAdoptables(data.adoptables);
        setPages(data.pages);
      } catch (err: any) {
        setError(err.message ?? "Error loading adoptables");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, filters]);

  return {
    adoptables,
    loading,
    error,
    page,
    pages,
    filters,
    setFilters,
    setPage,
  };
}
