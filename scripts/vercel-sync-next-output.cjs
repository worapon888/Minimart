const fs = require("fs");
const path = require("path");

const repoRoot = __dirname ? path.resolve(__dirname, "..") : process.cwd();
const sourceNextDir = path.join(repoRoot, "apps", "web", ".next");
const targetNextDir = path.join(repoRoot, ".next");

if (!fs.existsSync(sourceNextDir)) {
  console.error(`Next.js output not found at ${sourceNextDir}`);
  process.exit(1);
}

fs.rmSync(targetNextDir, { recursive: true, force: true });
fs.cpSync(sourceNextDir, targetNextDir, { recursive: true });

console.log(`Synced ${sourceNextDir} -> ${targetNextDir}`);
