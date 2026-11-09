export interface PersonRestrictionSportListItem {
  id: string;
  name: string;
  lastUpdate: string | null;
  nextUpdate: string | null;
  daysNextUpdate: number;
  statusScraping: string;
  canTriggerUpdate: boolean;
}

export interface PersonRestrictionRestriction {
  restrictionType: string;
  quantity: number;
}
export interface PersonRestrictionSource {
  id: string;
  siteName: string | null;
  siteUrl: string | null;
  restrictionType: string;
  statusScraping: string | null;
}
export interface PersonRestrictionSportDetail extends PersonRestrictionSportListItem {
  internalName: string;
  totalRestrictions: number;
  restrictions: PersonRestrictionRestriction[];
  sources: PersonRestrictionSource[];
}
