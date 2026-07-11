import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";

const root = join(process.cwd(), "public");
const port = Number(process.env.PORT ?? 3000);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
};

function resolvePath(urlPath) {
  const cleanPath = normalize(decodeURIComponent(urlPath.split("?")[0] ?? "/")).replace(/^(\.\.[/\\])+/, "");
  const direct = join(root, cleanPath);
  if (existsSync(direct) && statSync(direct).isFile()) return direct;
  const indexPath = join(root, cleanPath, "index.html");
  if (existsSync(indexPath)) return indexPath;
  return join(root, "404.html");
}

createServer((request, response) => {
  const filePath = resolvePath(request.url ?? "/");
  const status = filePath.endsWith("404.html") ? 404 : 200;
  response.writeHead(status, {
    "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
    "Cache-Control": extname(filePath) === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
  });
  createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`Adaptive Strength Coach website running on ${port}`);
});
