import { useQuery } from "@tanstack/react-query";
import { getPersonRestrictionSports } from "../services/personRestriction.service";

export function usePersonRestrictionSports() {
  return useQuery({
    queryKey: ["person-restriction", "sports"],
    queryFn: getPersonRestrictionSports,
  });
}
