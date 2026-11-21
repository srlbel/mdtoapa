const { escapeHtml } = require("./utils");

function titlePage(metadata) {
    if (!metadata.title) return "";

    const fields = ["author", "affiliation", "course", "instructor", "date"];
    const lines = fields
        .map((f) => `<p class="apa-meta">${escapeHtml(metadata[f] || "")}</p>`)
        .join("\n        ");

    return `
    <div class="apa-title-page">
      <h1>${escapeHtml(metadata.title)}</h1>
      ${lines}
    </div>`;
}

function htmlDocument({ title, css, titlePageHtml, body }) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title || "APA Document")}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>
${css}
  </style>
</head>
<body>
  ${titlePageHtml}
  <main>
    ${body}
  </main>
</body>
</html>`;
}

module.exports = { titlePage, htmlDocument };