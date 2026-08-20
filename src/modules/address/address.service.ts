import { prisma } from "../../lib/prisma";
import findUserOrThrow from "../../utils/findUserOrThrow";
import { IAddress } from "./address.interface";

const getAdressByUserId = async (userId: string) => {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return addresses;
};

const createOrUpdateAddress = async (userId: string, payload: IAddress) => {
  const { address_line_1, address_line_2, postCode, city, region, whereAbout } =
    payload;

  const user = await findUserOrThrow(userId);

  const createdAddress = await prisma.address.upsert({
    where: {
      userId_whereAbout: {
        userId: user.id,
        whereAbout,
      },
    },
    update: {
      address_line_1,
      address_line_2,
      postCode,
      city,
      region,
    },
    create: {
      address_line_1,
      address_line_2,
      postCode,
      city,
      region,
      whereAbout,
      userId,
    },
  });

  return createdAddress;
};

export const addressService = {
  getAdressByUserId,
  createOrUpdateAddress,
};
