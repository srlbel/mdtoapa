const yaml = require("js-yaml");

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function parseFrontMatter(source) {
    const match = source.match(FRONT_MATTER);
    if (!match) return { metadata: {}, content: source };

    return {
        metadata: yaml.load(match[1]) || {},
        content: source.slice(match[0].length),
    };
}

module.exports = { parseFrontMatter };