# Forge — extension VS Code pour Kastel

Support du langage **Kastel** (`.ks`) dans VS Code.

## Fonctionnalités

- **Coloration syntaxique** : `let`, `func ... -> T`, `class`/`interface`/`enum`/`type`, `import std.x`,
  modificateurs (`public`, `private`, `protected`, `static`, `export`, `async`), `try/catch/finally`,
  `await`, `Option`/`Result` (`Some`, `Ok`, `Err`, `None`), collections (`List`, `Dict`, `Set`, `Tuple`, `Record`),
  capabilities d'opérateurs (`Add`, `Sub`, `Eq`, `Ord`, `Index`, …), unions `int | float`, génériques `<T: Add + Eq>`.
- **Snippets** : `func`, `class`, `init`, `interface`, `enum`, `type`, `import`, `match`, `try`, `for`, `opadd`, …
  et les littéraux `list`, `set`, `dict`, `record`, `tuple` (+ variantes typées `letlist`, `letset`, `letdict`, `letrecord`).
- **Exécution** : `Ctrl+Alt+R` (ou bouton ▶ de l'éditeur) lance `kastel <fichier>`.
- **REPL** : *Forge: Ouvrir le REPL Kastel*.
- **Gate** : *Forge: Commande Gate…* (sous-commandes configurables).
- **Serveur de langage (LSP)** : démarre automatiquement le serveur Kastel s'il est disponible
  (diagnostics, complétion, etc. selon ce que le serveur implémente).

## Plateformes

| Système | Cible `vsce` | Binaire embarqué |
|---|---|---|
| Windows x64 | `win32-x64` | `server/win32-x64/kastel-lsp.exe` |
| Linux x64 / arm64 | `linux-x64` / `linux-arm64` | `server/linux-<arch>/kastel-lsp` |
| macOS Intel / Apple Silicon | `darwin-x64` / `darwin-arm64` | `server/darwin-<arch>/kastel-lsp` |

Le serveur est cherché dans cet ordre : réglage `forge.server.path` → binaire embarqué →
`PATH` → `~/.cargo/bin` → build local (`target/release`, `LSP/target/release`).
En WSL, SSH ou conteneur, l'extension s'exécute côté distant et utilise le binaire de ce système.

## Installation

```bash
cd forge
npm install
node scripts/build-server.js          # compile kastel-lsp pour CETTE machine et l'embarque
npx @vscode/vsce package --target <cible>   # ex. win32-x64, linux-x64, darwin-arm64
code --install-extension forge-0.2.0-<cible>.vsix
```

Le dossier du crate `kastel-lsp` est trouvé automatiquement (`../LSP`, `../../LSP/Kastel-lsp`, …) ; sinon : `node scripts/build-server.js --lsp "C:\\chemin\\Kastel-lsp"` (ou variable `KASTEL_LSP_DIR`).
Pour publier toutes les plateformes d'un coup, utiliser le modèle `.github/workflows/release.yml`
(un runner par OS). Sans binaire embarqué, installer `kastel-lsp` dans le `PATH` suffit.

Pour tester sans empaqueter : ouvrir le dossier dans VS Code, `npm install`, puis `F5`.

## Réglages

| Réglage | Défaut | Rôle |
|---|---|---|
| `forge.kastel.path` | `kastel` | Exécutable Kastel |
| `forge.gate.path` | `gate` | Exécutable Gate |
| `forge.gate.commands` | `run, build, test, check` | Sous-commandes proposées |
| `forge.server.enabled` | `true` | Active le LSP |
| `forge.server.path` | *(vide = auto)* | Exécutable du serveur de langage (stdio) ; accepte `${workspaceFolder}`, `${env:X}`, `~` |
| `forge.server.args` | `[]` | Arguments du serveur |
| `forge.run.saveBeforeRun` | `true` | Enregistre avant d'exécuter |
| `forge.run.clearTerminal` | `false` | Efface le terminal avant exécution |
| `forge.trace.server` | `off` | Trace client/serveur |

Si le serveur de langage n'est pas trouvé, la coloration, les snippets et l'exécution restent fonctionnels.
