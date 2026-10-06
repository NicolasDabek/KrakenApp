import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-CQTqeWMb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/segmented-DgitihsW.js
var import_jsx_runtime = require_jsx_runtime();
function Segmented({ value, onChange, options, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex gap-1 overflow-x-auto", className),
		children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(option.id),
			className: cn("h-9 shrink-0 rounded-full px-3 text-xs font-medium transition-colors duration-150", value === option.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
			children: option.label
		}, option.id))
	});
}
//#endregion
export { Segmented as t };
