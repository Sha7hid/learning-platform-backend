const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const categoryRoutes = require('./routes/categories');
const courseRoutes = require('./routes/courses');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/coursedb';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Course Service connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'course-service' });
});

app.use('/categories', categoryRoutes);
app.use('/courses', courseRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Course Service running on port ${PORT}`);
});


