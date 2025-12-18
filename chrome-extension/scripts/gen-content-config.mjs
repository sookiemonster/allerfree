import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load .env then .env.local (local overrides)
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

const apiBaseUrl =
  process.env.ALLERFREE_API_BASE_URL ||
  "http://localhost:8081";

const outPath = path.join("public", "content", "config.generated.js");

const contents = `/* generated file, do not edit */
(function () {
  self.__allerfreeConfig = self.__allerfreeConfig || {};
  self.__allerfreeConfig.apiBaseUrl = ${JSON.stringify(apiBaseUrl)};
})();
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, contents, "utf8");

console.log("[gen-content-config] apiBaseUrl =", apiBaseUrl);
console.log("[gen-content-config] wrote", outPath);
