import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getOuCreerConversation(etudiantId: string, entrepriseId: string) {
  let conversation = await prisma.conversation.findUnique({
    where: { etudiantId_entrepriseId: { etudiantId, entrepriseId } },
    include: {
      etudiant: { select: { nom: true, prenom: true } },
      entreprise: { select: { nomEntreprise: true } },
      messages: {
        include: { expediteur: { select: { typeUtilisateur: true } } },
        orderBy: { dateEnvoi: 'asc' },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { etudiantId, entrepriseId },
      include: {
        etudiant: { select: { nom: true, prenom: true } },
        entreprise: { select: { nomEntreprise: true } },
        messages: {
          include: { expediteur: { select: { typeUtilisateur: true } } },
          orderBy: { dateEnvoi: 'asc' },
        },
      },
    });
  }
  return conversation;
}

export async function getMesConversations(userId: string, role: string) {
  let conversations;
  if (role === 'etudiant') {
    conversations = await prisma.conversation.findMany({
      where: { etudiantId: userId },
      include: {
        entreprise: { select: { nomEntreprise: true, secteurActivite: true } },
        messages: {
          orderBy: { dateEnvoi: 'desc' },
          take: 1,
        },
      },
      orderBy: { dateMaj: 'desc' },
    });
  } else {
    conversations = await prisma.conversation.findMany({
      where: { entrepriseId: userId },
      include: {
        etudiant: { select: { nom: true, prenom: true, filiere: true } },
        messages: {
          orderBy: { dateEnvoi: 'desc' },
          take: 1,
        },
      },
      orderBy: { dateMaj: 'desc' },
    });
  }
  return conversations;
}

export async function getMessages(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) throw new Error('Conversation introuvable');
  if (conversation.etudiantId !== userId && conversation.entrepriseId !== userId) {
    throw new Error('Acces non autorise');
  }

  // Marquer messages comme lus
  await prisma.message.updateMany({
    where: { conversationId, lu: false, NOT: { expediteurId: userId } },
    data: { lu: true },
  });

  return prisma.message.findMany({
    where: { conversationId },
    include: { expediteur: { select: { typeUtilisateur: true } } },
    orderBy: { dateEnvoi: 'asc' },
  });
}

export async function envoyerMessage(conversationId: string, expediteurId: string, contenu: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) throw new Error('Conversation introuvable');
  if (conversation.etudiantId !== expediteurId && conversation.entrepriseId !== expediteurId) {
    throw new Error('Acces non autorise');
  }

  const message = await prisma.message.create({
    data: { conversationId, expediteurId, contenu },
    include: { expediteur: { select: { typeUtilisateur: true } } },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { dateMaj: new Date() },
  });

  return message;
}

export async function getNombreMsgNonLus(userId: string) {
  const count = await prisma.message.count({
    where: {
      lu: false,
      NOT: { expediteurId: userId },
      conversation: {
        OR: [{ etudiantId: userId }, { entrepriseId: userId }],
      },
    },
  });
  return count;
}