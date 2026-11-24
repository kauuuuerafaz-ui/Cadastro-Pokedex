# Cadastro Pokémon

Baralho de Pokémon com banco PostgreSQL (Neon).

## Como rodar

1. `npm install`
2. Crie um arquivo `.env` na raiz com a variável (apenas o NOME é documentado aqui):
   - `DATABASE_URL`  -> string de conexão `postgresql://usuario:senha@host/banco`
   - `PORT`          -> opcional (padrão 3002)
3. `npm run migrate`  -> cria/confere a tabela `baralho` (seguro, não apaga dados)
4. `npm start`        -> abre em http://localhost:3002
5. Conferir a conexão: http://localhost:3002/api/saude

Nunca envie o `.env` ao GitHub (ele já está no `.gitignore`).

## Publicar na Vercel

As rotas `/api/...` rodam como funções da Vercel (pasta `api/`), reaproveitando o `server.js`.

1. No painel da Vercel: Project > Settings > Environment Variables.
2. Crie `DATABASE_URL` (string de conexão do Neon) para Production, Preview e Development.
3. Faça um novo Deploy (Redeploy) depois de criar a variável.
4. Confira em https://SEU-SITE.vercel.app/api/saude (deve responder `{"banco":"ok",...}`).

Rode `npm run migrate` uma vez na sua máquina (com o `.env` local) para criar a tabela no Neon.
