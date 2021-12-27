const express = require('express');
const Task = require('./../models/Task');
const auth = require('./../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  const queryObj = {};
  try {
    if (req.query.completed) {
      queryObj.completed = req.query.completed === 'true' ? true : false;
    }

    // /tasks?sortBy=createdAt:desc

    let result = Task.find({ ...queryObj, owner: req.user._id });

    if (req.query.sort) {
      const parts = req.query.sort.split(':');
      if (parts[1] === 'desc') result.sort({ [parts[1]]: -1 });
      else if (parts[1] === 'asc') result.sort({ [parts[1]]: 1 });
    }

    const limit = Number(req.query.limit) || 10;
    const skip = Number(req.query.skip) || 0;

    result = result.limit(limit).skip(skip);

    const tasks = await result;

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).json();
    res.status(200).json(task);
    if (!task) return res.status(404).json();
  } catch (error) {
    res.status(500).json(error);
  }
});

router.patch('/:id', auth, async (req, res) => {
  const keysUpdate = Object.keys(req.body);
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) return res.status(404).json();

    keysUpdate.forEach((field) => (task[field] = req.body[field]));
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).json();
    res.status(204).json();
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
