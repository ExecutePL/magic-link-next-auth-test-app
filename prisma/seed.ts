import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const { id: botId } =
    (await prisma.user.findFirst({
      where: {
        id: process.env.NEXT_PUBLIC_BOT_ID,
      },
      select: {
        id: true,
      },
    })) || {};

  if (botId) return;

  await prisma.user.create({
    data: {
      id: process.env.NEXT_PUBLIC_BOT_ID,
      name: "Bot",
      // isBot: true,
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
