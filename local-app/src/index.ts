import { loadConfig } from './config.js';
import { ChatController } from './controllers/chatController.js';

async function main(): Promise<void> {
  const controller = new ChatController(loadConfig());
  await controller.run();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
