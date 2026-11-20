import { defineConfig } from "vite";
import type { Connect, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const productPages = ["play", "net", "edit"];

/** Serves /play, /net and /edit from their own index.html, as vercel.json does in production. */
const rewrite: Connect.NextHandleFunction = (req, _res, next) => {
  const [path, query] = (req.url ?? "").split(/(?=\?)/);
  const name = path.replace(/^\/|\/$/g, "");
  if (productPages.includes(name)) req.url = `/${name}/index.html${query ?? ""}`;
  next();
};
const productRoutes: Plugin = {
  name: "ourtaiko-product-routes",
  configureServer: (server) => void server.middlewares.use(rewrite),
  configurePreviewServer: (server) => void server.middlewares.use(rewrite),
};

export default defineConfig({
  plugins: [react(), productRoutes],
  resolve: { alias: { "@": page("./src") } },
  build: {
    rollupOptions: {
      input: {
        home: page("./index.html"),
        ...Object.fromEntries(
          productPages.map((name) => [name, page(`./${name}/index.html`)]),
        ),
      },
    },
  },
});
