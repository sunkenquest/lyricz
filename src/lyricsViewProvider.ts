import * as vscode from 'vscode';

export class LyricsViewProvider implements vscode.TreeDataProvider<LyricsItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<LyricsItem | undefined> = new vscode.EventEmitter<LyricsItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<LyricsItem | undefined> = this._onDidChangeTreeData.event;

    private lyricsItems: LyricsItem[] = [];
    private songTitleItem: LyricsItem | undefined;
    private artistItem: LyricsItem | undefined;

    constructor(private context: vscode.ExtensionContext) { }

    getTreeItem(element: LyricsItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: LyricsItem): vscode.ProviderResult<LyricsItem[]> {
        if (element) {
            return [];
        } else {
            return this.lyricsItems.length 
                ? [this.songTitleItem!, this.artistItem!, ...this.lyricsItems]
                : [new LyricsItem('No lyrics available', vscode.TreeItemCollapsibleState.None)];
        }
    }

    setLyrics(lyrics: string, songTitle: string, artist: string) {
        this.songTitleItem = new LyricsItem(`Title: ${songTitle}`, vscode.TreeItemCollapsibleState.None);
        this.artistItem = new LyricsItem(`Artist: ${artist}`, vscode.TreeItemCollapsibleState.None);

        const lines = lyrics.split(/\r\n|\n/);
        this.lyricsItems = lines.map(line => new LyricsItem(line, vscode.TreeItemCollapsibleState.None));
        
        this._onDidChangeTreeData.fire(undefined);
    }
}


export class LyricsItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);

        this.tooltip = label;
    }
}
