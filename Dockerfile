FROM node:16
WORKDIR ./lutback
COPY package*.json ./lutback
COPY . .
RUN npm i nodemon --force
RUN npm install
EXPOSE 3000
CMD ["npm","run","dev"]
