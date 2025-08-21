FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --only=production
COPY src ./src
ENV PORT=3002
EXPOSE 3002
CMD ["node", "src/index.js"]


