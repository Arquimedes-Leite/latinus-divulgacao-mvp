# Hot Dog Latinus — Divulgação MVP

> Trabalho de portfólio da faculdade (Análise e Desenvolvimento de Sistemas - Projeto de Software — UDF, Brasília-DF).

MVP web para divulgar o **Hot Dog Latinus**, lanchonete do Condomínio Mansões Entrelagos (Itapoã, Brasília-DF). O objetivo é resolver a baixa visibilidade do comércio dentro do condomínio, com uma página pública para os moradores e um painel simples para o proprietário.

## Funcionalidades

**Página pública (moradores)**
* Endereço, horário de funcionamento e formas de pagamento.
* Atalhos para o iFood e o Instagram `@hotdoglatinus`.
* Promoções ativas, exibidas apenas dentro do período de validade.
* Galeria ilustrativa (SVG) e cardápio com preços.
* Mapa do Google Maps com a localização do estabelecimento.

**Clube Fidelidade**
* Criação de conta, login por e-mail ou validação de conta Google (`@gmail.com`).
* O cadastro começa com 0 compras. Ao registrar 10 compras, o cliente ganha 1 lanche grátis.

**Painel do proprietário**
* Login de acesso (usuário `dono.latinus`, senha com no mínimo 6 caracteres — apenas para demonstração).
* Cadastro de promoção com título, descrição e datas, com validação do período.
* Divulgação: texto pronto para WhatsApp, cópia do link e QR Code.

**Acessibilidade (ODS 8, meta 8.3)**
* Modo de Alto Contraste, com a preferência salva no navegador e respeito à configuração do sistema.
* Alvos de toque de no mínimo 44x44 px, foco visível e rótulos associados aos campos.
* Mensagens de erro em texto com ícone, nunca apenas por cor.

## Tecnologias
* **HTML5** — estrutura semântica.
* **CSS3** — variáveis CSS, layout responsivo e tema de alto contraste.
* **JavaScript** — regras de negócio e manipulação do DOM.
* **Node.js (`node:test`)** — testes automatizados com cobertura.
* **GitHub Actions** — integração contínua.

## Estrutura do projeto
```
index.html        Interface (página pública, conta do cliente e painel)
style.css         Identidade visual e modo de alto contraste
script.js         Regras de negócio e lógica da interface
script.test.js    Testes unitários e de integração
.github/workflows/ci.yml   Pipeline de CI
```

## Como executar
1. Baixe ou clone este repositório.
2. Abra o `index.html` em qualquer navegador moderno.

## Como rodar os testes
Requer Node.js 20 ou superior.

```bash
node --test --experimental-test-coverage
```

O mesmo comando roda automaticamente no GitHub Actions a cada `push` e `pull request` na branch `main`.

## Limitações conhecidas
Este é um protótipo de front-end. Contas, compras e promoções ficam apenas na memória do navegador e se perdem ao recarregar a página. A validação de conta Google verifica apenas o formato do e-mail, sem autenticação real (OAuth). O login do proprietário é de demonstração. Os preços e itens do cardápio são ilustrativos e devem ser conferidos com o proprietário.

## Autor
Arquimedes Leite de Assis Fonseca
