/**
 * Reads NigeriaEnergy.xlsx Sheet1 → src/data/territoriesParsed.json
 * Run from repo root: node scripts/import-excel.mjs
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const DEFAULT_XLSX = path.join(
  root,
  '..',
  'Nigeria Power impact Map Dashboard responsive webpage',
  'NigeriaEnergy.xlsx',
)

const xlsxPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_XLSX
const outPath = path.join(root, 'src', 'data', 'territoriesParsed.json')

function normalizeStatus(raw) {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase()
  if (s === 'stable') return 'stable'
  if (s === 'warning') return 'warning'
  if (s === 'critical') return 'critical'
  return 'warning'
}

function stripQuotes(s) {
  let t = String(s ?? '').trim()
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1)
  }
  return t
}

function parseIssues(text) {
  if (text == null || String(text).trim() === '') return []
  const normalized = String(text).replace(/\r\n/g, '\n')
  const parts = normalized
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const rows = []
  for (const part of parts) {
    const segments = part.includes(';')
      ? part
          .split(';')
          .map((s) => s.trim())
          .filter(Boolean)
      : [part]
    for (const seg of segments) {
      const m = seg.match(/^(.+?)-\s*(.+)$/)
      if (m) {
        rows.push({ datetime: m[1].trim(), description: m[2].trim() })
      } else if (seg) {
        rows.push({ datetime: '', description: seg })
      }
    }
  }
  return rows
}

function parseCustomData(raw) {
  if (!raw?.trim()) return []
  const entries = []
  const text = String(raw).replace(/\r\n/g, '\n')
  for (const block of text.split(/\n+/).map((s) => s.trim()).filter(Boolean)) {
    for (const part of block.split(';').map((s) => s.trim()).filter(Boolean)) {
      const idx = part.indexOf(':')
      if (idx > 0) {
        entries.push({
          key: part.slice(0, idx).trim(),
          value: part.slice(idx + 1).trim(),
        })
      }
    }
  }
  return entries
}

function num(v, fallback = 0) {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  const n = Number(String(v).replace(/,/g, '').trim())
  return Number.isFinite(n) ? n : fallback
}

if (!fs.existsSync(xlsxPath)) {
  console.error('Missing workbook:', xlsxPath)
  process.exit(1)
}

const wb = XLSX.readFile(xlsxPath)
const sheetName = wb.SheetNames[0]
const sheet = wb.Sheets[sheetName]
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

const territories = rows.map((row) => {
  const sn = num(row['s/n'], 0)
  const territory = String(row['Territory'] ?? '').trim()
  const territoryLabel =
    territory || (sn ? `Territory ${sn}` : 'Unknown territory')

  const powerDays = [1, 2, 3, 4, 5, 6, 7].map((d) =>
    num(row[`PowerUsedDay${d}`], 0),
  )

  return {
    sn,
    territory,
    territoryLabel,
    developerNotes: String(row['DeveloperNotes'] ?? '').trim(),
    areas: String(row['Areas'] ?? '').trim(),
    population: num(row['Population'], 0),
    households: num(row['Households'], 0),
    kpi: Math.min(100, Math.max(0, num(row['KPI'], 0))),
    energySources: String(row['Energy sources'] ?? '').trim(),
    status: normalizeStatus(row['Status']),
    poGrid: String(row['POGrid'] ?? '').trim(),
    poSolar: String(row['POSolar'] ?? '').trim(),
    poOther: String(row['POOther'] ?? '').trim(),
    impactCarbon: String(row['ImpactCarbon'] ?? '').trim(),
    impactRatio: stripQuotes(row['ImpactRatio']),
    powerUsedDay1: powerDays[0],
    powerUsedDay2: powerDays[1],
    powerUsedDay3: powerDays[2],
    powerUsedDay4: powerDays[3],
    powerUsedDay5: powerDays[4],
    powerUsedDay6: powerDays[5],
    powerUsedDay7: powerDays[6],
    issues: parseIssues(row['Issues']),
    customData: parseCustomData(row['CustomData']),
  }
})

const payload = {
  generatedAt: new Date().toISOString(),
  sourceSheet: sheetName,
  sourceFile: path.basename(xlsxPath),
  territories,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8')
console.log('Wrote', territories.length, 'territories →', outPath)
