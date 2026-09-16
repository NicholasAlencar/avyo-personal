import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { syncBase44Functions } from './syncBase44Functions'

test('copies canonical shared modules inside every deployable function directory', async () => {
  const root = await mkdtemp(join(tmpdir(), 'avyo-base44-sync-'))
  const functionsDir = join(root, 'base44', 'functions')
  await mkdir(join(functionsDir, '_shared'), { recursive: true })
  await writeFile(join(functionsDir, '_shared', 'contracts.js'), 'export const contract = true\n')
  await writeFile(join(functionsDir, '_shared', 'runtime.js'), 'export const runtime = true\n')
  for (const name of ['ai-planner', 'ai-monthly-report', 'ai-statement-parser']) {
    await mkdir(join(functionsDir, name), { recursive: true })
  }

  await syncBase44Functions(root)

  for (const name of ['ai-planner', 'ai-monthly-report', 'ai-statement-parser']) {
    await expect(readFile(join(functionsDir, name, 'shared-contracts.js'), 'utf8')).resolves.toBe('export const contract = true\n')
    await expect(readFile(join(functionsDir, name, 'shared-runtime.js'), 'utf8')).resolves.toBe('export const runtime = true\n')
  }
})
