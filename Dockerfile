FROM mhart/alpine-node:12.18.0
WORKDIR /usr/src/app
COPY package.json ./
RUN yarn
COPY . .
CMD ["yarn", "dev"]
