import {debounce, Plugin} from "obsidian";
import InlineReferenceExtension, { setPluginVariableForCM6 } from "./references-cm6";
import {buildLinksAndReferences, getCurrentPage} from "./indexer";
import markdownPreviewProcessor from "./references-preview";
import { SidePaneView, VIEW_TYPE_SNW } from "./sidepane";

export default class ThePlugin extends Plugin {
    appName = "Obsidian42 - Strange New Worlds";
    appID = "obsidian42-strange-new-worlds";
    lastSelectedReferenceKey: string;
    lastSelectedReferenceType: string;
    lastSelectedReferenceLink: string;

    async onload(): Promise < void > {
        console.clear();
        console.log("loading " + this.appName);

        const indexDebounce = debounce( () =>{ buildLinksAndReferences(this.app) }, 3000, true );

        const initializeEnvironment = () => {
            
            setPluginVariableForCM6(this);
            
            this.registerEditorExtension([InlineReferenceExtension]); //enable the codemirror extensions
            
            this.registerEvent(
                this.app.metadataCache.on("resolve", (file) => {
                    indexDebounce();
                })
            );

            this.registerMarkdownPostProcessor((el, ctx) => {
                markdownPreviewProcessor(el, ctx, this);
            });


            this.registerView(
                VIEW_TYPE_SNW,
                (leaf) =>  new SidePaneView(leaf, this)
              );
            
        }

        // enable while developing
        initializeEnvironment();

        this.app.workspace.onLayoutReady(() => {
            const resolved = this.app.metadataCache.on("resolved", () => {
                this.app.metadataCache.offref(resolved);
                initializeEnvironment();
            });
        });
               
    }

    async activateView(key: string, refType: string, link: string) {

        console.log('activateView', key, refType, link);

        this.lastSelectedReferenceKey = key;
        this.lastSelectedReferenceType = refType;
        this.lastSelectedReferenceLink = link;
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_SNW);

        await this.app.workspace.getRightLeaf(false).setViewState({
            type: VIEW_TYPE_SNW,
            active: true,
        });

        this.app.workspace.revealLeaf(
            this.app.workspace.getLeavesOfType(VIEW_TYPE_SNW)[0]
        );
    }

    onunload(): void { 
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_SNW);
        console.log("unloading " + this.appName) 
    }
}
