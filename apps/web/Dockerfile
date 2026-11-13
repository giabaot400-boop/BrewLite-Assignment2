FROM node:24-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN npm ci

COPY apps/web ./apps/web

ARG NEXT_PUBLIC_PRODUCTS_SOURCE=api
ARG NEXT_PUBLIC_AUTH_SOURCE=http


ENV NEXT_PUBLIC_PRODUCTS_SOURCE=${NEXT_PUBLIC_PRODUCTS_SOURCE}
ENV NEXT_PUBLIC_AUTH_SOURCE=${NEXT_PUBLIC_AUTH_SOURCE}

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --workspace apps/web

ENV NODE_ENV=production
ENV TZ=UTC
ENV PORT=3000

EXPOSE 3000

USER node

CMD ["npm", "run", "start", "--workspace", "apps/web"]