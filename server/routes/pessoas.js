const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET - Listar todas as pessoas
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM pessoas ORDER BY created_at DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar pessoas:', err.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }
    res.json(rows);
  });
});

// GET - Buscar pessoa por ID
router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM pessoas WHERE id = ?';
  
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar pessoa:', err.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Pessoa não encontrada' });
      return;
    }
    
    res.json(row);
  });
});

// POST - Criar nova pessoa
router.post('/', (req, res) => {
  const {
    codigo,
    nome,
    email,
    telefone,
    cargo,
    departamento,
    status,
    ativo,
    observacoes
  } = req.body;

  if (!codigo || !nome) {
    res.status(400).json({ error: 'Código e nome são obrigatórios' });
    return;
  }

  const sql = `INSERT INTO pessoas 
    (codigo, nome, email, telefone, cargo, departamento, status, ativo, observacoes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;

  const params = [
    codigo,
    nome,
    email || '',
    telefone || '',
    cargo || '',
    departamento || '',
    status || 'Ativo',
    ativo !== undefined ? ativo : 1,
    observacoes || ''
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Erro ao criar pessoa:', err.message);
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Código da pessoa já existe' });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
      return;
    }

    res.status(201).json({
      id: this.lastID,
      codigo,
      nome,
      email,
      telefone,
      cargo,
      departamento,
      status,
      ativo: ativo !== undefined ? ativo : 1,
      observacoes,
      message: 'Pessoa criada com sucesso'
    });
  });
});

// PUT - Atualizar pessoa
router.put('/:id', (req, res) => {
  const {
    codigo,
    nome,
    email,
    telefone,
    cargo,
    departamento,
    status,
    ativo,
    observacoes
  } = req.body;

  if (!codigo || !nome) {
    res.status(400).json({ error: 'Código e nome são obrigatórios' });
    return;
  }

  const sql = `UPDATE pessoas SET 
    codigo = ?, nome = ?, email = ?, telefone = ?, 
    cargo = ?, departamento = ?, status = ?, ativo = ?, observacoes = ?, 
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;

  const params = [
    codigo,
    nome,
    email || '',
    telefone || '',
    cargo || '',
    departamento || '',
    status || 'Ativo',
    ativo !== undefined ? ativo : 1,
    observacoes || '',
    req.params.id
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Erro ao atualizar pessoa:', err.message);
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Código da pessoa já existe' });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Pessoa não encontrada' });
      return;
    }

    res.json({ message: 'Pessoa atualizada com sucesso' });
  });
});

// DELETE - Deletar pessoa
router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM pessoas WHERE id = ?';
  
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      console.error('Erro ao deletar pessoa:', err.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Pessoa não encontrada' });
      return;
    }

    res.json({ message: 'Pessoa deletada com sucesso' });
  });
});

module.exports = router;