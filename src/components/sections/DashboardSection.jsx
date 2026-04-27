import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';

const fmtPct = (n) => n == null ? '—' : `${Number(n).toFixed(2).replace('.', ',')}%`;
const fmtNum = (n) => n == null ? '—' : Number(n).toLocaleString('id-ID');

// Mini horizontal bar for participation
function ParticipationBar({ value, color = '#F97316' }) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
      <div
        className="h-2 rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

// Stat card
function StatCard({ label, value, sub, barValue, barColor }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      {barValue != null && <ParticipationBar value={barValue} color={barColor} />}
    </div>
  );
}

export default function DashboardSection() {
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/election-data?tahun=2024&jenis=Presiden')
      .then(data => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setLatest(data[0]);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Fallback static for when DB is empty
  const d = latest ?? {
    tahun: 2024,
    partisipasi: 81.78,
    suaraTidakSah: 2.49,
    jumlahDPT: 204807222,
    jumlahTPS: 823220,
    jumlahKabKota: 514,
    jumlahProvinsi: 38,
  };

  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold tracking-wider uppercase mb-3">
            Data Pemilu {d.tahun}
          </span>
          <h2 className="text-3xl font-bold text-slate-800">Statistik Partisipasi Pemilih</h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto leading-relaxed text-sm">
            Data resmi pemilu Indonesia dari 1955 hingga {d.tahun}, dikelola langsung oleh tim Sindikasi Pemilu dan Demokrasi.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <StatCard
              label="Tingkat Partisipasi"
              value={fmtPct(d.partisipasi)}
              sub={`Pemilu Presiden ${d.tahun}`}
              barValue={d.partisipasi}
              barColor="#F97316"
            />
          </div>
          <StatCard
            label="Suara Tidak Sah"
            value={fmtPct(d.suaraTidakSah)}
            sub="dari total suara"
            barValue={d.suaraTidakSah}
            barColor="#94a3b8"
          />
          <StatCard
            label="Total DPT"
            value={d.jumlahDPT ? fmtNum(d.jumlahDPT) : '—'}
            sub="pemilih terdaftar"
          />
          <StatCard
            label="Jumlah TPS"
            value={d.jumlahTPS ? fmtNum(d.jumlahTPS) : '—'}
            sub="tempat pemungutan"
          />
          <StatCard
            label="Kab/Kota"
            value={d.jumlahKabKota ?? '—'}
            sub={`di ${d.jumlahProvinsi ?? '—'} provinsi`}
          />
        </div>

        {/* Trend preview — 6 elections bar chart */}
        <TrendBars />

        {/* CTA */}
        <div className="flex justify-center mt-8">
          <Link
            to="/data-pemilu"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Lihat Data Lengkap 1955–{d.tahun}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Simple CSS bar chart — no SVG, no height issues
function TrendBars() {
  const [data, setData] = useState([
    { tahun: 1999, partisipasi: 92.74 },
    { tahun: 2004, partisipasi: 78.23 },
    { tahun: 2009, partisipasi: 71.70 },
    { tahun: 2014, partisipasi: 70.59 },
    { tahun: 2019, partisipasi: 81.97 },
    { tahun: 2024, partisipasi: 81.78 },
  ]);

  useEffect(() => {
    let cancelled = false;
    api('/election-data?jenis=Presiden')
      .then(rows => {
        if (!cancelled && Array.isArray(rows) && rows.length >= 3) {
          const sorted = [...rows]
            .filter(r => r.partisipasi != null)
            .sort((a, b) => a.tahun - b.tahun)
            .slice(-8);
          setData(sorted);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const max = Math.max(...data.map(d => d.partisipasi ?? 0));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Tren Partisipasi Pemilih · Pilpres
      </p>
      <div className="flex items-end gap-3 h-28">
        {data.map((d) => {
          const heightPct = max > 0 ? (d.partisipasi / max) * 100 : 0;
          const isLatest = d.tahun === Math.max(...data.map(x => x.tahun));
          return (
            <div key={d.tahun} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-600">
                {d.partisipasi?.toFixed(1)}%
              </span>
              <div className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: isLatest ? '#F97316' : '#CBD5E1',
                  minHeight: '8px',
                }}
              />
              <span className="text-[10px] text-slate-400">{d.tahun}</span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-400 mt-3 text-right">
        Sumber: KPU RI · Sindikasi Pemilu dan Demokrasi
      </p>
    </div>
  );
}
