# FROM node:18-alpine

# WORKDIR /usr/src/app

# COPY package*.json ./
# RUN npm ci --only=production

# RUN npm install -g pm2

# RUN mkdir -p upload logs

# ENV NODE_ENV=production
# ENV PORT=5000

# EXPOSE 5000

# CMD ["node", "src/server.js"]


FROM node:18-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p upload logs

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]