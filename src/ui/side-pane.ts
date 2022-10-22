// Sidepane used by SNW for displaying references

import {ItemView, WorkspaceLeaf} from "obsidian";
import {getReferencesCache} from "../indexer";
import ThePlugin from "../main";
import { getUIC_SidePane } from "./components/uic-ref--parent";

export const VIEW_TYPE_SNW = "Strange New Worlds";

export class SideBarPaneView extends ItemView {
    thePlugin: ThePlugin;
    
    constructor(leaf : WorkspaceLeaf, thePlugin: ThePlugin) {
        super(leaf);
        this.thePlugin = thePlugin;
    }

    getViewType() { return VIEW_TYPE_SNW }

    getDisplayText() { return "Strange New Worlds"}

    getIcon() { return "dot-network" }

    async onOpen() {
        const container: HTMLElement = this.containerEl;
        const loadingEL: HTMLElement = container.createSpan({cls:"snw-sidepane-loading"});
        loadingEL.innerText = `Discovering new worlds...`;
        container.empty();
        container.appendChild(loadingEL);
    }

    async updateView() {
        // const container: HTMLElement = this.containerEl;
        const refType = this.thePlugin.lastSelectedReferenceType;
        const key = this.thePlugin.lastSelectedReferenceKey;
        const filePath = this.thePlugin.lastSelectedReferenceFilePath;
        const lineNu = this.thePlugin.lastSelectedLineNumber;

        if(this.thePlugin.snwAPI.enableDebugging.SidePane) {
            this.thePlugin.snwAPI.console("sidepane.open() refType, key, filePath", refType, key, filePath);
            this.thePlugin.snwAPI.console("sidepane.open() getReferencesCache()", getReferencesCache());
        }

        const sidepaneContentsEl = document.createRange().createContextualFragment(await getUIC_SidePane(refType, key, filePath, lineNu));
        this.containerEl.replaceChildren(sidepaneContentsEl)
    }

    async onClose() { // Nothing to clean up.
    }
}
