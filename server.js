import express from 'express';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { readdirSync } from 'fs';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const apiDir = path.join(__dirname, 'api');

readdirSync(apiDir).forEach((file) => {
  if (file.endsWith('.js')) {
    const routeName = file.replace('.js', '').replace('_', '-'); // simple mapping
    const handlerPath = path.join(apiDir, file);
    // Dynamically import the handler
    const moduleUrl = pathToFileURL(handlerPath).href;
    import(moduleUrl).then((mod) => {
      const handler = mod.default;
      if (typeof handler === 'function') {
        app.all(`/api/${routeName}`, handler);
        console.log(`Mounted /api/${routeName}`);
      }
    }).catch((e) => {
      console.error(`Failed to load ${handlerPath}:`, e);
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
  // Keep process alive to prevent premature exit
  setInterval(() => {}, 1 << 30);
});
