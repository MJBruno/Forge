'use strict';

const vscode = require('vscode');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { resolveServer, resolveStd, expandVariables, targetId } = require('./lib/resolve');

let client;
let output;
let replTerminal;
let warnedMissingServer = false;

function cfg() {
  return vscode.workspace.getConfiguration('forge');
}

function workspaceRoot(uri) {
  const folder =
    (uri && vscode.workspace.getWorkspaceFolder(uri)) || (vscode.workspace.workspaceFolders || [])[0];
  return folder ? folder.uri.fsPath : undefined;
}

// Exécute `command args…` dans un terminal de tâche. ShellExecution applique
// le bon quoting pour chaque shell (cmd, PowerShell, bash, zsh, fish…).
function runTask(label, command, args, cwd, env) {
  const strong = (value) => ({ value, quoting: vscode.ShellQuoting.Strong });
  const options = {};
  if (cwd) options.cwd = cwd;
  if (env) options.env = env;
  const execution = new vscode.ShellExecution(strong(command), args.map(strong), options);
  const task = new vscode.Task({ type: 'shell' }, vscode.TaskScope.Global, label, 'forge', execution);
  task.presentationOptions = {
    reveal: vscode.TaskRevealKind.Always,
    panel: vscode.TaskPanelKind.Shared,
    clear: !!cfg().get('run.clearTerminal'),
    focus: false,
  };
  return vscode.tasks.executeTask(task);
}

async function runFile(uri) {
  const editor = vscode.window.activeTextEditor;
  const target = uri || (editor && editor.document.uri);
  if (!target || target.scheme !== 'file') {
    vscode.window.showWarningMessage('Forge : aucun fichier Kastel (.ks) à exécuter.');
    return;
  }
  if (cfg().get('run.saveBeforeRun')) {
    const doc = vscode.workspace.textDocuments.find((d) => d.uri.toString() === target.toString());
    if (doc && doc.isDirty) await doc.save();
  }
  // `std` n'est imposée à la CLI que si l'utilisateur l'a configurée explicitement.
  const stdSetting = (cfg().get('std.path') || '').trim();
  const env = stdSetting
    ? { KASTEL_STD_PATH: expandVariables(stdSetting, { workspaceRoot: workspaceRoot(target), env: process.env, home: os.homedir() }) }
    : undefined;
  await runTask('Kastel: ' + path.basename(target.fsPath), cfg().get('kastel.path'), [target.fsPath],
    workspaceRoot(target) || path.dirname(target.fsPath), env);
}

function openRepl() {
  if (replTerminal && replTerminal.exitStatus === undefined) {
    replTerminal.show();
    return;
  }
  replTerminal = vscode.window.createTerminal({
    name: 'Kastel REPL',
    cwd: workspaceRoot(),
    shellPath: cfg().get('kastel.path'),
  });
  replTerminal.show();
}

async function runGate() {
  const commands = cfg().get('gate.commands') || [];
  const pick = await vscode.window.showQuickPick(commands, { placeHolder: 'Sous-commande Gate à exécuter' });
  if (!pick) return;
  await runTask('Gate: ' + pick, cfg().get('gate.path'), pick.split(/\s+/).filter(Boolean), workspaceRoot());
}

function ensureExecutable(file) {
  if (process.platform === 'win32') return;
  try {
    fs.accessSync(file, fs.constants.X_OK);
  } catch (_) {
    try { fs.chmodSync(file, 0o755); } catch (err) { output.appendLine(`chmod impossible sur ${file} : ${err.message}`); }
  }
}

function warnMissingServer(message) {
  output.appendLine(message);
  if (warnedMissingServer) return;
  warnedMissingServer = true;
  vscode.window
    .showWarningMessage(
      `Forge : serveur de langage introuvable pour ${targetId(process.platform, process.arch)}. ` +
        'La coloration, les snippets et l\'exécution restent disponibles.',
      'Ouvrir les réglages', 'Voir les détails')
    .then((choice) => {
      if (choice === 'Ouvrir les réglages') vscode.commands.executeCommand('workbench.action.openSettings', 'forge.server.path');
      if (choice === 'Voir les détails') output.show();
    });
}

async function startServer(context) {
  if (!cfg().get('server.enabled')) return;

  let lc;
  try {
    lc = require('vscode-languageclient/node');
  } catch (_) {
    output.appendLine('vscode-languageclient introuvable : exécutez « npm install » dans le dossier de l\'extension.');
    return;
  }

  const resolved = resolveServer({
    setting: cfg().get('server.path'),
    extensionPath: context.extensionPath,
    workspaceRoot: workspaceRoot(),
    home: os.homedir(),
  });
  if (resolved.error) return warnMissingServer(resolved.error);
  if (!resolved.command) {
    return warnMissingServer(`kastel-lsp introuvable. Emplacements testés :\n  ${resolved.tried.join('\n  ')}\n  + PATH`);
  }

  ensureExecutable(resolved.command);
  output.appendLine(`Serveur de langage : ${resolved.command} (${resolved.source}, ${targetId(process.platform, process.arch)})`);

  // Bibliothèque standard : le LSP ne la trouve pas seul hors de la machine de build.
  const serverEnv = { ...process.env };
  const std = resolveStd({
    setting: cfg().get('std.path'),
    kastelCommand: cfg().get('kastel.path'),
    extensionPath: context.extensionPath,
    workspaceRoot: workspaceRoot(),
    home: os.homedir(),
  });
  if (std && std.error) {
    output.appendLine(std.error);
  } else if (std) {
    serverEnv.KASTEL_STD_PATH = std.path;
    output.appendLine(`Bibliothèque standard : ${std.path} (${std.source})`);
  } else {
    output.appendLine('Bibliothèque standard introuvable : `import std.*` ne sera pas résolu (réglage forge.std.path).');
  }

  client = new lc.LanguageClient(
    'forge',
    'Forge — Kastel',
    { command: resolved.command, args: cfg().get('server.args') || [], options: { cwd: workspaceRoot(), env: serverEnv } },
    { documentSelector: [{ scheme: 'file', language: 'kastel' }], outputChannel: output }
  );
  try {
    await client.start();
  } catch (err) {
    client = undefined;
    output.appendLine(`Échec du démarrage du serveur : ${err && err.message ? err.message : err}`);
    vscode.window.showWarningMessage('Forge : le serveur de langage n\'a pas pu démarrer (voir « Forge: Afficher la sortie »).');
  }
}

async function stopServer() {
  if (!client) return;
  const current = client;
  client = undefined;
  try { await current.stop(); } catch (_) { /* déjà arrêté */ }
}

async function activate(context) {
  output = vscode.window.createOutputChannel('Forge');
  context.subscriptions.push(
    output,
    vscode.commands.registerCommand('forge.runFile', runFile),
    vscode.commands.registerCommand('forge.openRepl', openRepl),
    vscode.commands.registerCommand('forge.gate', runGate),
    vscode.commands.registerCommand('forge.showOutput', () => output.show()),
    vscode.commands.registerCommand('forge.restartServer', async () => {
      warnedMissingServer = false;
      await stopServer();
      await startServer(context);
    }),
    vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration('forge.server') || e.affectsConfiguration('forge.std')) {
        warnedMissingServer = false;
        await stopServer();
        await startServer(context);
      }
    })
  );
  await startServer(context);
}

async function deactivate() {
  await stopServer();
}

module.exports = { activate, deactivate };
