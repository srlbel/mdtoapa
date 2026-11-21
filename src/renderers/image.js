const fs = require("node:fs");
const path = require("node:path");
const { escapeHtml } = require("../utils");

const MIME = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
};

function toDataUri(href, baseDir) {
    const filePath = path.resolve(baseDir, decodeURI(href));
    const ext = path.extname(filePath).toLowerCase();

    if (!fs.existsSync(filePath) || !MIME[ext]) {
        console.warn(`Image not found or unsupported: ${filePath}`);
        return href;
    }
    const b64 = fs.readFileSync(filePath).toString("base64");
    return `data:${MIME[ext]};base64,${b64}`;
}

function imageRenderer(baseDir, embed) {
    return {
        image({ href, title, text }) {
            const src =
                embed && !/^(https?:|data:)/i.test(href) ? toDataUri(href, baseDir) : href;

            const img = `<img src="${escapeHtml(src)}" alt="${escapeHtml(text)}">`;
            return title
                ? `<figure>${img}<figcaption>${escapeHtml(title)}</figcaption></figure>`
                : img;
        },
    };
}

module.exports = { imageRenderer };