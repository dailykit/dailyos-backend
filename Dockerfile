FROM node:14.2.0-alpine
WORKDIR /usr/src/app
COPY package.json ./
RUN yarn
COPY . .
CMD ["yarn", "dev"]
