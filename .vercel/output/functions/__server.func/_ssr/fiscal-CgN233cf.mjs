import { i as __toESM } from "../_runtime.mjs";
import { At as uid, C as legsFromKrakenCsv, D as parisMonth, E as parisDate, Lt as PAIR_UNIVERSE, N as resolvePeriod, O as parisYear, T as movesFromLedgers, _ as formatFiscalDate, n as buildFiscalReport, st as formatFiat, w as movesFromFills } from "./kraken.server-CQDHT3_G.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as fetchOhlc, t as cn, v as krakenLedgers } from "./utils-CQTqeWMb.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
import { t as Button } from "./button-C4JPhzGd.mjs";
import { t as Input } from "./input-Bh1uix8E.mjs";
import { t as Segmented } from "./segmented-DgitihsW.mjs";
import { t as Badge } from "./badge-Cl68uAGu.mjs";
import { a as eurUsdRate, s as isLiveConnected, u as useTradingStore } from "./router-DCxDvC4F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fiscal-CgN233cf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DISCLAIMER = "Aide au calcul selon la méthode du portefeuille global (CGI art. 150 VH bis, formulaire 2086). Document non officiel, ce n’est pas un conseil fiscal. Les échanges crypto-crypto ne sont pas imposables. Le seuil de 305 € s’apprécie sur la somme des prix de cession nets de frais (ligne 218) de l’année civile. PFU 30 % (12,8 % + 17,2 %) jusqu’aux revenus 2025, puis 31,4 % (12,8 % + 18,6 %) à compter de 2026. Les moins-values se reportent sur les 10 années suivantes. Les revenus de staking sont listés à part.";
function eur(n) {
	return n.toLocaleString("fr-FR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}
function qty(n) {
	return n.toLocaleString("fr-FR", { maximumFractionDigits: 8 });
}
function who(id) {
	return `${id.firstName} ${id.lastName}`.trim() || "Contribuable";
}
function reportToText(report, id) {
	const lines = [];
	lines.push("NAUTILUS — AIDE À LA DÉCLARATION DES PLUS-VALUES D'ACTIFS NUMÉRIQUES");
	lines.push(`Contribuable : ${who(id)}`);
	if (id.taxId.trim()) lines.push(`N° fiscal : ${id.taxId.trim()}`);
	lines.push(`Période : ${report.period.label}`);
	lines.push(`Source : ${report.sourceLabel}`);
	lines.push("");
	lines.push("SYNTHÈSE (formulaire 2086)");
	lines.push(`Prix de cession net de la période : ${eur(report.totalCessions)} EUR`);
	lines.push(`Plus-values : ${eur(report.totalGains)} EUR`);
	lines.push(`Moins-values : ${eur(report.totalLosses)} EUR`);
	lines.push(`Solde net : ${eur(report.net)} EUR (arrondi ${report.netEuros} EUR)`);
	lines.push(`Prix total d'acquisition début : ${eur(report.openingPta)} EUR`);
	lines.push(`Prix total d'acquisition fin : ${eur(report.closingPta)} EUR`);
	lines.push(`Échanges crypto-crypto (non imposables) : ${report.swapCount}`);
	if (report.declaration) {
		const box = report.declaration;
		lines.push("");
		lines.push(`ANNÉE ${box.year} — CASES À REPORTER`);
		lines.push(`Somme des lignes 218 (prix de cession nets) : ${eur(box.cessionsNet)} EUR`);
		lines.push(`Ligne 52, solde des plus ou moins-values : ${eur(box.gain)} EUR`);
		if (box.exempt) lines.push("Exonération : total ≤ 305 EUR. Déposer la 2086 sans montant en 3AN ni 3BN.");
		else if (box.reportBox === "3AN") {
			lines.push(`Moins-values antérieures imputées : ${eur(box.imputed)} EUR`);
			lines.push(`2042-C case 3AN : ${box.reportEuros} EUR`);
		} else if (box.reportBox === "3BN") lines.push(`2042-C case 3BN : ${box.reportEuros} EUR`);
		else lines.push("Aucune plus-value imposable après imputation des moins-values.");
	} else if (report.exempt) lines.push("Exonération : total des cessions de l'année civile ≤ 305 EUR.");
	if (report.tax) lines.push(`${report.indicative ? "Estimation indicative" : "PFU"} ${report.tax.label} : IR ${eur(report.tax.ir)} + PS ${eur(report.tax.ps)} = ${eur(report.tax.total)} EUR`);
	else if (report.net < 0 && !report.exempt) lines.push("Moins-value nette : reportable sur les plus-values des 10 années suivantes (case 3BN si année civile).");
	if (report.yearCessions.length) {
		lines.push("");
		lines.push("CESSIONS PAR ANNÉE CIVILE");
		for (const y of report.yearCessions) lines.push(`  ${y.year} : ${eur(y.total)} EUR${y.exempt ? " — sous le seuil de 305 EUR" : ""}`);
	}
	lines.push("");
	lines.push("CESSIONS IMPOSABLES");
	lines.push("Date ; Actif ; Quantité ; Prix brut ; Frais ; Prix net ; Valeur portefeuille ; Acquisition imputée ; Plus-value");
	for (const c of report.cessions) lines.push([
		formatFiscalDate(c.time),
		c.asset,
		qty(c.qty),
		eur(c.grossEur),
		eur(c.feesEur),
		eur(c.netEur),
		eur(c.portfolioEur),
		eur(c.acquiredEur),
		eur(c.gainEur)
	].join(" ; "));
	if (!report.cessions.length) lines.push("Aucune cession imposable sur la période.");
	lines.push("");
	lines.push("REVENUS (staking et assimilés) — hors cases 2086");
	if (!report.incomes.length) lines.push("Aucun revenu détecté.");
	for (const row of report.incomes) lines.push(`${formatFiscalDate(row.time)} ; ${row.asset} ; ${qty(row.qty)} ; ${eur(row.valueEur)} EUR ; ${row.note ?? ""}`);
	lines.push("");
	lines.push("ANNEXE 3916-BIS — COMPTE D'ACTIFS NUMÉRIQUES À L'ÉTRANGER");
	lines.push("Exploitant : Kraken (Payward), opérateur étranger");
	lines.push(`Référence de compte : ${id.accountRef.trim() || "à compléter"}`);
	lines.push("Nature : compte d'actifs numériques");
	lines.push("");
	lines.push(DISCLAIMER);
	for (const w of report.warnings) lines.push(`- ${w}`);
	return lines.join("\n");
}
function reportToCsv(report) {
	return `\uFEFF${[[
		"date",
		"actif",
		"quantite",
		"213_prix_brut_eur",
		"214_frais_eur",
		"218_prix_net_eur",
		"212_portefeuille_eur",
		"220_acquisitions_eur",
		"223_acquisition_nette_eur",
		"acquisition_imputee_eur",
		"224_plus_value_eur",
		"cours_manquant"
	], ...report.cessions.map((c) => [
		formatFiscalDate(c.time),
		c.asset,
		String(c.qty),
		num(c.grossEur),
		num(c.feesEur),
		num(c.netEur),
		num(c.portfolioEur),
		num(c.ptaEver),
		num(c.ptaBefore),
		num(c.acquiredEur),
		num(c.gainEur),
		c.incomplete ? "oui" : "non"
	])].map((r) => r.map(csvCell).join(";")).join("\r\n")}\r\n`;
}
function reportToJson(report, id) {
	return JSON.stringify({
		identity: id,
		disclaimer: DISCLAIMER,
		report
	}, null, 2);
}
function num(n) {
	return n.toFixed(2).replace(".", ",");
}
function csvCell(value) {
	return `"${value.replaceAll("\"", "\"\"")}"`;
}
function xml(text) {
	return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
}
var CRC_TABLE = (() => {
	const table = /* @__PURE__ */ new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
		table[n] = c >>> 0;
	}
	return table;
})();
function crc32(data) {
	let c = 4294967295;
	for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 255] ^ c >>> 8;
	return (c ^ 4294967295) >>> 0;
}
function dosStamp(ms) {
	const d = new Date(ms);
	return {
		time: d.getUTCHours() << 11 | d.getUTCMinutes() << 5 | d.getUTCSeconds() >> 1,
		date: d.getUTCFullYear() - 1980 << 9 | d.getUTCMonth() + 1 << 5 | d.getUTCDate()
	};
}
function zipStore(files, now = Date.now()) {
	const enc = new TextEncoder();
	const { time, date } = dosStamp(now);
	const parts = [];
	const central = [];
	let offset = 0;
	for (const file of files) {
		const name = enc.encode(file.name);
		const crc = crc32(file.data);
		const local = new Uint8Array(30 + name.length);
		const lv = new DataView(local.buffer);
		lv.setUint32(0, 67324752, true);
		lv.setUint16(4, 20, true);
		lv.setUint16(6, 2048, true);
		lv.setUint16(8, 0, true);
		lv.setUint16(10, time, true);
		lv.setUint16(12, date, true);
		lv.setUint32(14, crc, true);
		lv.setUint32(18, file.data.length, true);
		lv.setUint32(22, file.data.length, true);
		lv.setUint16(26, name.length, true);
		lv.setUint16(28, 0, true);
		local.set(name, 30);
		parts.push(local, file.data);
		const cen = new Uint8Array(46 + name.length);
		const cv = new DataView(cen.buffer);
		cv.setUint32(0, 33639248, true);
		cv.setUint16(4, 20, true);
		cv.setUint16(6, 20, true);
		cv.setUint16(8, 2048, true);
		cv.setUint16(10, 0, true);
		cv.setUint16(12, time, true);
		cv.setUint16(14, date, true);
		cv.setUint32(16, crc, true);
		cv.setUint32(20, file.data.length, true);
		cv.setUint32(24, file.data.length, true);
		cv.setUint16(28, name.length, true);
		cv.setUint16(30, 0, true);
		cv.setUint16(32, 0, true);
		cv.setUint16(34, 0, true);
		cv.setUint16(36, 0, true);
		cv.setUint32(38, 0, true);
		cv.setUint32(42, offset, true);
		cen.set(name, 46);
		central.push(cen);
		offset += local.length + file.data.length;
	}
	const cdSize = central.reduce((s, c) => s + c.length, 0);
	const eocd = /* @__PURE__ */ new Uint8Array(22);
	const ev = new DataView(eocd.buffer);
	ev.setUint32(0, 101010256, true);
	ev.setUint16(4, 0, true);
	ev.setUint16(6, 0, true);
	ev.setUint16(8, files.length, true);
	ev.setUint16(10, files.length, true);
	ev.setUint32(12, cdSize, true);
	ev.setUint32(16, offset, true);
	ev.setUint16(20, 0, true);
	const total = offset + cdSize + eocd.length;
	const out = new Uint8Array(total);
	let p = 0;
	for (const part of parts) {
		out.set(part, p);
		p += part.length;
	}
	for (const cen of central) {
		out.set(cen, p);
		p += cen.length;
	}
	out.set(eocd, p);
	return out;
}
function utf8(text) {
	return new TextEncoder().encode(text);
}
function sheetXml(rows) {
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((row, r) => {
		const cells = row.map((cell, c) => {
			const ref = `${colName(c)}${r + 1}`;
			if (typeof cell === "number" && Number.isFinite(cell)) return `<c r="${ref}"><v>${cell}</v></c>`;
			return `<c r="${ref}" t="inlineStr"><is><t>${xml(String(cell))}</t></is></c>`;
		}).join("");
		return `<row r="${r + 1}">${cells}</row>`;
	}).join("")}</sheetData></worksheet>`;
}
function colName(index) {
	let n = index + 1;
	let s = "";
	while (n > 0) {
		const m = (n - 1) % 26;
		s = String.fromCharCode(65 + m) + s;
		n = Math.floor((n - 1) / 26);
	}
	return s;
}
function cessionRows(report) {
	return [[
		"Date",
		"Actif",
		"Quantité",
		"213 brut",
		"214 frais",
		"218 net",
		"212 portefeuille",
		"220 acquisitions",
		"223 PTA nette",
		"Imputée",
		"224 PV",
		"Incomplet"
	], ...report.cessions.map((c) => [
		formatFiscalDate(c.time),
		c.asset,
		c.qty,
		c.grossEur,
		c.feesEur,
		c.netEur,
		c.portfolioEur,
		c.ptaEver,
		c.ptaBefore,
		c.acquiredEur,
		c.gainEur,
		c.incomplete ? "oui" : "non"
	])];
}
function reportToXlsx(report, id) {
	const summary = [
		["Nautilus — formulaire 2086 (aide au calcul)"],
		["Contribuable", who(id)],
		["N° fiscal", id.taxId.trim()],
		["Période", report.period.label],
		["Source", report.sourceLabel],
		["Cessions nettes EUR", report.totalCessions],
		["Plus-values EUR", report.totalGains],
		["Moins-values EUR", report.totalLosses],
		["Solde net EUR", report.net],
		["Solde arrondi EUR", report.netEuros],
		["PTA début EUR", report.openingPta],
		["PTA fin EUR", report.closingPta],
		["Exonération 305 EUR", report.exempt ? "oui" : "non"],
		["Moins-values imputées EUR", report.declaration?.imputed ?? 0],
		["Case 2042-C", report.declaration?.reportBox ?? ""],
		["Montant à reporter EUR", report.declaration?.reportEuros ?? ""],
		["IR 12,8 %", report.tax?.ir ?? 0],
		[`Prélèvements sociaux ${report.tax ? Math.round(report.tax.psRate * 1e3) / 10 : 17.2} %`, report.tax?.ps ?? 0],
		[`PFU ${report.tax?.label ?? ""}`.trim(), report.tax?.total ?? 0],
		["Note", report.indicative ? "PFU indicatif : la période n'est pas une année civile." : "PFU sur l'année civile."],
		["Avertissement", DISCLAIMER]
	];
	const annex = [
		["3916-bis — compte d'actifs numériques"],
		["Exploitant", "Kraken (Payward), opérateur étranger"],
		["Référence", id.accountRef.trim() || "à compléter"],
		["Nature", "Compte d'actifs numériques"],
		[],
		["Revenus staking / assimilés (hors 2086)"],
		[
			"Date",
			"Actif",
			"Quantité",
			"Valeur EUR",
			"Note"
		],
		...report.incomes.map((row) => [
			formatFiscalDate(row.time),
			row.asset,
			row.qty,
			row.valueEur,
			row.note ?? ""
		]),
		[],
		[
			"Année civile",
			"Cessions nettes EUR",
			"Solde EUR",
			"Imputé EUR",
			"Imposable EUR",
			"Moins-value EUR",
			"Sous 305 EUR",
			"PFU"
		],
		...report.yearSheets.map((y) => [
			y.year,
			y.cessionsNet,
			y.gain,
			y.imputed,
			y.taxable,
			y.lossCreated,
			y.exempt ? "oui" : "non",
			y.tax?.total ?? 0
		]),
		[],
		["Journal des mouvements"],
		[
			"Date",
			"Type",
			"Actif",
			"Quantité",
			"EUR",
			"Frais",
			"Source",
			"Dans la période",
			"Note"
		],
		...report.journal.map((row) => [
			formatFiscalDate(row.time),
			row.kind,
			row.asset,
			row.qty,
			row.quoteQty ?? "",
			row.feeEur ?? "",
			row.source,
			row.inPeriod ? "oui" : "non",
			row.note ?? ""
		])
	];
	return zipStore([
		{
			name: "[Content_Types].xml",
			data: utf8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`)
		},
		{
			name: "_rels/.rels",
			data: utf8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`)
		},
		{
			name: "xl/workbook.xml",
			data: utf8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>
<sheet name="Synthese" sheetId="1" r:id="rId1"/>
<sheet name="Cessions" sheetId="2" r:id="rId2"/>
<sheet name="Annexe" sheetId="3" r:id="rId3"/>
</sheets>
</workbook>`)
		},
		{
			name: "xl/_rels/workbook.xml.rels",
			data: utf8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
</Relationships>`)
		},
		{
			name: "xl/worksheets/sheet1.xml",
			data: utf8(sheetXml(summary))
		},
		{
			name: "xl/worksheets/sheet2.xml",
			data: utf8(sheetXml(cessionRows(report)))
		},
		{
			name: "xl/worksheets/sheet3.xml",
			data: utf8(sheetXml(annex))
		}
	]);
}
function para(text, bold = false) {
	return `<w:p><w:r>${bold ? "<w:rPr><w:b/></w:rPr>" : ""}<w:t xml:space="preserve">${xml(text)}</w:t></w:r></w:p>`;
}
function docTable(headers, rows) {
	const cell = (text, header = false) => `<w:tc><w:p><w:r>${header ? "<w:rPr><w:b/></w:rPr>" : ""}<w:t xml:space="preserve">${xml(text)}</w:t></w:r></w:p></w:tc>`;
	const tr = (values, header = false) => `<w:tr>${values.map((v) => cell(v, header)).join("")}</w:tr>`;
	return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/></w:tblPr>${tr(headers, true)}${rows.map((r) => tr(r)).join("")}</w:tbl>`;
}
function reportToDocx(report, id) {
	const tableRows = report.cessions.map((c) => [
		formatFiscalDate(c.time),
		c.asset,
		qty(c.qty),
		eur(c.netEur),
		eur(c.portfolioEur),
		eur(c.acquiredEur),
		eur(c.gainEur)
	]);
	const incomeRows = report.incomes.map((row) => [
		formatFiscalDate(row.time),
		row.asset,
		qty(row.qty),
		eur(row.valueEur),
		row.note ?? ""
	]);
	const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${[
		para("Nautilus — plus-values d'actifs numériques (2086)", true),
		para(`Contribuable : ${who(id)}${id.taxId.trim() ? ` — n° ${id.taxId.trim()}` : ""}`),
		para(`Période : ${report.period.label}`),
		para(`Source : ${report.sourceLabel}`),
		para(`Cessions nettes : ${eur(report.totalCessions)} EUR`),
		para(`Solde de plus ou moins-value : ${eur(report.net)} EUR (arrondi ${report.netEuros} EUR)`),
		report.declaration ? para(report.declaration.exempt ? `Année ${report.declaration.year} exonérée (cessions nettes ${eur(report.declaration.cessionsNet)} EUR).` : `Année ${report.declaration.year} : case ${report.declaration.reportBox} = ${report.declaration.reportEuros} EUR. Moins-values imputées ${eur(report.declaration.imputed)} EUR.`) : para(""),
		report.tax ? para(`PFU ${report.tax.label} : ${eur(report.tax.total)} EUR (IR ${eur(report.tax.ir)} + PS ${eur(report.tax.ps)}).`) : para("Pas de PFU estimé sur cette période."),
		para(`Prix total d'acquisition : ${eur(report.openingPta)} EUR en début de période, ${eur(report.closingPta)} EUR en fin.`),
		para("Cessions imposables", true),
		report.cessions.length ? docTable([
			"Date",
			"Actif",
			"Qté",
			"Prix net",
			"Portefeuille",
			"Acquisition",
			"PV"
		], tableRows) : para("Aucune cession imposable sur la période."),
		para("Revenus staking et assimilés", true),
		report.incomes.length ? docTable([
			"Date",
			"Actif",
			"Qté",
			"Valeur EUR",
			"Note"
		], incomeRows) : para("Aucun revenu détecté."),
		para("Compte d'actifs numériques (3916-bis)", true),
		para("Exploitant : Kraken (Payward), opérateur étranger."),
		para(`Référence : ${id.accountRef.trim() || "à compléter"}.`),
		para(DISCLAIMER),
		...report.warnings.map((w) => para(`• ${w}`)),
		`<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr>`
	].join("")}</w:body></w:document>`;
	return zipStore([
		{
			name: "[Content_Types].xml",
			data: utf8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`)
		},
		{
			name: "_rels/.rels",
			data: utf8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`)
		},
		{
			name: "word/_rels/document.xml.rels",
			data: utf8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`)
		},
		{
			name: "word/document.xml",
			data: utf8(documentXml)
		}
	]);
}
var WIN = {
	"€": 128,
	"Œ": 140,
	"œ": 156,
	"‘": 145,
	"’": 146,
	"“": 147,
	"”": 148,
	"–": 150,
	"—": 151,
	"\xA0": 160,
	"°": 176,
	"«": 171,
	"»": 187,
	" ": 160,
	" ": 32,
	" ": 32,
	À: 192,
	Â: 194,
	Ç: 199,
	È: 200,
	É: 201,
	Ê: 202,
	Ë: 203,
	Î: 206,
	Ï: 207,
	Ô: 212,
	Ù: 217,
	Û: 219,
	à: 224,
	â: 226,
	ä: 228,
	ç: 231,
	è: 232,
	é: 233,
	ê: 234,
	ë: 235,
	î: 238,
	ï: 239,
	ô: 244,
	ö: 246,
	ù: 249,
	û: 251,
	ü: 252
};
function winAnsi(text) {
	const out = new Uint8Array(text.length);
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		const code = ch.charCodeAt(0);
		if (code >= 32 && code <= 126) out[i] = code;
		else if (WIN[ch] != null) out[i] = WIN[ch];
		else out[i] = 63;
	}
	return out;
}
function pdfEscape(bytes) {
	let s = "";
	for (const b of bytes) if (b === 40 || b === 41 || b === 92) s += `\\${String.fromCharCode(b)}`;
	else if (b < 32 || b > 126) s += `\\${b.toString(8).padStart(3, "0")}`;
	else s += String.fromCharCode(b);
	return s;
}
function wrap(text, size, font) {
	const width = font === "F3" ? Math.floor(500 / (size * .6)) : Math.floor(515 / (size * .5));
	if (text.length <= width) return [text];
	const out = [];
	let rest = text;
	while (rest.length > width) {
		let cut = rest.lastIndexOf(" ", width);
		if (cut < 12) cut = width;
		out.push(rest.slice(0, cut));
		rest = rest.slice(cut).trimStart();
	}
	if (rest) out.push(rest);
	return out;
}
function reportToPdf(report, id) {
	const src = [
		{
			text: "Nautilus — plus-values d'actifs numeriques",
			font: "F2",
			size: 16
		},
		{
			text: "Formulaire 2086 — methode du portefeuille global",
			font: "F1",
			size: 11
		},
		{
			text: `Contribuable : ${who(id)}${id.taxId.trim() ? `   N fiscal : ${id.taxId.trim()}` : ""}`,
			font: "F1",
			size: 10
		},
		{
			text: `Periode : ${report.period.label}    Source : ${report.sourceLabel}`,
			font: "F1",
			size: 10
		},
		{
			text: " ",
			font: "F1",
			size: 8
		},
		{
			text: `Cessions nettes          ${eur(report.totalCessions)} EUR`,
			font: "F3",
			size: 10
		},
		{
			text: `Solde net                ${eur(report.net)} EUR   (arrondi ${report.netEuros} EUR)`,
			font: "F3",
			size: 10
		},
		{
			text: `Acquisition debut/fin    ${eur(report.openingPta)} / ${eur(report.closingPta)} EUR`,
			font: "F3",
			size: 10
		},
		{
			text: report.exempt ? "Exonere : somme des prix de cession nets de l'annee civile inferieure ou egale a 305 EUR." : report.tax ? `${report.indicative ? "Estimation indicative. " : ""}PFU ${report.tax.label} : ${eur(report.tax.total)} EUR (IR ${eur(report.tax.ir)} + PS ${eur(report.tax.ps)}).` : report.declaration?.reportBox === "3BN" ? `Moins-value nette reportable, case 3BN : ${report.declaration.reportEuros} EUR.` : report.net < 0 ? "Moins-value nette, reportable 10 ans." : "Pas d'impot estime.",
			font: "F1",
			size: 10
		},
		{
			text: " ",
			font: "F1",
			size: 8
		},
		{
			text: "Cessions imposables",
			font: "F2",
			size: 12
		},
		{
			text: "Date        Actif   Qte            Prix net    Portef.     Acquis      PV",
			font: "F3",
			size: 8
		}
	];
	if (!report.cessions.length) src.push({
		text: "Aucune cession imposable.",
		font: "F1",
		size: 10
	});
	for (const c of report.cessions) src.push({
		text: cessionPdf(c),
		font: "F3",
		size: 8
	});
	src.push({
		text: " ",
		font: "F1",
		size: 8
	});
	src.push({
		text: "Revenus (staking) — hors 2086",
		font: "F2",
		size: 12
	});
	if (!report.incomes.length) src.push({
		text: "Aucun.",
		font: "F1",
		size: 10
	});
	for (const row of report.incomes) src.push({
		text: `${formatFiscalDate(row.time)}  ${row.asset}  ${qty(row.qty)}  ${eur(row.valueEur)} EUR`,
		font: "F3",
		size: 8
	});
	src.push({
		text: " ",
		font: "F1",
		size: 8
	});
	src.push({
		text: "3916-bis — compte d'actifs numeriques ouvert a l'etranger",
		font: "F2",
		size: 12
	});
	src.push({
		text: `Kraken (Payward). Reference : ${id.accountRef.trim() || "a completer"}.`,
		font: "F1",
		size: 10
	});
	src.push({
		text: " ",
		font: "F1",
		size: 6
	});
	src.push({
		text: DISCLAIMER,
		font: "F1",
		size: 8
	});
	for (const w of report.warnings) src.push({
		text: `- ${w}`,
		font: "F1",
		size: 8
	});
	const flat = [];
	for (const line of src) for (const piece of wrap(line.text, line.size, line.font)) flat.push({
		...line,
		text: piece
	});
	const pages = [];
	let bucket = [];
	let y = 800;
	for (const line of flat) {
		const h = line.size + 4;
		if (y - h < 48) {
			pages.push(bucket);
			bucket = [];
			y = 800;
		}
		bucket.push(line);
		y -= h;
	}
	if (bucket.length) pages.push(bucket);
	if (!pages.length) pages.push([{
		text: "Rapport vide",
		font: "F1",
		size: 12
	}]);
	const objects = [
		"",
		"",
		""
	];
	const font = (base) => `<< /Type /Font /Subtype /Type1 /BaseFont /${base} /Encoding /WinAnsiEncoding >>`;
	objects[3] = font("Helvetica");
	objects[4] = font("Helvetica-Bold");
	objects[5] = font("Courier");
	let next = 6;
	const pageIds = [];
	for (const page of pages) {
		let cursor = 800;
		const cmds = [];
		for (const line of page) {
			cursor -= line.size + 4;
			cmds.push(`BT /${line.font} ${line.size} Tf 40 ${cursor} Td (${pdfEscape(winAnsi(line.text))}) Tj ET`);
		}
		cmds.push(`BT /F1 8 Tf 40 28 Td (Page ${pageIds.length + 1} / ${pages.length} - Nautilus) Tj ET`);
		const stream = cmds.join("\n");
		const contentId = next++;
		objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
		const pageId = next++;
		pageIds.push(pageId);
		objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> >>`;
	}
	objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
	objects[2] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`;
	let pdf = "%PDF-1.4\n";
	const offsets = [0];
	for (let i = 1; i < objects.length; i++) {
		if (!objects[i]) continue;
		offsets[i] = pdf.length;
		pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
	}
	const xref = pdf.length;
	const count = objects.length;
	pdf += `xref\n0 ${count}\n`;
	pdf += "0000000000 65535 f \n";
	for (let i = 1; i < count; i++) pdf += `${String(offsets[i] ?? 0).padStart(10, "0")} 00000 n \n`;
	pdf += `trailer << /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
	return new TextEncoder().encode(pdf);
}
function cessionPdf(c) {
	const col = (value, width) => value.slice(0, width).padEnd(width, " ");
	return [
		col(formatFiscalDate(c.time), 12),
		col(c.asset, 7),
		col(qty(c.qty), 14),
		col(eur(c.netEur), 11),
		col(eur(c.portfolioEur), 11),
		col(eur(c.acquiredEur), 11),
		eur(c.gainEur)
	].join(" ");
}
function downloadBytes(filename, bytes, mime) {
	const blob = new Blob([Uint8Array.from(bytes)], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 2e3);
}
function downloadText(filename, text, mime) {
	downloadBytes(filename, new TextEncoder().encode(text), mime);
}
function fiscalBasename(report) {
	return `nautilus-2086-${report.period.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "periode"}`;
}
var PROFILE_KEY = "nautilus-fiscal-profile";
var MANUAL_KEY = "nautilus-fiscal-manual";
var PRICE_KEY = "nautilus-fiscal-prices";
var EMPTY_ID = {
	firstName: "",
	lastName: "",
	taxId: "",
	accountRef: ""
};
var KINDS = [
	{
		id: "buy",
		label: "Achat EUR"
	},
	{
		id: "sell",
		label: "Vente EUR"
	},
	{
		id: "swap",
		label: "Échange crypto"
	},
	{
		id: "deposit",
		label: "Dépôt"
	},
	{
		id: "withdraw",
		label: "Retrait"
	},
	{
		id: "income",
		label: "Revenu"
	}
];
function FiscalPage() {
	const nowYear = parisYear(Date.now());
	const nowMonth = parisMonth(Date.now());
	const connection = useTradingStore((s) => s.connection);
	const tickers = useTradingStore((s) => s.tickers);
	const liveFills = useTradingStore((s) => s.liveFills);
	const krakenFills = useTradingStore((s) => s.krakenFills);
	const paperTrades = useTradingStore((s) => s.paper.trades);
	const linked = isLiveConnected(connection);
	const [kind, setKind] = (0, import_react.useState)("year");
	const [year, setYear] = (0, import_react.useState)(nowYear);
	const [month, setMonth] = (0, import_react.useState)(nowMonth);
	const [from, setFrom] = (0, import_react.useState)(`${nowYear}-01-01`);
	const [to, setTo] = (0, import_react.useState)(`${nowYear}-12-31`);
	const [source, setSource] = (0, import_react.useState)(linked ? "kraken" : "desk");
	const [ownWallets, setOwnWallets] = (0, import_react.useState)(true);
	const [includePaper, setIncludePaper] = (0, import_react.useState)(false);
	const [identity, setIdentity] = (0, import_react.useState)(EMPTY_ID);
	const [manual, setManual] = (0, import_react.useState)([]);
	const [legs, setLegs] = (0, import_react.useState)(null);
	const [ledgerNote, setLedgerNote] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const fileRef = (0, import_react.useRef)(null);
	const [pricing, setPricing] = (0, import_react.useState)(false);
	const [history, setHistory] = (0, import_react.useState)({});
	const [manualPx, setManualPx] = (0, import_react.useState)({});
	const [usdText, setUsdText] = (0, import_react.useState)("");
	const [draftKind, setDraftKind] = (0, import_react.useState)("buy");
	const [draft, setDraft] = (0, import_react.useState)({
		date: `${nowYear}-01-15`,
		asset: "BTC",
		qty: "",
		eur: "",
		fee: "",
		quote: "ETH"
	});
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		try {
			const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
			if (profile) setIdentity({
				...EMPTY_ID,
				...profile
			});
			const saved = JSON.parse(localStorage.getItem(MANUAL_KEY) || "[]");
			if (Array.isArray(saved)) setManual(saved.filter((m) => m && m.asset && m.kind));
			const prices = JSON.parse(localStorage.getItem(PRICE_KEY) || "null");
			if (prices?.manual && typeof prices.manual === "object") setManualPx(prices.manual);
			if (typeof prices?.usd === "string") setUsdText(prices.usd);
		} catch {}
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		localStorage.setItem(PROFILE_KEY, JSON.stringify(identity));
	}, [identity, ready]);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		localStorage.setItem(MANUAL_KEY, JSON.stringify(manual));
	}, [manual, ready]);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		localStorage.setItem(PRICE_KEY, JSON.stringify({
			usd: usdText,
			manual: manualPx
		}));
	}, [
		manualPx,
		usdText,
		ready
	]);
	const usdPerEur = eurUsdRate(tickers);
	const typedUsd = Number(usdText.replace(",", "."));
	const eurPerUsd = typedUsd > 0 ? typedUsd : usdPerEur > 0 ? 1 / usdPerEur : void 0;
	const manualPrices = (0, import_react.useMemo)(() => {
		const out = {};
		for (const [asset, raw] of Object.entries(manualPx)) {
			const n = Number(String(raw).replace(",", "."));
			if (n > 0) out[asset] = n;
		}
		return out;
	}, [manualPx]);
	const period = (0, import_react.useMemo)(() => resolvePeriod({
		kind,
		year,
		month,
		from,
		to
	}), [
		kind,
		year,
		month,
		from,
		to
	]);
	const report = (0, import_react.useMemo)(() => {
		const warnings = [];
		let parsed = [];
		if (source === "kraken") {
			if (legs) {
				const led = movesFromLedgers(legs, { eurPerUsd });
				parsed = led.moves;
				warnings.push(...led.warnings);
			}
		} else {
			const fills = dedupeFills([...krakenFills, ...liveFills]);
			const desk = movesFromFills(fills, "desk", { eurPerUsd });
			parsed = desk.moves;
			warnings.push(...desk.warnings);
			if (includePaper) {
				const paper = movesFromFills(paperTrades, "paper", { eurPerUsd });
				parsed = [...parsed, ...paper.moves];
				warnings.push(...paper.warnings);
			}
		}
		const built = buildFiscalReport([...parsed, ...manual], period, {
			eurPerUsd,
			ownWallets,
			prices: {
				history,
				manual: manualPrices
			},
			sourceLabel: source === "kraken" ? "Grand livre Kraken" : includePaper ? "Bureau + simulation" : "Activité du bureau"
		});
		return {
			...built,
			warnings: [...warnings, ...built.warnings].filter((w, i, all) => all.indexOf(w) === i)
		};
	}, [
		source,
		legs,
		eurPerUsd,
		krakenFills,
		liveFills,
		includePaper,
		paperTrades,
		manual,
		period,
		ownWallets,
		history,
		manualPrices
	]);
	const load = async () => {
		if (!linked) {
			toast.message("Ajoute tes clés Kraken pour lire le grand livre.");
			return;
		}
		setBusy(true);
		try {
			const res = await krakenLedgers({ data: {
				apiKey: connection.apiKey,
				apiSecret: connection.apiSecret
			} });
			if (!res.ok) {
				toast.message(res.message);
				setLedgerNote(res.message);
				return;
			}
			setLegs(res.legs);
			setLedgerNote(res.truncated ? `${res.message} (${res.legs.length} / ${res.count})` : `${res.legs.length} écritures`);
			toast.message(res.message);
		} catch {
			toast.message("Grand livre Kraken indisponible");
		} finally {
			setBusy(false);
		}
	};
	const onCsv = async (file) => {
		if (!file) return;
		try {
			const text = await file.text();
			const parsed = legsFromKrakenCsv(text);
			if (!parsed.legs.length) {
				toast.message(parsed.warnings[0] ?? "Fichier illisible");
				return;
			}
			setSource("kraken");
			setLegs(parsed.legs);
			setLedgerNote(`${parsed.legs.length} lignes importées`);
			if (parsed.warnings.length) toast.message(parsed.warnings[0]);
			else toast.message("Export Kraken importé");
		} catch {
			toast.message("Lecture du fichier impossible");
		} finally {
			if (fileRef.current) fileRef.current.value = "";
		}
	};
	const priceAssets = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		for (const row of report.journal) {
			if (row.kind === "fiat" || row.kind === "fee") continue;
			if (row.asset) set.add(row.asset);
		}
		for (const row of report.holdings) set.add(row.asset);
		return [...set].sort();
	}, [report.journal, report.holdings]);
	const loadCourses = async () => {
		if (!priceAssets.length) {
			toast.message("Aucun actif à valoriser.");
			return;
		}
		setPricing(true);
		const next = {};
		const missing = [];
		try {
			for (const asset of priceAssets) {
				const pair = PAIR_UNIVERSE.find((item) => item.base === asset && item.quote === "EUR")?.id;
				if (!pair) {
					missing.push(asset);
					continue;
				}
				const [weekly, daily] = await Promise.all([fetchOhlc({ data: {
					pair,
					interval: 10080
				} }), fetchOhlc({ data: {
					pair,
					interval: 1440
				} })]);
				const map = /* @__PURE__ */ new Map();
				for (const candle of [...weekly, ...daily]) if (candle.close > 0 && candle.time > 0) map.set(candle.time * 1e3, candle.close);
				if (map.size) next[asset] = [...map.entries()].sort((a, b) => a[0] - b[0]).map(([time, eur]) => ({
					time,
					eur
				}));
				else missing.push(asset);
			}
			setHistory((prev) => ({
				...prev,
				...next
			}));
			const loaded = Object.keys(next).length;
			toast.message(loaded ? `Cours chargés pour ${loaded} actif${loaded > 1 ? "s" : ""}` : "Aucun cours Kraken");
			if (missing.length) toast.message(`Pas de marché EUR : ${missing.join(", ")}`);
		} catch {
			toast.message("Cours Kraken indisponibles");
		} finally {
			setPricing(false);
		}
	};
	const addManual = () => {
		const qty = Number(draft.qty.replace(",", "."));
		const eur = Number(draft.eur.replace(",", "."));
		const fee = Number(draft.fee.replace(",", ".")) || 0;
		const asset = draft.asset.trim().toUpperCase();
		if (!asset || !(qty > 0)) {
			toast.message("Actif et quantité requis.");
			return;
		}
		const [y, m, d] = draft.date.split("-").map(Number);
		if (!y || !m || !d) {
			toast.message("Date invalide.");
			return;
		}
		const time = parisDate(y, m, d, 12);
		const move = {
			id: uid("fisc"),
			time,
			kind: draftKind,
			asset,
			qty,
			quote: draftKind === "swap" ? draft.quote.trim().toUpperCase() : "EUR",
			quoteQty: draftKind === "swap" ? eur : eur,
			feeEur: fee,
			source: "manual",
			note: "Saisie manuelle"
		};
		if ((draftKind === "buy" || draftKind === "sell" || draftKind === "income") && !(eur > 0)) {
			toast.message("Montant EUR requis.");
			return;
		}
		setManual((rows) => [move, ...rows]);
		toast.message("Mouvement ajouté");
	};
	const base = fiscalBasename(report);
	const exportPdf = () => downloadBytes(`${base}.pdf`, reportToPdf(report, identity), "application/pdf");
	const exportXlsx = () => downloadBytes(`${base}.xlsx`, reportToXlsx(report, identity), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
	const exportDocx = () => downloadBytes(`${base}.docx`, reportToDocx(report, identity), "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Impôts",
				kicker: "Plus-values d’actifs numériques, méthode du portefeuille global (formulaire 2086)."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-relaxed text-subtle",
				children: "Aide au calcul pour une déclaration française. Ce n’est pas un conseil fiscal : les montants se reportent sur le formulaire 2086, et le compte Kraken sur le 3916-bis. Les échanges crypto-crypto ne sont pas imposables."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-lg border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Contribuable"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid grid-cols-2 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Prénom",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: identity.firstName,
								onChange: (e) => setIdentity({
									...identity,
									firstName: e.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nom",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: identity.lastName,
								onChange: (e) => setIdentity({
									...identity,
									lastName: e.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "N° fiscal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: identity.taxId,
								onChange: (e) => setIdentity({
									...identity,
									taxId: e.target.value
								}),
								className: "font-mono"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Réf. compte Kraken",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: identity.accountRef,
								onChange: (e) => setIdentity({
									...identity,
									accountRef: e.target.value
								}),
								className: "font-mono"
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-3 rounded-lg border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Période"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
						className: "mt-3",
						value: kind,
						onChange: setKind,
						options: [
							{
								id: "year",
								label: "Année civile"
							},
							{
								id: "rolling12",
								label: "12 mois"
							},
							{
								id: "month",
								label: "Un mois"
							},
							{
								id: "custom",
								label: "Personnalisée"
							}
						]
					}),
					kind === "year" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-1",
						children: years(nowYear).map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							on: year === y,
							onClick: () => setYear(y),
							children: y
						}, y))
					}),
					kind === "month" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: years(nowYear).map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
								on: year === y,
								onClick: () => setYear(y),
								children: y
							}, y))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: [
								"janv",
								"févr",
								"mars",
								"avr",
								"mai",
								"juin",
								"juil",
								"août",
								"sept",
								"oct",
								"nov",
								"déc"
							].map((label, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
								on: month === i + 1,
								onClick: () => setMonth(i + 1),
								children: label
							}, label))
						})]
					}),
					kind === "custom" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Du",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: from,
								onChange: (e) => setFrom(e.target.value)
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Au",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: to,
								onChange: (e) => setTo(e.target.value)
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: [period.label, period.calendarYear ? " · le seuil de 305 € et le PFU s’appliquent sur cette année civile." : " · le PFU affiché est indicatif : il se liquide sur l’année civile, pas sur une période libre."]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-3 rounded-lg border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Source"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
						className: "mt-3",
						value: source,
						onChange: setSource,
						options: [{
							id: "kraken",
							label: "Kraken réel"
						}, {
							id: "desk",
							label: "Bureau"
						}]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setOwnWallets((v) => !v),
						className: cn("mt-3 h-11 w-full rounded-md text-xs font-medium", ownWallets ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
						children: ownWallets ? "Dépôts et retraits ignorés (wallets perso)" : "Dépôts et retraits modifient le stock"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "1 USD en euros — vide = cours du moment",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								inputMode: "decimal",
								value: usdText,
								placeholder: usdPerEur > 0 ? (1 / usdPerEur).toLocaleString("fr-FR", { maximumFractionDigits: 4 }) : "0,92",
								onChange: (e) => setUsdText(e.target.value),
								className: "font-mono"
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: ".csv,text/csv,text/plain",
						className: "hidden",
						onChange: (e) => void onCsv(e.target.files?.[0])
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						className: "mt-3 w-full",
						onClick: () => fileRef.current?.click(),
						children: "Importer un CSV Kraken"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs leading-relaxed text-muted-foreground",
						children: "Grand livre ou historique de trades exporté depuis Kraken. Le fichier n’est pas envoyé : il sert seulement au calcul de cette session."
					}),
					source === "kraken" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs leading-relaxed text-muted-foreground",
								children: "Le grand livre Kraken reconstruit achats, ventes, échanges et staking. Les clés restent sur cet appareil."
							}),
							ledgerNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: ledgerNote
							}),
							!linked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-warning",
								children: ["Clés absentes. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/connect",
									className: "text-accent",
									children: "Connecter Kraken"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								className: "w-full",
								disabled: busy || !linked,
								onClick: () => void load(),
								children: busy ? "Lecture du grand livre…" : legs ? "Recharger le grand livre" : "Charger le grand livre"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-relaxed text-muted-foreground",
							children: "Ordres réels déjà vus par le bureau (bots et historique Kraken synchronisé). Moins complet qu’un grand livre."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setIncludePaper((v) => !v),
							className: cn("h-11 w-full rounded-md text-xs font-medium", includePaper ? "bg-warning text-background" : "bg-muted text-muted-foreground"),
							children: includePaper ? "Simulation incluse — ne pas déclarer" : "Exclure la simulation papier"
						})]
					})
				]
			}),
			source === "kraken" && !legs && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 rounded-lg border border-border bg-card px-3 py-3 text-xs leading-relaxed text-warning",
				children: "Grand livre non chargé. Les totaux ci-dessous n’utilisent que les lignes saisies à la main — pas encore tes cessions Kraken."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Cessions nettes",
						value: formatFiat(report.totalCessions, "EUR")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Plus ou moins-value",
						value: formatFiat(report.net, "EUR"),
						tone: report.net > 0 ? "buy" : report.net < 0 ? "sell" : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: report.exempt ? "Exonéré" : report.indicative ? "PFU indicatif" : `PFU ${report.tax?.label ?? ""}`.trim(),
						value: report.exempt ? "0 €" : report.tax ? formatFiat(report.tax.total, "EUR") : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Échanges crypto",
						value: String(report.swapCount)
					})
				]
			}),
			report.tax && !report.exempt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: [
					"IR 12,8 % ",
					formatFiat(report.tax.ir, "EUR"),
					" · prélèvements sociaux",
					" ",
					(report.tax.psRate * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 }),
					" % ",
					formatFiat(report.tax.ps, "EUR"),
					report.declaration ? ` · base ${report.declaration.reportBox === "3AN" ? report.declaration.reportEuros : report.netEuros} €` : ""
				]
			}),
			report.declaration && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-3 rounded-lg border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium",
							children: ["Année ", report.declaration.year]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "accent",
							children: report.declaration.exempt ? "Exonéré" : report.declaration.reportBox === "none" ? "Néant" : report.declaration.reportBox
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs leading-relaxed text-muted-foreground",
						children: [
							"Somme des prix de cession nets (ligne 218) ",
							formatFiat(report.declaration.cessionsNet, "EUR"),
							". Solde des cessions",
							" ",
							formatFiat(report.declaration.gain, "EUR"),
							report.declaration.imputed > 0 ? ` · moins-values antérieures imputées ${formatFiat(report.declaration.imputed, "EUR")}` : "",
							"."
						]
					}),
					report.declaration.exempt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs leading-relaxed text-foreground",
						children: "Sous le seuil de 305 €. Dépose quand même la 2086 avec les prix de cession. Rien en case 3AN ni 3BN."
					}) : report.declaration.reportBox === "3AN" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm font-medium",
						children: [
							"2042-C, case 3AN : ",
							report.declaration.reportEuros.toLocaleString("fr-FR"),
							" €"
						]
					}) : report.declaration.reportBox === "3BN" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm font-medium",
						children: [
							"2042-C, case 3BN : ",
							report.declaration.reportEuros.toLocaleString("fr-FR"),
							" €"
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: "Plus-value absorbée par les moins-values reportables. Rien à inscrire en 3AN."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-subtle",
						children: "L’option pour le barème de l’impôt sur le revenu se coche en case 3CN. Elle n’est pas chiffrée ici : elle dépend du reste des revenus."
					})
				]
			}),
			report.yearSheets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-1",
				children: report.yearSheets.map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-baseline justify-between gap-3 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "shrink-0",
						children: ["Cessions nettes ", y.year]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 text-right font-mono tabular-nums",
						children: [formatFiat(y.cessionsNet, "EUR"), y.exempt ? " · ≤ 305 €" : y.lossCreated > 0 ? ` · 3BN ${Math.round(y.lossCreated)} €` : y.taxable > 0 ? ` · 3AN ${Math.round(y.taxable)} €` : ""]
					})]
				}, y.year))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
					children: "Cessions imposables"
				}), report.cessions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "Aucune vente contre des euros sur cette période."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-2",
					children: report.cessions.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-lg border border-border bg-card px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-medium",
								children: [
									row.asset,
									" · ",
									formatFiscalDate(row.time)
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("font-mono text-sm tabular-nums", row.gainEur >= 0 ? "text-buy" : "text-sell"),
								children: formatFiat(row.gainEur, "EUR")
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs leading-relaxed text-muted-foreground",
							children: [
								"218 ",
								formatFiat(row.netEur, "EUR"),
								" · 214 ",
								formatFiat(row.feesEur, "EUR"),
								" · 212",
								" ",
								formatFiat(row.portfolioEur, "EUR"),
								" · 223 ",
								formatFiat(row.ptaBefore, "EUR"),
								" · imputé",
								" ",
								formatFiat(row.acquiredEur, "EUR"),
								row.valuedAtCost ? " · cours manquant" : "",
								row.incomplete ? " · incomplet" : ""
							]
						})]
					}, `${row.time}-${row.asset}-${i}`))
				})]
			}),
			report.incomes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
					children: "Revenus (hors 2086)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1",
					children: report.incomes.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								formatFiscalDate(row.time),
								" · ",
								row.asset,
								" · ",
								row.note ?? "revenu"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono tabular-nums",
							children: formatFiat(row.valueEur, "EUR")
						})]
					}, `${row.time}-${i}`))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Valeur du portefeuille"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-relaxed text-muted-foreground",
						children: "La case 212 est le cours de chaque actif le jour de la vente, pas son prix d’achat. Les cours Kraken couvrent environ deux ans au jour le jour, et plus loin en clôture hebdomadaire."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						className: "mt-3 w-full",
						disabled: pricing || priceAssets.length === 0,
						onClick: () => void loadCourses(),
						children: pricing ? "Lecture des cours…" : "Appliquer les cours Kraken"
					}),
					report.holdings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: "Aucun actif en stock à la fin de la période."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2",
						children: report.holdings.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-14 shrink-0 font-mono text-xs",
									children: row.asset
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "decimal",
									"aria-label": `Prix EUR de ${row.asset}`,
									value: manualPx[row.asset] ?? "",
									placeholder: row.priceEur ? String(row.priceEur) : "prix EUR",
									onChange: (e) => setManualPx((prev) => ({
										...prev,
										[row.asset]: e.target.value
									})),
									className: "font-mono"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-12 shrink-0 text-right text-xs text-muted-foreground",
									children: row.priced ? "cours" : "achat"
								})
							]
						}, row.asset))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "3916-bis"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "accent",
							children: "Compte étranger"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs leading-relaxed text-muted-foreground",
						children: [
							"Kraken (Payward), compte d’actifs numériques ouvert auprès d’un opérateur étranger. Référence : ",
							identity.accountRef.trim() || "à compléter ci-dessus",
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-subtle",
						children: [
							"Prix d’acquisition en début de période ",
							formatFiat(report.openingPta, "EUR"),
							" · en fin",
							" ",
							formatFiat(report.closingPta, "EUR"),
							"."
						]
					})
				]
			}),
			report.warnings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-1",
				children: report.warnings.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-xs leading-relaxed text-warning",
					children: w
				}, w))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Mouvement hors Kraken"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-relaxed text-muted-foreground",
						children: "Achat payé ailleurs, revenu, ou transfert. Ces lignes restent sur cet appareil et s’ajoutent au calcul."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-1",
						children: KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							on: draftKind === k.id,
							onClick: () => setDraftKind(k.id),
							children: k.label
						}, k.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-2 gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Date",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: draft.date,
									onChange: (e) => setDraft({
										...draft,
										date: e.target.value
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Actif",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: draft.asset,
									onChange: (e) => setDraft({
										...draft,
										asset: e.target.value
									}),
									className: "font-mono"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Quantité",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "decimal",
									value: draft.qty,
									onChange: (e) => setDraft({
										...draft,
										qty: e.target.value
									}),
									className: "font-mono"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: draftKind === "swap" ? "Quantité reçue" : "Montant EUR",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "decimal",
									value: draft.eur,
									onChange: (e) => setDraft({
										...draft,
										eur: e.target.value
									}),
									className: "font-mono"
								})
							}),
							draftKind === "swap" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Actif reçu",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: draft.quote,
									onChange: (e) => setDraft({
										...draft,
										quote: e.target.value
									}),
									className: "font-mono"
								})
							}),
							draftKind !== "swap" && draftKind !== "deposit" && draftKind !== "withdraw" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Frais EUR",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "decimal",
									value: draft.fee,
									onChange: (e) => setDraft({
										...draft,
										fee: e.target.value
									}),
									className: "font-mono"
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						className: "mt-3 w-full",
						onClick: addManual,
						children: "Ajouter au calcul"
					}),
					manual.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 divide-y divide-border",
						children: manual.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-2 py-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									formatFiscalDate(m.time),
									" · ",
									labelKind(m.kind),
									" ",
									m.asset
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-accent",
								onClick: () => setManual((rows) => rows.filter((r) => r.id !== m.id)),
								children: "Retirer"
							})]
						}, m.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
					children: "Exporter"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid grid-cols-2 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: exportPdf,
							children: "PDF"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: exportXlsx,
							children: "Excel"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: exportDocx,
							children: "Word"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => downloadText(`${base}.csv`, reportToCsv(report), "text/csv;charset=utf-8"),
							children: "CSV"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => downloadText(`${base}.txt`, reportToText(report, identity), "text/plain;charset=utf-8"),
							children: "Texte"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => downloadText(`${base}.json`, reportToJson(report, identity), "application/json"),
							children: "JSON"
						})
					]
				})]
			})
		]
	});
}
function years(current) {
	return Array.from({ length: 7 }, (_, i) => current - i);
}
function dedupeFills(rows) {
	const map = /* @__PURE__ */ new Map();
	for (const row of rows) map.set(row.id, row);
	return [...map.values()];
}
function labelKind(kind) {
	return KINDS.find((k) => k.id === kind)?.label ?? kind;
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-xs text-muted-foreground",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1",
			children
		})]
	});
}
function Chip({ on, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("h-9 rounded-full px-3 text-xs font-medium", on ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
		children
	});
}
function Stat({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-wide text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-1 font-mono text-lg tabular-nums", tone === "buy" && "text-buy", tone === "sell" && "text-sell"),
			children: value
		})]
	});
}
//#endregion
export { FiscalPage as component };
