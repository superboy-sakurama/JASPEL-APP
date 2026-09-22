import React, { useState } from 'react';
import { 
  Cloud, 
  Copy, 
  Check, 
  AlertTriangle, 
  Terminal, 
  KeyRound, 
  FileSpreadsheet, 
  ShieldCheck, 
  ExternalLink,
  Code2
} from 'lucide-react';

export const VercelGuideModal: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [rawJsonInput, setRawJsonInput] = useState('');
  const [convertedEmail, setConvertedEmail] = useState('');
  const [convertedKey, setConvertedKey] = useState('');
  const [convertedBase64, setConvertedBase64] = useState('');
  const [convertError, setConvertError] = useState<string | null>(null);

  const copyToClipboard = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Helper converter tool: Pengguna paste JSON Google Cloud -> Otomatis format untuk Vercel
  const handleConvertJson = () => {
    setConvertError(null);
    try {
      if (!rawJsonInput.trim()) {
        setConvertError('Masukkan isi file JSON Service Account terlebih dahulu.');
        return;
      }

      const parsed = JSON.parse(rawJsonInput.trim());
      if (!parsed.client_email || !parsed.private_key) {
        setConvertError('JSON tidak valid. Properti "client_email" atau "private_key" tidak ditemukan.');
        return;
      }

      setConvertedEmail(parsed.client_email);

      // Format private key dengan \n eksplisit yang aman untuk Vercel dashboard
      const formattedKey = parsed.private_key.replace(/\r?\n/g, '\\n');
      setConvertedKey(formattedKey);

      // Format Base64 (100% immune dari masalah newline di Vercel)
      const b64 = Buffer.from(JSON.stringify(parsed)).toString('base64');
      setConvertedBase64(b64);
    } catch (e: any) {
      setConvertError(`Format JSON tidak valid: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Cloud className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">
                Panduan Konfigurasi Production Vercel & Penanganan Safe ENV
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                Vercel Serverless Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Panduan teknis penanganan multiline string RSA private key, pencegahan timeout serverless, 
              serta konfigurasi Environment Variables di Vercel Dashboard agar Google Sheets API berjalan stabil tanpa error.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Tool: Auto-Formatter Kredensial untuk Vercel */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Tool Otomatis: Konversi Service Account JSON ke Format Vercel ENV
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Aman (Diproses di browser/lokal Anda, tidak dikirim ke server luar)
          </span>
        </div>

        <p className="text-xs text-slate-600">
          Paste isi file <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">service-account-credentials.json</span> dari Google Cloud Console ke bawah. Tool ini akan otomatis memformat private key multiline menjadi string aman dan Base64 untuk Vercel:
        </p>

        <div>
          <textarea
            rows={3}
            value={rawJsonInput}
            onChange={(e) => setRawJsonInput(e.target.value)}
            placeholder='{"type": "service_account", "project_id": "...", "private_key": "-----BEGIN PRIVATE KEY-----\\n...", "client_email": "..."}'
            className="w-full text-xs font-mono p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 bg-slate-50"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleConvertJson}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Format Kredensial untuk Vercel
          </button>
          {convertError && (
            <span className="text-xs text-rose-600 font-medium">{convertError}</span>
          )}
        </div>

        {/* Converted Output Values */}
        {convertedEmail && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">
              Hasil Format: Salin langsung ke Vercel Project Settings → Environment Variables
            </h4>

            {/* Field 1: GOOGLE_CLIENT_EMAIL */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-700">GOOGLE_CLIENT_EMAIL</span>
                <button
                  onClick={() => copyToClipboard('client_email', convertedEmail)}
                  className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  {copiedKey === 'client_email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'client_email' ? 'Tersalin!' : 'Salin Nilai'}</span>
                </button>
              </div>
              <input
                readOnly
                value={convertedEmail}
                className="w-full text-xs font-mono px-3 py-1.5 rounded border border-slate-300 bg-white"
              />
            </div>

            {/* Field 2: GOOGLE_PRIVATE_KEY */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-700">GOOGLE_PRIVATE_KEY (Escaped)</span>
                <button
                  onClick={() => copyToClipboard('private_key', convertedKey)}
                  className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  {copiedKey === 'private_key' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'private_key' ? 'Tersalin!' : 'Salin Nilai'}</span>
                </button>
              </div>
              <input
                readOnly
                value={convertedKey}
                className="w-full text-xs font-mono px-3 py-1.5 rounded border border-slate-300 bg-white"
              />
            </div>

            {/* Field 3: Base64 Option */}
            <div className="space-y-1 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-700">GOOGLE_SERVICE_ACCOUNT_BASE64 (Pilihan Alternatif Terbaik)</span>
                <button
                  onClick={() => copyToClipboard('base64', convertedBase64)}
                  className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  {copiedKey === 'base64' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'base64' ? 'Tersalin!' : 'Salin Nilai'}</span>
                </button>
              </div>
              <input
                readOnly
                value={convertedBase64}
                className="w-full text-xs font-mono px-3 py-1.5 rounded border border-slate-300 bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Checklist Table of Environment Variables in Vercel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-slate-600" />
            <span>Daftar Lengkap Environment Variables untuk Dashboard Vercel</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Buka <span className="font-semibold text-slate-700">Vercel Dashboard → Project Anda → Settings → Environment Variables</span>, lalu masukkan variabel berikut:
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-48">Key Environment</th>
                <th className="py-3 px-4 w-24">Status</th>
                <th className="py-3 px-4">Deskripsi & Contoh Format</th>
                <th className="py-3 px-4 w-28 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-800">SPREADSHEET_ID</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Wajib
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">
                  ID unik dari URL Google Sheets (contoh:{' '}
                  <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">
                    1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
                  </span>
                  ).
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => copyToClipboard('key_sheet', 'SPREADSHEET_ID')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
                    title="Salin Key"
                  >
                    {copiedKey === 'key_sheet' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-800">GOOGLE_CLIENT_EMAIL</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Sangat Dianjurkan
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">
                  Email akun layanan Google Cloud (contoh:{' '}
                  <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">
                    jaspel-bot@puskesmas-app.iam.gserviceaccount.com
                  </span>
                  ). <i>Pastikan email ini sudah di-share akses 'Editor' di Google Spreadsheet</i>.
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => copyToClipboard('key_email', 'GOOGLE_CLIENT_EMAIL')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
                    title="Salin Key"
                  >
                    {copiedKey === 'key_email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-800">GOOGLE_PRIVATE_KEY</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Sangat Dianjurkan
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">
                  Kunci RSA private key. Pada dashboard Vercel, pastikan karakter newline tetap tersimpan sebagai{' '}
                  <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">\n</span> atau gunakan helper fungsi{' '}
                  <span className="font-mono text-indigo-700">normalizePrivateKey()</span> kami.
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => copyToClipboard('key_priv', 'GOOGLE_PRIVATE_KEY')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
                    title="Salin Key"
                  >
                    {copiedKey === 'key_priv' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-800">GOOGLE_SERVICE_ACCOUNT_BASE64</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    Alternatif Terbaik
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">
                  Seluruh isi file JSON yang di-encode Base64 dalam satu baris. Cara ini 100% tahan banting dari error corrupt akibat tanda petik atau enter di dashboard Vercel.
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => copyToClipboard('key_b64', 'GOOGLE_SERVICE_ACCOUNT_BASE64')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
                    title="Salin Key"
                  >
                    {copiedKey === 'key_b64' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Serverless Functions Optimization Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800">
              1. Pencegahan Error Private Key Multiline
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Di Node.js/Next.js Vercel, string private key sering terpotong atau escape sequence <code className="font-mono text-slate-800">\n</code> dibaca sebagai 2 karakter literal ('\' dan 'n'). 
            Kode fungsi kami menanganinya secara defensif:
          </p>
          <pre className="text-[11px] font-mono bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto">
{`export function normalizePrivateKey(key: string): string {
  if (!key) return '';
  let clean = key.trim();
  if (clean.startsWith('"') && clean.endsWith('"')) {
    clean = clean.slice(1, -1);
  }
  return clean.replace(/\\\\n/g, '\\n');
}`}
          </pre>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-sky-600" />
            <h4 className="text-xs font-bold text-slate-800">
              2. Mencegah Timeout & Memory Leak di Vercel
            </h4>
          </div>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
            <li>
              <span className="font-semibold text-slate-800">Singleton Client:</span> Klien <code className="font-mono">google.sheets</code> di-cache agar instance TCP socket di-reuse antar invokasi serverless.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Runtime Node.js:</span> Wajib menggunakan <code className="font-mono text-indigo-700">export const runtime = 'nodejs'</code> (bukan Edge) karena Google APIs membutuhkan crypto Node.js.
            </li>
            <li>
              <span className="font-semibold text-slate-800">maxDuration:</span> Tambahkan <code className="font-mono text-indigo-700">export const maxDuration = 30</code> pada route handler Next.js.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
