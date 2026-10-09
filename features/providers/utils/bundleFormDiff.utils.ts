/**
 * Calcula diferença de IDs entre listas para atualização parcial.
 */
export function diffIds(
  current: string[],
  initial: string[],
): { added: string[]; removed: string[] } {
  const initialSet = new Set(initial);
  const currentSet = new Set(current);

  const added = current.filter((id) => !initialSet.has(id));
  const removed = initial.filter((id) => !currentSet.has(id));

  return { added, removed };
}
