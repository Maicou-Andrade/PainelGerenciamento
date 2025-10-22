const express = require('express');
const router = express.Router();
const { prisma } = require('../prisma');

// GET - Listar todos os projetos
router.get('/', async (req, res) => {
  try {
    const projetos = await prisma.projeto.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(projetos);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar projeto por ID
router.get('/:id', async (req, res) => {
  try {
    const projeto = await prisma.projeto.findUnique({
      where: {
        id: parseInt(req.params.id)
      }
    });
    
    if (!projeto) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }
    
    res.json(projeto);
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Criar novo projeto
router.post('/', async (req, res) => {
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

  try {
    const projeto = await prisma.projeto.create({
      data: {
        codigo,
        nome,
        descricao: descricao || '',
        prioridade: prioridade || '',
        responsaveis: responsaveis || '',
        inicioPlaneado: inicioPlaneado || '',
        fimPlaneado: fimPlaneado || '',
        status: status || 'Ativo',
        progresso: progresso || 0,
        observacoes: observacoes || '',
        aprovacao: aprovacao || false
      }
    });

    res.status(201).json({
      ...projeto,
      message: 'Projeto criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Código do projeto já existe' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// PUT - Atualizar projeto
router.put('/:id', async (req, res) => {
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

  try {
    const projeto = await prisma.projeto.update({
      where: {
        id: parseInt(req.params.id)
      },
      data: {
        codigo,
        nome,
        descricao: descricao || '',
        prioridade: prioridade || '',
        responsaveis: responsaveis || '',
        inicioPlaneado: inicioPlaneado || '',
        fimPlaneado: fimPlaneado || '',
        status: status || 'Ativo',
        progresso: progresso || 0,
        observacoes: observacoes || '',
        aprovacao: aprovacao || false
      }
    });

    console.log('🔍 Projeto atualizado:', projeto);
    res.json({ message: 'Projeto atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Código do projeto já existe' });
    } else if (error.code === 'P2025') {
      res.status(404).json({ error: 'Projeto não encontrado' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// DELETE - Deletar projeto
router.delete('/:id', async (req, res) => {
  try {
    await prisma.projeto.delete({
      where: {
        id: parseInt(req.params.id)
      }
    });

    res.json({ message: 'Projeto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Projeto não encontrado' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

module.exports = router;