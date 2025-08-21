const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.PORT || 3000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const COURSE_SERVICE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3002';

const app = express();
app.use(cors());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

app.use(
  '/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => '/auth' + path, // ensure '/auth' prefix is preserved
  })
);

app.use(
  '/courses',
  createProxyMiddleware({
    target: COURSE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => '/courses' + path,
  })
);

app.use(
  '/categories',
  createProxyMiddleware({
    target: COURSE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => '/categories' + path,
  })
);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});


