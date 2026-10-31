import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // カスタムドメイン japan-election.visualizing.jp はサイトのルート。
  base: "/politics/elections/",
  build: { outDir: "dist", assetsDir: "assets" },
});
