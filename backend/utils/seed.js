const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedUsers = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendease';
    await mongoose.connect(connUri);
    console.log('[Seed] Connected to MongoDB');

    // Default demo accounts
    const demoAccounts = [
      {
        name: 'System Administrator',
        email: 'admin@attendease.com',
        password: 'AdminPassword123!',
        role: 'admin',
        isActive: true,
      },
      {
        name: 'Dr. Sarah Jenkins',
        email: 'faculty@attendease.com',
        password: 'FacultyPassword123!',
        role: 'faculty',
        isActive: true,
      },
      {
        name: 'Alex Johnson',
        email: 'student@attendease.com',
        password: 'StudentPassword123!',
        role: 'student',
        isActive: true,
      },
    ];

    for (const acc of demoAccounts) {
      const existing = await User.findOne({ email: acc.email });
      if (!existing) {
        await User.create(acc);
        console.log(`[Seed] Created ${acc.role} account: ${acc.email} / ${acc.password}`);
      } else {
        console.log(`[Seed] Account already exists: ${acc.email}`);
      }
    }

    console.log('[Seed] Seeding completed successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding users:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;
