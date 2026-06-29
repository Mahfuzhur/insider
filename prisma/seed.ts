import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const email = process.env.ADMIN_EMAIL ?? "admin@insider.com.bd";
  const password = process.env.ADMIN_PASSWORD ?? "insider2026";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  // Site settings
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      heroTagline:
        "An interior design studio in Dhaka turning spaces into experiences — from concept and 3D visualization to turnkey fit-out.",
      aboutBody:
        "Insider is an independent interior design studio based in Dhaka. From first sketch and 3D visualization to turnkey fit-out, we shape residential and commercial spaces with craft, restraint, and a feel for how people actually live.",
    },
  });

  // Project types
  const residential = await prisma.projectType.upsert({
    where: { slug: "residential" },
    update: {},
    create: { name: "Residential", slug: "residential", order: 0 },
  });
  await prisma.projectType.upsert({
    where: { slug: "commercial" },
    update: {},
    create: { name: "Commercial", slug: "commercial", order: 1 },
  });

  // Services
  const services = [
    {
      title: "Interior Design",
      description:
        "End-to-end residential and commercial interiors, designed around how you live and work.",
      icon: "ti-armchair",
      order: 0,
    },
    {
      title: "Space Planning",
      description:
        "Smart layouts that make every square foot purposeful, comfortable, and beautiful.",
      icon: "ti-ruler-2",
      order: 1,
    },
    {
      title: "3D Visualization",
      description:
        "Photoreal renders so you can see and feel your space before a single wall moves.",
      icon: "ti-cube",
      order: 2,
    },
    {
      title: "Turnkey Fit-Out",
      description:
        "We deliver the finished space — managed, on time, and built to last.",
      icon: "ti-tools",
      order: 3,
    },
  ];
  for (const s of services) {
    const exists = await prisma.service.findFirst({ where: { title: s.title } });
    if (!exists) await prisma.service.create({ data: s });
  }

  // Sample project (from the client's template)
  const existingProject = await prisma.project.findUnique({
    where: { slug: "nazrul-islam-residence" },
  });
  if (!existingProject) {
    await prisma.project.create({
      data: {
        title: "Nazrul Islam Residence",
        slug: "nazrul-islam-residence",
        typeId: residential.id,
        location: "Kalabagan, Dhanmondi",
        areaSqft: 1500,
        yearCompleted: 2025,
        duration: "60 days",
        rooms: JSON.stringify([
          "Kitchen",
          "Bedroom",
          "Dining",
          "Living",
          "Bathroom",
        ]),
        shortDescription:
          "Gorgeous look but traditional — a 1,500 sqft residence reimagined in a modern minimalist style while keeping a warm, traditional soul.",
        designStyle: "Modern minimalist",
        testimonial: "Friendly and delivery good quality material.",
        testimonialAuthor: "Nazrul Islam",
        featured: true,
        published: true,
        order: 0,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
