import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BACKEND_ENDPOINTS, backendRequest } from "@/lib/trading/backend";
import { formatFiat, formatQty } from "@/lib/trading/format";
import { fetchKrakenStatus } from "@/lib/trading/functions";
import { useTradingStore } from "@/lib/trading/store";

export const Route = createFileRoute("/connect")({ component: ConnectPage });

function ConnectPage() {
  const connection = useTradingStore((s) => s.connection);
  const setConnection = useTradingStore((s) => s.setConnection);
  const syncKraken = useTradingStore((s) => s.syncKraken);
  const krakenEur = useTradingStore((s) => s.krakenEur);
  const krakenBalances = useTradingStore((s) => s.krakenBalances);
  const [baseUrl, setBaseUrl] = useState(connection.baseUrl);
  const [apiKey, setApiKey] = useState(connection.apiKey);
  const [apiSecret, setApiSecret] = useState(connection.apiSecret);
  const [busy, setBusy] = useState(false);
  const [kraken, setKraken] = useState<{ ok: boolean; ms: number } | null>(null);

  const save = () => setConnection({ baseUrl, apiKey: apiKey.trim(), apiSecret: apiSecret.trim() });

  const testKraken = async () => {
    save();
    setBusy(true);
    await syncKraken();
    setBusy(false);
  };

  const testBackend = async () => {
    save();
    setBusy(true);
    const res = await backendRequest({ ...connection, baseUrl, apiKey, apiSecret }, "/health");
    setConnection({
      baseUrl,
      apiKey,
      apiSecret,
      testedAt: Date.now(),
      testOk: res.ok,
      testMessage: res.message,
    });
    setBusy(false);
  };

  const pingPublic = async () => {
    try {
      const s = await fetchKrakenStatus();
      setKraken(s);
    } catch {
      setKraken({ ok: false, ms: 0 });
    }
  };

  const holdings = Object.entries(krakenBalances).filter(([, q]) => q > 0);

  return (
    <div className="mx-auto max-w-xl px-4 py-5">
      <PageHeader title="Connexion" kicker="Clés stockées sur cet appareil" />
      <Badge tone={connection.testOk ? "buy" : "warn"}>{connection.testOk ? "Kraken OK" : "Non testé"}</Badge>
      <p className="mt-3 text-sm text-muted-foreground">
        Branche tes clés API Kraken pour que les bots réels passent des ordres spot EUR. Droits : Query funds + Create
        & modify orders. Évite Withdrawal.
      </p>

      <div className="mt-5 space-y-3">
        <label className="block space-y-1 text-xs text-muted-foreground">
          Clé publique (API Key)
          <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} autoComplete="off" />
        </label>
        <label className="block space-y-1 text-xs text-muted-foreground">
          Clé privée (Private Key / Secret)
          <Input
            type="password"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            autoComplete="off"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" type="button" onClick={save}>
            Enregistrer
          </Button>
          <Button type="button" onClick={() => void testKraken()} disabled={busy}>
            {busy ? "Test…" : "Tester Kraken"}
          </Button>
        </div>
        {connection.testMessage && (
          <p className={connection.testOk ? "text-sm text-buy" : "text-sm text-sell"}>{connection.testMessage}</p>
        )}
        {connection.testOk && (
          <div className="rounded-lg border border-border bg-muted p-3">
            <p className="text-xs text-muted-foreground">EUR disponible</p>
            <p className="mt-1 font-mono text-lg tabular-nums">{formatFiat(krakenEur, "EUR")}</p>
            {holdings.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {holdings.slice(0, 8).map(([asset, qty]) => (
                  <li key={asset} className="flex justify-between">
                    <span>{asset}</span>
                    <span className="font-mono">{formatQty(qty, 6)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <Button variant="ghost" type="button" className="w-full" onClick={() => void pingPublic()}>
          Ping Kraken public {kraken ? `· ${kraken.ok ? `${kraken.ms} ms` : "échec"}` : ""}
        </Button>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-4 text-sm">
        <p className="font-medium">Backend perso (optionnel)</p>
        <p className="mt-1 text-xs text-muted-foreground">Si tu préfères relayer tes propres endpoints plus tard.</p>
        <label className="mt-3 block space-y-1 text-xs text-muted-foreground">
          URL backend
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.votre-domaine.com"
          />
        </label>
        <Button variant="outline" className="mt-3 w-full" type="button" onClick={() => void testBackend()} disabled={busy}>
          Tester /health
        </Button>
        <ul className="mt-3 space-y-1.5 font-mono text-xs text-muted-foreground">
          {BACKEND_ENDPOINTS.map((e) => (
            <li key={e.path}>
              <span className="text-foreground">{e.method}</span> {e.path}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
