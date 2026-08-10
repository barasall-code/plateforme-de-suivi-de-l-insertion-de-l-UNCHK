/**
 * Script de préparation des données de démo — à exécuter depuis backend/
 * Usage : node prepare-demo.js
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const TEST_ACCOUNTS = [
  'etudianttest@unchk.edu.sn',
  'diplome@test.sn',
  'rh@sentech.sn',
  'admin@unchk.sn',
  'superviseur1@unchk.sn',
];

async function main() {
  console.log('=== 1. Verification / mise a jour des mots de passe ===');
  const hash = await bcrypt.hash('1234567890', 12);
  for (const email of TEST_ACCOUNTS) {
    const u = await prisma.utilisateur.findUnique({ where: { email } });
    if (!u) {
      console.log(`  ATTENTION: ${email} n'existe pas en base - ignore.`);
      continue;
    }
    await prisma.utilisateur.update({ where: { email }, data: { motDePasseHash: hash } });
    console.log(`  OK  ${email} (role: ${u.typeUtilisateur})`);
  }

  console.log('\n=== 2. Offre au statut "soumis" (En attente de validation admin) ===');
  const entreprise = await prisma.utilisateur.findUnique({
    where: { email: 'rh@sentech.sn' },
    include: { entreprise: true },
  });
  if (!entreprise || !entreprise.entreprise) {
    console.log('  ATTENTION: rh@sentech.sn introuvable ou sans profil entreprise - etape ignoree.');
  } else {
    let offreEnAttente = await prisma.offre.findFirst({
      where: { entrepriseId: entreprise.entreprise.id, statut: 'soumis' },
    });
    if (offreEnAttente) {
      console.log(`  Deja presente : "${offreEnAttente.titre}" (id: ${offreEnAttente.id})`);
    } else {
      offreEnAttente = await prisma.offre.create({
        data: {
          titre: 'Développeur Backend Node.js — Démo',
          description: "Offre créée pour la démonstration vidéo de soutenance : illustre le workflow de validation d'une offre par l'administrateur avant publication.",
          typeOffre: 'cdi',
          domaine: 'Informatique',
          niveauRequis: 'licence',
          localisation: 'Dakar',
          salaireMin: 400000,
          salaireMax: 550000,
          dateLimiteCandidature: new Date('2026-12-31'),
          statut: 'soumis',
          modeTravail: 'presentiel',
          entrepriseId: entreprise.entreprise.id,
        },
      });
      console.log(`  CREEE : "${offreEnAttente.titre}" (id: ${offreEnAttente.id})`);
    }
  }

  console.log('\n=== 3. Candidature au statut "soumise" ===');
  const etudiant = await prisma.utilisateur.findUnique({
    where: { email: 'etudianttest@unchk.edu.sn' },
    include: { etudiant: true },
  });
  if (!etudiant || !etudiant.etudiant) {
    console.log('  ATTENTION: etudianttest@unchk.edu.sn introuvable ou sans profil etudiant - etape ignoree.');
  } else {
    const offrePubliee = await prisma.offre.findFirst({ where: { statut: 'publie' } });
    if (!offrePubliee) {
      console.log('  ATTENTION: aucune offre au statut "publie" trouvee - impossible de creer la candidature.');
    } else {
      let candidature = await prisma.candidature.findFirst({
        where: { etudiantId: etudiant.etudiant.id, offreId: offrePubliee.id },
      });
      if (candidature) {
        console.log(`  Deja presente : candidature sur "${offrePubliee.titre}" (statut: ${candidature.statut})`);
      } else {
        candidature = await prisma.candidature.create({
          data: {
            etudiantId: etudiant.etudiant.id,
            offreId: offrePubliee.id,
            statut: 'soumise',
            lettreMotivation: "Candidature créée pour la démonstration vidéo de soutenance — motivée par l'opportunité de rejoindre une équipe technique dynamique.",
            cvUrl: 'https://example.com/cv-demo-etudiant.pdf',
          },
        });
        console.log(`  CREEE : candidature sur "${offrePubliee.titre}" (statut: soumise)`);
      }
    }
  }

  console.log('\n=== 4. Message deja envoye (etudiant <-> entreprise) ===');
  if (!etudiant?.etudiant || !entreprise?.entreprise) {
    console.log('  ATTENTION: etudiant ou entreprise manquant - etape ignoree.');
  } else {
    let conversation = await prisma.conversation.findUnique({
      where: {
        etudiantId_entrepriseId: {
          etudiantId: etudiant.etudiant.id,
          entrepriseId: entreprise.entreprise.id,
        },
      },
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { etudiantId: etudiant.etudiant.id, entrepriseId: entreprise.entreprise.id },
      });
      console.log(`  Conversation creee (id: ${conversation.id})`);
    } else {
      console.log(`  Conversation deja existante (id: ${conversation.id})`);
    }

    const existingMessage = await prisma.message.findFirst({
      where: { conversationId: conversation.id },
    });
    if (existingMessage) {
      console.log(`  Message deja present : "${existingMessage.contenu.slice(0, 60)}..."`);
    } else {
      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          expediteurId: etudiant.id,
          contenu: "Bonjour, je me permets de vous recontacter suite à ma candidature. Je reste disponible pour un entretien à votre convenance.",
        },
      });
      console.log(`  CREE : "${message.contenu.slice(0, 60)}..."`);
    }
  }

  console.log('\n=== TERMINE ===');
  console.log('Comptes prets (mot de passe : 1234567890) :');
  TEST_ACCOUNTS.forEach((e) => console.log(`  - ${e}`));
}

main()
  .catch((e) => { console.error('ERREUR:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
