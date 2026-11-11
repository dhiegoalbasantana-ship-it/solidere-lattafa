# 🚀 Guia de Deploy Oficial: Solidere Atacadista x Lattafa Brasil

Este projeto está pronto para produção e integrado com **GitHub**, **Vercel**, **Supabase** e seu **Subdomínio no Cloudflare**.

---

## 1. 🐙 GitHub (Já Realizado ✅)

O repositório já foi criado e enviado para a sua conta do GitHub:
👉 **[https://github.com/dhiegoalbasantana-ship-it/solidere-lattafa](https://github.com/dhiegoalbasantana-ship-it/solidere-lattafa)**

Branch principal: `main`  
Todos os arquivos, imagens, tokens e scripts já estão commitados.

---

## 2. ⚡ Vercel (Deploy em 1 Clique)

Como o repositório já está no seu GitHub:

1. Acesse **[vercel.com/new](https://vercel.com/new)** (faça login com seu GitHub).
2. O repositório **`solidere-lattafa`** aparecerá no topo da lista.
3. Clique no botão azul **"Import"**.
4. Não precisa alterar nenhuma configuração (já criamos o `vercel.json` otimizado).
5. Clique em **"Deploy"**.
6. Em cerca de 20 segundos o site estará online com link oficial da Vercel (ex: `https://solidere-lattafa.vercel.app`).

---

## 3. 🌐 Subdomínio no Cloudflare para o Vercel

Para colocar o site no seu subdomínio (ex: `solidere.seudominio.com`):

### Passo A: Na Vercel
1. No painel do seu projeto na Vercel, vá em **Settings** > **Domains**.
2. No campo de texto, digite seu subdomínio (ex: `solidere.seudominio.com`) e clique em **Add**.
3. A Vercel vai indicar o apontamento CNAME: `cname.vercel-dns.com`.

### Passo B: No Cloudflare
1. Acesse o painel da **Cloudflare** (`dash.cloudflare.com`) e selecione o seu domínio.
2. No menu lateral, clique em **DNS** > **Records**.
3. Clique em **Add record**:
   - **Type:** `CNAME`
   - **Name:** `solidere` *(ou o nome do subdomínio que escolheu)*
   - **Target:** `cname.vercel-dns.com`
   - **Proxy status:** Deixe ativado (Nuvem laranja) ou apenas DNS.
4. Clique em **Save**.
5. ✅ Pronto! Em segundos o subdomínio estará funcionando com SSL (HTTPS) emitido automaticamente!

---

## 4. 🗄️ Supabase (Banco de Dados de Leads & Pedidos)

O site já conta com o cliente Supabase integrado em `assets/supabaseClient.js`.

Para ativar a tabela no seu projeto Supabase:
1. Acesse o painel do **[Supabase](https://supabase.com/dashboard)**.
2. Selecione o seu projeto (o mesmo usado anteriormente ou crie um novo).
3. No menu lateral esquerdo, clique no ícone **SQL Editor**.
4. Clique em **New query**.
5. Copie e cole todo o conteúdo do arquivo [`supabase/schema.sql`](./supabase/schema.sql) e clique em **Run**.
6. A tabela `leads_solidere` será criada com sucesso!
7. Todos os cliques em *"Fechar Pedido pelo WhatsApp"* e *"Orçamento Rápido"* gravarão o cliente, lista de perfumes e valor total no Supabase com código `#SOL-XXXXXX`.
