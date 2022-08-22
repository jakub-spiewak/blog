FROM node:latest as build
WORKDIR /app
COPY ./package.json /app/package.json

RUN yarn
COPY . .
RUN yarn build

FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
