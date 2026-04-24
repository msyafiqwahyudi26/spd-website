import Button from '../ui/Button';
import LineChart, { DEFAULT_DATA, DEFAULT_SERIES } from '../charts/LineChart';

export default function DashboardSection() {
  return (
    <section className="py-16 px-4 bg-slate-50 fade-in-up">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800">Dashboard Data Pemilu</h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto leading-relaxed">
            Visualisasi data pemilu berdasarkan riset dan monitoring yang kami lakukan.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 mb-8">
          <LineChart data={DEFAULT_DATA} series={DEFAULT_SERIES} />
          <p className="text-xs text-slate-400 mt-4 text-center">
            Sumber: Sindikasi Pemilu dan Demokrasi
          </p>
        </div>
        <div className="flex justify-center">
          <Button href="/data-pemilu" variant="primary">
            Akses Dashboard Lengkap
          </Button>
        </div>
      </div>
    </section>
  );
}
