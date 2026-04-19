/**
 * Produces a lighter mask GeoJSON for the browser (original is often 20MB+).
 * Run: node scripts/simplify-mask-geojson.mjs [input.geojson] [output.geojson]
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as turf from '@turf/turf'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const defaultIn = path.join(
  root,
  '..',
  'Nigeria Power impact Map Dashboard responsive webpage',
  'Nigeria_Excluded.geojson',
)
const defaultOut = path.join(root, 'public', 'geojson', 'nigeria-excluded-mask.geojson')

const inPath = path.resolve(process.argv[2] || defaultIn)
const outPath = path.resolve(process.argv[3] || defaultOut)

if (!fs.existsSync(inPath)) {
  console.error('Missing:', inPath)
  process.exit(1)
}

const raw = fs.readFileSync(inPath, 'utf8')
const fc = JSON.parse(raw)
if (fc.type !== 'FeatureCollection' || !Array.isArray(fc.features)) {
  console.error('Expected FeatureCollection')
  process.exit(1)
}

/** Degrees; ~0.025 ≈ few km at equator — good for a soft world mask */
const TOLERANCE = 0.025

const out = {
  type: 'FeatureCollection',
  name: 'nigeria_excluded_mask',
  features: fc.features.map((f, i) => {
    try {
      return turf.simplify(f, { tolerance: TOLERANCE, highQuality: false })
    } catch (e) {
      console.warn('Skip feature', i, e.message)
      return f
    }
  }),
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(out))
const mb = (fs.statSync(outPath).size / 1e6).toFixed(2)
console.log('Wrote', outPath, `(${mb} MB), ${out.features.length} features`)
