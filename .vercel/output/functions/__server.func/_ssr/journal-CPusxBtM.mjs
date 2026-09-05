import { i as __toESM } from "../_runtime.mjs";
import { i as PAIR_BY_ID, o as PAIR_UNIVERSE } from "./pairs-DHGeMw8F.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as formatDateTime, i as cn, x as useTradingStore } from "./router-DFwZ_5tV.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
import { t as Button } from "./button-D7MFyafD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/journal-CPusxBtM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MOODS = [
	{
		id: "plan",
		label: "Plan"
	},
	{
		id: "note",
		label: "Note"
	},
	{
		id: "win",
		label: "Gain"
	},
	{
		id: "loss",
		label: "Perte"
	}
];
function JournalPage() {
	const lastPair = useTradingStore((s) => s.lastPair);
	const journal = useTradingStore((s) => s.journal);
	const addJournal = useTradingStore((s) => s.addJournal);
	const removeJournal = useTradingStore((s) => s.removeJournal);
	const [pair, setPair] = (0, import_react.useState)(lastPair);
	const [mood, setMood] = (0, import_react.useState)("plan");
	const [text, setText] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Journal",
				kicker: "Plans, notes et post-mortem — stockés sur l’appareil"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3 rounded-lg border border-border bg-card p-4",
				onSubmit: (e) => {
					e.preventDefault();
					if (!text.trim()) return;
					addJournal({
						pair,
						mood,
						text: text.trim()
					});
					setText("");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-xs text-muted-foreground",
						children: ["Paire", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: pair,
							onChange: (e) => setPair(e.target.value),
							className: "mt-1 h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground",
							children: PAIR_UNIVERSE.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p.id,
								children: p.display
							}, p.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1 overflow-x-auto",
						children: MOODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMood(m.id),
							className: cn("h-8 shrink-0 rounded-full px-3 text-xs font-medium", mood === m.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
							children: m.label
						}, m.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: text,
						onChange: (e) => setText(e.target.value),
						rows: 4,
						placeholder: "Thèse, invalidation, émotion…",
						className: "w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/60"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						children: "Enregistrer"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-6 divide-y divide-border",
				children: [journal.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-8 text-center text-sm text-muted-foreground",
					children: "Journal vide."
				}), journal.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-medium",
								children: [
									PAIR_BY_ID[j.pair]?.display,
									" · ",
									MOODS.find((m) => m.id === j.mood)?.label
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm leading-relaxed text-muted-foreground",
								children: j.text
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-subtle",
								children: formatDateTime(j.createdAt)
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => removeJournal(j.id),
							children: "Suppr."
						})]
					})
				}, j.id))]
			})
		]
	});
}
//#endregion
export { JournalPage as component };
