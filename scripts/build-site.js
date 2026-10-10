const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
const publicFiles = [
  "about.html",
  "collaborate-form.html",
  "collaborate.html",
  "index.html",
  "projects.js",
  "work.html",
  "assets"
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of publicFiles) {
  const source = path.join(root, file);
  if (!fs.existsSync(source)) {
    throw new Error(`Required website file is missing: ${file}`);
  }
  fs.cpSync(source, path.join(output, file), { recursive: true });
}
