FROM node:12.18.0-alpine
WORKDIR /usr/src/app
COPY package.json ./
RUN yarn
COPY . .
CMD ["yarn", "dev"]
