import type { CessionRow, FiscalIdentity, FiscalReport, IncomeRow } from "./fiscal.ts";
import { formatFiscalDate } from "./fiscal.ts";

const DISCLAIMER =
  "Aide au calcul selon la méthode du portefeuille global (CGI art. 150 VH bis, formulaire 2086). " +
  "Document non officiel, ce n’est pas un conseil fiscal. Les échanges crypto-crypto ne sont pas imposables. " +
  "Le seuil de 305 € s’apprécie sur la somme des prix de cession nets de frais (ligne 218) de l’année civile. " +
  "PFU 30 % (12,8 % + 17,2 %) jusqu’aux revenus 2025, puis 31,4 % (12,8 % + 18,6 %) à compter de 2026. " +
  "Les moins-values se reportent sur les 10 années suivantes. Les revenus de staking sont listés à part.";

function eur(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function qty(n: number): string {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 8 });
}

function who(id: FiscalIdentity): string {
  const name = `${id.firstName} ${id.lastName}`.trim();
  return name || "Contribuable";
}

export function reportToText(report: FiscalReport, id: FiscalIdentity): string {
  const lines: string[] = [];
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
    if (box.exempt) {
      lines.push("Exonération : total ≤ 305 EUR. Déposer la 2086 sans montant en 3AN ni 3BN.");
    } else if (box.reportBox === "3AN") {
      lines.push(`Moins-values antérieures imputées : ${eur(box.imputed)} EUR`);
      lines.push(`2042-C case 3AN : ${box.reportEuros} EUR`);
    } else if (box.reportBox === "3BN") {
      lines.push(`2042-C case 3BN : ${box.reportEuros} EUR`);
    } else {
      lines.push("Aucune plus-value imposable après imputation des moins-values.");
    }
  } else if (report.exempt) {
    lines.push("Exonération : total des cessions de l'année civile ≤ 305 EUR.");
  }
  if (report.tax) {
    lines.push(
      `${report.indicative ? "Estimation indicative" : "PFU"} ${report.tax.label} : IR ${eur(report.tax.ir)} + PS ${eur(report.tax.ps)} = ${eur(report.tax.total)} EUR`,
    );
  } else if (report.net < 0 && !report.exempt) {
    lines.push("Moins-value nette : reportable sur les plus-values des 10 années suivantes (case 3BN si année civile).");
  }
  if (report.yearCessions.length) {
    lines.push("");
    lines.push("CESSIONS PAR ANNÉE CIVILE");
    for (const y of report.yearCessions) {
      lines.push(`  ${y.year} : ${eur(y.total)} EUR${y.exempt ? " — sous le seuil de 305 EUR" : ""}`);
    }
  }
  lines.push("");
  lines.push("CESSIONS IMPOSABLES");
  lines.push("Date ; Actif ; Quantité ; Prix brut ; Frais ; Prix net ; Valeur portefeuille ; Acquisition imputée ; Plus-value");
  for (const c of report.cessions) {
    lines.push(
      [
        formatFiscalDate(c.time),
        c.asset,
        qty(c.qty),
        eur(c.grossEur),
        eur(c.feesEur),
        eur(c.netEur),
        eur(c.portfolioEur),
        eur(c.acquiredEur),
        eur(c.gainEur),
      ].join(" ; "),
    );
  }
  if (!report.cessions.length) lines.push("Aucune cession imposable sur la période.");
  lines.push("");
  lines.push("REVENUS (staking et assimilés) — hors cases 2086");
  if (!report.incomes.length) lines.push("Aucun revenu détecté.");
  for (const row of report.incomes) {
    lines.push(`${formatFiscalDate(row.time)} ; ${row.asset} ; ${qty(row.qty)} ; ${eur(row.valueEur)} EUR ; ${row.note ?? ""}`);
  }
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

export function reportToCsv(report: FiscalReport): string {
  const rows = [
    ["date", "actif", "quantite", "213_prix_brut_eur", "214_frais_eur", "218_prix_net_eur", "212_portefeuille_eur", "220_acquisitions_eur", "223_acquisition_nette_eur", "acquisition_imputee_eur", "224_plus_value_eur", "cours_manquant"],
    ...report.cessions.map((c) => [
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
      c.incomplete ? "oui" : "non",
    ]),
  ];
  const body = rows.map((r) => r.map(csvCell).join(";")).join("\r\n");
  return `\uFEFF${body}\r\n`;
}

