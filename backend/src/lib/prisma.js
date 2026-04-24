const { PrismaClient } = require('@prisma/client');

// Single shared instance across the entire app.
// Multiple PrismaClient instances in one process each open their own
// connection pool, which wastes resources and causes issues with SQLite.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
