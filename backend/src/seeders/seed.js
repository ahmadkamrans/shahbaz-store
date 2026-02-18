import dotenv from 'dotenv';
import seedUsers from './userSeeder.js';

dotenv.config();

const runSeeders = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Run all seeders
    await seedUsers();

    console.log('\n✅ All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    process.exit(1);
  }
};

runSeeders();
