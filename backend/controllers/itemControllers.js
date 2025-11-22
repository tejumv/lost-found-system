const Item = require("../models/Item");

exports.addItem = async (req, res) => {
  try {
    // Attach user ID
    req.body.postedBy = req.user._id;

    const item = new Item(req.body);
    await item.save();

    res.json({ message: "Item added successfully", item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = await Item.find().populate("postedBy claimedBy", "name email");
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
