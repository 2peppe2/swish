import {
  CircleCheckBig,
  CircleX,
  TriangleAlert,
  CloudAlert,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

type StatusContent = {
  badge: string;
  title: string;
  description: string;
  badgeStyle: CSSProperties;
  tone: string;
  iconWrap: string;
  cardTone: string;
  Icon: LucideIcon;
  primaryActionLabel: string;
};

const statusContent = {
  PAID: {
    badge: "Betald",
    title: "Betalningen är klar",
    description: "Swish-betalningen genomförd!",
    badgeStyle: {
      backgroundColor: "#dcfce7",
      borderColor: "#86efac",
      color: "#166534",
    },
    tone:
      "border-emerald-200/80 bg-linear-to-br from-emerald-500/18 via-emerald-400/10 to-background text-emerald-800 dark:border-emerald-500/30 dark:from-emerald-500/20 dark:via-emerald-400/10 dark:to-background dark:text-emerald-200",
    iconWrap:
      "border-emerald-200/80 bg-white/70 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300",
    cardTone:
      "shadow-emerald-500/10 dark:shadow-emerald-500/10",
    Icon: CircleCheckBig,
    primaryActionLabel: "Fortsätt",
  },
  CANCELLED: {
    badge: "Avbruten",
    title: "Betalningen avbröts",
    description: "Swishbetalningen avbröts, inga pengar har dragits.",
    badgeStyle: {
      backgroundColor: "#e2e8f0",
      borderColor: "#cbd5e1",
      color: "#0f172a",
    },
    tone:
      "border-slate-200/80 bg-linear-to-br from-slate-400/18 via-slate-300/8 to-background text-slate-800 dark:border-slate-500/30 dark:from-slate-500/20 dark:via-slate-400/10 dark:to-background dark:text-slate-200",
    iconWrap:
      "border-slate-200/80 bg-white/70 text-slate-700 dark:border-slate-500/30 dark:bg-slate-950/40 dark:text-slate-300",
    cardTone:
      "shadow-slate-500/10 dark:shadow-slate-500/10",
    Icon: CircleX,
    primaryActionLabel: "Tillbaka till betalalternativ",
  },
  DECLINED: {
    badge: "Nekad",
    title: "Betalningen nekades",
    description: "Swishbetalningen avvisades innan köpet kunde slutföras, inga pengar har dragits.",
    badgeStyle: {
      backgroundColor: "#fef3c7",
      borderColor: "#fcd34d",
      color: "#92400e",
    },
    tone:
      "border-amber-200/80 bg-linear-to-br from-amber-400/20 via-amber-300/10 to-background text-amber-800 dark:border-amber-500/30 dark:from-amber-500/20 dark:via-amber-400/10 dark:to-background dark:text-amber-200",
    iconWrap:
      "border-amber-200/80 bg-white/70 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300",
    cardTone:
      "shadow-amber-500/10 dark:shadow-amber-500/10",
    Icon: TriangleAlert,
    primaryActionLabel: "Försök igen",
  },
  ERROR: {
    badge: "Fel",
    title: "Något gick fel",
    description: "Vi kunde inte slutföra betalningen på grund av ett tekniskt problem.",
    badgeStyle: {
      backgroundColor: "#ffe4e6",
      borderColor: "#fda4af",
      color: "#9f1239",
    },
    tone:
      "border-rose-200/80 bg-linear-to-br from-rose-400/20 via-rose-300/10 to-background text-rose-800 dark:border-rose-500/30 dark:from-rose-500/20 dark:via-rose-400/10 dark:to-background dark:text-rose-200",
    iconWrap:
      "border-rose-200/80 bg-white/70 text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300",
    cardTone:
      "shadow-rose-500/10 dark:shadow-rose-500/10",
    Icon: CloudAlert,
    primaryActionLabel: "Försök igen",
  },
  
} as const satisfies Record<string, StatusContent>;

export { statusContent };
export type { StatusContent };
