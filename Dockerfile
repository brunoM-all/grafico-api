FROM node:20-slim

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
RUN npm install --production

COPY src/ ./src/

EXPOSE 3000

CMD ["node", "src/app.js"]
