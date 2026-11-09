import { useMutation, useQueryClient } from "@tanstack/react-query";
import { triggerPersonRestrictionSportUpdate } from "../services/personRestriction.service";

export function useTriggerPersonRestrictionSportUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerPersonRestrictionSportUpdate,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["person-restriction", "sports"],
      });
    },
  });
}
