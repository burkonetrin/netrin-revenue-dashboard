export type HierarchySortDir = "asc" | "desc";

export type HierarchySortState<K extends string> = {
  key: K | null;
  dir: HierarchySortDir;
};

export function toggleHierarchySort<K extends string>(
  prev: HierarchySortState<K>,
  key: K,
): HierarchySortState<K> {
  if (prev.key === key) {
    return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
  }
  return { key, dir: "desc" };
}

export function hierarchySortIcon<K extends string>(
  sort: HierarchySortState<K>,
  key: K,
): string {
  if (sort.key !== key) return "↕";
  return sort.dir === "asc" ? "↑" : "↓";
}

export function sortHierarchyRows<T, K extends string>(
  rows: T[],
  sort: HierarchySortState<K>,
  valueOf: (row: T, key: K) => number,
): T[] {
  if (!sort.key) return rows;
  const factor = sort.dir === "asc" ? 1 : -1;
  const key = sort.key;
  return [...rows].sort((a, b) => (valueOf(a, key) - valueOf(b, key)) * factor);
}
