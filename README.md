# Forge — Kastel pour VS Code

**Tout ce qu'il faut pour écrire du Kastel dans VS Code** : coloration syntaxique fidèle, serveur de langage,
snippets, exécution en un clic et intégration de **Gate**. Sur Windows, macOS et Linux.

> Ouvre un fichier `.ks`, c'est prêt : le serveur de langage est embarqué, rien à configurer.

## Démarrage rapide

1. **Installe** l'extension : cherche *Forge* dans la vue Extensions (`Ctrl+Shift+X`).
2. **Ouvre** un fichier `.ks` — coloration, complétion et diagnostics s'activent automatiquement.
3. **Exécute-le** avec `Ctrl+Alt+R` (`Cmd+Alt+R` sur macOS) ou le bouton ▶ de l'éditeur.

## Aperçu

```kastel
func plus_grand<T: Ord>(a: T, b: T) -> T {
    return a > b ? a : b;
}

func main() {
    let nombres: List<int> = [3, 1, 4, 1, 5];

    for n in nombres {
        println(plus_grand(n, 2));
    }

    try {
        let reponse = http_get("http://localhost:8080/");
        println(reponse.status);
    } catch (e) {
        println(e);
    }
}
```

Forge colore les types (`List<int>`, `T`, `Ord`), signale les erreurs au fil de la frappe, complète les méthodes
et les champs (`reponse.` propose `status`, `headers`, `body`…), affiche les signatures au survol et formate le tout.

## Fonctionnalités

### Écrire
- **Coloration syntaxique** complète : mots-clés (`let`, `const`, `func`, `class`, `interface`, `enum`, `match`, `async`, `await`, `try / catch / finally`…),
  chaînes `"…"` et `'…'`, nombres (`100_000_000`, `0xFF`, `0b1010`, `1e5`), intervalles `..` et `..=`, opérateurs, commentaires.
- **Types colorés** partout où ils apparaissent : paramètres (`name: int`), retours (`-> int`), `let x: T`, `catch (e: Err)`,
  alias `type A = …`, génériques `<T: Add + Eq>`, unions `int | str`, `List<int>`, records `{ x: int }`.
- **Plus de 45 snippets**, fermeture automatique des parenthèses et guillemets, repli de code (`// region`).

### Comprendre — serveur de langage
Le serveur `kastel-lsp` est embarqué dans l'extension :

| | |
|---|---|
| **Diagnostics** | erreurs signalées en temps réel, soulignement du mot entier |
| **Complétion** | mots-clés, types, membres d'objets, modules (`math.` après `import std.math;`), snippets |
| **Survol et signatures** | types, documentation des fonctions natives, aide aux paramètres (`(` et `,`) |
| **Navigation** | aller à la définition, trouver toutes les références, symboles du document et de l'espace de travail |
| **Refactoring** | renommer un symbole (avec validation préalable), mise en évidence des occurrences |
| **Formatage** | indentation, espacement, accolades et génériques (`Shift+Alt+F`) |

Il connaît la bibliothèque standard, les types du langage, les natives (fichiers, **réseau TCP/UDP/HTTP**, regex, concurrence)
et les capabilities génériques (`Add`, `Sub`, `Eq`, `Ord`…).

### Exécuter
- **Exécuter le fichier** : `Ctrl+Alt+R` ou bouton ▶ — lance `kastel <fichier>` dans un terminal intégré.
- **REPL** : ouvre le REPL Kastel dans le terminal.
- **Gate** : lance les sous-commandes de ton gestionnaire de projet depuis la palette de commandes.

## Installation

**Depuis VS Code** : vue Extensions, recherche *Forge*. **En ligne de commande** :

```sh
code --install-extension <publisher>.forge
```

**Depuis un fichier** `.vsix` : `code --install-extension forge-<version>-<plateforme>.vsix`.

| Système | Plateforme |
|---|---|
| Windows (Intel/AMD) | `win32-x64` |
| Linux (Intel/AMD, ARM) | `linux-x64`, `linux-arm64` |
| macOS (Intel, Apple Silicon) | `darwin-x64`, `darwin-arm64` |

