FROM node:22.7.0

WORKDIR /app

COPY build /app/build

EXPOSE 3000

ENV NODE_ENV=production

RUN npm install serve

ENTRYPOINT ["npx", "serve", "build", "-p", "3000", "--no-request-logging", "--no-port-switching", "--no-compression"]
