import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // カスタムドメイン governor-election.visualizing.jp はサイトのルート。
  base: "/politics/elections/governors/",
  build: { outDir: "dist", assetsDir: "assets" },
});
