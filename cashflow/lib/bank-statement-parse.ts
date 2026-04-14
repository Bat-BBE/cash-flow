import type { RawTx } from '@/contexts/dashboard-data-context';

export type BankParseResult = {
  rows: RawTx[];
  warnings: string[];
  error?: string;
};

function normCell(s: unknown): string {
  if (s == null) return '';
  if (s instanceof Date) {
    const y = s.getFullYear();
    const m = String(s.getMonth() + 1).padStart(2, '0');
    const d = String(s.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof s === 'number') {
    if (s > 40_000 && s < 120_000) {
      const utc = (s - 25569) * 86400 * 1000;
      const dt = new Date(utc);
      if (!Number.isNaN(dt.getTime())) {
        const y = dt.getUTCFullYear();
        const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
        const d = String(dt.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }
    return String(s);
  }
  return String(s).trim();
}

/** Монгол банкны хуулганд түгээмэл: зай, мянгатын таслал */
export function parseAmountCell(raw: string): number {
  const s = raw.replace(/\u00a0/g, ' ').trim();
  if (!s || s === '—' || s === '-') return 0;
  const cleaned = s.replace(/\s/g, '').replace(/,/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** DD.MM.YYYY · YYYY.MM.DD · YYYY-MM-DD + optional time */
export function parseDateToIso(raw: string): string | null {
  const t = raw.replace(/\u00a0/g, ' ').trim();
  if (!t) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) {
    const base = t.slice(0, 10);
    const rest = t.includes('T') ? t.slice(11) : t.slice(11).trim();
    if (rest && /\d/.test(rest)) {
      const tm = rest.match(/(\d{1,2}):(\d{2})/);
      if (tm) return `${base} ${tm[1].padStart(2, '0')}:${tm[2]}:00`;
    }
    return `${base} 12:00:00`;
  }
  let m = t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (m) {
    const dd = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    const yyyy = m[3];
    const tm = t.match(/(\d{1,2}):(\d{2})/);
    if (tm) return `${yyyy}-${mm}-${dd} ${tm[1].padStart(2, '0')}:${tm[2]}:00`;
    return `${yyyy}-${mm}-${dd} 12:00:00`;
  }
  m = t.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  if (m) {
    const yyyy = m[1];
    const mm = m[2].padStart(2, '0');
    const dd = m[3].padStart(2, '0');
    return `${yyyy}-${mm}-${dd} 12:00:00`;
  }
  return null;
}

function splitCsvLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQ = !inQ;
      continue;
    }
    if (!inQ && ch === delim) {
      out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function detectDelim(line: string): string {
  const byTab = splitCsvLine(line, '\t').length;
  const bySemi = splitCsvLine(line, ';').length;
  const byComma = splitCsvLine(line, ',').length;
  if (byTab > bySemi && byTab > byComma && byTab > 1) return '\t';
  if (bySemi > byComma && bySemi > 1) return ';';
  return ',';
}

async function rowsFromSpreadsheet(file: File): Promise<string[][]> {
  const buf = await file.arrayBuffer();
  const XLSX = await import('xlsx');
  const wb = XLSX.read(buf, { type: 'array', cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(ws, {
    header: 1,
    defval: '',
    raw: false,
  }) as unknown[][];
  return data
    .map((row) => (row ?? []).map((c) => normCell(c)))
    .filter((row) => row.some((c) => String(c).trim() !== ''));
}

async function rowsFromCsvTxt(file: File): Promise<string[][]> {
  const buf = await file.arrayBuffer();
  let text = new TextDecoder('utf-8', { fatal: false }).decode(buf);
  if (text.includes('\uFFFD') && buf.byteLength >= 2) {
    const b = new Uint8Array(buf);
    if (b[0] === 0xff && b[1] === 0xfe) text = new TextDecoder('utf-16le').decode(buf);
    else if (b[0] === 0xfe && b[1] === 0xff) text = new TextDecoder('utf-16be').decode(buf);
  }
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (!lines.length) return [];
  const delim = detectDelim(lines[0]);
  return lines.map((l) => splitCsvLine(l, delim));
}

function lower(s: string): string {
  return s.toLowerCase().trim();
}

const PAT_DATE = ['огноо', 'date', 'txn', 'transaction date', 'огноо цаг'];
const PAT_DEBIT = ['дебит', 'debit', 'дебет', 'гаргалт', 'гарах', 'зарлага гаргах'];
const PAT_CREDIT = ['кредит', 'credit', 'орох', 'орсон', 'орлого'];
const PAT_DESC = ['тайлбар', 'description', 'гүйлгээний утга', 'дэлгэрэнгүй', 'утга', 'detail'];
const PAT_BAL = ['үлдэгдэл', 'balance', 'хуримтлал', 'closing'];
const PAT_AMT = ['дүн', 'amount', 'гүйлгээний дүн', 'үнэ дүн'];

function findHeaderRowIndex(matrix: string[][]): number {
  for (let r = 0; r < Math.min(matrix.length, 40); r++) {
    const row = matrix[r];
    const joined = lower(row.join(' '));
    const hasDate = PAT_DATE.some((p) => joined.includes(p));
    const hasMoney =
      PAT_DEBIT.some((p) => joined.includes(p)) ||
      PAT_CREDIT.some((p) => joined.includes(p)) ||
      PAT_AMT.some((p) => joined.includes(p));
    if (hasDate && hasMoney) return r;
  }
  return 0;
}

function mapColumns(header: string[]): {
  iDate: number;
  iDebit: number;
  iCredit: number;
  iDesc: number;
  iBal: number;
  iAmt: number;
  mode: 'pair' | 'single';
} {
  const h = header.map((x) => lower(x || ''));
  const iDate = h.findIndex((cell) => PAT_DATE.some((p) => cell.includes(p)));

  let iDebit = -1;
  for (let i = 0; i < h.length; i++) {
    if (PAT_DEBIT.some((p) => h[i].includes(p))) {
      iDebit = i;
      break;
    }
  }
  let iCredit = -1;
  for (let i = 0; i < h.length; i++) {
    if (i === iDebit) continue;
    if (PAT_CREDIT.some((p) => h[i].includes(p))) {
      iCredit = i;
      break;
    }
  }

  const iDesc = h.findIndex((cell) => PAT_DESC.some((p) => cell.includes(p)));
  const iBal = h.findIndex((cell) => PAT_BAL.some((p) => cell.includes(p)));
  const iAmt = h.findIndex((cell) => PAT_AMT.some((p) => cell.includes(p)));

  const mode: 'pair' | 'single' =
    iDebit >= 0 || iCredit >= 0 ? 'pair' : iAmt >= 0 ? 'single' : 'pair';

  return { iDate, iDebit, iCredit, iDesc, iBal, iAmt, mode };
}

function rowToRaw(cells: string[], col: ReturnType<typeof mapColumns>): RawTx | null {
  if (col.iDate < 0 || col.iDate >= cells.length) return null;
  const dateStr = parseDateToIso(cells[col.iDate] || '');
  if (!dateStr) return null;

  let debit = 0;
  let credit = 0;
  let closingBalance: number | null = null;

  if (col.mode === 'single' && col.iAmt >= 0) {
    const v = parseAmountCell(cells[col.iAmt] ?? '');
    if (v < 0) debit = Math.abs(v);
    else credit = v;
  } else {
    if (col.iDebit >= 0) debit = Math.abs(parseAmountCell(cells[col.iDebit] ?? ''));
    if (col.iCredit >= 0) credit = Math.abs(parseAmountCell(cells[col.iCredit] ?? ''));
  }

  if (col.iBal >= 0 && col.iBal < cells.length) {
    const b = parseAmountCell(cells[col.iBal] ?? '');
    if (b !== 0 || String(cells[col.iBal] ?? '').trim() !== '') closingBalance = b;
  }

  const desc =
    col.iDesc >= 0 && col.iDesc < cells.length
      ? String(cells[col.iDesc] ?? '').trim()
      : '';

  const skipPhrase =
    /нийт\s*дүн|нийтдүн|total\s*balance|opening\s*balance|хуулгын\s*дүн/i;
  if (skipPhrase.test(desc) || skipPhrase.test(cells.join(' '))) return null;

  if (debit === 0 && credit === 0) return null;

  return {
    date: dateStr,
    branch: null,
    openingBalance: null,
    debit,
    credit,
    closingBalance,
    description: desc || 'Гүйлгээ',
    counterAccount: null,
  };
}

/**
 * CSV / Excel (.xlsx, .xls) банкны хуулгаас RawTx мөрүүд гаргана.
 * Толгой мөр нь «Огноо», «Дебит/Кредит» эсвэл нэг «Дүн» багана гэх мэтийг таамаглана.
 */
export async function parseBankStatementToRawTxs(file: File): Promise<BankParseResult> {
  const warnings: string[] = [];
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith('.pdf')) {
    return {
      rows: [],
      warnings,
      error: 'PDF одоогоор дэмжигдэхгүй. Банкны системээс Excel (.xlsx) эсвэл CSV файл татаж оруулна уу.',
    };
  }

  let matrix: string[][] = [];
  try {
    if (lowerName.endsWith('.csv') || lowerName.endsWith('.txt')) {
      matrix = await rowsFromCsvTxt(file);
    } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
      matrix = await rowsFromSpreadsheet(file);
    } else {
      return {
        rows: [],
        warnings,
        error:
          'Файлын төрөл танигдсангүй. .csv, .xlsx, .xls зөвшөөрнө.',
      };
    }
  } catch (e) {
    console.error('[bank-statement-parse]', e);
    return {
      rows: [],
      warnings,
      error: 'Файлыг уншихад алдаа гарлаа. Файл хаалттай эсвэл эвдэрсэн байж магадгүй.',
    };
  }

  if (matrix.length < 2) {
    return { rows: [], warnings, error: 'Хоосон эсвэл хэт богино файл байна.' };
  }

  const headerIdx = findHeaderRowIndex(matrix);
  const header = matrix[headerIdx] ?? [];
  const col = mapColumns(header);

  if (col.iDate < 0) {
    return {
      rows: [],
      warnings,
      error:
        '«Огноо» багана олдсонгүй. Эхний мөрөнд огноо, дебит/кредит эсвэл дүн багана байгаа эсэхийг шалгана уу.',
    };
  }

  if (col.mode === 'pair' && col.iDebit < 0 && col.iCredit < 0 && col.iAmt < 0) {
    return {
      rows: [],
      warnings,
      error:
        'Дебит/Кредит эсвэл «Дүн» багана олдсонгүй. Банкны анхны хуулга (экспорт) файлыг ашиглана уу.',
    };
  }

  const rows: RawTx[] = [];
  let skipped = 0;

  for (let r = headerIdx + 1; r < matrix.length; r++) {
    const cells = matrix[r];
    if (!cells || !cells.some((c) => String(c).trim())) continue;
    const raw = rowToRaw(cells, col);
    if (!raw) {
      skipped += 1;
      continue;
    }
    rows.push(raw);
  }

  if (!rows.length) {
    return {
      rows: [],
      warnings,
      error:
        'Бодит гүйлгээний мөр олдсонгүй. Огноо болон дүнгийн баганы байрлал өөр байж магадгүй.',
    };
  }

  if (skipped > 0) warnings.push(`${skipped} хоосон/нийт дүн мөрийг алгаслаа.`);

  return { rows, warnings };
}
