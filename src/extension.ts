import * as vscode from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    Executable
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

function createClient(): LanguageClient {
    const config = vscode.workspace.getConfiguration('zenc');
    const serverPath = config.get<string>('serverPath') || 'zc';

    const run: Executable = {
        command: serverPath,
        args: ['lsp'],
        options: {
            env: process.env
        }
    };

    const serverOptions: ServerOptions = {
        run,
        debug: run
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'zenc' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };

    return new LanguageClient(
        'zenc',
        'Zen C Language Server',
        serverOptions,
        clientOptions
    );
}

async function startClient() {
    if (client) {
        return;
    }

    client = createClient();
    await client.start();
}

async function restartClient() {
    const oldClient = client;
    client = undefined;

    if (oldClient) {
        await oldClient.stop();
    }

    await startClient();
    void vscode.window.showInformationMessage('Zen C Language Server restarted.');
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('zenc.restartLanguageServer', async () => {
            await restartClient();
        })
    );

    void startClient();
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }

    const oldClient = client;
    client = undefined;
    return oldClient.stop();
}
