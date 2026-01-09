import { prisma } from "../src/lib/prisma";

async function testConnection() {
  try {
    console.log("Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connection successful!");
    
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database is accessible. User count: ${userCount}`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();

