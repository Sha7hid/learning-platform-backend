FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --only=production
COPY src ./src
ENV PORT=3001
EXPOSE 3001
CMD ["node", "src/index.js"]


