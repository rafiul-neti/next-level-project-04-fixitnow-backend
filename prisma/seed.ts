import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import config from "../src/config";
import { WeekendDays } from "../generated/prisma/enums";
import { Prisma } from "../generated/prisma/client";

// Config
const SALT_ROUNDS = Number(config.bcrypt_salt_rounds);
const SEED_PASSWORD = config.seed_password!;

// Reference data

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Painting",
  "Carpentry",
  "Appliance Repair",
  "Pest Control",
  "HVAC",
] as const;

// A few services per category
const SERVICES_BY_CATEGORY: Record<
  (typeof CATEGORIES)[number],
  { name: string; description: string }[]
> = {
  Plumbing: [
    {
      name: "Pipe Leak Repair",
      description: "Fix leaking or burst pipes under sinks, walls, or floors.",
    },
    {
      name: "Drain Cleaning",
      description:
        "Clear clogged drains in kitchens, bathrooms, and laundry areas.",
    },
    {
      name: "Faucet & Sink Installation",
      description: "Install or replace kitchen and bathroom faucets and sinks.",
    },
  ],
  Electrical: [
    {
      name: "Wiring Inspection",
      description:
        "Full inspection of household wiring for safety and code compliance.",
    },
    {
      name: "Switch & Socket Installation & Repair",
      description: "Repair or replace faulty switches, sockets, and outlets.",
    },
    {
      name: "Ceiling Fan Installation",
      description: "Mount and wire new ceiling fans.",
    },
  ],
  Cleaning: [
    {
      name: "Deep House Cleaning",
      description: "Full top-to-bottom cleaning of an entire home.",
    },
    {
      name: "Move-in/Move-out Cleaning",
      description: "Thorough cleaning before moving in or after moving out.",
    },
    {
      name: "Sofa & Carpet Cleaning",
      description: "Steam cleaning for upholstery and carpets.",
    },
  ],
  Painting: [
    {
      name: "Interior Wall Painting",
      description: "Fresh coat of paint for interior rooms and walls.",
    },
    {
      name: "Exterior House Painting",
      description: "Weatherproof paint job for exterior walls and fences.",
    },
  ],
  Carpentry: [
    {
      name: "Furniture Repair",
      description: "Repair broken chairs, tables, cabinets, and doors.",
    },
    {
      name: "Custom Shelving",
      description: "Design and install custom shelves and storage units.",
    },
  ],
  "Appliance Repair": [
    {
      name: "Refrigerator Repair",
      description: "Diagnose and repair fridge cooling and compressor issues.",
    },
    {
      name: "Washing Machine Repair",
      description: "Fix drainage, spin, and motor issues in washing machines.",
    },
    {
      name: "Microwave Oven Repair",
      description: "Diagnose and repair various issues in Microwave Ovens.",
    },
  ],
  "Pest Control": [
    {
      name: "General Pest Treatment",
      description:
        "Treatment for common household pests like ants and roaches.",
    },
    {
      name: "Termite Inspection",
      description: "Inspection and treatment plan for termite infestations.",
    },
  ],
  HVAC: [
    {
      name: "AC Servicing",
      description: "Routine cleaning and gas check for split and window ACs.",
    },
    {
      name: "AC Installation",
      description: "Full installation of new air conditioning units.",
    },
  ],
};

