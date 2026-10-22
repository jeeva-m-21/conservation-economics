import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("PWA Configuration & Offline Support (SPRINT-6.2)", () => {
  it("has a valid manifest.json with required PWA attributes", () => {
    const manifestPath = path.resolve(process.cwd(), "public/manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    expect(manifest.name).toContain("NPTEL Quiz Platform");
    expect(manifest.short_name).toBe("NPTEL Quiz");
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBeDefined();
    expect(manifest.background_color).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  it("has valid service worker file (sw.js) with caching logic", () => {
    const swPath = path.resolve(process.cwd(), "public/sw.js");
    expect(fs.existsSync(swPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, "utf-8");
    expect(swContent).toContain("CACHE_NAME");
    expect(swContent).toContain("addEventListener(\"install\"");
    expect(swContent).toContain("addEventListener(\"activate\"");
    expect(swContent).toContain("addEventListener(\"fetch\"");
  });

  it("has generated high-resolution PWA icons", () => {
    const icon192 = path.resolve(process.cwd(), "public/icons/icon-192.png");
    const icon512 = path.resolve(process.cwd(), "public/icons/icon-512.png");
    const iconSvg = path.resolve(process.cwd(), "public/icons/icon.svg");

    expect(fs.existsSync(icon192)).toBe(true);
    expect(fs.existsSync(icon512)).toBe(true);
    expect(fs.existsSync(iconSvg)).toBe(true);
  });
});
