const { PrismaClient, SubscriptionTierName } = require('@prisma/client');

const prisma = new PrismaClient();

// A script to seed your subscription plans
async function seedSubscriptionPlans() {
  await prisma.subscriptionPlan.createMany({
    skipDuplicates: true, // Skip if plans with these names already exist
    data: [
      {
        name: SubscriptionTierName.INACTIVE, // For users without an active subscription (mapped from "Beginner" in your UI)
        displayName: 'Beginner',
        monthlyPrice: 0.0,
        annualPrice: 0.0,
        projectLimit: 2,
        storageLimit: 100, // Assuming a basic storage limit
        clientLimit: 5 // Basic client limit
      },
      {
        name: SubscriptionTierName.CREATOR,
        displayName: 'Creator',
        monthlyPrice: 19.99,
        annualPrice: 199.9, // Assuming ~15% discount for annual billing
        projectLimit: 10,
        storageLimit: 5120, // 5GB in MB
        clientLimit: 20
      },
      {
        name: SubscriptionTierName.INNOVATOR,
        displayName: 'Innovator',
        monthlyPrice: 49.99,
        annualPrice: 499.9, // Assuming ~15% discount for annual billing
        projectLimit: null, // Unlimited projects
        storageLimit: 51200, // 50GB in MB
        clientLimit: 50,
        teamMemberLimit: 3 // Assuming some team members for this tier
      },
      {
        name: SubscriptionTierName.VISIONARY,
        displayName: 'Visionary',
        monthlyPrice: 99.99,
        annualPrice: 999.9, // Assuming ~15% discount for annual billing
        projectLimit: null, // Unlimited
        storageLimit: null, // Unlimited file sharing
        clientLimit: null, // Unlimited
        teamMemberLimit: 10 // Advanced team management
      }
    ]
  });

  console.log('Subscription plans seeded successfully');
}

seedSubscriptionPlans()
  .catch((e) => console.error('Error seeding subscription plans:', e))
  .finally(() => prisma.$disconnect());
