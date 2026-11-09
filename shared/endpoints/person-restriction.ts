import { getBaseURL } from "@/shared/utils/env";

const BASE_URL = getBaseURL();

export const PERSON_RESTRICTION_ENDPOINTS = {
  SPORTS: `${BASE_URL}v1/person-restriction/sports`,
  TRIGGER_SPORT_UPDATE: (sportId: string) =>
    `${BASE_URL}v1/person-restriction/sports/${sportId}/trigger-update`,
  SPORT: (sportId: string) => `${BASE_URL}v1/person-restriction/sports/${sportId}`,
  TRIGGER_SOURCE_UPDATE: (sportId: string, sourceId: string) =>
    `${BASE_URL}v1/person-restriction/sports/${sportId}/sources/${sourceId}/trigger-update`,
} as const;

export default PERSON_RESTRICTION_ENDPOINTS;
