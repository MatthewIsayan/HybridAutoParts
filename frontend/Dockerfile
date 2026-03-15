FROM node:22-alpine AS build
WORKDIR /workspace/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
COPY shared ../shared
RUN npm run build

FROM nginx:1.27-alpine
ENV PORT=80
COPY frontend/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /workspace/frontend/dist /usr/share/nginx/html
COPY frontend/docker-entrypoint.d/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 80
