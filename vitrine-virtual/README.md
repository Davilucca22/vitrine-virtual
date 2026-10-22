# Vitrine Virtual

Aplicação web para lojistas criarem e administrarem uma vitrine de produtos, e para clientes consultarem o catálogo e montarem pedidos para enviar pelo WhatsApp.

## Funcionalidades

- Cadastro de loja com nome, email, senha, WhatsApp e foto opcional.
- Login e sessão de usuário no navegador.
- Catálogo administrativo para cadastrar, visualizar, editar e excluir produtos.
- Gerenciamento dos dados da loja e das credenciais da conta.
- Configuração para exibir ou ocultar os preços na vitrine pública.
- Vitrine pública com identidade da loja, filtro por categoria e catálogo responsivo.
- Carrinho de compras com ajuste de quantidades, cálculo do total e envio do pedido pelo WhatsApp.
- Layout adaptado para dispositivos móveis e telas maiores.

## Tecnologias

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 4
- React Icons
- ESLint

## Pré-requisitos

- Node.js e npm instalados.
- A API de backend da Vitrine Virtual disponível.

## Configuração e execução

1. Entre na pasta do aplicativo:

   ```bash
   cd vitrine-virtual
   ```

2. Instale as dependências:

   ```bash
   npm ci
   ```

3. Crie o arquivo `.env` com base no exemplo:

   ```bash
   cp .env.example .env
   ```

4. Configure `VITE_URL_SITE` no `.env` com a URL base da API. Por exemplo:

   ```env
   VITE_URL_SITE=http://localhost:3000
   ```

5. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

O endereço local é informado pelo Vite no terminal. A variável `VITE_URL_SITE` deve conter somente a URL base, sem acrescentar os caminhos dos endpoints.

## Comandos disponíveis

Execute os comandos dentro da pasta `vitrine-virtual`:

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento com atualização automática. |
| `npm run build` | Gera a versão de produção em `dist/`. |
| `npm run preview` | Serve localmente a versão gerada pelo build. |
| `npm run lint` | Executa o ESLint nos arquivos do projeto. |

## Rotas

| Rota | Acesso | Descrição |
| --- | --- | --- |
| `/login` | Visitante | Autenticação da conta da loja. |
| `/registro` | Visitante | Cadastro de uma nova loja. |
| `/register` | Visitante | Redireciona para `/registro`. |
| `/home` | Requer autenticação | Catálogo administrativo de produtos. |
| `/home/profile` | Requer autenticação | Visão geral dos dados da loja. |
| `/home/profile/account` | Requer autenticação | Edição dos dados da loja, do contato e da visibilidade dos preços. |
| `/home/profile/login` | Requer autenticação | Atualização do email e da senha. |
| `/vitrine?id_loja=<id>` | Pública | Vitrine pública da loja identificada por `id_loja`. |

Na área `/home`, a navegação inferior permite adicionar produtos e acessar o perfil. No catálogo, os lojistas podem editar ou excluir produtos; em telas pequenas, os detalhes e essas ações ficam disponíveis em uma janela modal.

Na rota `/vitrine`, o cliente pode filtrar por categoria e adicionar produtos ao carrinho. O pedido é composto no WhatsApp da loja. É necessário informar o identificador da loja na URL, por exemplo:

```text
/vitrine?id_loja=123
```

## Integração com a API

A aplicação usa `VITE_URL_SITE` como URL base do backend. Os módulos de integração estão em `src/APIs/`.

| Método | Caminho | Uso |
| --- | --- | --- |
| `POST` | `/login` | Autenticar uma loja. |
| `POST` | `/register` | Criar uma conta de loja. |
| `POST` | `/logout` | Encerrar a sessão no backend. |
| `GET` | `/produto?id_loja=<id>` | Listar produtos da conta autenticada. |
| `POST` | `/produto` | Cadastrar um produto. |
| `PUT` | `/produto` | Atualizar um produto. |
| `DELETE` | `/produto?id_produto=<id>` | Excluir um produto. |
| `PUT` | `/user/data` | Atualizar dados e foto da loja. |
| `PUT` | `/user/login` | Atualizar email ou senha. |
| `GET` | `/vitrine?id_loja=<id>` | Obter dados públicos da loja e seus produtos. |

As operações da área administrativa enviam credenciais de sessão. O backend deve aceitar as requisições do frontend com cookies; para desenvolvimento em origens diferentes, configure CORS e cookies de acordo com os domínios usados. A rota pública `/vitrine` não envia credenciais.

Os campos dos produtos são normalizados no frontend para `id`, `name`, `description`, `category`, `price` e `image`. A API também recebe imagens e dados de produtos em `FormData`.

O formulário `PUT /user/data` envia o campo booleano `ver_precos` junto aos dados da loja. A resposta de `GET /vitrine` inclui esse campo para controlar a exibição dos preços nos cards, no carrinho e no resumo do pedido pelo WhatsApp.

## Estrutura do projeto

```text
src/
├── APIs/          # Chamadas ao backend: autenticação, usuário e produtos
├── components/    # Provedor e guardas de autenticação, navegação e perfil
├── config/        # Inicialização da aplicação, estilos e configuração das rotas
├── constants/     # Constantes compartilhadas
├── hooks/         # Hooks reutilizáveis
└── pages/         # Telas de autenticação, administração e vitrine pública
```

- `src/pages/home.jsx`: catálogo administrativo, formulários de produto e rotas de perfil.
- `src/pages/vitrine.jsx`: catálogo público, filtro de categorias e carrinho.
- `src/config/router.jsx`: definição das rotas públicas e privadas.
- `src/components/auth-provider.jsx`: estado de autenticação da aplicação.

## Implantação

Gere os arquivos de produção com `npm run build`; o conteúdo publicado fica na pasta `dist/`. O arquivo `vercel.json` configura o fallback das rotas do frontend para `index.html`, necessário para o roteamento da aplicação de página única.
