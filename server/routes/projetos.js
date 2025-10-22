const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET - Listar todos os projetos
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM projetos ORDER BY created_at DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar projetos:', err.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }
    res.json(rows);
  });
});

// GET - Buscar projeto por ID
router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM projetos WHERE id = ?';
  
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar projeto:', err.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }
    
    res.json(row);
  });
});

// POST - Criar novo projeto
router.post('/', (req, res) => {
  const {
    codigo,
    nome,
    descricao,
    prioridade,
    responsaveis,
    inicioPlaneado,
    fimPlaneado,
    status,
    progresso,
    observacoes,
    aprovacao
  } = req.body;

  if (!codigo || !nome) {
    res.status(400).json({ error: 'Código e nome são obrigatórios' });
    return;
  }

  const sql = `INSERT INTO projetos 
    (codigo, nome, descricao, prioridade, responsaveis, inicioPlaneado, fimPlaneado, status, progresso, observacoes, aprovacao, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;

  const params = [
    codigo,
    nome,
    descricao || '',
    prioridade || '',
    responsaveis || '',
    inicioPlaneado || '',
    fimPlaneado || '',
    status || 'Ativo',
    progresso || 0,
    observacoes || '',
    aprovacao || false
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Erro ao criar projeto:', err.message);
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Código do projeto já existe' });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
      return;
    }

    res.status(201).json({
      id: this.lastID,
      codigo,
      nome,
      descricao,
      prioridade,
      responsaveis,
      inicioPlaneado,
      fimPlaneado,
      status,
      progresso,
      observacoes,
      message: 'Projeto criado com sucesso'
    });
  });
});

// PUT - Atualizar projeto
router.put('/:id', (req, res) => {
  console.log('🔍 PUT /api/projetos/:id - Body recebido:', req.body);
  console.log('🔍 Campo aprovacao recebido:', req.body.aprovacao, 'Tipo:', typeof req.body.aprovacao);
  
  const {
    codigo,
    nome,
    descricao,
    prioridade,
    responsaveis,
    inicioPlaneado,
    fimPlaneado,
    status,
    progresso,
    observacoes,
    aprovacao
  } = req.body;

  if (!codigo || !nome) {
    res.status(400).json({ error: 'Código e nome são obrigatórios' });
    return;
  }

  const sql = `UPDATE projetos SET 
    codigo = ?, nome = ?, descricao = ?, prioridade = ?, responsaveis = ?, inicioPlaneado = ?, 
    fimPlaneado = ?, status = ?, progresso = ?, observacoes = ?, aprovacao = ?, 
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;

  const params = [
    codigo,
    nome,
    descricao || '',
    prioridade || '',
    responsaveis || '',
    inicioPlaneado || '',
    fimPlaneado || '',
    status || 'Ativo',
    progresso || 0,
    observacoes || '',
    aprovacao || false,
    req.params.id
  ];

  console.log('🔍 Parâmetros da query:', params);
  console.log('🔍 Valor aprovacao nos parâmetros:', params[10], 'Tipo:', typeof params[10]);

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Erro ao atualizar projeto:', err.message);
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Código do projeto já existe' });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }

    res.json({ message: 'Projeto atualizado com sucesso' });
  });
});

// DELETE - Deletar projeto
router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM projetos WHERE id = ?';
  
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      console.error('Erro ao deletar projeto:', err.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }

    res.json({ message: 'Projeto deletado com sucesso' });
  });
});

module.exports = router;