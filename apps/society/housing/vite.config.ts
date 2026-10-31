import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // カスタムドメイン japan-data-housing.visualizing.jp はサイトのルート。
  base: "/society/housing/",
  build: { outDir: "dist", assetsDir: "assets" },
});
