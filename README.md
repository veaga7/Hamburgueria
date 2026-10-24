# Burger House — site da hamburgueria

Site estático (HTML, CSS e JavaScript nativos, sem frameworks) com cardápio filtrável, pedido com quantidades e envio por WhatsApp.

## Como abrir

**No VS Code com Live Server**
1. Extraia o ZIP e abra a pasta no VS Code (`Arquivo > Abrir Pasta`).
2. Instale a extensão **Live Server** (Ritwick Dey), se ainda não tiver.
3. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

Também funciona abrindo `index.html` direto no navegador.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura e textos das seções |
| `style.css` | Visual, responsividade e animações |
| `script.js` | Configuração, produtos, filtros, pedido e menu |

## Personalização (tudo em `script.js`)

- **`CONFIG`** (topo do arquivo): WhatsApp, Instagram, e-mail, endereço, link do mapa e horários. Campos vazios não aparecem no site.
- **`PRODUCTS`**: nome, descrição, preço, categoria, selo e foto de cada item. Para adicionar um produto, copie uma linha e mude o `id` (único).
- **Fotos próprias**: coloque os arquivos em uma pasta `assets/` e use `image: "assets/nome.jpg"`. Imagens que não carregam mostram o quadro "Foto em breve".
- **Textos**: história, depoimentos e chamadas estão em `index.html`.
- **Cores**: variáveis no início de `style.css` (`--red`, `--flame`, `--ink`...).

## O que depende de configuração ou serviço externo

| Item | Situação |
|---|---|
| Envio do pedido | **Modo demonstração** até você preencher `CONFIG.whatsapp` (DDI + DDD + número, só dígitos). Com o número, o botão abre o WhatsApp com o resumo, e o cliente confirma o envio por lá. |
| Pagamento | Não existe. O site não processa pagamentos nem confirma pedidos. Para isso é preciso um backend ou serviço de pedidos/pagamento. |
| Taxa de entrega | Não calculada: aparece como "a combinar". |
| Fotos | Vêm do Unsplash (precisa de internet) e as fontes, do Google Fonts. Para uso comercial, troque por fotos próprias. |
| Endereço, Instagram, e-mail | Vazios por padrão. |

## Conteúdo de exemplo para revisar antes de publicar

- Horários de funcionamento e "entrega grátis na sua região" vieram do site anterior: confirme.
- Depoimentos estão marcados como exemplo na página: troque por avaliações reais e remova o aviso.
- Itens e preços adicionados nesta versão (`sample: true` em `script.js`): Combo Smash, Milkshake de Chocolate e Refrigerante lata.
- Itens sem foto (Combo Smash, Onion Rings, bebidas) mostram "Foto em breve" até você incluir imagens.
- Para compartilhamento em redes sociais, adicione uma meta `og:image` com uma imagem sua (URL absoluta).

## Pedido: como funciona

O pedido fica salvo no navegador do cliente (`localStorage`), com quantidades limitadas a 20 por item. O resumo enviado inclui itens, subtotal e o campo de endereço/observações.
