import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Registry, IRawGrammar, INITIAL } from 'vscode-textmate';
import { loadWASM, OnigScanner, OnigString } from 'vscode-oniguruma';

interface MarkdownToken {
    info: string;
    content: string;
}

interface MarkdownRenderer {
    renderToken(tokens: MarkdownToken[], index: number): string;
}

interface MarkdownItLike {
    renderer: {
        rules: {
            fence?: (
                tokens: MarkdownToken[],
                index: number,
                options: unknown,
                environment: unknown,
                renderer: MarkdownRenderer
            ) => string;
        };
    };
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function tokenClass(scopes: string[]): string | undefined {
    const scope = scopes.slice(1).join(' ');

    if (/comment\./.test(scope)) {
        return 'comment';
    }
    if (/string\./.test(scope)) {
        return 'string';
    }
    if (/constant\.numeric\./.test(scope)) {
        return 'number';
    }
    if (/constant\.language\./.test(scope)) {
        return 'constant';
    }
    if (/entity\.name\.function\./.test(scope)) {
        return 'function';
    }
    if (/storage\.type\./.test(scope)) {
        return 'type';
    }
    if (/keyword\./.test(scope)) {
        return 'keyword';
    }
    return undefined;
}

export async function createMarkdownPreviewApi(context: vscode.ExtensionContext) {
    const wasmPath = require.resolve('vscode-oniguruma/release/onig.wasm');
    const wasm = fs.readFileSync(wasmPath);
    await loadWASM(new Uint8Array(wasm));

    const grammarPath = path.join(context.extensionPath, 'syntaxes', 'zenc.tmLanguage.json');
    const grammarJson = fs.readFileSync(grammarPath, 'utf8');
    const rawGrammar = JSON.parse(grammarJson) as IRawGrammar;
    const registry = new Registry({
        onigLib: Promise.resolve({
            createOnigScanner: (sources: string[]) => new OnigScanner(sources),
            createOnigString: (value: string) => new OnigString(value)
        }),
        loadGrammar: async (scopeName: string) => scopeName === 'source.zenc' ? rawGrammar : null
    });
    const grammar = await registry.loadGrammar('source.zenc');

    if (!grammar) {
        throw new Error('Could not load the Zen C TextMate grammar.');
    }

    return {
        extendMarkdownIt(markdown: MarkdownItLike) {
            const defaultFence = markdown.renderer.rules.fence;
            markdown.renderer.rules.fence = (tokens, index, options, environment, renderer) => {
                const token = tokens[index];
                const language = token.info.trim().split(/\s+/, 1)[0].toLowerCase();

                if (language !== 'zenc') {
                    return defaultFence
                        ? defaultFence(tokens, index, options, environment, renderer)
                        : renderer.renderToken(tokens, index);
                }

                let ruleStack = INITIAL;
                const highlighted = token.content.split('\n').map((line) => {
                    const result = grammar.tokenizeLine(line, ruleStack);
                    ruleStack = result.ruleStack;

                    return result.tokens.map((tokenPart) => {
                        const content = escapeHtml(line.slice(tokenPart.startIndex, tokenPart.endIndex));
                        const className = tokenClass(tokenPart.scopes);
                        return className ? `<span class="zenc-${className}">${content}</span>` : content;
                    }).join('');
                }).join('\n');

                return `<pre class="zenc-code"><code>${highlighted}</code></pre>\n`;
            };
            return markdown;
        }
    };
}