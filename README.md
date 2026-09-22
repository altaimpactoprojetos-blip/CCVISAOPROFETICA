# CC Visão Profética

Site da Comunidade Cristã Visão Profética, com páginas públicas, formulários e painel administrativo.

## Administração

O link **Administração**, no rodapé, abre `/admin`.

- Login próprio por e-mail e senha, independente do ChatGPT e do Google.
- Eventos: nome, descrição, data, horário, local, arte, vagas e abertura de inscrições.
- Publicação: salvar em rascunho ou publicar; desmarcar a publicação retira o conteúdo público.
- Inscrições e contatos: contagens, filtro por assunto e evento, busca, paginação e situação do atendimento.
- Galeria: álbuns por categoria e data, envio de até 20 fotos por lote e remoção de fotos do álbum.
- Programação e contato: editar horários, endereço, WhatsApp, e-mail e redes sociais.
- Troca de senha encerra as sessões abertas.

A primeira ativação ocorre em `/admin/ativar#token=TOKEN_PRIVADO`. O responsável recebe o link separadamente e define as próprias credenciais nessa tela. Não há senha padrão. O token não entra na URL enviada ao servidor; o fragmento é removido do navegador após a leitura. A criação é atômica e só funciona quando ainda não há administrador.

O painel de ativação não possui cadastro público. Para recuperar um acesso perdido, o proprietário deve solicitar suporte ao mantenedor; não há envio automático de e-mails de recuperação configurado.

### Variáveis de ambiente

Configure no ambiente de hospedagem, nunca no Git:

| Variável | Uso |
| --- | --- |
| `SUPABASE_URL` | URL do projeto Supabase `https://...supabase.co`. |
| `SUPABASE_SECRET_KEY` | Chave secreta do servidor, usada somente pelas rotas do Worker. Nunca publique no navegador ou no Git. |
| `SUPABASE_STORAGE_BUCKET` | Nome opcional do bucket privado de imagens; o padrão é `cc-visao-profetica-media`. |
| `ADMIN_SETUP_TOKEN_HASH` | SHA-256 hexadecimal de um token aleatório de 32 bytes, entregue em hexadecimal ao proprietário. |
| `ADMIN_SETUP_EXPIRES_AT` | Prazo da ativação em milissegundos Unix. |

Depois de ativado, o token deixa de servir para criar outra conta. As variáveis podem ser removidas. Um novo link só deve ser emitido pelo mantenedor após verificar a identidade do proprietário.

Senhas usam scrypt (`N=16384`, `r=8`, `p=5`) com salt individual. Apenas hashes são armazenados. Sessões duram até oito horas e usam cookies `HttpOnly`, `Secure`, `SameSite=Strict`; o banco guarda apenas o hash do token de sessão. Todos os endpoints privados validam sessão no servidor, e as gravações verificam a origem. O login limita tentativas por conta e origem de rede.

