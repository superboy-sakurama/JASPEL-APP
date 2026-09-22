import React, { useState } from 'react';
import { Code, Copy, Check, FileCode, FolderTree, ExternalLink } from 'lucide-react';

const NEXTJS_FILES: Record<string, { path: string; desc: string; code: string }> = {
  'api-sheets': {
    path: 'app/api/sheets/route.ts',
    desc: 'Next.js App Router Route Handler (Serverless Function) untuk Google Sheets Proxy (GET/POST)',
    code: `import { NextRequest, NextResponse } from 'next/server';
import { 
  testGoogleSheetsConnection, 
  getSheetData, 
  appendSheetData, 
  initializeSpreadsheetTabs,
  saveHasilPerhitunganToSheets,
  savePeriodeKapitasiToSheets
} from '@/services/googleSheets';

// Wajib Node.js runtime untuk Google APIs library
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 detik batas waktu serverless

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'test';

    if (action === 'test') {
      const testResult = await testGoogleSheetsConnection();
      return NextResponse.json(testResult);
    }

    if (action === 'get') {
      const range = searchParams.get('range') || 'Master_Karyawan!A:K';
      const rows = await getSheetData(range);
      return NextResponse.json({ success: true, values: rows });
    }

    return NextResponse.json({ error: 'Action tidak dikenal' }, { status: 400 });
  } catch (err: any) {
    console.error('Google Sheets API Route Error:', err);
    return NextResponse.json(
      { 
        success: false, 
        error: err.message || 'Gagal berinteraksi dengan Google Sheets API' 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, bulan, tahun, results, setup, range, values } = body;

    if (action === 'init-tabs') {
      const initResult = await initializeSpreadsheetTabs();
      return NextResponse.json({ success: true, ...initResult });
    }

    if (action === 'save-results') {
      await saveHasilPerhitunganToSheets(bulan, tahun, results);
      return NextResponse.json({ success: true, message: 'Hasil Jaspel berhasil disimpan ke Google Sheets' });
    }

    if (action === 'save-setup') {
      await savePeriodeKapitasiToSheets(setup);
      return NextResponse.json({ success: true, message: 'Konfigurasi kapitasi tersimpan ke Google Sheets' });
    }

    if (action === 'append' && range && values) {
      await appendSheetData(range, values);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Payload aksi tidak valid' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
`,
  },

  'api-calculate': {
    path: 'app/api/calculate/route.ts',
    desc: 'Route Handler kalkulasi Jaspel & Largest Remainder Method di sisi server',
    code: `import { NextRequest, NextResponse } from 'next/server';
import { calculateJaspel } from '@/lib/calculateJaspel';
import { Employee } from '@/types/jaspel';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employees, totalAlokasi } = body as {
      employees: Employee[];
      totalAlokasi: number;
    };

    if (!employees || !totalAlokasi) {
      return NextResponse.json(
        { error: 'employees array dan totalAlokasi wajib disertakan' },
        { status: 400 }
      );
    }

    // Eksekusi engine balancing
    const result = calculateJaspel(employees, totalAlokasi);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
`,
  },

  'google-auth': {
    path: 'lib/google-auth.ts',
    desc: 'Kredensial parser dengan safe regex multiline & singleton memory leak preventer',
    code: `import { google } from 'googleapis';

export function normalizePrivateKey(key: string): string {
  if (!key) return '';
  let normalized = key.trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.substring(1, normalized.length - 1);
  }
  return normalized.replace(/\\\\n/g, '\\n');
}

export function parseGoogleCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
    const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    return {
      client_email: parsed.client_email,
      private_key: normalizePrivateKey(parsed.private_key),
    };
  }

  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      client_email: process.env.GOOGLE_CLIENT_EMAIL.trim(),
      private_key: normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY),
    };
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    return {
      client_email: parsed.client_email,
      private_key: normalizePrivateKey(parsed.private_key),
    };
  }

  throw new Error('Kredensial Service Account belum disetel di ENV Vercel.');
}

let cachedAuth: any = null;

export function getGoogleAuthClient() {
  if (cachedAuth) return cachedAuth;
  const creds = parseGoogleCredentials();
  cachedAuth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return cachedAuth;
}
`,
  },

  'env-local': {
    path: '.env.local',
    desc: 'Template Environment Variables untuk file .env.local di Next.js lokal',
    code: `# ID Google Spreadsheet
SPREADSHEET_ID="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"

# Kredensial Service Account (Pilih salah satu)
GOOGLE_CLIENT_EMAIL="jaspel-bot@puskesmas-project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n"

# Atau Base64:
# GOOGLE_SERVICE_ACCOUNT_BASE64="eyd0eXBlJzogJ3NlcnZpY2VfYWNjb3VudCcsIC..."
`,
  },
};

export const NextJsCodeExport: React.FC = () => {
  const [selectedFileKey, setSelectedFileKey] = useState<string>('api-sheets');
  const [copied, setCopied] = useState(false);

  const current = NEXTJS_FILES[selectedFileKey];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FolderTree className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-800">
                Arsitektur Next.js App Router (Siap Di-Deploy ke Vercel)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              File-file di bawah ini siap Anda salin ke proyek Next.js Anda jika ingin mendeploy langsung ke Vercel dengan arsitektur App Router resmi.
            </p>
          </div>
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-4 min-h-[520px]">
        {/* Sidebar File List */}
        <div className="border-r border-slate-200 bg-slate-50 p-3 space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-400 px-2 py-1 block">
            Daftar File Next.js
          </span>

          {Object.entries(NEXTJS_FILES).map(([key, item]) => {
            const isSelected = selectedFileKey === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedFileKey(key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.path}</span>
              </button>
            );
          })}
        </div>

        {/* Main Code Preview Area */}
        <div className="md:col-span-3 flex flex-col bg-slate-900 text-slate-100">
          {/* Top file title bar */}
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400">{current.path}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">{current.desc}</p>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
          </div>

          {/* Code content */}
          <pre className="p-5 font-mono text-xs overflow-auto flex-1 leading-relaxed text-slate-300">
            {current.code}
          </pre>
        </div>
      </div>
    </div>
  );
};
