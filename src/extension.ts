import * as vscode from 'vscode';
import { LyricsViewProvider } from './lyricsViewProvider';

interface LyricsResponse {
    lyrics: string;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension activated');

    const lyricsViewProvider = new LyricsViewProvider(context);
    vscode.window.registerTreeDataProvider('lyricsExplorerView', lyricsViewProvider);

    let disposable = vscode.commands.registerCommand('extension.getLyrics', async () => {
        const songTitle = await vscode.window.showInputBox({ prompt: 'Enter Song Title' });
        const artist = await vscode.window.showInputBox({ prompt: 'Enter Artist Name' });

        if (songTitle && artist) {
            try {
                const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(songTitle)}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json() as LyricsResponse;
                if (data.lyrics) {
                    console.log('Lyrics fetched');
                    lyricsViewProvider.setLyrics(data.lyrics);
                } else {
                    lyricsViewProvider.setLyrics('Lyrics not found!');
                }
            } catch (error) {
                console.error('Error fetching lyrics:', error);
                lyricsViewProvider.setLyrics('Error fetching lyrics.');
            }
        } else {
            vscode.window.showWarningMessage('Please provide both song title and artist.');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
