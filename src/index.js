const fs = require("node:fs");
const path = require("node:path");
const { convertMdToHtml } = require("./convert");

const [input = "test.md", output = "paper.html"] = process.argv.slice(2);

const markdown = fs.readFileSync(input, "utf-8");
const html = convertMdToHtml(markdown, css, path.dirname(input));

fs.writeFileSync(output, html);
console.log(`Generated at ${output}`);