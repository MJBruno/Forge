# Changelog

## 0.2.0
- Serveur de langage multi-plateforme : détection automatique du binaire `kastel-lsp` (embarqué `server/<os>-<arch>/`, PATH, `~/.cargo/bin`, build local) sur Windows, macOS et Linux ; `forge.server.path` vide par défaut.
- Exécution via l'API de tâches : quoting correct pour cmd, PowerShell, bash, zsh, fish.
- `extensionKind: workspace` (WSL, SSH, conteneurs), réglages d'exécutables non modifiables par un espace non approuvé.
- Script `scripts/build-server.js` et modèle CI `.github/workflows/release.yml` (un .vsix par plateforme).

## 0.1.3
- Snippets de littéraux : `list`, `set`, `dict`, `record`, `tuple`, `tuple1`, `emptyset`, `emptydict`, `letlist`, `letset`, `letdict`, `letrecord`, `lettuple`.
- Snippets `anon` (fonction anonyme), `ternary`, `new`, `newg`.

## 0.1.2
- Snippets alignés sur le parser : `if`/`while` sans parenthèses obligatoires, `for x in xs {` (sans parenthèses), `match valeur { pattern => … }`, `matchr` (Option), `matchres` (Result), `importf`, `from`, `efunc`.
- Coloration du chemin de module après `from`.

## 0.1.1
- Grammaire alignée sur le lexer Kastel : chaînes `'…'` et `"…"`, échappements `\n \t \r \" \' \\`, `const`, `is`, `?`, intervalles `..` / `..=`, exposant sur les entiers, opérateurs composés `+= -= *= /= %=` uniquement.
- Correction : `<<` / `>>` n'étaient pas reconnus comme opérateurs de décalage.
- Snippets `const`, `lambda`, `forr`.

## 0.1.0
- Première version.
