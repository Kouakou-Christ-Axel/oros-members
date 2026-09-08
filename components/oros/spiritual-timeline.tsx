import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { StatusBadge, type MemberStatus } from "./status-badge";

/* SpiritualTimeline — a member's progression history, oldest first.
   One entry per recorded step (arrival, baptism, department, consecration…).
   The current step is the terracotta marker with the halo; earlier steps
   are outlined. This is the component the Pastor reads before a visit. */
export type TimelineStepKind =
  | "arrivee"
  | "bapteme"
  | "formation"
  | "departement"
  | "serviteur"
  | "leader"
  | "consecration"
  | "note"
  | "statut";

export const STEP_ICONS: Record<TimelineStepKind, IconName> = {
  arrivee: "user-round-plus",
  bapteme: "droplets",
  formation: "graduation-cap",
  departement: "briefcase-business",
  serviteur: "hand-heart",
  leader: "award",
  consecration: "crown",
  note: "notebook-pen",
  statut: "milestone",
};

export interface TimelineEntry {
  kind?: TimelineStepKind;
  icon?: IconName;
  title: ReactNode;
  date: ReactNode;
  status?: MemberStatus;
  by?: ReactNode;
  note?: ReactNode;
  current?: boolean;
}

export interface SpiritualTimelineProps extends ComponentProps<"ol"> {
  entries?: TimelineEntry[];
}

export function SpiritualTimeline({ entries = [], ...rest }: SpiritualTimelineProps) {
  return (
    <ol data-slot="timeline" {...rest}>
      {entries.map((e, i) => (
        <li
          key={i}
          data-slot="timeline-item"
          data-current={e.current ? "true" : undefined}
          data-done={!e.current && i < entries.length - 1 ? "true" : undefined}
        >
          <span data-slot="timeline-marker">
            <Icon name={e.icon || (e.kind ? STEP_ICONS[e.kind] : undefined) || "circle-dot"} size={13} />
          </span>
          <div data-slot="timeline-body">
            <span data-slot="timeline-title">{e.title}</span>
            <div data-slot="timeline-meta">
              <span>{e.date}</span>
              {e.status ? <StatusBadge status={e.status} /> : null}
              {e.by ? <span>· {e.by}</span> : null}
            </div>
            {e.note ? <span data-slot="timeline-note">{e.note}</span> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
