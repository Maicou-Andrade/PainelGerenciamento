const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeDatabase, closeDatabase } = require('./database');

// Importar rotas
const projetosRoutes = require('./routes/projetos');
const pessoasRoutes = require('./routes/pessoas');
const atividadesRoutes = require('./routes/atividades');
const subtarefasRoutes = require('./routes/subtarefas');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Inicializar banco de dados
initializeDatabase();

// Rotas da API
app.use('/api/projetos', projetosRoutes);
app.use('/api/pessoas', pessoasRoutes);
app.use('/api/atividades', atividadesRoutes);
app.use('/api/subtarefas', subtarefasRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API do Painel de Projetos funcionando!',
    timestamp: new Date().toISOString()
  });
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
  console.log(`🌐 API acessível na rede em: http://172.16.20.217:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado.');
    closeDatabase();
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado.');
    closeDatabase();
    process.exit(0);
  });
});

module.exports = app;