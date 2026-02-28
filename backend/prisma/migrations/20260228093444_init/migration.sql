-- CreateEnum
CREATE TYPE "TypeUtilisateur" AS ENUM ('etudiant', 'entreprise', 'admin', 'superviseur');

-- CreateEnum
CREATE TYPE "NiveauEtude" AS ENUM ('licence', 'master', 'doctorat');

-- CreateEnum
CREATE TYPE "TypeOffre" AS ENUM ('stage', 'alternance', 'cdi', 'cdd', 'freelance');

-- CreateEnum
CREATE TYPE "ModeTravail" AS ENUM ('presentiel', 'teletravail', 'hybride');

-- CreateEnum
CREATE TYPE "StatutOffre" AS ENUM ('brouillon', 'soumis', 'valide', 'publie', 'ferme');

-- CreateEnum
CREATE TYPE "StatutCandidature" AS ENUM ('soumise', 'vue', 'entretien', 'acceptee', 'refusee');

-- CreateEnum
CREATE TYPE "TypeStatutProfessionnel" AS ENUM ('en_emploi', 'en_recherche', 'en_formation', 'autre');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('offre', 'candidature', 'statut', 'rappel', 'systeme');

-- CreateEnum
CREATE TYPE "CategorieCompetence" AS ENUM ('technique', 'transversale', 'linguistique');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "typeUtilisateur" "TypeUtilisateur" NOT NULL,
    "estActif" BOOLEAN NOT NULL DEFAULT true,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateModification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etudiants" (
    "id" TEXT NOT NULL,
    "numeroEtudiant" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3),
    "telephone" TEXT,
    "filiere" TEXT NOT NULL,
    "niveauEtude" "NiveauEtude" NOT NULL,
    "promotion" TEXT NOT NULL,
    "dateDiplome" TIMESTAMP(3),
    "pourcentageProfilComplet" INTEGER NOT NULL DEFAULT 0,
    "cvUrl" TEXT,
    "photoUrl" TEXT,
    "linkedinUrl" TEXT,

    CONSTRAINT "etudiants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entreprises" (
    "id" TEXT NOT NULL,
    "nomEntreprise" TEXT NOT NULL,
    "siret" TEXT,
    "secteurActivite" TEXT NOT NULL,
    "tailleEntreprise" TEXT,
    "siteWeb" TEXT,
    "ville" TEXT,
    "pays" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "estValide" BOOLEAN NOT NULL DEFAULT false,
    "dateValidation" TIMESTAMP(3),

    CONSTRAINT "entreprises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "departement" TEXT,
    "permission" TEXT,
    "dateNommination" TIMESTAMP(3),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "superviseurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "departement" TEXT,
    "telephone" TEXT,

    CONSTRAINT "superviseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offres" (
    "id" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "typeOffre" "TypeOffre" NOT NULL,
    "domaine" TEXT NOT NULL,
    "niveauRequis" "NiveauEtude" NOT NULL,
    "dureeMois" INTEGER,
    "salaireMin" DECIMAL(65,30),
    "salaireMax" DECIMAL(65,30),
    "localisation" TEXT NOT NULL,
    "modeTravail" "ModeTravail" NOT NULL DEFAULT 'presentiel',
    "competencesRequises" JSONB,
    "dateLimiteCandidature" TIMESTAMP(3) NOT NULL,
    "statut" "StatutOffre" NOT NULL DEFAULT 'brouillon',
    "nombrePostes" INTEGER NOT NULL DEFAULT 1,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datePublication" TIMESTAMP(3),
    "dateFermeture" TIMESTAMP(3),

    CONSTRAINT "offres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidatures" (
    "id" TEXT NOT NULL,
    "etudiantId" TEXT NOT NULL,
    "offreId" TEXT NOT NULL,
    "lettreMotivation" TEXT NOT NULL,
    "cvUrl" TEXT NOT NULL,
    "documentsComplementaires" JSONB,
    "statut" "StatutCandidature" NOT NULL DEFAULT 'soumise',
    "dateCandidature" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDerniereModification" TIMESTAMP(3) NOT NULL,
    "commentaireEntreprise" TEXT,
    "noteEvaluation" INTEGER,

    CONSTRAINT "candidatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statuts_professionnels" (
    "id" TEXT NOT NULL,
    "etudiantId" TEXT NOT NULL,
    "typeStatut" "TypeStatutProfessionnel" NOT NULL,
    "nomEntreprise" TEXT,
    "poste" TEXT,
    "typeContrat" TEXT,
    "salaireBrutAnnuel" DECIMAL(65,30),
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "secteurActivite" TEXT,
    "ville" TEXT,
    "pays" TEXT,
    "justificatifUrl" TEXT,
    "estValide" BOOLEAN NOT NULL DEFAULT false,
    "idValidateur" TEXT,
    "dateDeclaration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateValidation" TIMESTAMP(3),

    CONSTRAINT "statuts_professionnels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competences" (
    "id" TEXT NOT NULL,
    "nomCompetence" TEXT NOT NULL,
    "categorie" "CategorieCompetence" NOT NULL,
    "description" TEXT,

    CONSTRAINT "competences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etudiant_competences" (
    "etudiantId" TEXT NOT NULL,
    "competenceId" TEXT NOT NULL,
    "niveauMaitrise" TEXT NOT NULL,
    "dateAcquisition" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etudiant_competences_pkey" PRIMARY KEY ("etudiantId","competenceId")
);

-- CreateTable
CREATE TABLE "offre_competences" (
    "offreId" TEXT NOT NULL,
    "competenceId" TEXT NOT NULL,
    "niveauRequis" TEXT NOT NULL,
    "estObligatoire" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "offre_competences_pkey" PRIMARY KEY ("offreId","competenceId")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "typeNotification" "TypeNotification" NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lienAction" TEXT,
    "estLue" BOOLEAN NOT NULL DEFAULT false,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historique_statuts_candidatures" (
    "id" TEXT NOT NULL,
    "candidatureId" TEXT NOT NULL,
    "ancienStatut" TEXT NOT NULL,
    "nouveauStatut" TEXT NOT NULL,
    "modificateurId" TEXT NOT NULL,
    "commentaire" TEXT,
    "dateModification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historique_statuts_candidatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervisions" (
    "superviseurId" TEXT NOT NULL,
    "etudiantId" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estActif" BOOLEAN NOT NULL DEFAULT true,
    "commentaire" TEXT,

    CONSTRAINT "supervisions_pkey" PRIMARY KEY ("superviseurId","etudiantId")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "etudiants_numeroEtudiant_key" ON "etudiants"("numeroEtudiant");

-- CreateIndex
CREATE UNIQUE INDEX "entreprises_siret_key" ON "entreprises"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "candidatures_etudiantId_offreId_key" ON "candidatures"("etudiantId", "offreId");

-- CreateIndex
CREATE UNIQUE INDEX "competences_nomCompetence_key" ON "competences"("nomCompetence");

-- AddForeignKey
ALTER TABLE "etudiants" ADD CONSTRAINT "etudiants_id_fkey" FOREIGN KEY ("id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entreprises" ADD CONSTRAINT "entreprises_id_fkey" FOREIGN KEY ("id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_id_fkey" FOREIGN KEY ("id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "superviseurs" ADD CONSTRAINT "superviseurs_id_fkey" FOREIGN KEY ("id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offres" ADD CONSTRAINT "offres_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "etudiants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "offres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statuts_professionnels" ADD CONSTRAINT "statuts_professionnels_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "etudiants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiant_competences" ADD CONSTRAINT "etudiant_competences_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "etudiants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiant_competences" ADD CONSTRAINT "etudiant_competences_competenceId_fkey" FOREIGN KEY ("competenceId") REFERENCES "competences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offre_competences" ADD CONSTRAINT "offre_competences_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "offres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offre_competences" ADD CONSTRAINT "offre_competences_competenceId_fkey" FOREIGN KEY ("competenceId") REFERENCES "competences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique_statuts_candidatures" ADD CONSTRAINT "historique_statuts_candidatures_candidatureId_fkey" FOREIGN KEY ("candidatureId") REFERENCES "candidatures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique_statuts_candidatures" ADD CONSTRAINT "historique_statuts_candidatures_modificateurId_fkey" FOREIGN KEY ("modificateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisions" ADD CONSTRAINT "supervisions_superviseurId_fkey" FOREIGN KEY ("superviseurId") REFERENCES "superviseurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisions" ADD CONSTRAINT "supervisions_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "etudiants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
