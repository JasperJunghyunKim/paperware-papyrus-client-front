FROM node:16.13.2-alpine as builder

WORKDIR /a

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:16.13.2-alpine
WORKDIR /a

COPY --from=builder /a/package.json .
COPY --from=builder /a/yarn.lock .
COPY --from=builder /a/next.config.js ./
COPY --from=builder /a/public ./public
COPY --from=builder /a/node_modules ./node_modules
COPY --from=builder /a/.next/ ./.next

EXPOSE 80

CMD ["yarn", "start"]