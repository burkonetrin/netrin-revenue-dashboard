import { useQuery } from "@tanstack/react-query";
import { getPersonRestrictionSport } from "../services/personRestriction.service";

export function usePersonRestrictionSport(sportId: string) {
  return useQuery({
    queryKey: ["person-restriction", "sports", sportId],
    queryFn: () => getPersonRestrictionSport(sportId),
    enabled: Boolean(sportId),
  });
}