const TECHNICIAN_SEED = [
  {
    name: "Arif Hossain",
    email: "arif.hossain@example.com",
    bio: "Licensed electrician with 8+ years of residential and commercial experience.",
    hourlyRate: 800,
    experienceYears: 8,
    serviceAreas: ["Dhaka", "Gazipur"],
    services: [
      "Wiring Inspection",
      "Switch & Socket Installation & Repair",
      "Ceiling Fan Installation",
    ],
    availability: {
      weekendDays: "SAT",
      startTime: "09:00",
      endTime: "18:00",
    },
  },
  {
    name: "Shakil Ahmed",
    email: "shakil.ahmed@example.com",
    bio: "Expert AC technician specializing in installation and maintenance.",
    hourlyRate: 900,
    experienceYears: 10,
    serviceAreas: ["Dhaka", "Narayanganj"],
    services: ["AC Installation", "AC Servicing"],
    availability: {
      weekendDays: "FRI",
      startTime: "10:00",
      endTime: "19:00",
    },
  },
  {
    name: "Rashed Karim",
    email: "rashed.karim@example.com",
    bio: "Professional plumber experienced in household and commercial plumbing.",
    hourlyRate: 700,
    experienceYears: 7,
    serviceAreas: ["Dhaka", "Savar"],
    services: [
      "Pipe Leak Repair",
      "Drain Cleaning",
      "Faucet & Sink Installation",
    ],
    availability: {
      weekendDays: "SAT",
      startTime: "08:30",
      endTime: "17:30",
    },
  },
  {
    name: "Imran Khan",
    email: "imran.khan@example.com",
    bio: "Experienced appliance repair technician for common household electronics.",
    hourlyRate: 850,
    experienceYears: 9,
    serviceAreas: ["Dhaka", "Mirpur"],
    services: [
      "Refrigerator Repair",
      "Washing Machine Repair",
      "Microwave Oven Repair",
    ],
    availability: {
      weekendDays: "FRI",
      startTime: "09:00",
      endTime: "18:00",
    },
  },
  {
    name: "Mahmud Hasan",
    email: "mahmud.hasan@example.com",
    bio: "Skilled painter delivering interior and exterior painting services.",
    hourlyRate: 650,
    experienceYears: 6,
    serviceAreas: ["Dhaka", "Uttara"],
    services: ["Interior Wall Painting", "Exterior House Painting"],
    availability: {
      weekendDays: "SAT",
      startTime: "08:00",
      endTime: "16:00",
    },
  },
  {
    name: "Tanvir Islam",
    email: "tanvir.islam@example.com",
    bio: "Carpenter specializing in custom furniture assembly and wood repairs.",
    hourlyRate: 750,
    experienceYears: 11,
    serviceAreas: ["Dhaka", "Keraniganj"],
    services: ["Custom Shelving", "Furniture Repair"],
    availability: {
      weekendDays: "FRI",
      startTime: "09:30",
      endTime: "18:30",
    },
  },
  {
    name: "Sabbir Rahman",
    email: "sabbir.rahman@example.com",
    bio: "Reliable home cleaning professional for apartments and offices.",
    hourlyRate: 500,
    experienceYears: 5,
    serviceAreas: ["Dhaka", "Mohammadpur"],
    services: [
      "Sofa & Carpet Cleaning",
      "Move-in/Move-out Cleaning",
      "Deep House Cleaning",
    ],
    availability: {
      weekendDays: "SAT",
      startTime: "08:00",
      endTime: "17:00",
    },
  },
  {
    name: "Nayeem Chowdhury",
    email: "nayeem.chowdhury@example.com",
    bio: "Experienced pest control specialist for residential and commercial properties.",
    hourlyRate: 700,
    experienceYears: 8,
    serviceAreas: ["Dhaka", "Gulshan"],
    services: ["Termite Inspection", "General Pest Treatment"],
    availability: {
      weekendDays: "FRI",
      startTime: "09:00",
      endTime: "18:00",
    },
  },
  {
    name: "Farhan Kabir",
    email: "farhan.kabir@example.com",
    bio: "Certified CCTV and smart home technician with expertise in security system installation.",
    hourlyRate: 950,
    experienceYears: 9,
    serviceAreas: ["Dhaka", "Banani"],
    services: [
      "Switch & Socket Installation & Repair",
      "Ceiling Fan Installation",
    ],
    availability: {
      weekendDays: "SAT",
      startTime: "10:00",
      endTime: "18:30",
    },
  },
  {
    name: "Mehedi Hasan",
    email: "mehedi.hasan@example.com",
    bio: "Experienced handyman providing a wide range of home maintenance and repair services.",
    hourlyRate: 650,
    experienceYears: 7,
    serviceAreas: ["Dhaka", "Bashundhara"],
    services: ["Furniture Repair", "Custom Shelving"],
    availability: {
      weekendDays: "FRI",
      startTime: "08:30",
      endTime: "17:30",
    },
  },
];

