import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function envoyerEmailVerification(
  email: string,
  prenom: string,
  token: string
): Promise<void> {
  const lien = `${process.env.APP_URL}/verifier-email?token=${token}`;
  await transporter.sendMail({
    from: `"UNCHK Plateforme" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: "Confirmez votre adresse email - UNCHK",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#16a34a;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">Universite UNCHK</h1>
          <p style="color:#dcfce7;margin:4px 0 0;font-size:14px;">Plateforme de suivi d insertion professionnelle</p>
        </div>
        <div style="background:#f9fafb;padding:32px;border:1px solid #e5e7eb;">
          <h2 style="color:#111827;margin-top:0;">Bonjour ${prenom} !</h2>
          <p style="color:#374151;line-height:1.7;">
            Merci de vous etre inscrit(e). Cliquez sur le bouton ci-dessous pour activer votre compte :
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${lien}"
               style="background:#16a34a;color:white;padding:14px 36px;border-radius:8px;
                      text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
              Confirmer mon adresse email
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px;">Ce lien expire dans <strong>24 heures</strong>.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
          <p style="color:#9ca3af;font-size:12px;">
            Lien direct : <a href="${lien}" style="color:#16a34a;">${lien}</a>
          </p>
        </div>
        <div style="background:#f3f4f6;padding:16px;border-radius:0 0 8px 8px;text-align:center;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">2026 Universite Numerique Cheikh Hamidou Kane</p>
        </div>
      </div>
    `,
  });
}
