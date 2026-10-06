import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-CQTqeWMb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-Cl68uAGu.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "neutral", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", tone === "neutral" && "bg-muted text-muted-foreground", tone === "buy" && "bg-buy/15 text-buy", tone === "sell" && "bg-sell/15 text-sell", tone === "accent" && "bg-accent/15 text-accent", tone === "warn" && "bg-warning/15 text-warning", className),
		...props
	});
}
//#endregion
export { Badge as t };
