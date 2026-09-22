import { google } from 'googleapis';

/**
 * Utility Fungsi Parsing Kredensial Google Service Account yang Aman untuk Vercel Serverless
 *
 * Masalah umum di Vercel:
 * Nilai `private_key` memiliki escape sequence `\n` yang seringkali tidak diinterpretasikan
 * sebagai newline asli oleh lingkungan runtime Vercel, menyebabkan error:
 * "error:0909006C:PEM routines:get_name:no start line" atau "DECODER routines:unsupported".
 *
 * Fungsi ini menangani 3 strategi parsing:
 * 1. Base64 Encoded JSON (Paling aman untuk CI/CD & Vercel Dashboard)
 * 2. Raw JSON string dengan auto-normalization regex
 * 3. Variabel terpisah (GOOGLE_CLIENT_EMAIL & GOOGLE_PRIVATE_KEY)
 */

export interface GoogleServiceAccountCredentials {
  client_email: string;
  private_key: string;
  project_id?: string;
}

export function parseGoogleCredentials(): GoogleServiceAccountCredentials | null {
  // Strategi 1: Base64 Encoded JSON string
  const base64Json = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
  if (base64Json && base64Json.trim() !== '') {
    try {
      const decodedStr = Buffer.from(base64Json.trim(), 'base64').toString('utf8');
      const parsed = JSON.parse(decodedStr);
      if (parsed.client_email && parsed.private_key) {
        return {
          client_email: parsed.client_email,
          private_key: normalizePrivateKey(parsed.private_key),
          project_id: parsed.project_id,
        };
      }
    } catch (err) {
      console.warn('Gagal mem-parsing GOOGLE_SERVICE_ACCOUNT_BASE64:', err);
    }
  }

  // Strategi 2: Full JSON string
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (rawJson && rawJson.trim() !== '') {
    try {
      // Hilangkan kutip ganda pembungkus jika ada yang memasukkan di ENV Vercel
      let cleaned = rawJson.trim();
      if ((cleaned.startsWith("'") && cleaned.endsWith("'")) ||
          (cleaned.startsWith('"') && cleaned.endsWith('"') && cleaned.includes('{'))) {
        cleaned = cleaned.slice(1, -1);
      }
      const parsed = JSON.parse(cleaned);
      if (parsed.client_email && parsed.private_key) {
        return {
          client_email: parsed.client_email,
          private_key: normalizePrivateKey(parsed.private_key),
          project_id: parsed.project_id,
        };
      }
    } catch (err) {
      console.warn('Gagal mem-parsing GOOGLE_SERVICE_ACCOUNT_JSON:', err);
    }
  }

  // Strategi 3: Individual Environment Variables (Vercel Friendly)
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (clientEmail && privateKey) {
    return {
      client_email: clientEmail.trim(),
      private_key: normalizePrivateKey(privateKey),
      project_id: process.env.GOOGLE_PROJECT_ID,
    };
  }

  return null;
}

/**
 * Normalisasi Private Key RSA:
 * Mengubah literal "\n" string menjadi actual newline character (\n)
 * Menghapus kutipan pembungkus yang tidak sengaja terbawa saat copy-paste di Vercel
 */
export function normalizePrivateKey(key: string): string {
  if (!key) return '';

  let normalized = key.trim();

  // Bersihkan kutipan awal dan akhir jika dimasukkan manual di Vercel
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.substring(1, normalized.length - 1);
  }

  // Ganti literal \n dan \\n menjadi newline sesungguhnya
  normalized = normalized.replace(/\\n/g, '\n');

  // Pastikan header dan footer PEM berposisi benar
  if (!normalized.includes('-----BEGIN PRIVATE KEY-----')) {
    normalized = `-----BEGIN PRIVATE KEY-----\n${normalized}\n-----END PRIVATE KEY-----`;
  }

  return normalized;
}

/**
 * Singleton Auth Client untuk mencegah memory leak di Vercel Serverless Function
 */
let cachedAuth: any = null;

export function getGoogleAuthClient() {
  if (cachedAuth) {
    return cachedAuth;
  }

  const credentials = parseGoogleCredentials();
  if (!credentials) {
    throw new Error(
      'Kredensial Google Service Account tidak ditemukan di Environment Variables. ' +
      'Silakan setel GOOGLE_CLIENT_EMAIL & GOOGLE_PRIVATE_KEY atau GOOGLE_SERVICE_ACCOUNT_JSON / BASE64.'
    );
  }

  cachedAuth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return cachedAuth;
}
