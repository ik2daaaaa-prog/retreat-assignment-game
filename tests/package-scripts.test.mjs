import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

test("npm build script runs without shell-specific environment assignment", () => {
  const isWindows = process.platform === "win32";
  const result = spawnSync(
    isWindows ? process.env.ComSpec : "npm",
    isWindows ? ["/d", "/s", "/c", "npm run build"] : ["run", "build"],
    {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    encoding: "utf8",
    },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
});
