import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

export function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    // Path to built index.html
    const distPath = path.join(extensionUri.fsPath, 'src', 'frontend', 'dist', 'index.html')
    let html = fs.readFileSync(distPath, 'utf8')

    // Rewrite script & link tags to use webview URIs
    html = html.replace(/src="(.+?)"/g, (_, src) => {
        const uri = webview.asWebviewUri(vscode.Uri.file(path.join(extensionUri.fsPath, 'src', 'frontend', 'dist', src)))
        return `src="${uri}"`
    })

    html = html.replace(/href="(.+?)"/g, (_, href) => {
        const uri = webview.asWebviewUri(vscode.Uri.file(path.join(extensionUri.fsPath, 'src', 'frontend', 'dist', href)))
        return `href="${uri}"`
    })

    return html
}
