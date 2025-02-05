import { MarkdownRenderer, Pos, TFile } from "obsidian";
import SNWPlugin from "src/main";
import { Link } from "../../types";

let thePlugin: SNWPlugin;

export function setPluginVariableUIC_RefItem(plugin: SNWPlugin) {
    thePlugin = plugin;
}

export /**
 * Creats an individual reference item
 *
 * @param {Link} ref
 * @return {*}  {Promise<string>}
 */
const getUIC_Ref_Item = async (ref: Link): Promise<HTMLElement>=> {
    const itemEl = createDiv();
    itemEl.addClass("snw-ref-item-info");
    itemEl.addClass("search-result-file-match");

    itemEl.setAttribute("snw-data-line-number", ref.reference.position.start.line.toString());
    itemEl.setAttribute("snw-data-file-name",   ref.sourceFile.path.replace(".md",""));
    itemEl.setAttribute("data-href",            ref.sourceFile.path.replace(".md",""));

    const fileChuncksEl = await grabChunkOfFile(ref.sourceFile, ref.reference.position);

    itemEl.appendChild( fileChuncksEl );

    return itemEl;
}


/**
 * Grabs a block from a file, then runs it through a markdown render
 *
 * @param {TFile} file
 * @param {Pos} position
 * @return {*}  {Promise<string>}
 */
const grabChunkOfFile = async (file: TFile, position: Pos): Promise<HTMLElement> =>{
    const fileContents = await thePlugin.app.vault.cachedRead(file)
    const cachedMetaData = thePlugin.app.metadataCache.getFileCache(file);

    let startPosition = 0;
    let endPosition = 0;

    for (let i = 0; i < cachedMetaData.sections.length; i++) {
        const sec = cachedMetaData.sections[i];
        if(sec.position.start.offset<=position.start.offset && sec.position.end.offset>=position.end.offset) {
            startPosition = sec.position.start.offset;
            endPosition = sec.position.end.offset;
            break;
        }
    }

    const blockContents = fileContents.substring(startPosition, endPosition);

    const el = createDiv();
    el.setAttribute("uic","uic");  //used to track if this is UIC element. 
    await MarkdownRenderer.renderMarkdown(blockContents, el, file.path, thePlugin);

    return el
}
