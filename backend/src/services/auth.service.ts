import { envoyerEmailVerification } from "./email.service";
import crypto from "crypto";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { RegisterDto, LoginDto, AuthResponse, JwtPayload } from '../types/auth.types';
import { randomBytes } from 'crypto';

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET non defini dans .env');
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

function msFromExpires(expires: string): number {
  const match = expires.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const n = Number(match[1]);
  const unit: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * (unit[match[2]] ?? 86400000);
}

function makeTokens(userId: string, email: string, role: string) {
  const payload: JwtPayload = { userId, email, role };
  const accessToken  = jwt.sign(payload,       JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }  as any);
  const refreshToken = jwt.sign({ userId },    JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN } as any);
  return { accessToken, refreshToken };
}

export async function register(dto: RegisterDto): Promise<AuthResponse> {
  const existing = await prisma.utilisateur.findUnique({ where: { email: dto.email } });
  if (existing) throw new Error('Email deja utilise');

  const hash           = await bcrypt.hash(dto.motDePasse, 12);
  const numeroEtudiant = dto.numeroEtudiant || `ETU-${randomBytes(4).toString('hex').toUpperCase()}`;

  let user: any;
  try {
    user = await prisma.utilisateur.create({
      data: {
        email:           dto.email,
        motDePasseHash:  hash,
        typeUtilisateur: dto.typeUtilisateur,
        ...(dto.typeUtilisateur === 'etudiant' && {
          etudiant: {
            create: {
              nom:            dto.nom    || '',
              prenom:         dto.prenom || '',
              numeroEtudiant,
              filiere:        dto.filiere || '',
              niveauEtude:    (dto.niveauEtude?.toLowerCase() as any) || 'licence',
              promotion:      dto.promotion || String(new Date().getFullYear()),
              telephone:      dto.telephone || null,
              situationActuelle: (dto as any).situationActuelle || 'en_cours_etude',
            },
          },
        }),
        ...(dto.typeUtilisateur === 'entreprise' && {
          entreprise: {
            create: {
              nomEntreprise:   dto.nomEntreprise   || '',
              secteurActivite: dto.secteurActivite || '',
              ville:           dto.ville           || null,
              siteWeb:         dto.siteWeb         || null,
            },
          },
        }),
      },
    });
  } catch (e: any) {
    if (e?.code === 'P2002') {
      const field = e?.meta?.target?.[0] || 'champ';
      throw new Error(`Ce ${field} est deja utilise`);
    }
    throw e;
  }

  const { accessToken, refreshToken } = makeTokens(user.id, user.email, user.typeUtilisateur);
  await prisma.refreshToken.create({
    data: {
      token:     refreshToken,
      userId:    user.id,
      expiresAt: new Date(Date.now() + msFromExpires(REFRESH_EXPIRES_IN)),
    },
  });

  const verifToken = crypto.randomBytes(32).toString("hex");
  await prisma.verificationEmail.create({ data: { token: verifToken, utilisateurId: user.id, expiresAt: new Date(Date.now() + 86400000) } });
  await envoyerEmailVerification(user.email, user.email, verifToken).catch(() => {});
  return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.typeUtilisateur } };
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const user = await prisma.utilisateur.findUnique({ where: { email: dto.email } });
  if (!user)          throw new Error('Email ou mot de passe incorrect');
  if (!user.estActif) throw new Error('Compte desactive');

  const valid = await bcrypt.compare(dto.motDePasse, user.motDePasseHash);
  if (!valid) throw new Error('Email ou mot de passe incorrect');

  const { accessToken, refreshToken } = makeTokens(user.id, user.email, user.typeUtilisateur);
  await prisma.refreshToken.create({
    data: {
      token:     refreshToken,
      userId:    user.id,
      expiresAt: new Date(Date.now() + msFromExpires(REFRESH_EXPIRES_IN)),
    },
  });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.typeUtilisateur } };
}

export async function refreshToken(token: string): Promise<{ accessToken: string }> {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await prisma.refreshToken.delete({ where: { token } });
    throw new Error('Refresh token invalide ou expire');
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user    = await prisma.utilisateur.findUnique({ where: { id: decoded.userId } });
    if (!user) throw new Error('Utilisateur introuvable');
    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.typeUtilisateur };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
    return { accessToken };
  } catch {
    throw new Error('Token invalide ou expire');
  }
}

export async function logout(userId: string, token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token, userId } });
}
