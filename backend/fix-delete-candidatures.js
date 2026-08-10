const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const etudiant = await prisma.utilisateur.findUnique({
    where: { email: 'etudianttest@unchk.edu.sn' },
    include: { etudiant: true },
  });
  const etudiantId = etudiant.etudiant.id;

  const toutes = await prisma.candidature.findMany({
    where: { etudiantId },
    include: { offre: { select: { titre: true } } },
  });
  const aSupprimer = toutes.filter((c) => /test/i.test(c.offre.titre));

  for (const c of aSupprimer) {
    await prisma.historiqueStatutCandidature.deleteMany({ where: { candidatureId: c.id } });
    await prisma.candidature.delete({ where: { id: c.id } });
    console.log('Supprimee (avec historique) : "' + c.offre.titre + '"');
  }

  console.log('\n=== Candidatures restantes ===');
  const restantes = await prisma.candidature.findMany({
    where: { etudiantId },
    include: { offre: { select: { titre: true } } },
  });
  restantes.forEach((c) => console.log('  ' + c.offre.titre + ' : ' + c.statut));
}

main()
  .catch((e) => console.error('ERREUR:', e.message))
  .finally(() => prisma.$disconnect());
