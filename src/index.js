const fs = require("node:fs");
const { marked } = require("marked");
const markedKatex = require("marked-katex-extension");
const yaml = require("js-yaml");

marked.use(
  markedKatex({
    throwOnError: false,
    output: 'html'
  })
);

/**
 *
 * @param {string} mdString
 * @param {string} cssPath
 */
function convertMdToHtml(mdString, cssPath) {
  let metadata = {};
  let content = mdString;

  if (mdString.startsWith("---")) {
    const parts = mdString.split("---");
    if (parts.length >= 3) {
      metadata = yaml.load(parts[1]);
      content = parts.slice(2).join("---");
    }
  }

  let parsedBody = marked.parse(content);

  parsedBody = parsedBody.replace(
    /<h1>References<\h1>([\s|s]*)/i,
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
    <link rel="stylesheet" href="apa.css">
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

const inputMd = fs.readFileSync('test.md', 'utf-8');
const outputHtml = convertMdToHtml(inputMd, 'apa.css');
fs.writeFileSync('paper.html', outputHtml);
console.log("Generated at paper.html")
