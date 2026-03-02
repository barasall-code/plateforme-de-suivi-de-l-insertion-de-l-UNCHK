import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { utilisateurId: userId },
    orderBy: { dateCreation: 'desc' },
    take: 20,
  });
}

export async function getNombreNonLues(userId: string) {
  return prisma.notification.count({
    where: { utilisateurId: userId, estLue: false },
  });
}

export async function marquerCommeLue(id: string, userId: string) {
  return prisma.notification.update({
    where: { id },
    data: { estLue: true },
  });
}

export async function marquerToutesCommeLues(userId: string) {
  return prisma.notification.updateMany({
    where: { utilisateurId: userId, estLue: false },
    data: { estLue: true },
  });
}

export async function creerNotification(
  utilisateurId: string,
  typeNotification: string,
  titre: string,
  message: string,
  lienAction?: string
) {
  return prisma.notification.create({
    data: {
      utilisateurId,
      typeNotification: typeNotification as any,
      titre,
      message,
      lienAction,
      estLue: false,
    },
  });
}