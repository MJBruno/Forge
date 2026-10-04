#!/usr/bin/env node
'use strict';
// Compile kastel-lsp et copie le binaire dans server/<plateforme>-<arch>/ (embarqué dans le .vsix).
//
// Variables d'environnement :
//   --lsp <dossier> ou KASTEL_LSP_DIR : dossier du crate kastel-lsp (sinon recherche automatique autour de l'extension)
//   KASTEL_RUST_TARGET triplet Rust pour la compilation croisée (ex. aarch64-apple-darwin)
//   KASTEL_PLATFORM / KASTEL_ARCH  plateforme VS Code ciblée (défaut : celles de cette machine)

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const rustTarget = process.env.KASTEL_RUST_TARGET;
const platform = process.env.KASTEL_PLATFORM || process.platform;
const arch = process.env.KASTEL_ARCH || process.arch;
const bin = platform === 'win32' ? 'kastel-lsp.exe' : 'kastel-lsp';

// Dossier du crate kastel-lsp : argument (--lsp <dossier>), variable KASTEL_LSP_DIR, sinon recherche automatique.
function isLspCrate(dir) {
  try {
    return /name\s*=\s*"kastel-lsp"/.test(fs.readFileSync(path.join(dir, 'Cargo.toml'), 'utf8'));
  } catch (_) {
    return false;
  }
}

const argIndex = process.argv.indexOf('--lsp');
const explicit = (argIndex !== -1 && process.argv[argIndex + 1]) || process.env.KASTEL_LSP_DIR;
const candidates = explicit
  ? [path.resolve(explicit)]
  : [
      ['..', 'LSP'], ['..', 'LSP', 'Kastel-lsp'], ['..', 'Kastel-lsp'],
      ['..', '..', 'LSP'], ['..', '..', 'LSP', 'Kastel-lsp'], ['..', '..', 'Kastel-lsp'],
    ].map((parts) => path.resolve(root, ...parts));

const lspDir = candidates.find(isLspCrate);
if (!lspDir) {
  console.error('Crate kastel-lsp introuvable. Dossiers testés :\n  ' + candidates.join('\n  '));
  console.error('\nIndique-le : node scripts/build-server.js --lsp "C:\\chemin\\vers\\Kastel-lsp"');
  process.exit(1);
}

const args = ['build', '--release'];
if (rustTarget) args.push('--target', rustTarget);
console.log(`> cargo ${args.join(' ')}  (${lspDir})`);
const result = spawnSync('cargo', args, { cwd: lspDir, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);

const releaseDirs = [
  path.join(lspDir, 'target', ...(rustTarget ? [rustTarget] : []), 'release'),
  path.join(lspDir, '..', 'target', ...(rustTarget ? [rustTarget] : []), 'release'),
];
const built = releaseDirs.map((d) => path.join(d, bin)).find((f) => fs.existsSync(f));
if (!built) {
  console.error(`Binaire ${bin} introuvable après compilation (cherché dans : ${releaseDirs.join(', ')}).`);
  process.exit(1);
}

const dest = path.join(root, 'server', `${platform}-${arch}`);
fs.mkdirSync(dest, { recursive: true });
const out = path.join(dest, bin);
fs.copyFileSync(built, out);
if (platform !== 'win32') fs.chmodSync(out, 0o755);
console.log(`Copié : ${out}`);
