import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the retreat assignment game shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /나만 아니면/);
  assert.match(html, /야유회 랜덤 배정 게임/);
  assert.match(html, /참가자 추가/);
  assert.match(html, /게임 시작/);
  assert.doesNotMatch(html, /BMW APEX|Autobahn Rush|우리들의 야유회/);
});
