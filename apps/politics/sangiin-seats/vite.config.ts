import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // カスタムドメイン election-sangiin-seats.visualizing.jp はサイトのルート。
  base: "/politics/elections/sangiin/seats/",
  build: { outDir: "dist", assetsDir: "assets" },
});