const CUSTOMER_SEED = [
  { name: "Tanvir Hasan", email: "tanvir.customer@example.com" },
  { name: "Sumaiya Islam", email: "sumaiya.customer@example.com" },
  { name: "Arifin Chowdhury", email: "arifin.customer@example.com" },
  { name: "Nusrat Jahan", email: "nusrat.customer@example.com" },
];

const ADMIN_SEED = { name: "Platform Admin", email: "admin@fixitnow.com" };

const PHONE_PREFIX = "0169";

function makePhone(counter: number) {
  return PHONE_PREFIX + String(1000000 + counter).slice(-7);
}

// Generates a believable startedAt/completedAt/workedMinutes/totalPrice
// set for a COMPLETED booking, given the technician's hourly rate.
function makeCompletedBookingTimeline(hourlyRate: number, daysAgo: number) {
  const workedMinutes = 45 + Math.floor(Math.random() * 196); // 45–240 min

  const startedAt = new Date();
  startedAt.setDate(startedAt.getDate() - daysAgo);
  startedAt.setHours(9 + Math.floor(Math.random() * 7), 0, 0, 0); // 9am–4pm start

  const completedAt = new Date(startedAt.getTime() + workedMinutes * 60_000);

  const totalPrice = new Prisma.Decimal(
    ((workedMinutes / 60) * hourlyRate).toFixed(2),
  );

  return { startedAt, completedAt, workedMinutes, totalPrice };
}

const REVIEW_SNIPPETS = [
  {
    content: "Arrived on time and fixed the issue quickly. Very professional.",
    stars: 5,
  },
  {
    content: "Good work overall, though a bit pricier than expected.",
    stars: 4,
  },
  { content: "Solid job, would book again.", stars: 4 },
  { content: "Took longer than quoted but the result was solid.", stars: 3 },
  { content: "Excellent communication and clean work.", stars: 5 },
  { content: "Decent service, minor follow-up was needed.", stars: 3 },
];

