# 📁 Pasta Public

Arquivos estáticos que serão copiados para a raiz do `dist/` durante o build.

## Favicon

O arquivo `favicon.svg` será automaticamente:
- Copiado para `dist/favicon.svg` durante o build
- Referenciado no `index.html` com o base path correto
- Funcionará tanto em desenvolvimento quanto em produção (GitHub Pages)

## Como Adicionar Outros Arquivos Estáticos

Para adicionar outros arquivos estáticos (imagens, manifest, robots.txt, etc.):
1. Coloque-os nesta pasta `public/`
2. Referencie-os no código com `/` (ex: `/imagem.png`)
3. O Vite ajustará automaticamente os paths durante o build

**Importante:** Arquivos em `public/` são copiados como estão, sem processamento.
