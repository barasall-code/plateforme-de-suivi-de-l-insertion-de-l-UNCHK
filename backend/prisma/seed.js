
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  // Récupérer les IDs existants
  const admin = await prisma.utilisateur.findUnique({ where: { email: 'admin@unchk.sn' } });
  const fatou = await prisma.utilisateur.findUnique({ where: { email: 'fatou@unchk.sn' } });
  const entrepriseUser = await prisma.utilisateur.findUnique({ where: { email: 'entreprise@test.sn' } });

  if (!admin || !fatou || !entrepriseUser) {
    console.log('Utilisateurs manquants');
    return;
  }

  // Créer superviseur
  const hash = await bcrypt.hash('motdepasse123', 12);
  const supUser = await prisma.utilisateur.upsert({
    where: { email: 'superviseur@unchk.sn' },
    update: {},
    create: {
      email: 'superviseur@unchk.sn',
      motDePasseHash: hash,
      typeUtilisateur: 'superviseur',
      superviseur: { create: { nom: 'Sow', prenom: 'Ibrahima', departement: 'Informatique' } }
    }
  });

  // Valider l'entreprise Tech Dakar
  await prisma.entreprise.update({
    where: { id: entrepriseUser.id },
    data: { estValide: true }
  });

  // Créer offres pour Tech Dakar
  const offres = [
    { titre: 'Developpeur React', typeOffre: 'stage', domaine: 'Informatique', localisation: 'Dakar', niveauRequis: 'licence', modeTravail: 'presentiel', statut: 'publie', description: 'Stage developpement React', dateLimiteCandidature: new Date('2026-06-30') },
    { titre: 'Developpeur Backend Node.js', typeOffre: 'cdi', domaine: 'Informatique', localisation: 'Dakar', niveauRequis: 'master', modeTravail: 'hybride', statut: 'publie', description: 'Poste CDI backend', dateLimiteCandidature: new Date('2026-05-30'), salaireMin: 400000, salaireMax: 700000 },
    { titre: 'Chef de projet IT', typeOffre: 'cdd', domaine: 'Informatique', localisation: 'Dakar', niveauRequis: 'master', modeTravail: 'presentiel', statut: 'publie', description: 'CDD chef de projet', dateLimiteCandidature: new Date('2026-04-30'), salaireMin: 500000, salaireMax: 900000 },
    { titre: 'Designer UX/UI', typeOffre: 'freelance', domaine: 'Design', localisation: 'Dakar', niveauRequis: 'licence', modeTravail: 'teletravail', statut: 'publie', description: 'Mission freelance design', dateLimiteCandidature: new Date('2026-06-01') },
    { titre: 'Data Analyst', typeOffre: 'alternance', domaine: 'Data', localisation: 'Dakar', niveauRequis: 'master', modeTravail: 'hybride', statut: 'publie', description: 'Alternance data analyst', dateLimiteCandidature: new Date('2026-05-15'), salaireMin: 200000, salaireMax: 400000, dureeMois: 12 },
  ];

  for (const o of offres) {
    await prisma.offre.create({
      data: { ...o, entrepriseId: entrepriseUser.id, datePublication: new Date() }
    });
  }
  console.log('5 offres créées');

  // Candidature de Fatou sur première offre
  const premiereOffre = await prisma.offre.findFirst({ where: { entrepriseId: entrepriseUser.id } });
  if (premiereOffre) {
    await prisma.candidature.upsert({
      where: { etudiantId_offreId: { etudiantId: fatou.id, offreId: premiereOffre.id } },
      update: {},
      create: {
        etudiantId: fatou.id,
        offreId: premiereOffre.id,
        lettreMotivation: 'Je suis très motivée par ce poste.',
        cvUrl: '',
        statut: 'soumise'
      }
    });
    console.log('1 candidature créée');
  }

  // Notification pour Fatou
  await prisma.notification.create({
    data: {
      utilisateurId: fatou.id,
      typeNotification: 'offre',
      titre: 'Nouvelle offre disponible',
      message: '5 nouvelles offres correspondent à votre profil.',
      estLue: false
    }
  });

  console.log('Seed terminé !');
}

main().catch(console.error).finally(() => prisma.$disconnect());
