"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const ai_1 = require("../src/lib/ai");
async function main() {
    const filename = "test.jpg";
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const uploadsDir = path_1.default.join(process.cwd(), "public", "uploads");
    await promises_1.default.mkdir(uploadsDir, { recursive: true });
    const safeKey = key.replace(/\.\.|\//g, "_");
    const outPath = path_1.default.join(uploadsDir, safeKey);
    await promises_1.default.writeFile(outPath, Buffer.from("mock-image-bytes"));
    const publicUrl = `http://localhost:3000/uploads/${encodeURIComponent(safeKey)}`;
    const text = "E2E mock upload test: schedule planning meeting";
    console.log("Wrote mock file:", outPath);
    try {
        let decision;
        if (process.env.OPENAI_API_KEY) {
            decision = await (0, ai_1.analyzeParaCapture)({ text, imageUrl: publicUrl });
        }
        else {
            // Local/dev fallback: mocked classification when no API key is present
            decision = {
                classification: "INBOX",
                title: text.slice(0, 80),
                details: text,
                type: "NOTE",
            };
        }
        console.log(JSON.stringify({ ok: true, key: safeKey, publicUrl, decision }, null, 2));
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("analyzeParaCapture failed:", msg);
        process.exit(1);
    }
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
