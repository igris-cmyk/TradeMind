import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log("🧹 Cleaning up dummy test data from the database...");

  try {
    // Delete in order to respect foreign key constraints
    const deletedAnalyses = await prisma.aIAnalysis.deleteMany({});
    console.log(`✅ Deleted ${deletedAnalyses.count} AI Analyses.`);

    const deletedMemories = await prisma.behaviorMemory.deleteMany({});
    console.log(`✅ Deleted ${deletedMemories.count} Behavior Memories.`);

    const deletedAlerts = await prisma.insight.deleteMany({});
    console.log(`✅ Deleted ${deletedAlerts.count} Insights.`);

    const deletedTrades = await prisma.trade.deleteMany({});
    console.log(`✅ Deleted ${deletedTrades.count} Trades.`);

    const deletedJournal = await prisma.journalEntry.deleteMany({});
    console.log(`✅ Deleted ${deletedJournal.count} Journal Entries.`);

    const deletedStrategies = await prisma.strategy.deleteMany({});
    console.log(`✅ Deleted ${deletedStrategies.count} Strategies.`);

    console.log("🚀 Database clean up complete! (Users and Accounts preserved)");
  } catch (error) {
    console.error("❌ Error cleaning up database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
