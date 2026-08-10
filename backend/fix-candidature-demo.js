const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const etudiant = await prisma.utilisateur.findUnique({
    where: { email: 'etudianttest@unchk.edu.sn' },
    include: { etudiant: true },
  });

  // 1. Supprimer la candidature parasite sur "test 4"
  const test4 = await prisma.candidature.findFirst({
    where: { etudiantId: etudiant.etudiant.id },
    include: { offre: true },
  });
  const candidatures = await prisma.candidature.findMany({
    where: { etudiantId: etudiant.etudiant.id },
    include: { offre: { select: { titre: true } } },
  });
  const aSupprimer = candidatures.find((c) => c.offre.titre === 'test 4');
  if (aSupprimer) {
    await prisma.candidature.delete({ where: { id: aSupprimer.id } });
    console.log('Candidature sur "test 4" supprimee.');
  } else {
    console.log('Aucune candidature sur "test 4" trouvee (deja propre).');
  }

  // 2. Retrouver l'offre au titre soigne
  const offreCible = await prisma.offre.findFirst({
    where: { titre: 'Développeur Full Stack React/Node.js' },
  });
  if (offreCible == null) {
    console.log('ATTENTION : offre introuvable.');
    return;
  }

  // 3. Verifier si une candidature existe deja sur cette offre pour cet etudiant
  const existante = await prisma.candidature.findFirst({
    where: { etudiantId: etudiant.etudiant.id, offreId: offreCible.id },
  });

  if (existante) {
    await prisma.candidature.update({
      where: { id: existante.id },
      data: { statut: 'soumise' },
    });
    console.log('Candidature existante remise au statut "soumise" sur : ' + offreCible.titre);
  } else {
    await prisma.candidature.create({
      data: {
        etudiantId: etudiant.etudiant.id,
        offreId: offreCible.id,
        statut: 'soumise',
        lettreMotivation: "Candidature creee pour la demonstration video de soutenance.",
        cvUrl: 'https://example.com/cv-demo-etudiant.pdf',
      },
    });
    console.log('Nouvelle candidature creee sur : ' + offreCible.titre + ' (statut: soumise)');
  }
}

main()
  .catch((e) => console.error('ERREUR:', e.message))
  .finally(() => prisma.$disconnect());
