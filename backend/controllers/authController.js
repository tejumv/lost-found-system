const User = require("../models/User");
const jwt = require("jsonwebtoken");

// REGISTER USER - FIXED TO SAVE ALL FIELDS
exports.registerUser = async (req, res) => {
  try {
    console.log("Registration request received:", req.body);

    const {
      name, email, password, phone,
      semester, branch, year, enrollment
    } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Generate enrollment if not provided
    const userEnrollment = enrollment || `ENR${Date.now().toString().slice(-6)}`;

    // Create new user with ALL fields
    const newUser = new User({
      name,
      email,
      password,
      phone: phone || "",
      semester: semester || "",
      branch: branch || "",
      year: year || "",
      enrollment: userEnrollment,
      isVerified: false,
      trustScore: 100,
      preferences: {
        notifications: true,
        emailAlerts: true,
        smsAlerts: false
      }
    });

    await newUser.save();

    console.log("User created successfully with ID:", newUser._id);
    console.log("User data saved:", {
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      semester: newUser.semester,
      branch: newUser.branch,
      year: newUser.year,
      enrollment: newUser.enrollment
    });

    // JWT Payload
    const payload = {
      userId: newUser._id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "your_jwt_secret", {
      expiresIn: "7d"
    });

    // Return ALL user data
    res.json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        semester: newUser.semester,
        branch: newUser.branch,
        year: newUser.year,
        enrollment: newUser.enrollment,
        trustScore: newUser.trustScore
      }
    });

  } catch (error) {
    console.error("Registration error details:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration: " + error.message
    });
  }
};

// LOGIN USER - FIXED TO RETURN ALL FIELDS
exports.loginUser = async (req, res) => {
  try {
    console.log("Login attempt for:", req.body.email);

    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    // Compare password (bcrypt)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    console.log("Login successful for:", user.name);
    console.log("User data retrieved:", {
      name: user.name,
      email: user.email,
      phone: user.phone,
      semester: user.semester,
      branch: user.branch,
      year: user.year,
      enrollment: user.enrollment
    });

    // JWT
    const payload = {
      userId: user._id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "your_jwt_secret", {
      expiresIn: "7d"
    });

    // Return ALL user data
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        semester: user.semester || "",
        branch: user.branch || "",
        year: user.year || "",
        enrollment: user.enrollment || "",
        trustScore: user.trustScore || 100
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login: " + error.message
    });
  }
};

// GET CURRENT USER PROFILE
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        semester: user.semester || "",
        branch: user.branch || "",
        year: user.year || "",
        enrollment: user.enrollment || "",
        trustScore: user.trustScore || 100,
        isVerified: user.isVerified || false,
        preferences: user.preferences || {
          notifications: true,
          emailAlerts: true,
          smsAlerts: false
        },
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// UPDATE USER PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, semester, branch, year, enrollment } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        name,
        phone,
        semester,
        branch,
        year,
        enrollment
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// VERIFY EMAIL (for forgot password)
exports.verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// GET ALL USERS (for testing)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.json({
      success: true,
      users,
      count: users.length
    });

  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};