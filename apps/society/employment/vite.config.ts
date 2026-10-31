import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // カスタムドメイン japan-data-employment.visualizing.jp はサイトのルート。
  base: "/society/employment/",
  build: { outDir: "dist", assetsDir: "assets" },
});
