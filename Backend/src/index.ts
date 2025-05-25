// index.ts
import 'reflect-metadata'; // For TypeORM
import { dataSource } from './config/db/conn';
import { createServer } from './config/server';

async function init() {
  try {
    console.log('Initializing database...');
    await dataSource.initialize();
    console.log('✅ Database initialized.');

    const server = await createServer();

    await server.start();
    console.log('🚀 Server running at:', server.info.uri);

  } catch (error) {
    console.error('❌ Initialization error:', error);
    process.exit(1);
  }
}

// Global error handlers
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

init();
