FROM node:alpine AS builder
RUN apk add --no-cache bash
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app
COPY . .

RUN yarn install:packages && yarn build

FROM node:16-alpine

#RUN apt-get update \
#    && apt-get install -y wget gnupg \
#    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#    && apt-get update \
#    && apt-get install -y libxss1 google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
#    && rm -rf /var/lib/apt/lists/*


#ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
#RUN chmod +x /usr/local/bin/dumb-init

WORKDIR /usr/src/app

#CMD ["google-chrome-unstable"]

RUN mkdir subscription-shop

COPY --from=builder /usr/src/app/subscription-shop/next.config.js ./subscription-shop
COPY --from=builder /usr/src/app/subscription-shop/public ./subscription-shop/public
COPY --from=builder /usr/src/app/subscription-shop/.next ./subscription-shop/.next
COPY --from=builder /usr/src/app/subscription-shop/node_modules ./subscription-shop/node_modules
COPY --from=builder /usr/src/app/subscription-shop/package.json ./subscription-shop/package.json
COPY --from=builder /usr/src/app/subscription-shop/.env ./subscription-shop/.env

RUN mkdir dailyos

COPY --from=builder /usr/src/app/dailyos/build ./dailyos/build

COPY --from=builder /usr/src/app/server ./server
COPY --from=builder /usr/src/app/template ./template

COPY --from=builder /usr/src/app/index.js ./index.js
COPY --from=builder /usr/src/app/main.js ./main.js
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/get_env.js ./get_env.js
COPY --from=builder /usr/src/app/.env ./.env

#RUN yarn add puppeteer

EXPOSE 4000
EXPOSE 3000

#ENTRYPOINT ["dumb-init", "--"]
CMD [ "yarn", "prod" ]