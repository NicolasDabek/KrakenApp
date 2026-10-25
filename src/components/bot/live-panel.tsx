import { Link } from "@tanstack/react-router";
import { Square } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime, formatFiat, formatQty } from "@/lib/trading/format";
import { useTradingStore } from "@/lib/trading/store";
import { Field } from "@/components/bot/shared";

export function LivePanel() {
  const connection = useTradingStore((s) => s.connection);
  const setConnection = useTradingStore((s) => s.setConnection);
  const syncKraken = useTradingStore((s) => s.syncKraken);
  const pauseAllBots = useTradingStore((s) => s.pauseAllBots);
  const krakenEur = useTradingStore((s) => s.krakenEur);
  const krakenBalances = useTradingStore((s) => s.krakenBalances);
  const krakenError = useTradingStore((s) => s.krakenError);
  const krakenSyncAt = useTradingStore((s) => s.krakenSyncAt);
  const [apiKey, setApiKey] = useState(connection.apiKey);
  const [apiSecret, setApiSecret] = useState(connection.apiSecret);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setApiKey(connection.apiKey);
    setApiSecret(connection.apiSecret);
  }, [connection.apiKey, connection.apiSecret]);

  const save = () => setConnection({ apiKey: apiKey.trim(), apiSecret: apiSecret.trim() });

  const test = async () => {
    save();
    setBusy(true);
    await syncKraken();
    setBusy(false);
  };

  const holdings = Object.entries(krakenBalances).filter(([a, q]) => a !== "EUR" && q > 0).slice(0, 6);

  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Solde Kraken (EUR)</p>
          <p className="mt-1 font-mono text-2xl font-medium tabular-nums tracking-tight">
            {formatFiat(krakenEur, "EUR")}
          </p>
          {krakenSyncAt > 0 && (
            <p className="mt-1 text-xs text-subtle">Sync {formatDateTime(krakenSyncAt)}</p>
          )}
        </div>
        <Badge tone={connection.testOk ? "buy" : "warn"}>{connection.testOk ? "Clés OK" : "Hors ligne"}</Badge>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Clé publique et clé privée Kraken (Spot). Droits : Query funds + Create & modify orders. Les clés restent
        sur cet appareil.
      </p>
      <div className="mt-3 space-y-2">
        <Field label="Clé publique (API Key)">
          <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} autoComplete="off" />
        </Field>
        <Field label="Clé privée (API Secret)">
          <Input
            type="password"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            autoComplete="off"
          />
        </Field>
      </div>
      {krakenError && <p className="mt-2 text-xs text-sell">{krakenError}</p>}
      {holdings.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          {holdings.map(([asset, qty]) => (
            <li key={asset} className="flex justify-between">
              <span>{asset}</span>
              <span className="font-mono tabular-nums">{formatQty(qty, 6)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => void test()} disabled={busy}>
          {busy ? "Test…" : "Tester Kraken"}
        </Button>
        <Button variant="sell" onClick={() => pauseAllBots("live")}>
          <Square className="size-3.5" />
          Stop réel
        </Button>
      </div>
      <Link to="/connect" className="mt-2 block text-center text-xs text-accent">
        Page connexion complète
      </Link>
      <p className="mt-3 text-[11px] leading-relaxed text-subtle">
        Les bots réels envoient des ordres marché spot EUR. Un timeout Kraken met le bot en pause (pas de double ordre). Le garde-fou flux est dans Paramètres. Par défaut ils se mettent en pause au rechargement.
      </p>
    </div>
  );
}
