const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Criar conexão com o banco de dados
const dbPath = path.join(__dirname, 'painel_projetos.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Função para inicializar as tabelas
const initializeDatabase = () => {
  // Tabela PROJETOS
  db.run(`CREATE TABLE IF NOT EXISTS projetos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    prioridade TEXT,
    responsaveis TEXT,
    inicioPlaneado TEXT,
    fimPlaneado TEXT,
    status TEXT DEFAULT 'Ativo',
    progresso INTEGER DEFAULT 0,
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela projetos:', err.message);
    } else {
      console.log('Tabela projetos criada/verificada com sucesso.');
      
      // Adicionar colunas que podem estar faltando (migração)
      db.run(`ALTER TABLE projetos ADD COLUMN descricao TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Erro ao adicionar coluna descricao:', err.message);
        } else if (!err) {
          console.log('Coluna descricao adicionada com sucesso.');
        }
      });
      
      db.run(`ALTER TABLE projetos ADD COLUMN prioridade TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Erro ao adicionar coluna prioridade:', err.message);
        } else if (!err) {
          console.log('Coluna prioridade adicionada com sucesso.');
        }
      });
      
      db.run(`ALTER TABLE projetos ADD COLUMN aprovacao BOOLEAN DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Erro ao adicionar coluna aprovacao:', err.message);
        } else if (!err) {
          console.log('Coluna aprovacao adicionada com sucesso.');
        }
      });
    }
  });

  // Tabela PESSOAS
  db.run(`CREATE TABLE IF NOT EXISTS pessoas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    cargo TEXT,
    departamento TEXT,
    status TEXT DEFAULT 'Ativo',
    ativo INTEGER DEFAULT 1,
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela pessoas:', err.message);
    } else {
      console.log('Tabela pessoas criada/verificada com sucesso.');
      
      // Adicionar coluna ativo se não existir (migração)
      db.run(`ALTER TABLE pessoas ADD COLUMN ativo INTEGER DEFAULT 1`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Erro ao adicionar coluna ativo:', err.message);
        } else if (!err) {
          console.log('Coluna ativo adicionada com sucesso.');
        }
      });
    }
  });

  // Tabela ATIVIDADES
  db.run(`CREATE TABLE IF NOT EXISTS atividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    codigoProjeto TEXT NOT NULL,
    projeto TEXT NOT NULL,
    responsavelProjeto TEXT,
    inicioPlaneado TEXT,
    fimPlaneado TEXT,
    tarefa TEXT NOT NULL,
    responsaveisTarefa TEXT,
    diasPrevistos INTEGER DEFAULT 0,
    dataInicio TEXT,
    previsaoEntrega TEXT,
    status TEXT DEFAULT 'Não Iniciado',
    statusPrazo TEXT DEFAULT 'Dentro do Prazo',
    progresso INTEGER DEFAULT 0,
    qtdHoras INTEGER DEFAULT 0,
    horasUtilizadas INTEGER DEFAULT 0,
    diferencaHoras INTEGER DEFAULT 0,
    observacoes TEXT,
    nome TEXT,
    responsavel TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela atividades:', err.message);
    } else {
      console.log('Tabela atividades criada/verificada com sucesso.');
    }
  });

  // Tabela SUBTAREFAS
  db.run(`CREATE TABLE IF NOT EXISTS subtarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    atividadeId INTEGER NOT NULL,
    nome TEXT NOT NULL,
    responsavel TEXT,
    dataInicio TEXT,
    dataFim TEXT,
    status TEXT DEFAULT 'Pendente',
    progresso INTEGER DEFAULT 0,
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (atividadeId) REFERENCES atividades (id)
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela subtarefas:', err.message);
    } else {
      console.log('Tabela subtarefas criada/verificada com sucesso.');
    }
  });
};

// Função para fechar a conexão
const closeDatabase = () => {
  db.close((err) => {
    if (err) {
      console.error('Erro ao fechar o banco de dados:', err.message);
    } else {
      console.log('Conexão com o banco de dados fechada.');
    }
  });
};

module.exports = {
  db,
  initializeDatabase,
  closeDatabase
};