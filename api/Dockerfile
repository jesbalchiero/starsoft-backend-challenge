FROM node:18-alpine AS development

WORKDIR /app

RUN apk add --no-cache curl netcat-openbsd

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x entrypoint.sh

RUN npm run build || echo "Aviso: Compilação falhou, mas continuaremos usando o modo de desenvolvimento"

EXPOSE 3000

CMD ["./entrypoint.sh"]