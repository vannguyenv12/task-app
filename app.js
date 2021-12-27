require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

// ROUTER
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');
const authRouter = require('./routes/auth');

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/users', authRouter);

// Not found routes
const notFound = require('./middleware/not-found');

app.use(notFound);

module.exports = app;
