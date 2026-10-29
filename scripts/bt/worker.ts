import { parentPort } from "node:worker_threads";
import { runDataset } from "./lib.ts";
parentPort!.on("message", (j: { id: number; kind: never; params: never; ds: string }) => {
  try { parentPort!.postMessage({ id: j.id, res: runDataset(j.kind, j.params, j.ds) }); }
  catch (e) { parentPort!.postMessage({ id: j.id, err: String(e) }); }
});
