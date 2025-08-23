FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# DEV
FROM base AS dev
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# PROD
FROM base AS prod
ENV NODE_ENV=production
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]
