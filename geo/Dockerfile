FROM node:18-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . ./

RUN yarn run build

CMD [ "node", "dist/main.js" ]
