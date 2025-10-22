const express = require('express');
const router = express.Router();
const { prisma } = require('../prisma');

// GET - Listar todas as pessoas
router.get('/', async (req, res) => {
  try {
    const pessoas = await prisma.pessoa.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(pessoas);
  } catch (error) {
    console.error('Erro ao buscar pessoas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar pessoa por ID
router.get('/:id', async (req, res) => {
  try {
    const pessoa = await prisma.pessoa.findUnique({
      where: {
        id: parseInt(req.params.id)
      }
    });
    
    if (!pessoa) {
      res.status(404).json({ error: 'Pessoa não encontrada' });
      return;
    }
    
    res.json(pessoa);
  } catch (error) {
    console.error('Erro ao buscar pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Criar nova pessoa
router.post('/', async (req, res) => {
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

  try {
    const pessoa = await prisma.pessoa.create({
      data: {
        codigo,
        nome,
        email: email || '',
        telefone: telefone || '',
        cargo: cargo || '',
        departamento: departamento || '',
        status: status || 'Ativo',
        ativo: ativo !== undefined ? ativo : true,
        observacoes: observacoes || ''
      }
    });

    res.status(201).json({
      ...pessoa,
      message: 'Pessoa criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Código da pessoa já existe' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// PUT - Atualizar pessoa
router.put('/:id', async (req, res) => {
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

  try {
    const pessoa = await prisma.pessoa.update({
      where: {
        id: parseInt(req.params.id)
      },
      data: {
        codigo,
        nome,
        email: email || '',
        telefone: telefone || '',
        cargo: cargo || '',
        departamento: departamento || '',
        status: status || 'Ativo',
        ativo: ativo !== undefined ? ativo : true,
        observacoes: observacoes || ''
      }
    });

    res.json({ message: 'Pessoa atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Código da pessoa já existe' });
    } else if (error.code === 'P2025') {
      res.status(404).json({ error: 'Pessoa não encontrada' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// DELETE - Deletar pessoa
router.delete('/:id', async (req, res) => {
  try {
    await prisma.pessoa.delete({
      where: {
        id: parseInt(req.params.id)
      }
    });

    res.json({ message: 'Pessoa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar pessoa:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Pessoa não encontrada' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

module.exports = router;