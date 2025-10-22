# Instruções de Deploy AWS Amplify

## Pré-requisitos
- Conta AWS ativa
- Instância RDS PostgreSQL configurada
- Repositório Git (GitHub, GitLab, etc.)

## 1. Configuração do Banco de Dados PostgreSQL

### Criar instância RDS PostgreSQL:
1. Acesse o console AWS RDS
2. Clique em "Create database"
3. Escolha "PostgreSQL"
4. Configure:
   - DB instance identifier: `painel-projetos-db`
   - Master username: `postgres`
   - Master password: (sua senha)
   - DB instance class: `db.t3.micro` (para desenvolvimento)
   - Storage: 20 GB
   - VPC: Default
   - Public access: Yes (para desenvolvimento)
   - Security group: Permitir conexões na porta 5432

### Obter string de conexão:
```
postgresql://username:password@endpoint:5432/database_name
```

## 2. Configuração do AWS Amplify

### Conectar repositório:
1. Acesse o console AWS Amplify
2. Clique em "New app" > "Host web app"
3. Conecte seu repositório Git
4. Selecione a branch principal

### Configurar variáveis de ambiente:
No console Amplify, vá em "Environment variables" e adicione:

```
DATABASE_URL=postgresql://username:password@endpoint:5432/database_name
CORS_ORIGIN=https://main.d2ixqhqhqhqhqh.amplifyapp.com
NODE_ENV=production
PORT=3001
```

### Configurar build settings:
O arquivo `amplify.yml` já está configurado. Certifique-se de que está na raiz do projeto.

## 3. Deploy do Backend (Opcional - Railway/Heroku)

Se preferir hospedar o backend separadamente:

### Railway:
1. Conecte seu repositório no Railway
2. Configure as variáveis de ambiente
3. O arquivo `railway.json` já está configurado

### Heroku:
```bash
heroku create painel-projetos-api
heroku config:set DATABASE_URL=postgresql://...
heroku config:set CORS_ORIGIN=https://your-amplify-app.amplifyapp.com
git subtree push --prefix server heroku main
```

## 4. Configuração Final

### Atualizar CORS_ORIGIN:
Após o deploy do Amplify, atualize a variável `CORS_ORIGIN` com a URL real:
```
CORS_ORIGIN=https://main.d2ixqhqhqhqhqh.amplifyapp.com
```

### Testar aplicação:
1. Acesse a URL do Amplify
2. Verifique se todas as funcionalidades estão funcionando
3. Teste CRUD de projetos, pessoas, atividades e subtarefas

## 5. Monitoramento

### Logs do Amplify:
- Acesse "Build history" para ver logs de build
- Verifique "Function logs" se usar serverless functions

### Logs do banco:
- Use CloudWatch para monitorar a instância RDS
- Configure alertas para uso de CPU e conexões

## 6. Backup e Segurança

### Backup automático:
- Configure backup automático no RDS
- Retenção recomendada: 7 dias

### Segurança:
- Use Security Groups para restringir acesso ao banco
- Configure SSL/TLS para conexões
- Use AWS Secrets Manager para credenciais sensíveis

## Estrutura de Arquivos Importantes

```
├── amplify.yml              # Configuração de build do Amplify
├── .env                     # Variáveis de ambiente (frontend)
├── server/
│   ├── .env                 # Variáveis de ambiente (backend)
│   ├── prisma/
│   │   └── schema.prisma    # Schema do banco de dados
│   ├── prisma.js           # Configuração do Prisma Client
│   └── server.js           # Servidor principal
└── AWS_DEPLOY_INSTRUCTIONS.md
```

## Troubleshooting

### Erro de conexão com banco:
- Verifique se a string DATABASE_URL está correta
- Confirme se o Security Group permite conexões na porta 5432
- Teste conexão local primeiro

### Erro de CORS:
- Verifique se CORS_ORIGIN está configurado corretamente
- Confirme se a URL do Amplify está atualizada

### Build falha:
- Verifique logs no console Amplify
- Confirme se todas as dependências estão no package.json
- Teste build local: `npm run build`