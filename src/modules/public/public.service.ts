import { prisma } from "../../lib/prisma";
import { ServiceIdType } from "./public.validation";

const getTechniciansForAServiceByID = async (id: ServiceIdType) => {
  const technicians = await prisma.technicianProfile.findMany({
    where: {
      technicianServices: { some: { serviceId: id.serviceId, isActive: true } },
    },
    select: {
      id: true,
      bio: true,
      user: { select: { name: true } },
      reviews: { select: { givenStars: true } },
      technicianServices: {
        where: { serviceId: id.serviceId },
        select: {
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              category: { select: { name: true } },
            },
          },
        },
      },
      hourlyRate: true,
    },
  });

  const result = technicians
    .map((t) => {
      const totalStars = t.reviews.reduce(
        (acc, review) => acc + review.givenStars,
        0,
      );

      const averageRating =
        t.reviews.length > 0 ? totalStars / t.reviews.length : 0;
      const service = t.technicianServices[0]?.service;

      return {
        id: t.id,
        bio: t.bio,
        name: t.user.name,
        hourlyRate: t.hourlyRate,
        averageRating,
        serviceId: service?.id,
        serviceName: service?.name,
        serviceDescription: service?.description,
        serviceCategory: service?.category.name,
      };
    })
    .sort((a, b) => b.averageRating - a.averageRating);

  return result;
};

export const publicService = { getTechniciansForAServiceByID };
