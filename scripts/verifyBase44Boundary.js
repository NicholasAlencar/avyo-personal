import { readdir, readFile } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const allowedFrontendBridge = 'src/services/ai/Base44AiProvider.js'
const expectedFunctions = ['ai-monthly-report', 'ai-planner', 'ai-statement-parser']
const runtimeExtensions = new Set(['.js', '.jsx', '.ts', '.tsx'])
const bridgePattern = /@base44\/sdk|base44Client|functions\.invoke/
const forbiddenRuntimePattern = /(?:\bentities|\bauth|\bagents|\bconnectors)\s*\.|site deploy/i

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const paths = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) paths.push(...await walk(path))
    else paths.push(path)
  }
  return paths
}

function isRuntimeFile(path) {
  const normalized = path.replaceAll('\\', '/')
  return runtimeExtensions.has(extname(path)) && !normalized.includes('.test.') && !normalized.includes('/__tests__/')
}

async function scan(paths, pattern, allow = () => false) {
  const violations = []
  for (const path of paths.filter(isRuntimeFile)) {
    const text = await readFile(path, 'utf8')
    if (pattern.test(text) && !allow(path, text)) violations.push(relative(root, path).replaceAll('\\', '/'))
    pattern.lastIndex = 0
  }
  return violations
}

const frontendFiles = await walk(join(root, 'src'))
const backendFiles = await walk(join(root, 'base44', 'functions'))

const frontendBridgeViolations = await scan(frontendFiles, bridgePattern, (path) => relative(root, path).replaceAll('\\', '/') === allowedFrontendBridge)
const forbiddenRuntimeViolations = await scan([...frontendFiles, ...backendFiles], forbiddenRuntimePattern)

const functionEntries = await readdir(join(root, 'base44', 'functions'), { withFileTypes: true })
const actualFunctions = functionEntries
  .filter((entry) => entry.isDirectory() && entry.name !== '_shared')
  .map((entry) => entry.name)
  .sort()

const errors = []
if (frontendBridgeViolations.length) errors.push(`Base44 bridge fora de ${allowedFrontendBridge}: ${frontendBridgeViolations.join(', ')}`)
if (forbiddenRuntimeViolations.length) errors.push(`APIs Base44 proibidas encontradas: ${forbiddenRuntimeViolations.join(', ')}`)
if (JSON.stringify(actualFunctions) !== JSON.stringify(expectedFunctions)) errors.push(`Funções Base44 inesperadas. Esperado: ${expectedFunctions.join(', ')}. Encontrado: ${actualFunctions.join(', ')}`)

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Base44 boundary OK: bridge frontend único em ${allowedFrontendBridge}; funções: ${actualFunctions.join(', ')}.`)
