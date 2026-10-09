"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export interface ExpandableClientListItem {
  id: string;
  name: string;
}

interface ExpandableClientListProps<T extends ExpandableClientListItem> {
  clients: T[];
  emptyMessage: string;
  titleClassName?: string;
  collapsedChevron?: "left" | "right";
  chevronSize?: number;
  panelClassName?: string;
  renderPanel: (client: T) => ReactNode;
}

export function ExpandableClientList<T extends ExpandableClientListItem>({
  clients,
  emptyMessage,
  titleClassName = "text-base font-medium text-default-800",
  collapsedChevron = "right",
  chevronSize = 20,
  panelClassName = "px-10 py-4 space-y-3 border-t border-default-200",
  renderPanel,
}: ExpandableClientListProps<T>) {
  const [expandedClientId, setExpandedClientId] = useState("");

  if (clients.length === 0) {
    return (
      <p className="text-sm text-default-400 py-8 text-center">{emptyMessage}</p>
    );
  }

  const CollapsedIcon = collapsedChevron === "left" ? ChevronLeft : ChevronRight;

  return (
    <div className="border border-default-200 rounded-lg overflow-hidden">
      {clients.map((client) => {
        const isExpanded = expandedClientId === client.id;
        return (
          <div
            key={client.id}
            className="border-b border-default-200 last:border-b-0"
          >
            <button
              type="button"
              className="w-full h-12 px-5 flex items-center justify-between text-left hover:bg-default-50 transition-colors"
              onClick={() => setExpandedClientId(isExpanded ? "" : client.id)}
              aria-expanded={isExpanded}
            >
              <span className={titleClassName}>{client.name}</span>
              {isExpanded ? (
                <ChevronDown
                  size={chevronSize}
                  className="text-default-500 shrink-0"
                />
              ) : (
                <CollapsedIcon
                  size={chevronSize}
                  className="text-default-500 shrink-0"
                />
              )}
            </button>
            {isExpanded && <div className={panelClassName}>{renderPanel(client)}</div>}
          </div>
        );
      })}
    </div>
  );
}
