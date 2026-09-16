import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { expect, test } from 'vitest'

function walk(root) {
  return readdirSync(root).flatMap((name) => {
    const full = join(root, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

test('keeps the Base44 SDK behind a single frontend adapter', () => {
  const root = join(process.cwd(), 'src')
  const imports = walk(root)
    .filter((file) => /\.[jt]sx?$/.test(file))
    .filter((file) => readFileSync(file, 'utf8').includes('@base44/sdk'))
    .map((file) => relative(root, file).replaceAll('\\', '/'))

  expect(imports).toEqual(['services/ai/Base44AiProvider.js'])
})

test('exposes exactly the three approved stateless Base44 functions', () => {
  const functionsRoot = join(process.cwd(), 'base44', 'functions')
  const functions = readdirSync(functionsRoot)
    .filter((name) => name !== '_shared' && statSync(join(functionsRoot, name)).isDirectory())
    .sort()

  expect(functions).toEqual(['ai-monthly-report', 'ai-planner', 'ai-statement-parser'])
})
