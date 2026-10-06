import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cn } from "./utils.ts";

describe("cn", () => {
  it("merges tailwind classes and drops conflicts", () => {
    assert.equal(cn("px-2", "px-4"), "px-4");
    assert.ok(cn("text-red-500", false && "hidden", "font-bold").includes("font-bold"));
    assert.equal(cn(), "");
  });
});
