const Item = require("../models/Item");
const Notification = require("../models/Notification");
const User = require("../models/User");


// Helper: Extract keywords from text
const extractKeywords = (text) => {
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by'];
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word));
  return [...new Set(words)].slice(0, 10);
};

// Helper: Calculate match score
const calculateMatchScore = (item1, item2) => {
  let score = 0;

  // Category match (lost vs found)
  if (item1.category !== item2.category) {
    score += 30; // Bonus for opposite categories
  }

  // Item type match
  if (item1.itemType === item2.itemType) {
    score += 20;
  }

  // Location match
  if (item1.location === item2.location) {
    score += 15;
  }

  // Date proximity (within 7 days)
  const dateDiff = Math.abs(new Date(item1.date) - new Date(item2.date));
  const daysDiff = dateDiff / (1000 * 60 * 60 * 24);
  if (daysDiff <= 7) {
    score += 10 - Math.min(daysDiff, 10);
  }

  // Keyword matching
  const commonKeywords = item1.keywords.filter(k =>
    item2.keywords.includes(k)
  );
  score += commonKeywords.length * 5;

  // Color match
  if (item1.color && item2.color &&
    item1.color.toLowerCase() === item2.color.toLowerCase()) {
    score += 10;
  }

  // Brand match
  if (item1.brand && item2.brand &&
    item1.brand.toLowerCase() === item2.brand.toLowerCase()) {
    score += 10;
  }

  return Math.min(score, 100);
};

// Report new item with smart matching
exports.reportItem = async (req, res) => {
  try {
    const {
      title, description, category, itemType,
      location, exactLocation, date, contactInfo,
      color, brand
    } = req.body;

    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Extract keywords for smart matching
    const keywords = extractKeywords(`${title} ${description}`);

    // Handle image upload
    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Create new item
    const newItem = new Item({
      title,
      description,
      category,
      itemType,
      location,
      exactLocation,
      date,
      contactInfo,
      color: color || "",
      brand: brand || "",
      image: imageUrl,
      keywords,
      userId,
      userName: user.name,
      userEmail: user.email
    });

    await newItem.save();

    // Find potential matches
    const oppositeCategory = category === 'lost' ? 'found' : 'lost';
    const potentialMatches = await Item.find({
      category: oppositeCategory,
      status: 'pending',
      itemType: itemType
    });

    let matchesFound = [];

    for (const match of potentialMatches) {
      const score = calculateMatchScore(newItem, match);

      if (score >= 60) { // Threshold for match
        newItem.matchedItems.push({
          itemId: match._id,
          score: score,
          matchReason: `High similarity based on ${itemType} at ${location}`
        });

        match.matchedItems.push({
          itemId: newItem._id,
          score: score,
          matchReason: `High similarity based on ${itemType} at ${location}`
        });

        match.matchScore = Math.max(match.matchScore, score);
        match.status = score >= 80 ? 'matched' : 'pending';

        await match.save();

        // Create notification for match owner
        await Notification.create({
          userId: match.userId,
          type: 'match',
          title: 'Potential Match Found!',
          message: `Your ${match.category} item "${match.title}" might match a ${newItem.category} report`,
          data: {
            matchedItemId: newItem._id,
            matchScore: score,
            itemType: itemType
          },
          priority: score >= 80 ? 'high' : 'medium'
        });

        matchesFound.push({
          itemId: match._id,
          title: match.title,
          score: score
        });
      }
    }

    newItem.matchScore = matchesFound.length > 0 ?
      Math.max(...matchesFound.map(m => m.score)) : 0;

    if (matchesFound.length > 0 && newItem.matchScore >= 80) {
      newItem.status = 'matched';

      // Create notification for new item owner
      await Notification.create({
        userId: userId,
        type: 'match',
        title: 'Match Found Immediately!',
        message: `We found ${matchesFound.length} potential match(es) for your item`,
        data: {
          matches: matchesFound,
          matchScore: newItem.matchScore
        },
        priority: 'high'
      });
    }

    await newItem.save();

    res.status(201).json({
      success: true,
      message: "Item reported successfully",
      item: newItem,
      matchesFound: matchesFound.length,
      matchScore: newItem.matchScore
    });

  } catch (error) {
    console.error("Error reporting item:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get user's items
exports.getUserItems = async (req, res) => {
  try {
    const items = await Item.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get all items with filters
exports.getAllItems = async (req, res) => {
  try {
    const { category, itemType, location, status, search } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (itemType) filter.itemType = itemType;
    if (location) filter.location = location;
    if (status) filter.status = status;

    if (search) {
      filter.$text = { $search: search };
    }

    const items = await Item.find(filter)
      .sort({ matchScore: -1, createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('matchedItems.itemId', 'title category location date image');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    res.json({
      success: true,
      item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Claim an item
exports.claimItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.userId;

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    if (item.category !== 'found') {
      return res.status(400).json({
        success: false,
        message: "Only found items can be claimed"
      });
    }

    if (item.status !== 'pending' && item.status !== 'matched') {
      return res.status(400).json({
        success: false,
        message: "Item is not available for claim"
      });
    }

    item.claimedBy = userId;
    item.claimedAt = new Date();
    item.status = 'claimed';

    await item.save();

    // Notify item owner
    await Notification.create({
      userId: item.userId,
      type: 'claim',
      title: 'Item Claimed!',
      message: 'Someone has claimed your found item',
      data: {
        itemId: item._id,
        claimantId: userId
      },
      priority: 'high'
    });

    res.json({
      success: true,
      message: "Item claimed successfully",
      item
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Mark item as returned
exports.markAsReturned = async (req, res) => {
  try {
    const { itemId, handoverLocation } = req.body;
    const userId = req.userId;

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    // Check if user is owner or claimant
    if (item.userId.toString() !== userId.toString() &&
      (!item.claimedBy || item.claimedBy.toString() !== userId.toString())) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    item.status = 'returned';
    item.handoverLocation = handoverLocation;
    item.handoverDate = new Date();

    await item.save();

    // Update trust scores
    await User.findByIdAndUpdate(item.userId, {
      $inc: { trustScore: 10 }
    });

    if (item.claimedBy) {
      await User.findByIdAndUpdate(item.claimedBy, {
        $inc: { trustScore: 10 }
      });

      // Notify claimant
      await Notification.create({
        userId: item.claimedBy,
        type: 'status',
        title: 'Item Returned Successfully',
        message: `The item "${item.title}" has been marked as returned`,
        priority: 'medium'
      });
    }

    res.json({
      success: true,
      message: "Item marked as returned",
      item
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const userId = req.userId;

    const totalItems = await Item.countDocuments({ userId });
    const lostItems = await Item.countDocuments({ userId, category: 'lost' });
    const foundItems = await Item.countDocuments({ userId, category: 'found' });
    const returnedItems = await Item.countDocuments({
      userId,
      status: 'returned'
    });
    const matchedItems = await Item.countDocuments({
      userId,
      status: 'matched'
    });

    // Calculate recovery rate
    const recoveryRate = lostItems > 0 ?
      (returnedItems / lostItems * 100).toFixed(1) : 0;

    res.json({
      success: true,
      stats: {
        totalItems,
        lostItems,
        foundItems,
        returnedItems,
        matchedItems,
        recoveryRate
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};