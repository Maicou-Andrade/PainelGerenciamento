require('dotenv/config');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { prisma, connectPrisma, disconnectPrisma } = require('./prisma');

// Importar rotas
const projetosRoutes = require('./routes/projetos');
const pessoasRoutes = require('./routes/pessoas');
const atividadesRoutes = require('./routes/atividades');
const subtarefasRoutes = require('./routes/subtarefas');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://172.16.20.217:5173',
    process.env.CORS_ORIGIN || 'https://main.d2ixqhqhqhqhqh.amplifyapp.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Conectar ao banco de dados
connectPrisma();

// Rotas da API
app.use('/api/projetos', projetosRoutes);
app.use('/api/pessoas', pessoasRoutes);
app.use('/api/atividades', atividadesRoutes);
app.use('/api/subtarefas', subtarefasRoutes);

// Rota de teste
app.get('/api/health', async (req, res) => {
  try {
    // Testar conexão com o banco
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'OK', 
      message: 'API do Painel de Projetos funcionando!',
      database: 'Conectado',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Erro na conexão com o banco de dados',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🌐 CORS configurado para: ${process.env.CORS_ORIGIN || 'localhost'}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Banco de dados: PostgreSQL via Prisma`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  server.close(async () => {
    console.log('✅ Servidor encerrado.');
    await disconnectPrisma();
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Encerrando servidor...');
  server.close(async () => {
    console.log('✅ Servidor encerrado.');
    await disconnectPrisma();
    process.exit(0);
  });
});

module.exports = app;