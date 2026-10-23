import fs from "node:fs";
import path from "node:path";

const targets = [
  path.join(process.cwd(), ".open-next", "server-functions", "default", "handler.mjs"),
  path.join(process.cwd(), ".open-next", "worker.js"),
];

let patchedCount = 0;

for (const target of targets) {
  if (fs.existsSync(target)) {
    const content = fs.readFileSync(target, "utf8");
    if (content.includes('process.chdir("")') || content.includes("process.chdir('')")) {
      const patched = content
        .replaceAll('process.chdir("")', '/* process.chdir disabled for Cloudflare Workers */')
        .replaceAll("process.chdir('')", '/* process.chdir disabled for Cloudflare Workers */');
      fs.writeFileSync(target, patched, "utf8");
      console.log(`[patch-cloudflare-worker] Successfully patched: ${path.relative(process.cwd(), target)}`);
      patchedCount++;
    } else {
      console.log(`[patch-cloudflare-worker] No empty process.chdir found in: ${path.relative(process.cwd(), target)}`);
    }
  } else {
    console.warn(`[patch-cloudflare-worker] Target file does not exist: ${path.relative(process.cwd(), target)}`);
  }
}

if (patchedCount > 0) {
  console.log(`[patch-cloudflare-worker] Cloudflare worker successfully patched (${patchedCount} file(s)).`);
} else {
  console.log("[patch-cloudflare-worker] Done checking files.");
}
