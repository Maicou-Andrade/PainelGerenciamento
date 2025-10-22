const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET - Listar todas as atividades
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM atividades ORDER BY created_at DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar atividades:', err.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }
    res.json(rows);
  });
});

// GET - Buscar atividade por ID
router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM atividades WHERE id = ?';
  
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar atividade:', err.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Atividade não encontrada' });
      return;
    }
    
    res.json(row);
  });
});

// POST - Criar nova atividade
router.post('/', (req, res) => {
  const {
    codigo,
    codigoProjeto,
    projeto,
    responsavelProjeto,
    inicioPlaneado,
    fimPlaneado,
    tarefa,
    responsaveisTarefa,
    diasPrevistos,
    dataInicio,
    previsaoEntrega,
    status,
    statusPrazo,
    progresso,
    qtdHoras,
    horasUtilizadas,
    diferencaHoras,
    observacoes,
    nome,
    responsavel
  } = req.body;

  if (!codigo || !tarefa) {
    res.status(400).json({ error: 'Código e tarefa são obrigatórios' });
    return;
  }

  const sql = `INSERT INTO atividades 
    (codigo, codigoProjeto, projeto, responsavelProjeto, inicioPlaneado, fimPlaneado,
     tarefa, responsaveisTarefa, diasPrevistos, dataInicio, previsaoEntrega, status,
     statusPrazo, progresso, qtdHoras, horasUtilizadas, diferencaHoras, observacoes,
     nome, responsavel, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;

  const params = [
    codigo,
    codigoProjeto || '',
    projeto || '',
    responsavelProjeto || '',
    inicioPlaneado || '',
    fimPlaneado || '',
    tarefa,
    responsaveisTarefa || '',
    diasPrevistos || 0,
    dataInicio || '',
    previsaoEntrega || '',
    status || 'Não Iniciado',
    statusPrazo || 'Dentro do Prazo',
    progresso || 0,
    qtdHoras || 0,
    horasUtilizadas || 0,
    diferencaHoras || 0,
    observacoes || '',
    nome || '',
    responsavel || ''
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Erro ao criar atividade:', err.message);
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Código da atividade já existe' });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
      return;
    }

    res.status(201).json({
      id: this.lastID,
      codigo,
      codigoProjeto,
      projeto,
      responsavelProjeto,
      inicioPlaneado,
      fimPlaneado,
      tarefa,
      responsaveisTarefa,
      diasPrevistos,
      dataInicio,
      previsaoEntrega,
      status,
      statusPrazo,
      progresso,
      qtdHoras,
      horasUtilizadas,
      diferencaHoras,
      observacoes,
      nome,
      responsavel,
      message: 'Atividade criada com sucesso'
    });
  });
});

// PUT - Atualizar atividade
router.put('/:id', (req, res) => {
  const {
    codigo,
    codigoProjeto,
    projeto,
    responsavelProjeto,
    inicioPlaneado,
    fimPlaneado,
    tarefa,
    responsaveisTarefa,
    diasPrevistos,
    dataInicio,
    previsaoEntrega,
    status,
    statusPrazo,
    progresso,
    qtdHoras,
    horasUtilizadas,
    diferencaHoras,
    observacoes,
    nome,
    responsavel
  } = req.body;

  if (!codigo || !tarefa) {
    res.status(400).json({ error: 'Código e tarefa são obrigatórios' });
    return;
  }

  const sql = `UPDATE atividades SET 
    codigo = ?, codigoProjeto = ?, projeto = ?, responsavelProjeto = ?, 
    inicioPlaneado = ?, fimPlaneado = ?, tarefa = ?, responsaveisTarefa = ?,
    diasPrevistos = ?, dataInicio = ?, previsaoEntrega = ?, status = ?,
    statusPrazo = ?, progresso = ?, qtdHoras = ?, horasUtilizadas = ?,
    diferencaHoras = ?, observacoes = ?, nome = ?, responsavel = ?,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;

  const params = [
    codigo,
    codigoProjeto || '',
    projeto || '',
    responsavelProjeto || '',
    inicioPlaneado || '',
    fimPlaneado || '',
    tarefa,
    responsaveisTarefa || '',
    diasPrevistos || 0,
    dataInicio || '',
    previsaoEntrega || '',
    status || 'Não Iniciado',
    statusPrazo || 'Dentro do Prazo',
    progresso || 0,
    qtdHoras || 0,
    horasUtilizadas || 0,
    diferencaHoras || 0,
    observacoes || '',
    nome || '',
    responsavel || '',
    req.params.id
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Erro ao atualizar atividade:', err.message);
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Código da atividade já existe' });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Atividade não encontrada' });
      return;
    }

    res.json({ message: 'Atividade atualizada com sucesso' });
  });
});

// DELETE - Deletar atividade
router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM atividades WHERE id = ?';
  
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      console.error('Erro ao deletar atividade:', err.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Atividade não encontrada' });
      return;
    }

    res.json({ message: 'Atividade deletada com sucesso' });
  });
});

module.exports = router;