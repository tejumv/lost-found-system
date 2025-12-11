const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lost-found-system");
        console.log('MongoDB Connected');

        const adminExists = await Admin.findOne({ email: 'admin@test.com' });

        if (adminExists) {
            console.log('Admin already exists');
            process.exit();
        }

        const admin = await Admin.create({
            name: 'Super Admin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'superadmin',
            permissions: ['users', 'items', 'reports', 'settings']
        });

        console.log('Admin created successfully');
        console.log('Email: admin@test.com');
        console.log('Password: password123');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