export function reportToJson(report: FiscalReport, id: FiscalIdentity): string {
  return JSON.stringify({ identity: id, disclaimer: DISCLAIMER, report }, null, 2);
}

function num(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function xml(text: string): string {
  return text
    .replaceAll("&", "&" + "amp;")
    .replaceAll("<", "&" + "lt;")
    .replaceAll(">", "&" + "gt;")
    .replaceAll('"', "&" + "quot;");
}

type ZipFile = { name: string; data: Uint8Array };

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]!) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosStamp(ms: number): { time: number; date: number } {
  const d = new Date(ms);
  const time = (d.getUTCHours() << 11) | (d.getUTCMinutes() << 5) | (d.getUTCSeconds() >> 1);
  const date = ((d.getUTCFullYear() - 1980) << 9) | ((d.getUTCMonth() + 1) << 5) | d.getUTCDate();
  return { time, date };
}

export function zipStore(files: ZipFile[], now = Date.now()): Uint8Array {
  const enc = new TextEncoder();
  const { time, date } = dosStamp(now);
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const name = enc.encode(file.name);
    const crc = crc32(file.data);
    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
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
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
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
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
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

function utf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function sheetXml(rows: (string | number)[][]): string {
  const body = rows
    .map((row, r) => {
      const cells = row
        .map((cell, c) => {
          const ref = `${colName(c)}${r + 1}`;
          if (typeof cell === "number" && Number.isFinite(cell)) {
            return `<c r="${ref}"><v>${cell}</v></c>`;
          }
          return `<c r="${ref}" t="inlineStr"><is><t>${xml(String(cell))}</t></is></c>`;
        })
        .join("");
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
}

function colName(index: number): string {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function cessionRows(report: FiscalReport): (string | number)[][] {
  return [
    ["Date", "Actif", "Quantité", "213 brut", "214 frais", "218 net", "212 portefeuille", "220 acquisitions", "223 PTA nette", "Imputée", "224 PV", "Incomplet"],
    ...report.cessions.map((c) => [
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
      c.incomplete ? "oui" : "non",
    ]),
  ];
}

export function reportToXlsx(report: FiscalReport, id: FiscalIdentity): Uint8Array {
  const summary: (string | number)[][] = [
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
    [`Prélèvements sociaux ${report.tax ? Math.round(report.tax.psRate * 1000) / 10 : 17.2} %`, report.tax?.ps ?? 0],
    [`PFU ${report.tax?.label ?? ""}`.trim(), report.tax?.total ?? 0],
    ["Note", report.indicative ? "PFU indicatif : la période n'est pas une année civile." : "PFU sur l'année civile."],
    ["Avertissement", DISCLAIMER],
  ];
  const annex: (string | number)[][] = [
    ["3916-bis — compte d'actifs numériques"],
    ["Exploitant", "Kraken (Payward), opérateur étranger"],
    ["Référence", id.accountRef.trim() || "à compléter"],
    ["Nature", "Compte d'actifs numériques"],
    [],
    ["Revenus staking / assimilés (hors 2086)"],
    ["Date", "Actif", "Quantité", "Valeur EUR", "Note"],
    ...report.incomes.map((row) => [formatFiscalDate(row.time), row.asset, row.qty, row.valueEur, row.note ?? ""]),
    [],
    ["Année civile", "Cessions nettes EUR", "Solde EUR", "Imputé EUR", "Imposable EUR", "Moins-value EUR", "Sous 305 EUR", "PFU"],
    ...report.yearSheets.map((y) => [
      y.year,
      y.cessionsNet,
      y.gain,
      y.imputed,
      y.taxable,
      y.lossCreated,
      y.exempt ? "oui" : "non",
      y.tax?.total ?? 0,
    ]),
    [],
    ["Journal des mouvements"],
    ["Date", "Type", "Actif", "Quantité", "EUR", "Frais", "Source", "Dans la période", "Note"],
    ...report.journal.map((row) => [
      formatFiscalDate(row.time),
      row.kind,
      row.asset,
      row.qty,
      row.quoteQty ?? "",
      row.feeEur ?? "",
      row.source,
      row.inPeriod ? "oui" : "non",
      row.note ?? "",
    ]),
  ];
  const files: ZipFile[] = [
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
</Types>`),
    },
    {
      name: "_rels/.rels",
      data: utf8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
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
</workbook>`),
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data: utf8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
</Relationships>`),
    },
    { name: "xl/worksheets/sheet1.xml", data: utf8(sheetXml(summary)) },
    { name: "xl/worksheets/sheet2.xml", data: utf8(sheetXml(cessionRows(report))) },
    { name: "xl/worksheets/sheet3.xml", data: utf8(sheetXml(annex)) },
  ];
  return zipStore(files);
}

function para(text: string, bold = false): string {
  const b = bold ? "<w:rPr><w:b/></w:rPr>" : "";
  return `<w:p><w:r>${b}<w:t xml:space="preserve">${xml(text)}</w:t></w:r></w:p>`;
}

function docTable(headers: string[], rows: string[][]): string {
  const cell = (text: string, header = false) =>
    `<w:tc><w:p><w:r>${header ? "<w:rPr><w:b/></w:rPr>" : ""}<w:t xml:space="preserve">${xml(text)}</w:t></w:r></w:p></w:tc>`;
  const tr = (values: string[], header = false) => `<w:tr>${values.map((v) => cell(v, header)).join("")}</w:tr>`;
  return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/></w:tblPr>${tr(headers, true)}${rows.map((r) => tr(r)).join("")}</w:tbl>`;
}

export function reportToDocx(report: FiscalReport, id: FiscalIdentity): Uint8Array {
  const tableRows = report.cessions.map((c) => [
    formatFiscalDate(c.time),
    c.asset,
    qty(c.qty),
    eur(c.netEur),
    eur(c.portfolioEur),
    eur(c.acquiredEur),
    eur(c.gainEur),
  ]);
  const incomeRows = report.incomes.map((row: IncomeRow) => [
    formatFiscalDate(row.time),
    row.asset,
    qty(row.qty),
    eur(row.valueEur),
    row.note ?? "",
  ]);
  const body = [
    para("Nautilus — plus-values d'actifs numériques (2086)", true),
    para(`Contribuable : ${who(id)}${id.taxId.trim() ? ` — n° ${id.taxId.trim()}` : ""}`),
    para(`Période : ${report.period.label}`),
    para(`Source : ${report.sourceLabel}`),
    para(`Cessions nettes : ${eur(report.totalCessions)} EUR`),
    para(`Solde de plus ou moins-value : ${eur(report.net)} EUR (arrondi ${report.netEuros} EUR)`),
    report.declaration
      ? para(
          report.declaration.exempt
            ? `Année ${report.declaration.year} exonérée (cessions nettes ${eur(report.declaration.cessionsNet)} EUR).`
            : `Année ${report.declaration.year} : case ${report.declaration.reportBox} = ${report.declaration.reportEuros} EUR. Moins-values imputées ${eur(report.declaration.imputed)} EUR.`,
        )
      : para(""),
    report.tax
      ? para(`PFU ${report.tax.label} : ${eur(report.tax.total)} EUR (IR ${eur(report.tax.ir)} + PS ${eur(report.tax.ps)}).`)
      : para("Pas de PFU estimé sur cette période."),
    para(`Prix total d'acquisition : ${eur(report.openingPta)} EUR en début de période, ${eur(report.closingPta)} EUR en fin.`),
    para("Cessions imposables", true),
    report.cessions.length
      ? docTable(["Date", "Actif", "Qté", "Prix net", "Portefeuille", "Acquisition", "PV"], tableRows)
      : para("Aucune cession imposable sur la période."),
    para("Revenus staking et assimilés", true),
    report.incomes.length
      ? docTable(["Date", "Actif", "Qté", "Valeur EUR", "Note"], incomeRows)
      : para("Aucun revenu détecté."),
    para("Compte d'actifs numériques (3916-bis)", true),
    para("Exploitant : Kraken (Payward), opérateur étranger."),
    para(`Référence : ${id.accountRef.trim() || "à compléter"}.`),
    para(DISCLAIMER),
    ...report.warnings.map((w) => para(`• ${w}`)),
    `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr>`,
  ].join("");

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`;

  return zipStore([
    {
      name: "[Content_Types].xml",
      data: utf8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`),
    },
    {
      name: "_rels/.rels",
      data: utf8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`),
    },
    {
      name: "word/_rels/document.xml.rels",
      data: utf8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`),
    },
    { name: "word/document.xml", data: utf8(documentXml) },
  ]);
}

