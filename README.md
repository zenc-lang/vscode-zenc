# Zen C for VS Code

This extension provides language support for the [Zen C](https://github.com/zenc-lang/zenc) programming language.

## Features

-   **Syntax Highlighting**: Colorization for keywords, types, functions, strings, and comments.
-   **IntelliSense**: Code completion for local variables, function arguments, and struct fields.
-   **Hover**: Documentation and type information on hover.
-   **Go to Definition**: Navigate to symbol definitions.
-   **Diagnostics**: Real-time error reporting and type checking.

## Requirements

You must have the Zen C compiler (`zc`) installed and available in your system path.

## Installation

### From Marketplace
Install via VS Code Marketplace: [Zen C](https://marketplace.visualstudio.com/items?itemName=Z-libs.zenc)

### From Source
1.  Clone the repository:
    ```bash
    git clone https://github.com/zenc-lang/vscode-zenc.git
    cd vscode-zenc
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Open in VS Code:
    ```bash
    code .
    ```
4.  Press **F5** to build and launch the extension in debug mode.

## Configuration

This extension contributes the following settings:

*   `zenc.serverPath`: Absolute path to the `zc` executable. Default: `zc` (assumes it is in your PATH).

## Publishing

To publish a new version:

1.  Update version in `package.json`.
2.  Install `vsce`: `npm install -g vsce`
3.  Package: `vsce package`
4.  Publish: `vsce publish`

## License

MIT
