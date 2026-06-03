FROM node:22-slim

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build
CMD ["sh", "-c", "node -e \"const fs=require('fs');const value=process.env.VITE_API_BASE_URL||'';fs.writeFileSync('/app/dist/env.js','window.__APP_CONFIG__ = '+JSON.stringify({VITE_API_BASE_URL:value})+';\\n');\" && npm run start"]
