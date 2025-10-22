const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET - Listar todas as subtarefas
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM subtarefas ORDER BY created_at DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar subtarefas:', err.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }
    res.json(rows);
  });
});

// GET - Buscar subtarefas por atividade
router.get('/atividade/:atividadeId', (req, res) => {
  const sql = 'SELECT * FROM subtarefas WHERE atividadeId = ? ORDER BY created_at DESC';
  
  db.all(sql, [req.params.atividadeId], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar subtarefas da atividade:', err.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }
    res.json(rows);
  });
});

// GET - Buscar subtarefa por ID
router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM subtarefas WHERE id = ?';
  
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar subtarefa:', err.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Subtarefa não encontrada' });
      return;
    }
    
    res.json(row);
  });
});

// POST - Criar nova subtarefa
router.post('/', (req, res) => {
  const {
    codigo,
    atividadeId,
    nome,
    responsavel,
    dataInicio,
    dataFim,
    status,
    progresso,
    observacoes
  } = req.body;

  if (!codigo || !nome || !atividadeId) {
    res.status(400).json({ error: 'Código, nome e ID da atividade são obrigatórios' });
    return;
  }

  const sql = `INSERT INTO subtarefas 
    (codigo, atividadeId, nome, responsavel, dataInicio, dataFim, status, progresso, observacoes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;

  const params = [
    codigo,
    atividadeId,
    nome,
    responsavel || '',
    dataInicio || '',
    dataFim || '',
    status || 'Pendente',
    progresso || 0,
    observacoes || ''
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Erro ao criar subtarefa:', err.message);
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Código da subtarefa já existe' });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
      return;
    }

    res.status(201).json({
      id: this.lastID,
      codigo,
      atividadeId,
      nome,
      responsavel,
      dataInicio,
      dataFim,
      status,
      progresso,
      observacoes,
      message: 'Subtarefa criada com sucesso'
    });
  });
});

// PUT - Atualizar subtarefa
router.put('/:id', (req, res) => {
  const {
    codigo,
    atividadeId,
    nome,
    responsavel,
    dataInicio,
    dataFim,
    status,
    progresso,
    observacoes
  } = req.body;

  if (!codigo || !nome || !atividadeId) {
    res.status(400).json({ error: 'Código, nome e ID da atividade são obrigatórios' });
    return;
  }

  const sql = `UPDATE subtarefas SET 
    codigo = ?, atividadeId = ?, nome = ?, responsavel = ?, 
    dataInicio = ?, dataFim = ?, status = ?, progresso = ?, 
    observacoes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;

  const params = [
    codigo,
    atividadeId,
    nome,
    responsavel || '',
    dataInicio || '',
    dataFim || '',
    status || 'Pendente',
    progresso || 0,
    observacoes || '',
    req.params.id
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Erro ao atualizar subtarefa:', err.message);
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Código da subtarefa já existe' });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Subtarefa não encontrada' });
      return;
    }

    res.json({ message: 'Subtarefa atualizada com sucesso' });
  });
});

// DELETE - Deletar subtarefa
router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM subtarefas WHERE id = ?';
  
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      console.error('Erro ao deletar subtarefa:', err.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Subtarefa não encontrada' });
      return;
    }

    res.json({ message: 'Subtarefa deletada com sucesso' });
  });
});

module.exports = router;