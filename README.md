# Forge — Kastel pour VS Code

**Forge** est l'extension officielle de VS Code pour le langage **Kastel** (fichiers `.ks`) :
coloration syntaxique, snippets, serveur de langage, exécution en un clic et intégration de **Gate**.

## Fonctionnalités

### Édition

- **Coloration syntaxique** complète : mots-clés (`let`, `const`, `func`, `class`, `interface`, `enum`, `match`, `async`, `await`, `try/catch/finally`…),
  chaînes `"…"` et `'…'`, nombres (décimaux, hexadécimaux `0x`, binaires `0b`, exposants), intervalles `..` et `..=`, opérateurs, commentaires.
- **Types colorés** : paramètres (`name: int`), types de retour (`-> int`), `let x: T`, `catch (e: Err)`,
  alias `type A = …`, génériques `<T: Add + Eq>`, unions `int | str`, `List<int>`, records `{ x: int }`.
- **Snippets** (liste ci-dessous), parenthèses et guillemets automatiques, repli de code `// region`.

### Serveur de langage (LSP)

Avec le serveur `kastel-lsp` (embarqué dans l'extension) :

- diagnostics en temps réel
- complétion (`.`, `:`, `<`), y compris les membres de module (`math.` après `import std.math;`)
- survol (types et signatures), aide à la signature (`(` et `,`)
- aller à la définition, trouver les références, renommer (avec validation préalable)
- symboles du document et de l'espace de travail, mise en évidence des occurrences
- formatage du document

### Exécution
- **Exécuter le fichier** : bouton ▶ de l'éditeur ou `Ctrl+Alt+R` (`Cmd+Alt+R` sur macOS) lance `kastel <fichier>`.
- **REPL Kastel** dans un terminal intégré.
- **Gate** : lance les sous-commandes de ton gestionnaire de projet depuis la palette de commandes.

## Installation

Depuis le Marketplace : cherche **Forge** dans la vue Extensions, ou :

```
code --install-extension <publisher>.forge
```

Depuis un fichier `.vsix` : `code --install-extension forge-<version>-<plateforme>.vsix`.

L'extension est publiée par plateforme et embarque le serveur de langage :

| Système | Plateforme |
|---|---|
| Windows (Intel/AMD) | `win32-x64` |
| Linux (Intel/AMD, ARM) | `linux-x64`, `linux-arm64` |
| macOS (Intel, Apple Silicon) | `darwin-x64`, `darwin-arm64` |

Fonctionne aussi dans WSL, SSH et les conteneurs (l'extension s'exécute côté distant).

### Prérequis
- Le langage **Kastel** (commande `kastel`) dans le `PATH`, pour exécuter des fichiers et ouvrir le REPL.
- **Gate** dans le `PATH`, pour la commande *Forge: Commande Gate…* (facultatif).
- Coloration, snippets et serveur de langage fonctionnent sans ces deux outils.

## Commandes

| Commande | Rôle |
|---|---|
| **Forge: Exécuter le fichier Kastel** | Exécute le fichier `.ks` actif (`Ctrl+Alt+R`) |
| **Forge: Ouvrir le REPL Kastel** | Ouvre le REPL dans un terminal |
| **Forge: Commande Gate…** | Choisit et lance une sous-commande Gate |
| **Forge: Redémarrer le serveur de langage** | Relance `kastel-lsp` |
| **Forge: Afficher la sortie** | Journal du serveur et de la détection des chemins |

## Réglages

| Réglage | Défaut | Rôle |
|---|---|---|
| `forge.kastel.path` | `kastel` | Exécutable Kastel |
| `forge.gate.path` | `gate` | Exécutable Gate |
| `forge.gate.commands` | `run, build, test, check` | Sous-commandes proposées par la commande Gate |
| `forge.run.saveBeforeRun` | `true` | Enregistre le fichier avant de l'exécuter |
| `forge.run.clearTerminal` | `false` | Efface le terminal avant chaque exécution |
| `forge.server.enabled` | `true` | Active le serveur de langage |
| `forge.server.path` | *(vide : auto)* | Exécutable du serveur ; accepte `${workspaceFolder}`, `${env:NOM}` et `~` |
| `forge.server.args` | `[]` | Arguments passés au serveur |
| `forge.std.path` | *(vide : auto)* | Dossier `std/` de Kastel (bibliothèque standard) |
| `forge.trace.server` | `off` | Trace des échanges client/serveur (`off`, `messages`, `verbose`) |

Les chemins d'exécutables ne peuvent pas être modifiés par un espace de travail non approuvé.

### Détection automatique
- **Serveur de langage** : réglage `forge.server.path`, puis binaire embarqué, puis `PATH`, `~/.cargo/bin` et enfin build local (`target/release`).
- **Bibliothèque standard** : réglage `forge.std.path`, variable `KASTEL_STD_PATH`, `std/` à côté de `kastel`, `std/` embarquée, `std/` de l'espace de travail.

## Snippets

Tape le préfixe puis `Tab`.

| Préfixe | Insère |
|---|---|
| `func`, `sfunc`, `afunc`, `efunc`, `main` | fonction, statique, `async`, exportée, point d'entrée |
| `class`, `classi`, `init`, `interface`, `opadd` | classe, classe + interface, constructeur `initialize`, interface, opérateur `Add` |
| `enum`, `type`, `typer` | énumération, alias de type, alias record |
| `let`, `const` | variables typées |
| `if`, `ifelse`, `while`, `for`, `forr` | conditions et boucles (`for x in xs`, `for i in 0..10`) |
| `match`, `matchr`, `matchres` | pattern matching, sur `Option`, sur `Result` |
| `try` | `try / catch / finally` |
| `import`, `importf`, `from` | imports |
| `list`, `set`, `dict`, `record`, `tuple`, `tuple1`, `emptyset`, `emptydict` | littéraux |
| `letlist`, `letset`, `letdict`, `letrecord`, `lettuple` | littéraux avec déclaration typée |
| `lambda`, `anon`, `ternary`, `new`, `newg`, `pr` | fonction fléchée, fonction anonyme, ternaire, instanciation, affichage |

## Dépannage

- **« Serveur de langage introuvable »** : ouvre *Forge: Afficher la sortie* pour voir les emplacements testés, puis renseigne `forge.server.path` ou installe `kastel-lsp` dans le `PATH`.
- **`import std.…` non résolu** : indique le dossier de la bibliothèque standard dans `forge.std.path`.
- **Rien ne s'exécute** : vérifie que `kastel` est dans le `PATH` ou renseigne `forge.kastel.path`.

## Compiler depuis les sources

```
npm install
node scripts/build-server.js --lsp "<dossier kastel-lsp>"
npx @vscode/vsce package --target <plateforme>
```

`build-server.js` compile le serveur avec `cargo`, l'embarque dans `server/<plateforme>/` et copie la bibliothèque standard.
Pour tester sans empaqueter : ouvre le dossier dans VS Code, lance `npm install`, puis `F5`.
Un modèle de workflow GitHub (`.github/workflows/release.yml`) construit un paquet par plateforme.

## Licence

[MIT](LICENSE)
