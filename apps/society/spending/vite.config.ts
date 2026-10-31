import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // カスタムドメイン japan-data-spending.visualizing.jp はサイトのルート。
  base: "/society/spending/",
  build: { outDir: "dist", assetsDir: "assets" },
});
