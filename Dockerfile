FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npx expo export --platform web
EXPOSE 8081
CMD ["npx", "serve", "-s", "dist", "-l", "8081"]
