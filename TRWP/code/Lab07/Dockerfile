FROM node:latest

MAINTAINER Bigadabman/tdwa07-01

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
