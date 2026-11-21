const { Renderer } = require("marked");

const CAPTION_RE = /^Tabla:\s*/i;

function tableRenderer() {
    return {
        table(token) {
            const html = Renderer.prototype.table.call(this, token);
            if (!token.caption) return html;

            return (
                `<figure class="table-figure">${html}` +
                `<figcaption class="table-caption"><strong>Tabla ${token.tableNumber}.</strong> ${token.caption}</figcaption>` +
                `</figure>`
            );
        },
    };
}

/** Numbers tables and consumes the "Tabla: ..." paragraph that follows each one. */
function applyTableCaptions(tokens, md) {
    let count = 0;

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type !== "table") continue;

        tokens[i].tableNumber = ++count;

        let j = i + 1;
        while (tokens[j]?.type === "space") j++;
        const next = tokens[j];

        if (next?.type === "paragraph" && CAPTION_RE.test(next.text)) {
            tokens[i].caption = md.parseInline(next.text.replace(CAPTION_RE, ""));
            tokens.splice(i + 1, j - i);
        }
    }
    return tokens;
}

module.exports = { tableRenderer, applyTableCaptions };