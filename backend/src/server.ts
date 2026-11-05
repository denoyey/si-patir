import { Application } from './Application.js';

const app = new Application();
app.start().catch((err) => {
  console.error('[Fatal Error] Failed to boot SI-PATIR server:', err);
  process.exit(1);
});
