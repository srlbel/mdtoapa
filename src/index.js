const fs = require("node:fs");
const path = require("node:path");
const { Marked, Renderer } = require("marked");
const markedKatex = require("marked-katex-extension");
const yaml = require("js-yaml");

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/**
 * Custom image renderer.
 * - Optionally embeds local images as base64 data URIs (portable HTML).
 * - Turns an image's title into an APA-style <figcaption>.
 *
 * @param {string} baseDir directory used to resolve relative image paths
 * @param {boolean} embed  whether to inline local images as base64
 */
function imageRenderer(baseDir, embed) {
  return {
    // marked >= 13 passes a token object; older versions pass (href, title, text)
    image(token, titleArg, textArg) {
      const isObj = typeof token === "object";
      const href = isObj ? token.href : token;
      const title = isObj ? token.title : titleArg;
      const alt = isObj ? token.text : textArg;

      let src = href;
      if (embed && !/^(https?:|data:)/i.test(href)) {
        const filePath = path.resolve(baseDir, decodeURI(href));
        const ext = path.extname(filePath).toLowerCase();
        if (fs.existsSync(filePath) && MIME[ext]) {
          const b64 = fs.readFileSync(filePath).toString("base64");
          src = `data:${MIME[ext]};base64,${b64}`;
        } else {
          console.warn(`Image not found or unsupported: ${filePath}`);
        }
      }

      const img = `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`;
      return title
        ? `<figure>${img}<figcaption>${escapeHtml(title)}</figcaption></figure>`
        : img;
    },
  };
}

function tableRenderer() {
  return {
    table(token) {
      const html = Renderer.prototype.table.call(this, token);
      if (!token.caption) return html;

      return `<figure class="table-figure">${html}<figcaption class="table-caption"><strong>Tabla ${token.tableNumber}.</strong> ${token.caption}</figcaption></figure>`;
    }
  }
}

/**
 * @param {string} mdString   markdown source (with optional YAML front matter)
 * @param {string} cssPath    path to the CSS file to inline
 * @param {string} [baseDir]  directory of the markdown file, for resolving images
 * @param {boolean} [embedImages] inline local images as base64
 */
function convertMdToHtml(mdString, cssPath, baseDir = ".", embedImages = true) {
  const md = new Marked(
    markedKatex({
      throwOnError: false,
      output: "html",
    }),
    { renderer: { ...imageRenderer(baseDir, embedImages), ...tableRenderer() } },
  );

  let metadata = {};
  let content = mdString;

  if (mdString.startsWith("---")) {
    const parts = mdString.split("---");
    if (parts.length >= 3) {
      metadata = yaml.load(parts[1]) || {};
      content = parts.slice(2).join("---");
    }
  }

  const tokens = md.lexer(content);
  let tableCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== "table") continue;

    tableCount++;
    tokens[i].tableNumber = tableCount;

    // find the next non-blank token
    let j = i + 1;
    while (tokens[j] && tokens[j].type === "space") j++;
    const next = tokens[j];

    if (next && next.type === "paragraph" && /^Tabla:\s*/i.test(next.text)) {
      const captionText = next.text.replace(/^Tabla:\s*/i, "");
      tokens[i].caption = md.parseInline(captionText); // supports *italics*, math, etc.
      tokens.splice(i + 1, j - i); // remove blanks + the caption paragraph
    }
  }

  let parsedBody = md.parser(tokens, md.defaults);

  parsedBody = parsedBody.replace(
    /<h1>References<\/h1>([\s\S]*)/i,
    '<h1>References</h1><div class="apa-references">$1</div>',
  );

  const cssContent = fs.readFileSync(cssPath, "utf-8");

  const titlePageHtml = metadata.title
    ? `
      <div class="apa-title-page">
        <h1>${metadata.title}</h1>
        <p class="apa-meta">${metadata.author || ""}</p>
        <p class="apa-meta">${metadata.affiliation || ""}</p>
        <p class="apa-meta">${metadata.course || ""}</p>
        <p class="apa-meta">${metadata.instructor || ""}</p>
        <p class="apa-meta">${metadata.date || ""}</p>
      </div>
  `
    : "";

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>${metadata.title || "APA Document"}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">

    <style>
      ${cssContent}

    </style>
  </head>
  <body>
    ${titlePageHtml}
    <main>
      ${parsedBody}
    </main>
  </body>
  </html>`;
}

const inputPath = "test.md";
const inputMd = fs.readFileSync(inputPath, "utf-8");
const outputHtml = convertMdToHtml(inputMd, "apa.css", path.dirname(inputPath));
fs.writeFileSync("paper.html", outputHtml);
console.log("Generated at paper.html");