import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // カスタムドメイン governor-election-okinawa.visualizing.jp はサイトのルート。
  base: "/politics/elections/governors/okinawa/",
  build: { outDir: "dist", assetsDir: "assets" },
});
