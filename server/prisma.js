const { PrismaClient } = require('@prisma/client');

// Configurar Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Função para conectar ao banco
const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco PostgreSQL via Prisma');
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error);
    process.exit(1);
  }
};

// Função para desconectar do banco
const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco PostgreSQL');
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco:', error);
  }
};

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase
};