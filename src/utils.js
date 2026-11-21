const escapeHtml = (s = "") =>
    String(s)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

module.exports = { escapeHtml };