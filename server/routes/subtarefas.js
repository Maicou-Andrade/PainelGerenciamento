const express = require('express');
const router = express.Router();
const { prisma } = require('../prisma');

// GET - Listar todas as subtarefas
router.get('/', async (req, res) => {
  try {
    const subtarefas = await prisma.subtarefa.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(subtarefas);
  } catch (error) {
    console.error('Erro ao buscar subtarefas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar subtarefas por atividade
router.get('/atividade/:atividadeId', async (req, res) => {
  try {
    const subtarefas = await prisma.subtarefa.findMany({
      where: {
        atividadeId: parseInt(req.params.atividadeId)
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(subtarefas);
  } catch (error) {
    console.error('Erro ao buscar subtarefas da atividade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar subtarefa por ID
router.get('/:id', async (req, res) => {
  try {
    const subtarefa = await prisma.subtarefa.findUnique({
      where: {
        id: parseInt(req.params.id)
      }
    });
    
    if (!subtarefa) {
      res.status(404).json({ error: 'Subtarefa não encontrada' });
      return;
    }
    
    res.json(subtarefa);
  } catch (error) {
    console.error('Erro ao buscar subtarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Criar nova subtarefa
router.post('/', async (req, res) => {
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

  try {
    const subtarefa = await prisma.subtarefa.create({
      data: {
        codigo,
        atividadeId: parseInt(atividadeId),
        nome,
        responsavel: responsavel || '',
        dataInicio: dataInicio || '',
        dataFim: dataFim || '',
        status: status || 'Pendente',
        progresso: progresso || 0,
        observacoes: observacoes || ''
      }
    });

    res.status(201).json({
      ...subtarefa,
      message: 'Subtarefa criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar subtarefa:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Código da subtarefa já existe' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// PUT - Atualizar subtarefa
router.put('/:id', async (req, res) => {
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

  try {
    const subtarefa = await prisma.subtarefa.update({
      where: {
        id: parseInt(req.params.id)
      },
      data: {
        codigo,
        atividadeId: parseInt(atividadeId),
        nome,
        responsavel: responsavel || '',
        dataInicio: dataInicio || '',
        dataFim: dataFim || '',
        status: status || 'Pendente',
        progresso: progresso || 0,
        observacoes: observacoes || ''
      }
    });

    res.json({ message: 'Subtarefa atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar subtarefa:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Código da subtarefa já existe' });
    } else if (error.code === 'P2025') {
      res.status(404).json({ error: 'Subtarefa não encontrada' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// DELETE - Deletar subtarefa
router.delete('/:id', async (req, res) => {
  try {
    await prisma.subtarefa.delete({
      where: {
        id: parseInt(req.params.id)
      }
    });

    res.json({ message: 'Subtarefa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar subtarefa:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Subtarefa não encontrada' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

module.exports = router;