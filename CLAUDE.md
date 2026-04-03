# Projeto: API de Geração de Gráficos

## Objetivo
API REST que gera imagens de gráficos de barras (PNG) com visual escuro e barras em tons de roxo/lavanda, similar ao dashboard de pontuações.

## Stack
- **Runtime:** Node.js 20
- **Framework:** Express
- **Gráficos:** chartjs-node-canvas + Chart.js
- **Container:** Docker + docker-compose
- **CI/Deploy:** GitHub (todo commit sobe automaticamente)

## Estrutura do projeto
```
grafico/
├── src/
│   ├── routes/
│   │   └── chart.js        # Rotas da API de gráfico
│   ├── services/
│   │   ├── chartService.js # Lógica de renderização
│   │   └── dataService.js  # Busca dados da API externa
│   └── app.js              # Setup do Express
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
└── CLAUDE.md
```

## Endpoints
- `POST /chart` — recebe JSON com dados, retorna PNG
- `GET /chart/live` — busca dados da API externa e retorna PNG
- `GET /health` — healthcheck

## Formato de entrada (POST /chart)
```json
{
  "title": "Pontuações",
  "subtitle": "02/04/2026 — Dia completo",
  "players": [
    { "name": "A2", "score": 407, "max": 407 },
    { "name": "A1", "score": 379, "max": 407 },
    { "name": "A5", "score": 379, "max": 407 },
    { "name": "A4", "score": 354, "max": 407 },
    { "name": "Facundo", "score": 352, "max": 407 }
  ]
}
```

## Visual do gráfico
- Fundo: `#1a1a2e` (escuro)
- Barras: gradiente de roxo escuro (`#5b5bd6`) para lavanda claro (`#c4b5fd`) baseado no percentual
- Labels acima das barras com score e percentual
- Eixos com grid sutil em cinza escuro

## API Externa
- Configurada via `EXTERNAL_API_URL` no `.env`
- Headers de autenticação via `EXTERNAL_API_KEY`

## Como rodar
```bash
# Desenvolvimento
npm install
npm run dev

# Docker
docker-compose up --build

# Gerar gráfico
curl -X POST http://localhost:3000/chart \
  -H "Content-Type: application/json" \
  -d '{"players":[...]}' \
  --output chart.png
```

## Git workflow
- Todo push vai para `main` no GitHub
- Commits devem ser descritivos em português
- Nunca commitar `.env` (apenas `.env.example`)
