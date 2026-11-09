import type {
  PersonRestrictionSportDetail,
  PersonRestrictionSportListItem,
} from "../types/person-restriction.types";
import {
  getPersonRestrictionSportMock,
  listPersonRestrictionSportsMock,
  triggerPersonRestrictionSourceUpdateMock,
  triggerPersonRestrictionSportUpdateMock,
  updatePersonRestrictionSportPeriodicityMock,
} from "../mock/personRestrictionMock.store";

export async function getPersonRestrictionSports(): Promise<PersonRestrictionSportListItem[]> {
  return listPersonRestrictionSportsMock();
}

export async function triggerPersonRestrictionSportUpdate(sportId: string): Promise<void> {
  return triggerPersonRestrictionSportUpdateMock(sportId);
}

export async function getPersonRestrictionSport(
  sportId: string,
): Promise<PersonRestrictionSportDetail> {
  return getPersonRestrictionSportMock(sportId);
}

export async function updatePersonRestrictionSportPeriodicity(
  sportId: string,
  daysNextUpdate: number,
): Promise<PersonRestrictionSportDetail> {
  return updatePersonRestrictionSportPeriodicityMock(sportId, daysNextUpdate);
}

export async function triggerPersonRestrictionSourceUpdate(
  sportId: string,
  sourceId: string,
): Promise<void> {
  return triggerPersonRestrictionSourceUpdateMock(sportId, sourceId);
}
