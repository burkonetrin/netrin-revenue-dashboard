import type {
  PersonRestrictionSportDetail,
  PersonRestrictionSportListItem,
} from "../types/person-restriction.types";

function isoDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function nextDate(fromIso: string, days: number): string {
  const date = new Date(fromIso);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const initialSports: PersonRestrictionSportDetail[] = [
  {
    id: "1",
    name: "Futebol",
    internalName: "football",
    lastUpdate: isoDate(12),
    nextUpdate: nextDate(isoDate(12), 30),
    daysNextUpdate: 30,
    statusScraping: "completed",
    canTriggerUpdate: true,
    totalRestrictions: 1_085,
    restrictions: [
      { restrictionType: "Atleta", quantity: 850 },
      { restrictionType: "Comissão Técnica", quantity: 60 },
      { restrictionType: "Agente Intermediário", quantity: 4 },
      { restrictionType: "Arbitragem", quantity: 89 },
      { restrictionType: "Agente Fiscalizador", quantity: 82 },
    ],
    sources: [
      {
        id: "s1",
        restrictionType: "Atleta",
        siteName: "CBF",
        siteUrl: "https://www.cbf.com.br",
        statusScraping: "completed",
      },
      {
        id: "s2",
        restrictionType: "Arbitragem",
        siteName: "CNJ — Cadastro Nacional",
        siteUrl: "https://www.cnj.jus.br",
        statusScraping: "completed",
      },
      {
        id: "s3",
        restrictionType: "Comissão Técnica",
        siteName: "LNB",
        siteUrl: "https://lnb.com.br",
        statusScraping: "completed",
      },
    ],
  },
  {
    id: "2",
    name: "Basquete",
    internalName: "basketball",
    lastUpdate: isoDate(8),
    nextUpdate: nextDate(isoDate(8), 45),
    daysNextUpdate: 45,
    statusScraping: "completed",
    canTriggerUpdate: true,
    totalRestrictions: 412,
    restrictions: [
      { restrictionType: "Atleta", quantity: 310 },
      { restrictionType: "Arbitragem", quantity: 102 },
    ],
    sources: [
      {
        id: "s4",
        restrictionType: "Atleta",
        siteName: "LNB",
        siteUrl: "https://lnb.com.br",
        statusScraping: "completed",
      },
    ],
  },
  {
    id: "3",
    name: "Vôlei",
    internalName: "volleyball",
    lastUpdate: isoDate(20),
    nextUpdate: nextDate(isoDate(20), 30),
    daysNextUpdate: 30,
    statusScraping: "completed",
    canTriggerUpdate: false,
    totalRestrictions: 288,
    restrictions: [
      { restrictionType: "Atleta", quantity: 240 },
      { restrictionType: "Arbitragem", quantity: 48 },
    ],
    sources: [
      {
        id: "s5",
        restrictionType: "Atleta",
        siteName: "CBV",
        siteUrl: "https://cbv.com.br",
        statusScraping: "completed",
      },
    ],
  },
];

let sportsStore = structuredClone(initialSports);

function toListItem(sport: PersonRestrictionSportDetail): PersonRestrictionSportListItem {
  return {
    id: sport.id,
    name: sport.name,
    lastUpdate: sport.lastUpdate,
    nextUpdate: sport.nextUpdate,
    daysNextUpdate: sport.daysNextUpdate,
    statusScraping: sport.statusScraping,
    canTriggerUpdate: sport.canTriggerUpdate,
  };
}

export async function listPersonRestrictionSportsMock(): Promise<PersonRestrictionSportListItem[]> {
  await new Promise((r) => setTimeout(r, 200));
  return sportsStore.map(toListItem);
}

export async function getPersonRestrictionSportMock(
  sportId: string,
): Promise<PersonRestrictionSportDetail> {
  await new Promise((r) => setTimeout(r, 200));
  const found = sportsStore.find((sport) => sport.id === sportId);
  if (!found) {
    throw new Error("Esporte não encontrado");
  }
  return structuredClone(found);
}

export async function triggerPersonRestrictionSportUpdateMock(sportId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 600));
  sportsStore = sportsStore.map((sport) => {
    if (sport.id !== sportId || !sport.canTriggerUpdate) {
      return sport;
    }
    const today = isoDate(0);
    return {
      ...sport,
      lastUpdate: today,
      nextUpdate: nextDate(today, sport.daysNextUpdate),
      statusScraping: "completed",
    };
  });
}

export async function updatePersonRestrictionSportPeriodicityMock(
  sportId: string,
  daysNextUpdate: number,
): Promise<PersonRestrictionSportDetail> {
  await new Promise((r) => setTimeout(r, 400));
  sportsStore = sportsStore.map((sport) => {
    if (sport.id !== sportId) {
      return sport;
    }
    const nextUpdate = sport.lastUpdate
      ? nextDate(sport.lastUpdate, daysNextUpdate)
      : nextDate(isoDate(0), daysNextUpdate);
    return {
      ...sport,
      daysNextUpdate,
      nextUpdate,
    };
  });
  return getPersonRestrictionSportMock(sportId);
}

export async function triggerPersonRestrictionSourceUpdateMock(
  sportId: string,
  sourceId: string,
): Promise<void> {
  await new Promise((r) => setTimeout(r, 500));
  sportsStore = sportsStore.map((sport) => {
    if (sport.id !== sportId) {
      return sport;
    }
    return {
      ...sport,
      sources: sport.sources.map((source) =>
        source.id === sourceId ? { ...source, statusScraping: "completed" } : source,
      ),
    };
  });
}
