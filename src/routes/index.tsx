import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { MarketList } from "@/components/markets/market-list";
import { MarketOverview } from "@/components/markets/market-overview";
import { fetchTickers } from "@/lib/trading/functions";
import { useTradingStore } from "@/lib/trading/store";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      return await fetchTickers();
    } catch {
      return [];
    }
  },
  component: MarketsPage,
});

function MarketsPage() {
  const data = Route.useLoaderData();
  useEffect(() => {
    if (data.length) useTradingStore.getState().hydrateTickers(data);
  }, [data]);

  return (
    <div className="mx-auto max-w-3xl lg:max-w-5xl">
      <MarketOverview />
      <MarketList seed={data} embedded />
    </div>
  );
}
