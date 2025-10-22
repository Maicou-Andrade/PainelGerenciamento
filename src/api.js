// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Função auxiliar para fazer requisições HTTP
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro na requisição para ${endpoint}:`, error);
    throw error;
  }
};

// ===== PROJETOS =====
export const projetosAPI = {
  // Listar todos os projetos
  getAll: () => apiRequest('/projetos'),
  
  // Buscar projeto por ID
  getById: (id) => apiRequest(`/projetos/${id}`),
  
  // Criar novo projeto
  create: (projeto) => apiRequest('/projetos', {
    method: 'POST',
    body: projeto,
  }),
  
  // Atualizar projeto
  update: (id, projeto) => apiRequest(`/projetos/${id}`, {
    method: 'PUT',
    body: projeto,
  }),
  
  // Deletar projeto
  delete: (id) => apiRequest(`/projetos/${id}`, {
    method: 'DELETE',
  }),
};

// ===== PESSOAS =====
export const pessoasAPI = {
  // Listar todas as pessoas
  getAll: () => apiRequest('/pessoas'),
  
  // Buscar pessoa por ID
  getById: (id) => apiRequest(`/pessoas/${id}`),
  
  // Criar nova pessoa
  create: (pessoa) => apiRequest('/pessoas', {
    method: 'POST',
    body: pessoa,
  }),
  
  // Atualizar pessoa
  update: (id, pessoa) => apiRequest(`/pessoas/${id}`, {
    method: 'PUT',
    body: pessoa,
  }),
  
  // Deletar pessoa
  delete: (id) => apiRequest(`/pessoas/${id}`, {
    method: 'DELETE',
  }),
};

// ===== ATIVIDADES =====
export const atividadesAPI = {
  // Listar todas as atividades
  getAll: () => apiRequest('/atividades'),
  
  // Buscar atividade por ID
  getById: (id) => apiRequest(`/atividades/${id}`),
  
  // Criar nova atividade
  create: (atividade) => apiRequest('/atividades', {
    method: 'POST',
    body: atividade,
  }),
  
  // Atualizar atividade
  update: (id, atividade) => apiRequest(`/atividades/${id}`, {
    method: 'PUT',
    body: atividade,
  }),
  
  // Deletar atividade
  delete: (id) => apiRequest(`/atividades/${id}`, {
    method: 'DELETE',
  }),
};

// ===== SUBTAREFAS =====
export const subtarefasAPI = {
  // Listar todas as subtarefas
  getAll: () => apiRequest('/subtarefas'),
  
  // Buscar subtarefas por atividade
  getByAtividade: (atividadeId) => apiRequest(`/subtarefas/atividade/${atividadeId}`),
  
  // Buscar subtarefa por ID
  getById: (id) => apiRequest(`/subtarefas/${id}`),
  
  // Criar nova subtarefa
  create: (subtarefa) => apiRequest('/subtarefas', {
    method: 'POST',
    body: subtarefa,
  }),
  
  // Atualizar subtarefa
  update: (id, subtarefa) => apiRequest(`/subtarefas/${id}`, {
    method: 'PUT',
    body: subtarefa,
  }),
  
  // Deletar subtarefa
  delete: (id) => apiRequest(`/subtarefas/${id}`, {
    method: 'DELETE',
  }),
};

// ===== HEALTH CHECK =====
export const healthAPI = {
  check: () => apiRequest('/health'),
};

// Função para testar conectividade com a API
export const testConnection = async (retries = 2) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Adicionar timeout para evitar requisições longas
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos timeout
      
      await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      if (i === retries - 1) {
        console.warn('⚠️ API não disponível após tentativas, usando dados de exemplo');
        return false;
      }
      // Pequeno delay antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  return false;
};