import type { PaginationInfo } from "@/shared/types/pagination.types";

/**
 * CORRECOES-GABRIEL.md (linha 825)
 */
export interface BannedBettor {
  id: number;
  sport: string;
  lastUpdate: string;
  updateInDays: number;
}

/**
 * CORRECOES-GABRIEL.md (linhas 858-864, 895)
 */
export interface BannedBettorListResponse {
  data: BannedBettor[];
  pagination: PaginationInfo;
}

export type { PersonRestrictionSportListItem } from "./person-restriction.types";
