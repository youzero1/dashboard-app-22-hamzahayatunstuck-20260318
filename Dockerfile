FROM node:20-alpine

RUN apk add --no-cache python3 make g++ 

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

RUN mkdir -p data

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

VOLUME ["/app/data"]

CMD ["npm", "run", "start"]
