import * as vscode from 'vscode';

interface LyricsResponse {
    lyrics: string;
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.getLyrics', async () => {
        const fetchModule = await import('node-fetch');
        const fetch = fetchModule.default;

        const panel = vscode.window.createWebviewPanel(
            'lyricsPanel', 
            'Song Lyrics', 
            vscode.ViewColumn.One, 
            { enableScripts: true } 
        );

        panel.webview.html = getWebviewContent();

        panel.webview.onDidReceiveMessage(
            async (message) => { 
                if (message.command === 'searchLyrics') {
                    const { songTitle, artist } = message;
                    try {
                        const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(songTitle)}`);
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                       const data = await response.json() as LyricsResponse;
                        if (data.lyrics) {
                            panel.webview.postMessage({ command: 'displayLyrics', lyrics: data.lyrics });
                        } else {
                            panel.webview.postMessage({ command: 'displayLyrics', lyrics: 'Lyrics not found!' });
                        }
                    } catch (error) {
                        console.error('Error fetching lyrics:', error);
                        panel.webview.postMessage({ command: 'displayLyrics', lyrics: 'Error fetching lyrics.' });
                    }
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

function getWebviewContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lyrics Finder</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 10px;
            }
            #lyrics {
                white-space: pre-wrap;
                margin-top: 20px;
            }
            input, button {
                padding: 10px;
                margin: 5px;
                font-size: 16px;
            }
            button {
                background-color: #4CAF50;
                color: white;
                border: none;
                cursor: pointer;
            }
            button:hover {
                background-color: #45a049;
            }
        </style>
    </head>
    <body>
        <h1>Song Lyrics Finder</h1>
        <input type="text" id="songTitle" placeholder="Song Title" />
        <input type="text" id="artist" placeholder="Artist" />
        <button id="searchButton">Search Lyrics</button>
        <pre id="lyrics"></pre>

        <script>
            const vscode = acquireVsCodeApi();
            document.getElementById('searchButton').addEventListener('click', () => {
                const songTitle = document.getElementById('songTitle').value;
                const artist = document.getElementById('artist').value;
                
                if (songTitle && artist) {
                    vscode.postMessage({
                        command: 'searchLyrics',
                        songTitle: songTitle,
                        artist: artist
                    });
                } else {
                    document.getElementById('lyrics').innerText = 'Please provide both song title and artist.';
                }
            });

            window.addEventListener('message', (event) => {
                const message = event.data;
                if (message.command === 'displayLyrics') {
                    document.getElementById('lyrics').innerText = message.lyrics;
                }
            });
        </script>
    </body>
    </html>`;
}
