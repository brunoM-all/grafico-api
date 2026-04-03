FROM node:20-slim AS base

# Dependências do sistema para o canvas (chartjs-node-canvas)
RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./

# Estágio dev: instala tudo (incluindo devDependencies) para hot-reload
FROM base AS dev
RUN npm install
COPY src/ ./src/
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Estágio produção: somente dependências de produção
FROM base AS production
RUN npm install --production
COPY src/ ./src/
EXPOSE 3000
CMD ["node", "src/app.js"]
