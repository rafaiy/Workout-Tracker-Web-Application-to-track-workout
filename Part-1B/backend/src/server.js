import { createApp } from './app.js';
import { config } from './config.js';

if (config.host !== '127.0.0.1') throw new Error('The API must bind to loopback only.');
const app = createApp();
const server = app.listen(config.port, config.host, () => {
  const address = server.address();
  if (!address || address.address !== '127.0.0.1') {
    server.close(() => process.exit(1));
    return;
  }
  console.log(`Workout API listening on http://${config.host}:${config.port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => { app.locals.db.close(); process.exit(0); });
  });
}
