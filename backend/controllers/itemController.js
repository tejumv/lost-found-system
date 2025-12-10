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
    console.log("=== REPORT ITEM START ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file ? "Image uploaded" : "No image");
    console.log("User ID from token:", req.userId);

    const {
      title, description, category, itemType,
      location, exactLocation, date, contactInfo,
      color, brand
    } = req.body;

    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("User found:", user.name, user.email);

    // Extract keywords for smart matching
    const keywords = extractKeywords(`${title} ${description}`);
    console.log("Extracted keywords:", keywords);

    // Handle image upload
    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      console.log("Image saved at:", imageUrl);
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
    console.log("Item saved successfully. ID:", newItem._id);

    // Find potential matches
    const oppositeCategory = category === 'lost' ? 'found' : 'lost';
    const potentialMatches = await Item.find({
      category: oppositeCategory,
      status: 'pending',
      itemType: itemType,
      userId: { $ne: userId } // Don't match with user's own items
    });

    console.log(`Found ${potentialMatches.length} potential matches`);

    let matchesFound = [];

    for (const match of potentialMatches) {
      const score = calculateMatchScore(newItem, match);
      console.log(`Match score with ${match.title}: ${score}`);

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

    console.log("=== REPORT ITEM COMPLETE ===");
    console.log("Matches found:", matchesFound.length);

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
      message: "Server error: " + error.message
    });
  }
};

// Get user's items
exports.getUserItems = async (req, res) => {
  try {
    console.log("Getting items for user:", req.userId);

    const items = await Item.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    console.log(`Found ${items.length} items for user`);

    res.json({
      success: true,
      items
    });
  } catch (error) {
    console.error("Error getting user items:", error);
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
    console.log("Get all items with filters:", { category, itemType, location, status, search });

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

    console.log(`Found ${items.length} items total`);

    res.json({
      success: true,
      items
    });
  } catch (error) {
    console.error("Error getting all items:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get item by ID
exports.getItemById = async (req, res) => {
  try {
    console.log("Getting item by ID:", req.params.id);

    const item = await Item.findById(req.params.id)
      .populate('matchedItems.itemId', 'title category location date image');

    if (!item) {
      console.log("Item not found");
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    console.log("Item found:", item.title);

    res.json({
      success: true,
      item
    });
  } catch (error) {
    console.error("Error getting item by ID:", error);
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

    console.log("Claim item:", { itemId, userId });

    const item = await Item.findById(itemId);

    if (!item) {
      console.log("Item not found for claim");
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    if (item.category !== 'found') {
      console.log("Cannot claim lost item");
      return res.status(400).json({
        success: false,
        message: "Only found items can be claimed"
      });
    }

    if (item.status !== 'pending' && item.status !== 'matched') {
      console.log("Item not available for claim, status:", item.status);
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

    console.log("Item claimed successfully");

    res.json({
      success: true,
      message: "Item claimed successfully",
      item
    });

  } catch (error) {
    console.error("Error claiming item:", error);
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

    console.log("Mark as returned:", { itemId, userId, handoverLocation });

    const item = await Item.findById(itemId);

    if (!item) {
      console.log("Item not found for return");
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    // Check if user is owner or claimant
    if (item.userId.toString() !== userId.toString() &&
      (!item.claimedBy || item.claimedBy.toString() !== userId.toString())) {
      console.log("User not authorized to mark as returned");
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

    console.log("Item marked as returned");

    res.json({
      success: true,
      message: "Item marked as returned",
      item
    });

  } catch (error) {
    console.error("Error marking item as returned:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get statistics - FIXED VERSION
exports.getStats = async (req, res) => {
  try {
    const userId = req.userId;

    console.log("=== GET STATS START ===");
    console.log("User ID:", userId);

    // Count all items for this user
    const totalItems = await Item.countDocuments({ userId: userId }) || 0;
    const lostItems = await Item.countDocuments({
      userId: userId,
      category: 'lost'
    }) || 0;
    const foundItems = await Item.countDocuments({
      userId: userId,
      category: 'found'
    }) || 0;
    const returnedItems = await Item.countDocuments({
      userId: userId,
      status: 'returned'
    }) || 0;
    const matchedItems = await Item.countDocuments({
      userId: userId,
      status: 'matched'
    }) || 0;

    // Calculate recovery rate
    let recoveryRate = 0;
    if (lostItems > 0) {
      recoveryRate = parseFloat(((returnedItems / lostItems) * 100).toFixed(1));
    }

    console.log("Stats calculated:", {
      totalItems,
      lostItems,
      foundItems,
      returnedItems,
      matchedItems,
      recoveryRate
    });

    // Debug: Show all items for this user
    const allUserItems = await Item.find({ userId: userId });
    console.log(`Total user items in DB: ${allUserItems.length}`);
    allUserItems.forEach(item => {
      console.log(`- ${item.title} (${item.category}, ${item.status})`);
    });

    console.log("=== GET STATS COMPLETE ===");

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
    console.error("Error in getStats:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};

// Debug: Get all items in database
exports.debugAllItems = async (req, res) => {
  try {
    const items = await Item.find({});

    console.log("=== DEBUG ALL ITEMS ===");
    console.log(`Total items in database: ${items.length}`);

    items.forEach(item => {
      console.log(`- ID: ${item._id}`);
      console.log(`  Title: ${item.title}`);
      console.log(`  Category: ${item.category}`);
      console.log(`  User ID: ${item.userId}`);
      console.log(`  User Name: ${item.userName}`);
      console.log(`  Created: ${item.createdAt}`);
      console.log(`---`);
    });

    res.json({
      success: true,
      count: items.length,
      items: items.map(item => ({
        id: item._id,
        title: item.title,
        category: item.category,
        status: item.status,
        userId: item.userId,
        userName: item.userName,
        userEmail: item.userEmail,
        createdAt: item.createdAt
      }))
    });

  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};