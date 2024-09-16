import * as vscode from 'vscode';
import { LyricsViewProvider } from './lyricsViewProvider';

interface LyricsResponse {
    lyrics: string;
}

function isLyricsResponse(data: any): data is LyricsResponse {
    return typeof data === 'object' && typeof data.lyrics === 'string';
}

async function fetchWithTimeout(url: string, timeout: number): Promise<LyricsResponse> {
    const fetchPromise = fetch(url).then(async response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (isLyricsResponse(data)) {
            return data;
        } else {
            throw new Error('Invalid response format');
        }
    });

    const timeoutPromise = new Promise<LyricsResponse>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), timeout)
    );

    return Promise.race([fetchPromise, timeoutPromise]);
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension activated');

    const lyricsViewProvider = new LyricsViewProvider(context);

    let disposable = vscode.commands.registerCommand('extension.getLyrics', async () => {
        const songTitle = await vscode.window.showInputBox({ prompt: 'Enter Song Title' });
        const artist = await vscode.window.showInputBox({ prompt: 'Enter Artist Name' });

        if (songTitle && artist) {
            try {
                const timeout = 3000;
                const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(songTitle)}`;

                const data = await fetchWithTimeout(url, timeout);
                if (data.lyrics) {
                    console.log('Lyrics fetched');
                    vscode.window.registerTreeDataProvider('lyricsExplorerView', lyricsViewProvider);
                    lyricsViewProvider.setLyrics(data.lyrics, songTitle, artist);
                } else {
                    vscode.window.registerTreeDataProvider('lyricsExplorerView', lyricsViewProvider);
                    lyricsViewProvider.setLyrics('Lyrics not found!', songTitle, artist);
                }
            } catch (error) {
                console.error('Error fetching lyrics:', error);
                vscode.window.registerTreeDataProvider('lyricsExplorerView', lyricsViewProvider);
                lyricsViewProvider.setLyrics('Error fetching lyrics or request timed out.', songTitle, artist);
            }
        } else {
            vscode.window.showWarningMessage('Please provide both song title and artist.');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
