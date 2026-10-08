"use client";

const SUBLINE_CLASS = "text-xs text-gray-500";

export function SupportToolsClientCell({
  clientName,
  clientId,
  ip,
}: {
  clientName: string;
  clientId: number;
  ip?: string | null;
}) {
  const subline =
    ip !== undefined ? `ID ${clientId} | IP ${ip ?? "—"}` : `ID ${clientId}`;

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-gray-900">{clientName}</span>
      <span className={SUBLINE_CLASS}>{subline}</span>
    </div>
  );
}

export function SupportToolsDataSourceCell({
  name,
  dataSourceId,
}: {
  name: string | null;
  dataSourceId: number;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-gray-900">{name ?? "—"}</span>
      <span className={SUBLINE_CLASS}>ID {dataSourceId}</span>
    </div>
  );
}

export function SupportToolsUserCell({
  username,
  userId,
}: {
  username: string;
  userId: number;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-gray-900">{username}</span>
      <span className={SUBLINE_CLASS}>ID {userId}</span>
    </div>
  );
}
