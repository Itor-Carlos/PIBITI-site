# Site de apresentação — PIBITI

Site estático de apresentação do projeto **Arquitetura de IA no COPIS/STI/UFS:
Microsserviços e Model Context Protocol (MCP)**.

Foi pensado para ser aberto a partir de um QR code durante a apresentação final do
PIBITI. Não depende de backend, banco ou variáveis de ambiente.

## Estrutura

```
site/
├── index.html              # página única com todas as seções
├── css/
│   └── style.css           # visual de caderno de anotações, numa camada só
├── js/
│   └── main.js             # menu, saudação, chat simulado e ampliação de imagens
├── assets/
│   ├── aria-avatar.png     # avatar do ARIA
│   └── editais-*.webp      # capturas reais do Buscador de Editais
├── vercel.json             # configuração opcional para Vercel
├── .nojekyll               # necessário para GitHub Pages
├── abrir-site.sh           # servidor local com abertura no navegador (WSL)
└── README.md
```

Todos os caminhos no HTML são relativos, então o site funciona tanto na raiz
quanto em subdiretórios.

## Seções

O texto é escrito em primeira pessoa, como uma conversa com quem chegou pelo
QR code. Os IDs das seções foram mantidos, então links antigos continuam
funcionando.

1. **Abertura** (`#topo`): apresentação, recado do ARIA e um bilhete com o sumário
2. **Em números**: os quatro números do ano
3. **O problema** (`#problema`): por que cada projeto de IA refazia a mesma integração
4. **MCP** (`#mcp`): a analogia da tomada, o diagrama e as três peças do protocolo
5. **MCP por dentro** (`#mcp-por-dentro`): host, cliente e servidor, o ciclo de uma
   chamada, as peças de cada lado, transportes e o que a segurança ainda exige
6. **ARIA** (`#aria`): o caminho de um pedido até o SIGAA e as 5 ferramentas MCP
7. **Teste você** (`#interface`): login e conversa simulados (dados fictícios)
8. **Buscador de Editais** (`#editais`): pipeline, capturas reais e a "conta" do experimento
9. **Aprendizados** (`#frentes`): ARIA, CHIP e Editais, próximo passo e o que faltava no CHIP
10. **Encerramento e rodapé**: carta de despedida, autoria, instituições e referências

## Rodar localmente

```bash
cd site
python3 -m http.server 8000
```

Abra `http://localhost:8000`.

### WSL + Windows

O site está no sistema de arquivos do WSL, então o navegador do Windows não abre
o caminho Linux diretamente. Use uma das opções:

**Opção recomendada — servidor com abertura automática:**

```bash
cd /home/itor_carlos/PIBITI/site
./abrir-site.sh
```

O script inicia o servidor e abre `http://localhost:8000` no navegador padrão do
Windows. Mantenha o terminal aberto enquanto apresentar. Para encerrar, use
`Ctrl+C`.

**Opção manual:**

```bash
cd /home/itor_carlos/PIBITI/site
python3 -m http.server 8000 --bind 0.0.0.0
```

Depois abra `http://localhost:8000` no Windows. Se `localhost` não funcionar,
use o IP do WSL (veja com `hostname -I`), por exemplo
`http://192.168.172.196:8000`.

**Abrir direto pelo Explorer (sem servidor):**

No Explorer do Windows, cole na barra de endereço:

```
\\wsl.localhost\Ubuntu-24.04\home\itor_carlos\PIBITI\site\index.html
```

Também é possível rodar `explorer.exe .` dentro da pasta `site` no WSL.

## Publicar

### Vercel

1. Importe o repositório na Vercel.
2. Em **Root Directory**, selecione `site`.
3. Framework preset: **Other**. Sem build command.
4. Faça o deploy e use a URL gerada no QR code.

### GitHub Pages

1. Envie a pasta `site` para um repositório (ou para a branch `gh-pages`).
2. Em **Settings → Pages**, publique a raiz da pasta.
3. O arquivo `.nojekyll` já está incluído.
4. Como todos os caminhos são relativos, o site funciona em subdiretórios.

### Outra hospedagem

Basta servir os arquivos estáticos. Não há dependência de servidor.

## Personalização rápida

- **Cores e fontes**: variáveis no início de `css/style.css` (`:root`).
- **Textos**: diretamente em `index.html`.
- **Respostas da demo do ARIA**: objetos `replies` (respostas com ferramenta e
  motivo) e `misses` (quando o ARIA não entende) em `js/main.js`.
- **Saudação do ARIA** ("Bom dia!", "Boa tarde!"...): calculada pela hora do
  visitante em `js/main.js`.
- **Métricas**: faixa "o ano em quatro números" e cupom da seção `#editais`.

## Observações para a apresentação

- O chatbot é uma **simulação local**. Nenhuma credencial é enviada e nenhum
  backend é chamado.
- O portal do Buscador de Editais é um **mockup visual** com dados ilustrativos.
- Para gerar o QR code, use a URL publicada em qualquer gerador (ex.: `qr.io`,
  `qrcode-monkey.com`) e inclua a imagem no slide ou no banner.
