/**
 * Type gate.
 *
 * `@slidev/client` is published as uncompiled TypeScript that references
 * Slidev's own build-time globals (`__DEV__`, `__SLIDEV_FEATURE_EDITOR__`, …)
 * and resolves its route meta through a virtual module. vue-tsc therefore
 * reports errors inside the dependency that we neither caused nor can fix, and
 * `skipLibCheck` does not suppress them because they come from .ts source
 * rather than .d.ts.
 *
 * So: run the full check, then fail only on diagnostics in OUR files.
 */
import { execFileSync } from 'node:child_process'

let output = ''
try {
  output = execFileSync('vue-tsc', ['--noEmit'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: process.cwd(),
  })
} catch (e) {
  output = `${e.stdout ?? ''}${e.stderr ?? ''}`
}

const lines = output.split('\n').filter(Boolean)
const ours = lines.filter((l) => /^(components|layouts|pages|lib|setup|scripts|env\.d\.ts)/.test(l))
const theirs = lines.filter((l) => l.includes('node_modules')).length

if (ours.length) {
  console.error('\n✗ type errors in project files:\n')
  for (const l of ours) console.error('  ' + l)
  console.error('')
  process.exit(1)
}
console.log(`✓ types OK (${theirs} pre-existing diagnostics inside @slidev/client ignored)`)
