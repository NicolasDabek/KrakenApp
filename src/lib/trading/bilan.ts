import { parisDate, parisMonth, parisYear } from "./fiscal.ts";

export type BilanPeriod = "today" | "7d" | "30d" | "all";

export type BilanFill = {
  pair: string;
  side: "buy" | "sell";
  amount: number;
  price: number;
  fee: number;
  pnl: number;
  time: number;
};

export type BilanRow = {
  pair: string;
  buys: number;
  sells: number;
  fees: number;
  pnl: number;
  volume: number;
  wins: number;
};

export type Bilan = {
  from: number;
  trades: number;
  buys: number;
  sells: number;
  fees: number;
  pnl: number;
  volume: number;
  wins: number;
  losses: number;
  winRate: number;
  rows: BilanRow[];
};

function parisDay(ms: number): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", day: "numeric" }).format(ms));
}

export function periodStart(period: BilanPeriod, now: number): number {
  if (period === "all") return 0;
  if (period === "7d") return now - 7 * 86_400_000;
  if (period === "30d") return now - 30 * 86_400_000;
  return parisDate(parisYear(now), parisMonth(now), parisDay(now));
}

export function buildBilan(fills: BilanFill[], period: BilanPeriod, now: number): Bilan {
  const from = periodStart(period, now);
  const picked = fills.filter((fill) => fill.time >= from && fill.amount > 0 && fill.price > 0);
  const map = new Map<string, BilanRow>();
  let fees = 0;
  let pnl = 0;
  let volume = 0;
  let buys = 0;
  let sells = 0;
  let wins = 0;
  let losses = 0;
  for (const fill of picked) {
    const row = map.get(fill.pair) ?? { pair: fill.pair, buys: 0, sells: 0, fees: 0, pnl: 0, volume: 0, wins: 0 };
    const notion = fill.amount * fill.price;
    row.fees += fill.fee || 0;
    row.volume += notion;
    fees += fill.fee || 0;
    volume += notion;
    if (fill.side === "buy") {
      row.buys += 1;
      buys += 1;
    } else {
      row.sells += 1;
      sells += 1;
      row.pnl += fill.pnl || 0;
      pnl += fill.pnl || 0;
      if ((fill.pnl || 0) > 0) {
        row.wins += 1;
        wins += 1;
      } else losses += 1;
    }
    map.set(fill.pair, row);
  }
  const rows = [...map.values()].sort((a, b) => b.pnl - a.pnl || b.volume - a.volume);
  return {
    from,
    trades: picked.length,
    buys,
    sells,
    fees,
    pnl,
    volume,
    wins,
    losses,
    winRate: sells > 0 ? (wins / sells) * 100 : 0,
    rows,
  };
}

function csvNum(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

export function bilanToCsv(report: Bilan): string {
  const lines = ["paire;achats;ventes;frais_eur;pnl_eur;volume_eur;gains"];
  for (const row of report.rows) {
    lines.push(
      [row.pair, String(row.buys), String(row.sells), csvNum(row.fees), csvNum(row.pnl), csvNum(row.volume), String(row.wins)].join(";"),
    );
  }
  lines.push(["TOTAL", String(report.buys), String(report.sells), csvNum(report.fees), csvNum(report.pnl), csvNum(report.volume), String(report.wins)].join(";"));
  return `\uFEFF${lines.join("\n")}`;
}
