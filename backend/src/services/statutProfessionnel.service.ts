import { prisma } from '../lib/prisma';

export async function getMesStatuts(etudiantId: string) {
  return prisma.statutProfessionnel.findMany({
    where: { etudiantId },
    orderBy: { dateDeclaration: 'desc' },
  });
}

export async function declarer(etudiantId: string, data: any) {
  if (!data.typeStatut) throw new Error('typeStatut requis');
  if (!data.dateDebut) throw new Error('dateDebut requis');

  return prisma.statutProfessionnel.create({
    data: {
      etudiantId,
      typeStatut: data.typeStatut,
      nomEntreprise: data.nomEntreprise || null,
      poste: data.poste || null,
      typeContrat: data.typeContrat || null,
      salaireBrutAnnuel: data.salaireBrutAnnuel ? Number(data.salaireBrutAnnuel) : null,
      dateDebut: new Date(data.dateDebut),
      dateFin: data.dateFin ? new Date(data.dateFin) : null,
      secteurActivite: data.secteurActivite || null,
      ville: data.ville || null,
      pays: data.pays || null,
      justificatifUrl: data.justificatifUrl || null,
    },
  });
}

export async function modifier(id: string, etudiantId: string, data: any) {
  const statut = await prisma.statutProfessionnel.findUnique({ where: { id } });
  if (!statut) throw new Error('Statut introuvable');
  if (statut.etudiantId !== etudiantId) throw new Error('Non autorise');

  return prisma.statutProfessionnel.update({
    where: { id },
    data: {
      typeStatut: data.typeStatut,
      nomEntreprise: data.nomEntreprise ?? null,
      poste: data.poste ?? null,
      typeContrat: data.typeContrat ?? null,
      salaireBrutAnnuel: data.salaireBrutAnnuel ? Number(data.salaireBrutAnnuel) : null,
      dateDebut: data.dateDebut ? new Date(data.dateDebut) : undefined,
      dateFin: data.dateFin ? new Date(data.dateFin) : null,
      secteurActivite: data.secteurActivite ?? null,
      ville: data.ville ?? null,
      pays: data.pays ?? null,
      justificatifUrl: data.justificatifUrl ?? null,
    },
  });
}

export async function supprimer(id: string, etudiantId: string) {
  const statut = await prisma.statutProfessionnel.findUnique({ where: { id } });
  if (!statut) throw new Error('Statut introuvable');
  if (statut.etudiantId !== etudiantId) throw new Error('Non autorise');
  await prisma.statutProfessionnel.delete({ where: { id } });
  return { message: 'Statut supprime' };
}

export async function getStatutsParEtudiant(etudiantId: string) {
  const etudiant = await prisma.etudiant.findUnique({ where: { id: etudiantId } });
  if (!etudiant) throw new Error('Etudiant introuvable');
  return prisma.statutProfessionnel.findMany({
    where: { etudiantId },
    orderBy: { dateDeclaration: 'desc' },
  });
}

export async function validerStatut(id: string, adminId: string) {
  const statut = await prisma.statutProfessionnel.findUnique({ where: { id } });
  if (!statut) throw new Error('Statut introuvable');
  return prisma.statutProfessionnel.update({
    where: { id },
    data: { estValide: true, idValidateur: adminId, dateValidation: new Date() },
  });
}
