# Install dependencies only when needed
FROM node:alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
# Rebuild the source code only when needed
FROM node:alpine AS builder
WORKDIR /usr/src/app
COPY . .
COPY --from=deps /usr/src/app/node_modules ./node_modules
RUN yarn build && yarn install --production --ignore-scripts --prefer-offline
# Production image, copy all the files and run next
FROM node:alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV production
COPY ./script.sh .
COPY .env .
# Add bash
RUN apk add --no-cache bash
# Make our shell script executable
RUN chmod +x script.sh
# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /usr/src/app/next.config.js ./
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
EXPOSE 80
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1
CMD ["/bin/bash", "-c", "/usr/src/app/script.sh && yarn start"]