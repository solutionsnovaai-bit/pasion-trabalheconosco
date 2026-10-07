# Pasion Salud Home Care: página Trabalhe Conosco

Página única de candidatura. A pessoa preenche a ficha, toca em enviar e o WhatsApp
abre com a mensagem pronta. Não tem servidor, banco de dados nem etapa de build:
é HTML, CSS e JavaScript puro.

## Arquivos

```
index.html        a página e as perguntas da ficha
css/styles.css    visual (as cores e fontes ficam nas variáveis do topo)
js/config.js      número do WhatsApp e texto de abertura da mensagem
js/app.js         validação, montagem da mensagem e envio
assets/           logo, símbolo, favicon e imagem de compartilhamento
```

## Publicar no GitHub Pages

1. Crie um repositório e suba todos os arquivos desta pasta na raiz dele.
2. No repositório, abra Settings > Pages.
3. Em "Build and deployment", escolha "Deploy from a branch", branch `main`, pasta `/ (root)` e salve.
4. Em um ou dois minutos a página fica em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

## Trocar o número do WhatsApp

Abra `js/config.js` e mude `whatsapp` (55 + DDD + número, só os dígitos).
O número escrito na página é atualizado sozinho. O `index.html` também traz o número
escrito como reserva para quem abre sem JavaScript; vale trocar lá também (busque por `wa.me`).

## Mudar as perguntas

As perguntas ficam no `index.html`, dentro de `<form id="ficha">`. Cada bloco com
`data-field` vira uma linha da mensagem:

- `data-rotulo`: nome da linha na mensagem (ex.: "Nome").
- `data-falta`: como o campo aparece no aviso "Falta ...". Sem esse atributo o campo é opcional.
- `data-kind`: `text`, `phone`, `choice` (opções de tocar) ou `note` (texto livre).

Para adicionar uma opção, copie uma linha `<label class="opt">` e troque o `id`, o `value` e o texto.
Para adicionar uma pergunta, copie um bloco inteiro e troque `data-field`, `id` e `name` por um nome novo.
O contador "x de y preenchidos" se ajusta sozinho.

## Prévia do link no WhatsApp e nas redes

A imagem da prévia é `assets/og.jpg`. Alguns aplicativos só mostram a prévia se o endereço
da imagem estiver completo. Depois de publicar, troque no `index.html` o conteúdo de
`og:image` e `og:url` pelo endereço final, por exemplo
`https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/assets/og.jpg`.
