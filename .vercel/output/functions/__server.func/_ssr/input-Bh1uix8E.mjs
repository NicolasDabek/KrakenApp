import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-CQTqeWMb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-Bh1uix8E.js
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground", "placeholder:text-subtle outline-none transition-colors duration-150", "focus-visible:ring-2 focus-visible:ring-ring/60", className),
		...props
	});
}
//#endregion
export { Input as t };
