import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // カスタムドメイン japan-data-juvenile.visualizing.jp はサイトのルート。
  base: "/society/juvenile/",
  build: { outDir: "dist", assetsDir: "assets" },
});
