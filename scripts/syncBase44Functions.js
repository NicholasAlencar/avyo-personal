import { copyFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const functionNames = ['ai-planner', 'ai-monthly-report', 'ai-statement-parser']

export async function syncBase44Functions(root = resolve(dirname(fileURLToPath(import.meta.url)), '..')) {
  const functionsDir = join(root, 'base44', 'functions')
  for (const name of functionNames) {
    await copyFile(join(functionsDir, '_shared', 'contracts.js'), join(functionsDir, name, 'shared-contracts.js'))
    await copyFile(join(functionsDir, '_shared', 'runtime.js'), join(functionsDir, name, 'shared-runtime.js'))
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await syncBase44Functions()
}
