import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // カスタムドメイン japan-data-working-age.visualizing.jp はサイトのルート。
  base: "/society/working-age/",
  build: { outDir: "dist", assetsDir: "assets" },
});
