import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // カスタムドメイン election-sangiin-turnout.visualizing.jp はサイトのルート。
  base: "/politics/elections/sangiin/turnout/",
  build: { outDir: "dist", assetsDir: "assets" },
});
