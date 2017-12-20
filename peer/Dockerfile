FROM node:carbon

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "./peer/index.js" ]

EXPOSE 8080