const WIN: Record<string, number> = {
  "€": 0x80,
  "Œ": 0x8c,
  "œ": 0x9c,
  "‘": 0x91,
  "’": 0x92,
  "“": 0x93,
  "”": 0x94,
  "–": 0x96,
  "—": 0x97,
  " ": 0xa0,
  "°": 0xb0,
  "«": 0xab,
  "»": 0xbb,
  "\u202f": 0xa0,
  "\u2009": 0x20,
  "\u2007": 0x20,
  À: 0xc0,
  Â: 0xc2,
  Ç: 0xc7,
  È: 0xc8,
  É: 0xc9,
  Ê: 0xca,
  Ë: 0xcb,
  Î: 0xce,
  Ï: 0xcf,
  Ô: 0xd4,
  Ù: 0xd9,
  Û: 0xdb,
  à: 0xe0,
  â: 0xe2,
  ä: 0xe4,
  ç: 0xe7,
  è: 0xe8,
  é: 0xe9,
  ê: 0xea,
  ë: 0xeb,
  î: 0xee,
  ï: 0xef,
  ô: 0xf4,
  ö: 0xf6,
  ù: 0xf9,
  û: 0xfb,
  ü: 0xfc,
};

function winAnsi(text: string): Uint8Array {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    const code = ch.charCodeAt(0);
    if (code >= 32 && code <= 126) out[i] = code;
    else if (WIN[ch] != null) out[i] = WIN[ch]!;
    else out[i] = 63;
  }
  return out;
}

