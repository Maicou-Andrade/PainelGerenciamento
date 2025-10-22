const express = require('express');
const router = express.Router();
const { prisma } = require('../prisma');

// GET - Listar todas as atividades
router.get('/', async (req, res) => {
  try {
    const atividades = await prisma.atividade.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(atividades);
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar atividade por ID
router.get('/:id', async (req, res) => {
  try {
    const atividade = await prisma.atividade.findUnique({
      where: {
        id: parseInt(req.params.id)
      }
    });
    
    if (!atividade) {
      res.status(404).json({ error: 'Atividade não encontrada' });
      return;
    }
    
    res.json(atividade);
  } catch (error) {
    console.error('Erro ao buscar atividade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Criar nova atividade
router.post('/', async (req, res) => {
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

  try {
    const atividade = await prisma.atividade.create({
      data: {
        codigo,
        codigoProjeto: codigoProjeto || '',
        projeto: projeto || '',
        responsavelProjeto: responsavelProjeto || '',
        inicioPlaneado: inicioPlaneado || '',
        fimPlaneado: fimPlaneado || '',
        tarefa,
        responsaveisTarefa: responsaveisTarefa || '',
        diasPrevistos: diasPrevistos || 0,
        dataInicio: dataInicio || '',
        previsaoEntrega: previsaoEntrega || '',
        status: status || 'Não Iniciado',
        statusPrazo: statusPrazo || 'Dentro do Prazo',
        progresso: progresso || 0,
        qtdHoras: qtdHoras || 0,
        horasUtilizadas: horasUtilizadas || 0,
        diferencaHoras: diferencaHoras || 0,
        observacoes: observacoes || '',
        nome: nome || '',
        responsavel: responsavel || ''
      }
    });

    res.status(201).json({
      ...atividade,
      message: 'Atividade criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Código da atividade já existe' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// PUT - Atualizar atividade
router.put('/:id', async (req, res) => {
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

  try {
    const atividade = await prisma.atividade.update({
      where: {
        id: parseInt(req.params.id)
      },
      data: {
        codigo,
        codigoProjeto: codigoProjeto || '',
        projeto: projeto || '',
        responsavelProjeto: responsavelProjeto || '',
        inicioPlaneado: inicioPlaneado || '',
        fimPlaneado: fimPlaneado || '',
        tarefa,
        responsaveisTarefa: responsaveisTarefa || '',
        diasPrevistos: diasPrevistos || 0,
        dataInicio: dataInicio || '',
        previsaoEntrega: previsaoEntrega || '',
        status: status || 'Não Iniciado',
        statusPrazo: statusPrazo || 'Dentro do Prazo',
        progresso: progresso || 0,
        qtdHoras: qtdHoras || 0,
        horasUtilizadas: horasUtilizadas || 0,
        diferencaHoras: diferencaHoras || 0,
        observacoes: observacoes || '',
        nome: nome || '',
        responsavel: responsavel || ''
      }
    });

    res.json({ message: 'Atividade atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Código da atividade já existe' });
    } else if (error.code === 'P2025') {
      res.status(404).json({ error: 'Atividade não encontrada' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// DELETE - Deletar atividade
router.delete('/:id', async (req, res) => {
  try {
    await prisma.atividade.delete({
      where: {
        id: parseInt(req.params.id)
      }
    });

    res.json({ message: 'Atividade deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar atividade:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Atividade não encontrada' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

module.exports = router;