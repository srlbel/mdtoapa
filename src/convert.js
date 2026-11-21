const fs = require("node:fs");
const { Marked } = require("marked");
const markedKatex = require("marked-katex-extension");

const { parseFrontMatter } = require("./frontMatter");
const { imageRenderer } = require("./renderers/image");
const { tableRenderer, applyTableCaptions } = require("./renderers/table");
const { titlePage, htmlDocument } = require("./template");

function createMarked(baseDir, embedImages) {
    return new Marked(markedKatex({ throwOnError: false, output: "html" }), {
        renderer: {
            ...imageRenderer(baseDir, embedImages),
            ...tableRenderer(),
        },
    });
}

function wrapReferences(html) {
    return html.replace(
        /<h1>References<\/h1>([\s\S]*)/i,
        '<h1>References</h1><div class="apa-references">$1</div>',
    );
}

/**
 * @param {string}  mdString      markdown source (with optional YAML front matter)
 * @param {string}  cssPath       CSS file to inline
 * @param {string}  [baseDir]     directory used to resolve relative image paths
 * @param {boolean} [embedImages] inline local images as base64
 */
function convertMdToHtml(mdString, cssPath, baseDir = ".", embedImages = true) {
    const md = createMarked(baseDir, embedImages);
    const { metadata, content } = parseFrontMatter(mdString);

    const tokens = applyTableCaptions(md.lexer(content, md.defaults), md);
    const body = wrapReferences(md.parser(tokens, md.defaults));

    return htmlDocument({
        title: metadata.title,
        css: fs.readFileSync(cssPath, "utf-8"),
        titlePageHtml: titlePage(metadata),
        body,
    });
}

module.exports = { convertMdToHtml };