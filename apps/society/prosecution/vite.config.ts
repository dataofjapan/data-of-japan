import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // カスタムドメイン japan-data-prosecution.visualizing.jp はサイトのルート。
  base: "/society/prosecution/",
  build: { outDir: "dist", assetsDir: "assets" },
});