async function main() {
  console.log("Seeding started...");

  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

  // ---- 1. Categories ----
  const categoryRecords = await Promise.all(
    CATEGORIES.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );
  const categoryIdByName = new Map(categoryRecords.map((c) => [c.name, c.id]));
  console.log(`Created ${categoryRecords.length} categories`);

  // ---- 2. Services ----
  let serviceCount = 0;
  const serviceIdByName = new Map<string, string>();

  for (const category of CATEGORIES) {
    const services = SERVICES_BY_CATEGORY[category];
    const categoryId = categoryIdByName.get(category)!;

    for (const svc of services) {
      const created = await prisma.service.create({
        data: {
          name: svc.name,
          description: svc.description,
          categoryId,
        },
      });
      serviceIdByName.set(created.name, created.id);
      serviceCount++;
    }
  }
  console.log(`Created ${serviceCount} services`);

  // ---- 3. Admin ----
  await prisma.user.upsert({
    where: { email: ADMIN_SEED.email },
    update: {},
    create: {
      name: ADMIN_SEED.name,
      email: ADMIN_SEED.email,
      phone: makePhone(0),
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("Created admin user");

  // ---- 4. Customers ----
  const customers = [];
  for (let i = 0; i < CUSTOMER_SEED.length; i++) {
    const c = CUSTOMER_SEED[i]!;
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        email: c.email,
        phone: makePhone(i + 1),
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });
    customers.push(user);
  }
  console.log(`Created ${customers.length} customers`);

  // 5. Technicians (User + TechnicianProfile + Availability)
  const technicianProfiles = [];

  for (let i = 0; i < TECHNICIAN_SEED.length; i++) {
    const t = TECHNICIAN_SEED[i]!;

    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        name: t.name,
        email: t.email,
        phone: makePhone(100 + i),
        password: hashedPassword,
        role: "TECHNICIAN",
      },
    });

    const profile = await prisma.technicianProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: t.bio,
        hourlyRate: t.hourlyRate,
        experienceYears: t.experienceYears,
        serviceAreas: t.serviceAreas,
      },
    });

    for (const serviceName of t.services) {
      const serviceId = serviceIdByName.get(serviceName);
      if (!serviceId) continue;

      await prisma.technicianService.upsert({
        where: {
          technicianId_serviceId: {
            technicianId: profile.id,
            serviceId,
          },
        },
        update: {},
        create: { technicianId: profile.id, serviceId, isActive: true },
      });
    }

    await prisma.availability.upsert({
      where: { technicianId: profile.id },
      update: {},
      create: {
        technicianId: profile.id,
        weekendDays: t.availability.weekendDays as WeekendDays,
        startTime: t.availability.startTime,
        endTime: t.availability.endTime,
      },
    });

    technicianProfiles.push({ profile, services: t.services, user });
  }
  console.log(
    `Created ${technicianProfiles.length} technicians with availability`,
  );

  // 6. Completed bookings + reviews (so rating filters have real data)
  let reviewCount = 0;
  let reviewSnippetIndex = 0;

  for (const tech of technicianProfiles) {
    // give each technician 2-4 completed bookings + reviews, pulling services from their own categories
    const eligibleServiceIds = tech.services.flatMap(
      (service) => serviceIdByName.get(service) ?? [],
    );
    if (eligibleServiceIds.length === 0) continue;

    const numReviews = 2 + (reviewSnippetIndex % 3);

    for (let j = 0; j < numReviews; j++) {
      const customer = customers[(reviewSnippetIndex + j) % customers.length]!;
      const serviceId = eligibleServiceIds[j % eligibleServiceIds.length]!;
      const area = tech.profile.serviceAreas[0] ?? "Rajshahi";

      const address = await prisma.address.upsert({
        where: {
          userId_whereAbout: { userId: customer.id, whereAbout: "HOME" },
        },
        update: {},
        create: {
          userId: customer.id,
          address_line_1: "House 12, Road 4",
          city: area,
          region: "Rajshahi Division",
          postCode: "6500",
          whereAbout: "HOME",
        },
      });

      const timeline = makeCompletedBookingTimeline(
        tech.profile.hourlyRate,
        5 + (reviewSnippetIndex + j) * 3, // spread bookings out over recent weeks
      );

      const booking = await prisma.booking.create({
        data: {
          userId: customer.id,
          serviceId,
          technicianId: tech.profile.id,
          addressId: address.id,
          status: "COMPLETED",
          startedAt: timeline.startedAt,
          completedAt: timeline.completedAt,
          workedMinutes: timeline.workedMinutes,
          totalPrice: timeline.totalPrice,
        },
      });

      const snippet =
        REVIEW_SNIPPETS[(reviewSnippetIndex + j) % REVIEW_SNIPPETS.length]!;

      await prisma.review.create({
        data: {
          userId: customer.id,
          technicianId: tech.profile.id,
          bookingId: booking.id,
          content: snippet.content,
          givenStars: snippet.stars,
        },
      });

      reviewCount++;
    }

    reviewSnippetIndex++;
  }
  console.log(`Created ${reviewCount} completed bookings with reviews`);

  // 7. In-progress bookings 
  let inProgressCount = 0;

  for (const tech of technicianProfiles) {
    const eligibleServiceIds = tech.services.flatMap(
      (service) => serviceIdByName.get(service) ?? [],
    );
    if (eligibleServiceIds.length === 0) continue;

    const customer = customers[inProgressCount % customers.length]!;
    const serviceId = eligibleServiceIds[0]!;
    const area = tech.profile.serviceAreas[0] ?? "Rajshahi";

    const address = await prisma.address.upsert({
      where: {
        userId_whereAbout: { userId: customer.id, whereAbout: "HOME" },
      },
      update: {},
      create: {
        userId: customer.id,
        address_line_1: "House 12, Road 4",
        city: area,
        region: "Rajshahi Division",
        postCode: "6500",
        whereAbout: "HOME",
      },
    });

    const startedAt = new Date();
    startedAt.setHours(startedAt.getHours() - (1 + (inProgressCount % 4))); // started 1-4 hrs ago

    await prisma.booking.create({
      data: {
        userId: customer.id,
        serviceId,
        technicianId: tech.profile.id,
        addressId: address.id,
        status: "IN_PROGRESS",
        startedAt,
      },
    });

    inProgressCount++;
  }
  console.log(`Created ${inProgressCount} in-progress bookings (startedAt only)`);

  console.log("Seeding finished.");
  console.log(`All seeded users share the password: ${SEED_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
