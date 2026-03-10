import { prisma } from '../lib/prisma';

export async function getNotifications(userId: string, page = 1, limit = 20) {
  const skip = (Math.max(1, page) - 1) * Math.min(50, limit);
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where:   { utilisateurId: userId },
      orderBy: { dateCreation: 'desc' },
      skip,
      take: Math.min(50, limit),
    }),
    prisma.notification.count({ where: { utilisateurId: userId } }),
  ]);
  return { notifications, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getNombreNonLues(userId: string) {
  return prisma.notification.count({
    where: { utilisateurId: userId, estLue: false },
  });
}

export async function marquerCommeLue(id: string, userId: string) {
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif) throw new Error('Notification introuvable');
  if (notif.utilisateurId !== userId) throw new Error('Non autorise');

  return prisma.notification.update({
    where: { id },
    data:  { estLue: true },
  });
}

export async function marquerToutesCommeLues(userId: string) {
  return prisma.notification.updateMany({
    where: { utilisateurId: userId, estLue: false },
    data:  { estLue: true },
  });
}

export async function creerNotification(
  utilisateurId: string,
  typeNotification: string,
  titre: string,
  message: string,
  lienAction?: string,
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
