export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RegisterDto {
  email: string;
  motDePasse: string;
  typeUtilisateur: 'etudiant' | 'diplome' | 'entreprise' | 'admin' | 'superviseur';
  nom?: string;
  prenom?: string;
  numeroEtudiant?: string;
  filiere?: string;
  niveauEtude?: string;
  promotion?: string;
  telephone?: string;
  situationActuelle?: 'en_cours_etude' | 'en_stage' | 'sous_contrat_cdi' | 'sous_contrat_cdd' | 'sous_contrat_stage' | 'freelance' | 'entrepreneur' | 'en_formation_continue' | 'en_recherche_emploi' | 'expatrie' | 'sans_activite';
  nomEntreprise?: string;
  secteurActivite?: string;
  ville?: string;
  siteWeb?: string;
}

export interface LoginDto {
  email: string;
  motDePasse: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}