L'extension fonctionne aussi dans WSL, SSH et les conteneurs : elle s'exécute côté distant avec le serveur de ce système.

**Prérequis** : VS Code 1.82 ou plus récent.
Pour exécuter du code, la commande `kastel` doit être dans le `PATH` ; la commande `gate` l'est pour l'intégration Gate (facultatif).
Coloration, snippets et serveur de langage fonctionnent sans ces deux outils.

## Utilisation

### Commandes
Ouvre la palette avec `Ctrl+Shift+P` et tape *Forge*.

| Commande | Raccourci | Rôle |
|---|---|---|
| **Forge: Exécuter le fichier Kastel** | `Ctrl+Alt+R` | Exécute le fichier `.ks` actif |
| **Forge: Ouvrir le REPL Kastel** | — | Ouvre le REPL dans un terminal |
| **Forge: Commande Gate…** | — | Choisit et lance une sous-commande Gate |
| **Forge: Redémarrer le serveur de langage** | — | Relance `kastel-lsp` |
| **Forge: Afficher la sortie** | — | Journal du serveur et de la détection des chemins |

### Snippets
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

## Configuration

Tous les réglages sont sous `forge.*` (`Ctrl+,` puis recherche *forge*).
Les valeurs par défaut conviennent à la plupart des installations.

| Réglage | Défaut | Rôle |
|---|---|---|
| `forge.kastel.path` | `kastel` | Exécutable Kastel |
| `forge.gate.path` | `gate` | Exécutable Gate |
| `forge.gate.commands` | `run, build, test, check` | Sous-commandes proposées par la commande Gate |
| `forge.run.saveBeforeRun` | `true` | Enregistre le fichier avant de l'exécuter |
| `forge.run.clearTerminal` | `false` | Efface le terminal avant chaque exécution |
| `forge.server.enabled` | `true` | Active le serveur de langage |
| `forge.server.path` | *auto* | Exécutable du serveur ; accepte `${workspaceFolder}`, `${env:NOM}` et `~` |
| `forge.server.args` | `[]` | Arguments passés au serveur |
| `forge.std.path` | *auto* | Dossier `std/` de Kastel (bibliothèque standard) |
| `forge.trace.server` | `off` | Trace des échanges avec le serveur (`off`, `messages`, `verbose`) |

**Détection automatique**
- *Serveur de langage* : réglage `forge.server.path`, puis binaire embarqué, `PATH`, `~/.cargo/bin`, enfin build local (`target/release`).
- *Bibliothèque standard* : réglage `forge.std.path`, variable `KASTEL_STD_PATH`, `std/` à côté de `kastel`, `std/` embarquée, `std/` de l'espace de travail.

Les chemins d'exécutables ne peuvent pas être modifiés par un espace de travail non approuvé.

## Dépannage

| Symptôme | Solution |
|---|---|
| « Serveur de langage introuvable » | Ouvre *Forge: Afficher la sortie* pour voir les emplacements testés, puis renseigne `forge.server.path` ou installe `kastel-lsp` dans le `PATH`. |
| `import std.…` non résolu | Indique le dossier de la bibliothèque standard dans `forge.std.path`. |
| Rien ne s'exécute | Vérifie que `kastel` est dans le `PATH`, ou renseigne `forge.kastel.path`. |
| Un diagnostic te semble faux | Lance *Forge: Redémarrer le serveur de langage*, puis signale le cas avec le code concerné. |

## Confidentialité

Forge ne collecte et n'envoie aucune donnée : le serveur de langage s'exécute localement sur ta machine.

## Compiler depuis les sources

```sh
npm install
node scripts/build-server.js --lsp "<dossier kastel-lsp>"
npx @vscode/vsce package --target <plateforme>
```

`build-server.js` compile le serveur avec `cargo`, l'embarque dans `server/<plateforme>/` et copie la bibliothèque standard.
Pour tester sans empaqueter : ouvre le dossier dans VS Code, lance `npm install`, puis `F5`.
Le modèle de workflow `.github/workflows/release.yml` construit un paquet par plateforme.

## Licence

Distribué sous licence **MIT** (fichier `LICENSE`).