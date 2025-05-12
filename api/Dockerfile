# Builder
FROM node:18-alpine AS development

WORKDIR /app

RUN apk add --no-cache curl netcat-openbsd

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x entrypoint.sh

RUN npm run build

# Production
FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

RUN apk add --no-cache curl netcat-openbsd

COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/dist ./dist
COPY --from=development /app/entrypoint.sh ./entrypoint.sh
COPY package*.json ./

RUN chmod +x entrypoint.sh

EXPOSE 3000

CMD ["./entrypoint.sh"]