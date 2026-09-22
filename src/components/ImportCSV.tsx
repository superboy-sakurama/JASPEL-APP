import React, { useState, useRef } from 'react';
import { Employee, AttendanceImportRow } from '../types/jaspel';
import { parseCSV, downloadCSV } from '../lib/utils';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  ArrowRight,
  Database
} from 'lucide-react';

interface ImportCSVProps {
  employees: Employee[];
  bulan: string;
  tahun: number;
  maxAttendance: number;
  onApplyAttendance: (records: AttendanceImportRow[]) => void;
  onPushToGoogleSheets?: (records: AttendanceImportRow[]) => Promise<void>;
  isSyncingToSheets?: boolean;
}

export const ImportCSV: React.FC<ImportCSVProps> = ({
  employees,
  bulan,
  tahun,
  maxAttendance,
  onApplyAttendance,
  onPushToGoogleSheets,
  isSyncingToSheets = false,
}) => {
  const [parsedRows, setParsedRows] = useState<AttendanceImportRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [matchedCount, setMatchedCount] = useState<number>(0);
  const [isApplied, setIsApplied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Proses parsing file CSV
  const handleFileProcess = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setErrorMsg('Format file harus .csv atau .txt');
      return;
    }

    setFileName(file.name);
    setErrorMsg(null);
    setIsApplied(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rawGrid = parseCSV(text);

        if (rawGrid.length < 2) {
          setErrorMsg('File CSV kosong atau tidak memiliki baris data.');
          return;
        }

        // Header mapping
        const headers = rawGrid[0].map(h => h.trim().toLowerCase());
        const nipIdx = headers.findIndex(h => h.includes('nip'));
        const nameIdx = headers.findIndex(h => h.includes('nama') || h.includes('name'));
        const attIdx = headers.findIndex(
          h => h.includes('kehadiran') || h.includes('hadir') || h.includes('attendance') || h.includes('hari')
        );

        if (attIdx === -1) {
          setErrorMsg('Kolom jumlah kehadiran tidak ditemukan. Pastikan ada kolom "Jumlah_Kehadiran" atau "Kehadiran".');
          return;
        }

        const employeeMapByNip = new Map<string, Employee>();
        const employeeMapByName = new Map<string, Employee>();

        employees.forEach(emp => {
          if (emp.nip && emp.nip !== '-') {
            employeeMapByNip.set(emp.nip.replace(/[^0-9]/g, ''), emp);
          }
          employeeMapByName.set(emp.name.toLowerCase().trim(), emp);
        });

        let matched = 0;
        const parsed: AttendanceImportRow[] = [];

        for (let i = 1; i < rawGrid.length; i++) {
          const row = rawGrid[i];
          if (!row || row.length === 0 || row.every(cell => !cell.trim())) continue;

          const rawNip = nipIdx !== -1 ? (row[nipIdx] || '').trim() : '';
          const rawName = nameIdx !== -1 ? (row[nameIdx] || '').trim() : '';
          const rawAtt = row[attIdx] ? parseInt(row[attIdx].replace(/[^0-9]/g, ''), 10) : 0;
          const cleanAtt = isNaN(rawAtt) ? 0 : rawAtt;

          // Cek kesesuaian dengan master
          const cleanNip = rawNip.replace(/[^0-9]/g, '');
          const match = (cleanNip && employeeMapByNip.get(cleanNip)) ||
                        employeeMapByName.get(rawName.toLowerCase().trim());

          if (match) {
            matched++;
          }

          parsed.push({
            nip: rawNip,
            name: rawName || (match ? match.name : 'Unknown'),
            attendance: cleanAtt,
            bulan,
            tahun,
          });
        }

        setParsedRows(parsed);
        setMatchedCount(matched);
      } catch (err: any) {
        setErrorMsg(`Gagal memproses file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Download Sample Template CSV
  const handleDownloadSample = () => {
    const headers = ['Bulan', 'Tahun', 'NIP', 'Nama', 'Jumlah_Kehadiran'];
    const rows = employees.map(emp => [
      bulan,
      tahun,
      emp.nip,
      emp.name,
      emp.attendance || maxAttendance,
    ]);
    downloadCSV(`Template_Absensi_${bulan}_${tahun}.csv`, headers, rows);
  };

  // Gunakan data absensi contoh bawaan sistem
  const handleUseMockSample = () => {
    const mockRows: AttendanceImportRow[] = employees.map((emp, idx) => ({
      nip: emp.nip,
      name: emp.name,
      attendance: idx === 2 ? 21 : idx === 5 ? 20 : idx === 8 ? 19 : 22,
      bulan,
      tahun,
    }));

    setParsedRows(mockRows);
    setFileName(`Presensi_Otomatis_${bulan}_${tahun}.csv`);
    setMatchedCount(mockRows.length);
    setErrorMsg(null);
    setIsApplied(false);
  };

  const handleApply = () => {
    if (parsedRows.length === 0) return;
    onApplyAttendance(parsedRows);
    setIsApplied(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Guide */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Import Data Absensi / Presensi Pegawai (Zero Data Entry)
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Unggah file rekap absensi dari mesin biometric fingerprint / aplikasi presensi online pemda. 
              Sistem akan memetakan kehadiran secara instan ke Master Pegawai dan menyesuaikan perhitungan Jaspel.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Unduh Template CSV</span>
            </button>

            <button
              onClick={handleUseMockSample}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>Muat Sampel Bulan {bulan}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/50'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileProcess(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-3">
          <UploadCloud className="w-6 h-6 text-slate-700" />
        </div>

        <p className="text-sm font-semibold text-slate-700">
          Klik untuk memilih file CSV atau seret (drag & drop) ke area ini
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Mendukung format kolom: <span className="font-mono text-slate-600">Bulan, Tahun, NIP, Nama, Jumlah_Kehadiran</span>
        </p>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preview Table of Parsed Data */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Pratinjau Data Absensi: {fileName}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Total baris: <span className="font-semibold text-slate-700">{parsedRows.length} data</span> |
                Cocok dengan Master: <span className="font-semibold text-emerald-700">{matchedCount} pegawai</span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleApply}
                disabled={isApplied}
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isApplied
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {isApplied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Kehadiran Sudah Diterapkan</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                    <span>Terapkan ke Kalkulasi Jaspel</span>
                  </>
                )}
              </button>

              {onPushToGoogleSheets && (
                <button
                  onClick={() => onPushToGoogleSheets(parsedRows)}
                  disabled={isSyncingToSheets}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
                >
                  <Database className="w-4 h-4" />
                  <span>{isSyncingToSheets ? 'Menyimpan...' : 'Sinkron Google Sheets'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">NIP</th>
                  <th className="py-2.5 px-3">Nama Pegawai</th>
                  <th className="py-2.5 px-3 text-center">Kehadiran (Hari)</th>
                  <th className="py-2.5 px-3 text-center">Maksimal Standar</th>
                  <th className="py-2.5 px-3 text-center">Status Validasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {parsedRows.map((row, idx) => {
                  const isExceeded = row.attendance > maxAttendance;
                  const isPerfect = row.attendance === maxAttendance;

                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{row.nip || '-'}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">{row.name}</td>
                      <td className="py-2 px-3 text-center font-bold text-slate-800">
                        {row.attendance} Hari
                      </td>
                      <td className="py-2 px-3 text-center text-slate-500">
                        {maxAttendance} Hari
                      </td>
                      <td className="py-2 px-3 text-center">
                        {isExceeded ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Lebih dari {maxAttendance} hari</span>
                          </span>
                        ) : isPerfect ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                            <CheckCircle className="w-3 h-3" />
                            <span>100% Hadir</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                            <span>Hadir Sebagian ({row.attendance}/{maxAttendance})</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
