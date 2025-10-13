FROM node:24.5.0-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY .eslintrc* .prettier* ./
COPY eslint.config.js ./
COPY tsconfig*.json ./

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]