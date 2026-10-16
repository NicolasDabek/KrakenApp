import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { orphanProtectiveOrders } from "./order-hygiene.ts";

describe("orphanProtectiveOrders", () => {
  it("flags stops/TPs only on pairs without a main limit order", () => {
    const open = {
      A: { descr: { pair: "XBTEUR", ordertype: "limit" } },
      B: { descr: { pair: "XBTEUR", ordertype: "stop-loss" } },
      C: { descr: { pair: "ETHEUR", ordertype: "stop-loss" } },
      D: { descr: { pair: "ETHEUR", ordertype: "take-profit-limit" } },
      E: { descr: { pair: "SOLEUR", ordertype: "market" } },
    };
    assert.deepEqual(orphanProtectiveOrders(open).sort(), ["C", "D"]);
    assert.deepEqual(orphanProtectiveOrders(open, ["XBTEUR"]), []);
  });
  it("handles empty input", () => {
    assert.deepEqual(orphanProtectiveOrders(undefined), []);
    assert.deepEqual(orphanProtectiveOrders({}), []);
  });
});
