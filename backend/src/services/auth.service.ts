import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { RegisterDto, LoginDto, AuthResponse, JwtPayload } from '../types/auth.types';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30m';
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export async function register(dto: RegisterDto): Promise<AuthResponse> {
  const existing = await prisma.utilisateur.findUnique({ where: { email: dto.email } });
  if (existing) throw new Error('Email deja utilise');
  const hash = await bcrypt.hash(dto.motDePasse, 12);
  const user = await prisma.utilisateur.create({
    data: {
      email: dto.email,
      motDePasseHash: hash,
      typeUtilisateur: dto.typeUtilisateur,
      ...(dto.typeUtilisateur === 'etudiant' && {
        etudiant: {
          create: {
            nom: dto.nom || '',
            prenom: dto.prenom || '',
            numeroEtudiant: dto.numeroEtudiant || 'ETU-' + Date.now(),
            filiere: '',
            niveauEtude: 'licence',
            promotion: String(new Date().getFullYear()),
          }
        }
      }),
      ...(dto.typeUtilisateur === 'entreprise' && {
        entreprise: {
          create: {
            nomEntreprise: dto.nomEntreprise || '',
            secteurActivite: dto.secteurActivite || '',
          }
        }
      }),
    }
  });
  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.typeUtilisateur };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
  const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN } as any);
  return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.typeUtilisateur } };
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const user = await prisma.utilisateur.findUnique({ where: { email: dto.email } });
  if (!user) throw new Error('Email ou mot de passe incorrect');
  if (!user.estActif) throw new Error('Compte desactive');
  const valid = await bcrypt.compare(dto.motDePasse, user.motDePasseHash);
  if (!valid) throw new Error('Email ou mot de passe incorrect');
  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.typeUtilisateur };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
  const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN } as any);
  return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.typeUtilisateur } };
}

export async function refreshToken(token: string): Promise<{ accessToken: string }> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.utilisateur.findUnique({ where: { id: decoded.userId } });
    if (!user) throw new Error('Utilisateur introuvable');
    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.typeUtilisateur };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
    return { accessToken };
  } catch {
    throw new Error('Token invalide ou expire');
  }
}