O perfil scrypt segue a alternativa de 16 MiB da [orientação OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#scrypt) e foi testado no runtime Workers usado pelo projeto.

## Eventos e inscrições

`/eventos` lista somente eventos publicados. `/eventos/[id]` exibe os detalhes e o formulário quando houver inscrições abertas e vagas. A reserva da vaga e a gravação ocorrem em uma única instrução SQL para evitar excesso de inscrições simultâneas. O mesmo e-mail não pode manter duas inscrições ativas no mesmo evento. Cancelar libera a vaga; reativar exige disponibilidade.

Os formulários anteriores continuam na tabela `submissions`. Inscrições antigas sem vínculo explícito com evento ficam disponíveis pelos filtros de assunto e busca; o projeto não inventa vínculos retroativos. A reserva de vagas usa uma função transacional do Postgres para manter a mesma proteção contra concorrência.

## Fotos

Use JPG, PNG ou WebP de até 8 MB. A arte do evento pode ter 1600 × 900 px. Os bytes são armazenados no bucket privado do Supabase Storage e os metadados no Postgres. A assinatura do arquivo é validada; SVG não é aceito em uploads. Fotos e capas de rascunhos só podem ser visualizadas por administradores. Retirar a publicação também impede novos acessos públicos ao arquivo. Remover uma foto do álbum retira sua referência; o objeto original não é apagado automaticamente do armazenamento.

## Arquitetura e armazenamento

- React, Vinext e Vite, com Worker em `worker/index.ts`.
- Banco Supabase Postgres, acessado somente no servidor com `@supabase/supabase-js`.
- Imagens Supabase Storage em bucket privado.
- Esquema legado em `db/schema.ts` e `drizzle/` preservado para auditoria; migrações atuais em `supabase/migrations/`.
- Publicação pelo Cloudflare Workers Builds a partir da branch `main`; `.openai/hosting.json` é o manifesto da hospedagem anterior.
- APIs administrativas em `app/api/admin/`; controles públicos em `app/api/submissions/` e `app/api/media/`.

O login da Área do Aluno permanece o existente; o login próprio desta versão se aplica à administração. A conexão com Supabase é feita no servidor; nenhuma chave secreta é embutida no navegador.

O endereço atual e a estrutura visual do site continuam no mesmo projeto e domínio enquanto a camada de dados é validada. O Supabase não substitui automaticamente a hospedagem do Worker; trocar também a hospedagem exigiria uma etapa separada. O repositório guarda o código, imagens estáticas e migrações. Inscrições reais, credenciais e fotos enviadas pelo painel ficam no Supabase e exigem backup de dados separado.

## Publicação no Cloudflare Workers

O site é compilado como um Worker do Cloudflare (`dist/server/`) com os arquivos estáticos em `dist/client/`. A publicação é feita pelo **Workers Builds**, a integração do Cloudflare com o GitHub: a cada push na branch `main`, o Cloudflare clona o repositório, roda `npm run build` e `npx wrangler deploy`, e publica o Worker `cc-visao-profetica`.

Acompanhe as builds em [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers e Pages** → `cc-visao-profetica` → **Implantações**. O botão **Retry build** refaz a última publicação.

### Variáveis do Worker

Cadastre em **Workers e Pages** → `cc-visao-profetica` → **Configurações** → **Variáveis e segredos**, sempre como **Segredo**:

| Segredo | Valor |
| --- | --- |
| `SUPABASE_URL` | URL do projeto Supabase. |
| `SUPABASE_SECRET_KEY` | Chave secreta do servidor (Project Settings → API Keys → Secret keys). |
| `SUPABASE_STORAGE_BUCKET` | Opcional. Padrão `cc-visao-profetica-media`. |
| `ADMIN_SETUP_TOKEN_HASH` | Opcional. Só na primeira ativação do administrador. |
| `ADMIN_SETUP_EXPIRES_AT` | Opcional. Só na primeira ativação do administrador. |

Sem `SUPABASE_URL` e `SUPABASE_SECRET_KEY` o site abre, mas eventos, galeria e painel aparecem como indisponíveis.

### Domínio próprio

No Worker, abra **Domínios** (ou **Configurações → Domínios e rotas**) → **Adicionar** → **Domínio personalizado** e informe o domínio. Se o DNS do domínio ainda não estiver no Cloudflare, adicione o site em **Websites** e troque os nameservers no registrador.

### Alternativa: Vercel

O código também roda na Vercel sem alterações: o arquivo `vercel.json` define `next build` como comando de build. Em [vercel.com/new](https://vercel.com/new), importe o repositório do GitHub, cadastre as variáveis `SUPABASE_URL` e `SUPABASE_SECRET_KEY` em **Environment Variables** e clique em **Deploy**. Para o domínio, em **Settings → Domains** adicione `ccvisaoprofetica.online` e siga o registro DNS que a Vercel indicar.

### Publicação manual

Com o Wrangler autenticado (`npx wrangler login`), o mesmo deploy pode ser feito localmente:

```bash
npm run deploy
```

## Desenvolvimento e validação

Use Node.js 22.13 ou superior e o lockfile existente.

```bash
npm run install:ci
npm run build
npm test
```

Os testes de integração locais históricos usam D1 e R2 isolados via Miniflare, sem consultar ou modificar dados reais. A migração do código usa as mesmas regras e deve ser validada com um projeto Supabase de teste antes de remover o ambiente antigo.

Para conferir apenas o código TypeScript:

```bash
npx tsc --noEmit --incremental false
```

Para alterar o esquema:

```bash
npm run db:generate
```

Inspecione a nova migração antes da publicação. Não altere migrações já aplicadas. O projeto Supabase já contém a migração do esquema e dos dados existentes; novas alterações devem ser adicionadas como migrações incrementais. Alterar o Git não atualiza automaticamente o endereço hospedado no Sites.