function pdfEscape(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) {
    if (b === 0x28 || b === 0x29 || b === 0x5c) s += `\\${String.fromCharCode(b)}`;
    else if (b < 32 || b > 126) s += `\\${b.toString(8).padStart(3, "0")}`;
    else s += String.fromCharCode(b);
  }
  return s;
}

type PdfLine = { text: string; font: "F1" | "F2" | "F3"; size: number };

function wrap(text: string, size: number, font: PdfLine["font"]): string[] {
  const width = font === "F3" ? Math.floor(500 / (size * 0.6)) : Math.floor(515 / (size * 0.5));
  if (text.length <= width) return [text];
  const out: string[] = [];
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

export function reportToPdf(report: FiscalReport, id: FiscalIdentity): Uint8Array {
  const src: PdfLine[] = [
    { text: "Nautilus — plus-values d'actifs numeriques", font: "F2", size: 16 },
    { text: "Formulaire 2086 — methode du portefeuille global", font: "F1", size: 11 },
    { text: `Contribuable : ${who(id)}${id.taxId.trim() ? `   N fiscal : ${id.taxId.trim()}` : ""}`, font: "F1", size: 10 },
    { text: `Periode : ${report.period.label}    Source : ${report.sourceLabel}`, font: "F1", size: 10 },
    { text: " ", font: "F1", size: 8 },
    { text: `Cessions nettes          ${eur(report.totalCessions)} EUR`, font: "F3", size: 10 },
    { text: `Solde net                ${eur(report.net)} EUR   (arrondi ${report.netEuros} EUR)`, font: "F3", size: 10 },
    { text: `Acquisition debut/fin    ${eur(report.openingPta)} / ${eur(report.closingPta)} EUR`, font: "F3", size: 10 },
    {
      text: report.exempt
        ? "Exonere : somme des prix de cession nets de l'annee civile inferieure ou egale a 305 EUR."
        : report.tax
          ? `${report.indicative ? "Estimation indicative. " : ""}PFU ${report.tax.label} : ${eur(report.tax.total)} EUR (IR ${eur(report.tax.ir)} + PS ${eur(report.tax.ps)}).`
          : report.declaration?.reportBox === "3BN"
            ? `Moins-value nette reportable, case 3BN : ${report.declaration.reportEuros} EUR.`
            : report.net < 0
              ? "Moins-value nette, reportable 10 ans."
              : "Pas d'impot estime.",
      font: "F1",
      size: 10,
    },
    { text: " ", font: "F1", size: 8 },
    { text: "Cessions imposables", font: "F2", size: 12 },
    { text: "Date        Actif   Qte            Prix net    Portef.     Acquis      PV", font: "F3", size: 8 },
  ];
  if (!report.cessions.length) src.push({ text: "Aucune cession imposable.", font: "F1", size: 10 });
  for (const c of report.cessions) src.push({ text: cessionPdf(c), font: "F3", size: 8 });
  src.push({ text: " ", font: "F1", size: 8 });
  src.push({ text: "Revenus (staking) — hors 2086", font: "F2", size: 12 });
  if (!report.incomes.length) src.push({ text: "Aucun.", font: "F1", size: 10 });
  for (const row of report.incomes) {
    src.push({
      text: `${formatFiscalDate(row.time)}  ${row.asset}  ${qty(row.qty)}  ${eur(row.valueEur)} EUR`,
      font: "F3",
      size: 8,
    });
  }
  src.push({ text: " ", font: "F1", size: 8 });
  src.push({ text: "3916-bis — compte d'actifs numeriques ouvert a l'etranger", font: "F2", size: 12 });
  src.push({ text: `Kraken (Payward). Reference : ${id.accountRef.trim() || "a completer"}.`, font: "F1", size: 10 });
  src.push({ text: " ", font: "F1", size: 6 });
  src.push({ text: DISCLAIMER, font: "F1", size: 8 });
  for (const w of report.warnings) src.push({ text: `- ${w}`, font: "F1", size: 8 });

  const flat: PdfLine[] = [];
  for (const line of src) {
    for (const piece of wrap(line.text, line.size, line.font)) flat.push({ ...line, text: piece });
  }

  const pages: PdfLine[][] = [];
  let bucket: PdfLine[] = [];
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
  if (!pages.length) pages.push([{ text: "Rapport vide", font: "F1", size: 12 }]);

  const objects: string[] = ["", "", ""];
  const font = (base: string) =>
    `<< /Type /Font /Subtype /Type1 /BaseFont /${base} /Encoding /WinAnsiEncoding >>`;
  objects[3] = font("Helvetica");
  objects[4] = font("Helvetica-Bold");
  objects[5] = font("Courier");
  let next = 6;
  const pageIds: number[] = [];
  for (const page of pages) {
    let cursor = 800;
    const cmds: string[] = [];
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
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> >>`;
  }
  objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
  objects[2] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let i = 1; i < objects.length; i++) {
    if (!objects[i]) continue;
    offsets[i] = pdf.length;
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = pdf.length;
  const count = objects.length;
  pdf += `xref\n0 ${count}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < count; i++) {
    pdf += `${String(offsets[i] ?? 0).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

function cessionPdf(c: CessionRow): string {
  const col = (value: string, width: number) => value.slice(0, width).padEnd(width, " ");
  return [
    col(formatFiscalDate(c.time), 12),
    col(c.asset, 7),
    col(qty(c.qty), 14),
    col(eur(c.netEur), 11),
    col(eur(c.portfolioEur), 11),
    col(eur(c.acquiredEur), 11),
    eur(c.gainEur),
  ].join(" ");
}

export function downloadBytes(filename: string, bytes: Uint8Array, mime: string) {
  const blob = new Blob([Uint8Array.from(bytes)], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadText(filename: string, text: string, mime: string) {
  downloadBytes(filename, new TextEncoder().encode(text), mime);
}

export function fiscalBasename(report: FiscalReport): string {
  const slug = report.period.label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `nautilus-2086-${slug || "periode"}`;
}
