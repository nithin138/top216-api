const Submission = require('../models/submission');
const { autoAssignAndEnforce, CATEGORIES } = require('../utils/autoSort');

// Create submission -> auto-sort -> return record
exports.create = async (req, res) => {
  try {
    const { title, description, author, category } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: "title and author required" });
    }

    // ✅ Check category count cap (20 max)
    if (category) {
      const count = await Submission.countDocuments({ category });
      if (count >= 20) {
        return res
          .status(400)
          .json({ error: `Category "${category}" already has 20 submissions.` });
      }
    }

    const sub = new Submission({ title, description, author, category });
    await sub.save();

    // run auto-sort/update logic
    const updated = await autoAssignAndEnforce(sub);

    return res.status(201).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
};


// List submissions (optional filters)
exports.list = async (req, res) => {
  try {
    const { assignedCategory, miniFinal } = req.query;
    const q = {};

    if (assignedCategory) q.assignedCategory = assignedCategory;
    if (typeof miniFinal !== 'undefined') {
      q.miniFinal = miniFinal === 'true';
    }

    const items = await Submission.find(q)
      .sort({ createdAt: -1 })
      .limit(500);

    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
};

// Placeholder: pick 1 winner + 4 runners-up from a category (only when miniFinal true)
exports.pickWinners = async (req, res) => {
  try {
    const { category } = req.params;

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'invalid category' });
    }

    const pool = await Submission.find({ assignedCategory: category });
    if (pool.length === 0) {
      return res.status(404).json({ error: 'no submissions' });
    }

    // Shuffle and pick
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const winner = shuffled[0];
    const runners = shuffled.slice(1, 5);

    // Reset statuses in that category then set new ones
    await Submission.updateMany(
      { assignedCategory: category },
      { $set: { status: 'submitted' } }
    );

    await Submission.findByIdAndUpdate(winner._id, { $set: { status: 'winner' } });
    await Promise.all(
      runners.map(r =>
        Submission.findByIdAndUpdate(r._id, { $set: { status: 'runnerup' } })
      )
    );

    return res.json({
      winner: winner._id,
      runners: runners.map(r => r._id),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
};
// Get a single submission by ID
exports.get = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await Submission.findById(id);

    if (!sub) {
      return res.status(404).json({ error: 'submission not found' });
    }

    return res.json(sub);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
};
// Get all submissions (no filters, no limits)
exports.getAll = async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    return res.json(submissions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
};
exports.getStats = async (req, res) => {
  try {
    // total submissions
    const totalEntries = await Submission.countDocuments();

    // categories where miniFinal = true (distinct categories)
    const miniFinalCategories = await Submission.distinct("assignedCategory", { miniFinal: true });
    const miniFinalCount = miniFinalCategories.length;

    // remaining categories = total categories - miniFinal categories
    const remaining = CATEGORIES.length - miniFinalCount;

    return res.json({
      totalEntries,
      miniFinalCategories: miniFinalCount,
      remaining
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
};