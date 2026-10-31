import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // カスタムドメイン japan-payroll.visualizing.jp はサイトのルート。
  base: "/society/payroll/",
  build: { outDir: "dist", assetsDir: "assets" },
});
