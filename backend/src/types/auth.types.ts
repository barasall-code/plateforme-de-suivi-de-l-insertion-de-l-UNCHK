export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RegisterDto {
  email: string;
  motDePasse: string;
  typeUtilisateur: 'etudiant' | 'entreprise' | 'admin' | 'superviseur';
  nom?: string;
  prenom?: string;
  numeroEtudiant?: string;
  nomEntreprise?: string;
  secteurActivite?: string;
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
