'use strict';

// Résolution du binaire kastel-lsp, indépendante de l'API VS Code (testable seule).

const fs = require('fs');
const nodePath = require('path');

function pathFlavor(platform) {
  return platform === 'win32' ? nodePath.win32 : nodePath.posix;
}

function binaryName(platform) {
  return platform === 'win32' ? 'kastel-lsp.exe' : 'kastel-lsp';
}

function targetId(platform, arch) {
  return `${platform}-${arch}`;
}

function expandVariables(value, ctx) {
  const env = ctx.env || {};
  let out = value
    .replace(/\$\{workspaceFolder\}/g, ctx.workspaceRoot || '')
    .replace(/\$\{env:([^}]+)\}/g, (_, name) => env[name] || '');
  if (ctx.home && (out === '~' || out.startsWith('~/') || out.startsWith('~\\'))) {
    out = ctx.home + out.slice(1);
  }
  return out;
}

function isFile(p, fsImpl) {
  try {
    return fsImpl.statSync(p).isFile();
  } catch (_) {
    return false;
  }
}

function findOnPath(name, ctx) {
  const p = pathFlavor(ctx.platform);
  const env = ctx.env || {};
  const dirs = (env.PATH || env.Path || '').split(p.delimiter).filter(Boolean);
  const names = [name];
  if (ctx.platform === 'win32' && !p.extname(name)) names.push(`${name}.exe`);
  for (const dir of dirs) {
    for (const candidate of names) {
      const full = p.join(dir, candidate);
      if (isFile(full, ctx.fsImpl)) return full;
    }
  }
  return undefined;
}

/**
 * Ordre : réglage `forge.server.path` → binaire embarqué (server/<os>-<arch>/)
 * → PATH → ~/.cargo/bin → builds de développement.
 *
 * Retourne { command, source } ou { error } (réglage explicite invalide)
 * ou { command: undefined, tried: [...] } si rien n'a été trouvé.
 */
function resolveServer(options) {
  const ctx = {
    platform: options.platform || process.platform,
    arch: options.arch || process.arch,
    env: options.env || process.env,
    home: options.home,
    workspaceRoot: options.workspaceRoot,
    fsImpl: options.fsImpl || fs,
  };
  const p = pathFlavor(ctx.platform);
  const bin = binaryName(ctx.platform);
  const tried = [];

  const setting = (options.setting || '').trim();
  if (setting) {
    const expanded = expandVariables(setting, ctx);
    if (/[\\/]/.test(expanded)) {
      if (isFile(expanded, ctx.fsImpl)) return { command: expanded, source: 'réglage forge.server.path' };
      return { error: `Le chemin configuré dans forge.server.path n'existe pas : ${expanded}` };
    }
    const found = findOnPath(expanded, ctx);
    if (found) return { command: found, source: 'réglage forge.server.path (PATH)' };
    return { error: `La commande « ${expanded} » (forge.server.path) est introuvable dans le PATH.` };
  }

  const candidates = [];
  if (options.extensionPath) {
    candidates.push([p.join(options.extensionPath, 'server', targetId(ctx.platform, ctx.arch), bin), 'binaire embarqué']);
  }
  candidates.push([() => findOnPath(bin, ctx), 'PATH']);
  if (ctx.home) candidates.push([p.join(ctx.home, '.cargo', 'bin', bin), '~/.cargo/bin']);
  if (ctx.workspaceRoot) {
    for (const rel of [['target', 'release'], ['LSP', 'target', 'release'], ['Kastel-lsp', 'target', 'release']]) {
      candidates.push([p.join(ctx.workspaceRoot, ...rel, bin), 'build local (workspace)']);
    }
  }
  if (options.extensionPath) {
    for (const dir of ['LSP', 'Kastel-lsp']) {
      candidates.push([p.join(options.extensionPath, '..', dir, 'target', 'release', bin), 'build local (voisin)']);
    }
  }

  for (const [candidate, source] of candidates) {
    const full = typeof candidate === 'function' ? candidate() : candidate;
    if (typeof candidate !== 'function') tried.push(full);
    if (full && isFile(full, ctx.fsImpl)) return { command: full, source };
  }
  return { command: undefined, tried };
}

module.exports = { resolveServer, binaryName, targetId, expandVariables, findOnPath };
