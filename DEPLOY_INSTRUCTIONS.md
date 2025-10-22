# 🚀 Instruções de Deploy - Painel de Gerenciamento de Projetos

## 📋 Pré-requisitos
- Conta no GitHub
- Conta no Vercel (para frontend)
- Conta no Railway (para backend)

## 🔧 Passo a Passo para Deploy

### 1. 📂 Criar Repositório no GitHub

1. Acesse [GitHub.com](https://github.com)
2. Clique em "New repository"
3. Nome sugerido: `painel-gerenciamento-projetos`
4. Deixe como **público** para facilitar o deploy
5. **NÃO** inicialize com README (já temos um)
6. Clique em "Create repository"

### 2. 🔗 Conectar Repositório Local ao GitHub

No terminal do projeto, execute:

```bash
# Adicionar o repositório remoto (substitua SEU_USUARIO pelo seu username)
git remote add origin https://github.com/SEU_USUARIO/painel-gerenciamento-projetos.git

# Enviar código para o GitHub
git branch -M main
git push -u origin main
```

### 3. 🌐 Deploy do Frontend (Vercel)

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione o repositório `painel-gerenciamento-projetos`
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (raiz do projeto)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Clique em "Deploy"

**⚠️ Importante:** Após o deploy, você receberá uma URL como `https://seu-projeto.vercel.app`

### 4. 🖥️ Deploy do Backend (Railway)

1. Acesse [railway.app](https://railway.app)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Escolha o repositório `painel-gerenciamento-projetos`
6. Configure:
   - **Root Directory:** `server`
   - **Start Command:** `npm start`
   - **Port:** `3001`
7. Clique em "Deploy"

**⚠️ Importante:** Após o deploy, você receberá uma URL como `https://seu-backend.railway.app`

### 5. 🔧 Configurar URLs de Produção

Após obter as URLs de deploy, você precisa atualizar o arquivo `src/api.js`:

```javascript
// Substitua pela URL real do seu backend no Railway
const API_BASE_URL = 'https://seu-backend.railway.app/api';
```

Depois, faça commit e push das alterações:

```bash
git add src/api.js
git commit -m "Update API URL for production"
git push origin main
```

O Vercel automaticamente fará redeploy com as novas configurações.

### 6. 🗄️ Configurar Banco de Dados

Para produção, recomenda-se usar um banco de dados online:

#### Opção 1: Railway Database
1. No Railway, adicione um "PostgreSQL" ao seu projeto
2. Atualize `server/database.js` para usar PostgreSQL
3. Configure as variáveis de ambiente

#### Opção 2: Manter SQLite (mais simples)
- O SQLite funcionará, mas os dados serão resetados a cada deploy
- Para dados persistentes, use a Opção 1

### 7. ✅ URLs Finais

Após completar todos os passos:

- **Frontend:** `https://seu-projeto.vercel.app`
- **Backend API:** `https://seu-backend.railway.app/api`
- **Repositório:** `https://github.com/SEU_USUARIO/painel-gerenciamento-projetos`

## 🔄 Atualizações Futuras

Para atualizar o sistema:

1. Faça as alterações localmente
2. Commit e push para o GitHub:
   ```bash
   git add .
   git commit -m "Descrição da alteração"
   git push origin main
   ```
3. Vercel e Railway farão deploy automático das alterações

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs no Vercel/Railway
2. Confirme se as URLs estão corretas
3. Teste localmente antes do deploy

---

🎉 **Parabéns!** Seu sistema estará acessível globalmente via internet!