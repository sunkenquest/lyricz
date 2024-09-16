import * as vscode from 'vscode';

export class LyricsViewProvider implements vscode.TreeDataProvider<LyricsItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<LyricsItem | undefined> = new vscode.EventEmitter<LyricsItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<LyricsItem | undefined> = this._onDidChangeTreeData.event;

    private lyricsItem: LyricsItem | undefined;

    constructor(private context: vscode.ExtensionContext) { }

    getTreeItem(element: LyricsItem): vscode.TreeItem {
        console.log('getTreeItem called');
        return element;
    }

    getChildren(element?: LyricsItem): vscode.ProviderResult<LyricsItem[]> {
        if (element) {
            console.log('getChildren called with element');
            return [];
        } else {
            console.log('getChildren called without element');
            return this.lyricsItem ? [this.lyricsItem] : [new LyricsItem('Lyrics', vscode.TreeItemCollapsibleState.None, 'The lyrics will display here')];
        }
    }

    setLyrics(lyrics: string) {
        console.log('setLyrics called');
        this.lyricsItem = new LyricsItem('Lyrics', vscode.TreeItemCollapsibleState.None, lyrics);
        this._onDidChangeTreeData.fire(this.lyricsItem);
    }
}

export class LyricsItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly lyrics?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = this.lyrics || '';
        this.description = this.lyrics || '';
    }
}

