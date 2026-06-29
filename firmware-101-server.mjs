import http from "node:http";
import { createReadStream, statSync } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8766);
const host = process.env.HOST || "127.0.0.1";
const gatewayOrigin = process.env.GATEWAY_ORIGIN || "http://127.0.0.1:9137";

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".ico", "image/x-icon"]
]);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    if (url.pathname === "/health") {
      sendJSON(response, 200, { ok: true, gatewayOrigin });
      return;
    }

    if (url.pathname === "/favicon.ico") {
      response.writeHead(204, { "Cache-Control": "no-store" });
      response.end();
      return;
    }

    if (url.pathname.startsWith("/v1/")) {
      await proxyToGateway(request, response, url);
      return;
    }

    await serveStatic(url, response);
  } catch (error) {
    sendJSON(response, 500, {
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

async function proxyToGateway(request, response, url) {
  const target = new URL(url.pathname + url.search, gatewayOrigin);
  const headers = { ...request.headers, host: target.host };
  delete headers["content-length"];

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method || "GET") ? undefined : request,
    duplex: "half"
  });

  response.writeHead(upstream.status, Object.fromEntries(upstream.headers));
  if (!upstream.body) {
    response.end();
    return;
  }

  const reader = upstream.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    response.write(Buffer.from(value));
  }
  response.end();
}

async function serveStatic(url, response) {
  let requestedPath = decodeURIComponent(url.pathname);
  if (requestedPath === "/") requestedPath = "/firmware-101-wiki.html";
  const safePath = path.normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = path.join(root, safePath);

  const info = await stat(filePath).catch(() => null);
  if (info?.isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  const fileInfo = statSync(filePath, { throwIfNoEntry: false });
  if (!fileInfo?.isFile() || !filePath.startsWith(root)) {
    sendJSON(response, 404, { error: "Not found" });
    return;
  }

  response.writeHead(200, {
    "Content-Type": mimeTypes.get(path.extname(filePath)) || "application/octet-stream",
    "Content-Length": fileInfo.size,
    "Cache-Control": "no-store"
  });
  createReadStream(filePath).pipe(response);
}

function sendJSON(response, statusCode, value) {
  const body = JSON.stringify(value, null, 2);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  response.end(body);
}

server.listen(port, host, () => {
  console.log(`firmware-101 server listening on http://${host}:${port}`);
  console.log(`proxying /v1/* to ${gatewayOrigin}`);
});
