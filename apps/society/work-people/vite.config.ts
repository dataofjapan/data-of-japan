import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // カスタムドメイン japan-data-occupation.visualizing.jp はサイトのルート。
  base: "/society/work-people/",
  build: { outDir: "dist", assetsDir: "assets" },
});
