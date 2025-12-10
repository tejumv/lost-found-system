const Message = require("../models/Message");
const Notification = require("../models/Notification");

// Send message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, itemId, message } = req.body;
        const senderId = req.userId;

        const newMessage = new Message({
            senderId,
            receiverId,
            itemId,
            message
        });

        await newMessage.save();

        // Create notification for receiver
        await Notification.create({
            userId: receiverId,
            type: 'message',
            title: 'New Message',
            message: `You have a new message regarding an item`,
            data: {
                messageId: newMessage._id,
                senderId: senderId,
                itemId: itemId
            }
        });

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get conversation
exports.getConversation = async (req, res) => {
    try {
        const { otherUserId, itemId } = req.query;
        const userId = req.userId;

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ],
            itemId: itemId || { $exists: true }
        })
            .populate('senderId', 'name email')
            .populate('receiverId', 'name email')
            .sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            { receiverId: userId, senderId: otherUserId, read: false },
            { read: true }
        );

        res.json({
            success: true,
            messages
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get all conversations
exports.getAllConversations = async (req, res) => {
    try {
        const userId = req.userId;

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ senderId: userId }, { receiverId: userId }]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", userId] },
                            "$receiverId",
                            "$senderId"
                        ]
                    },
                    lastMessage: { $first: "$message" },
                    lastMessageTime: { $first: "$createdAt" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$receiverId", userId] },
                                        { $eq: ["$read", false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    userId: "$_id",
                    userName: "$user.name",
                    userEmail: "$user.email",
                    lastMessage: 1,
                    lastMessageTime: 1,
                    unreadCount: 1
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            }
        ]);

        res.json({
            success: true,
            conversations
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};