import MEDIA from '../config/media';

// Fallback data for the /publications API. `image` comes from the central
// MEDIA registry — dashboard-uploaded images on real records will win via
// the API payload.
export const INITIAL_PUBLIKASI = [
  {
    id: 1,
    slug: 'mendorong-mekanisme-kandidasi-yang-demokratis',
    category: 'RISET SINGKAT',
    categoryColor: 'text-orange-500',
    image: MEDIA.collage[4].src,
    title: 'Mendorong Mekanisme Kandidasi yang Demokratis',
    description:
      'Kajian terhadap praktik pencalonan internal partai politik di Indonesia menunjukkan dominasi elite pengurus pusat yang melemahkan prinsip demokrasi internal dan membuka ruang transaksional dalam seleksi kandidat.',
    author: 'Tim Riset SPD',
    readTime: '8 menit baca',
    date: '15 Maret 2024',
    href: '/publikasi/mendorong-mekanisme-kandidasi-yang-demokratis',
    fullContent: [
      {
        type: 'lead',
        text: 'Demokrasi yang sehat tidak hanya diukur dari kualitas pemilu, tetapi juga dari bagaimana partai politik menjalankan proses seleksi kandidat secara internal. Di Indonesia, mekanisme kandidasi masih didominasi oleh elite pengurus pusat partai—sebuah pola yang bertentangan dengan semangat reformasi politik 1998.',
      },
      {
        type: 'heading',
        text: 'Oligarki di Balik Daftar Calon',
      },
      {
        type: 'paragraph',
        text: 'Berdasarkan kajian SPD terhadap 18 partai peserta Pemilu 2024, lebih dari 73 persen partai tidak memiliki mekanisme formal yang memberi suara kepada anggota dalam menentukan calon legislatif. Daftar calon (DCT) ditentukan melalui keputusan sepihak Dewan Pimpinan Pusat, tanpa proses demokratis yang dapat diverifikasi oleh Komisi Pemilihan Umum maupun publik.',
      },
      {
        type: 'paragraph',
        text: 'Kondisi ini menciptakan insentif struktural bagi praktik politik uang pada tahap pencalonan—jauh sebelum hari pemungutan suara. Calon yang tidak memiliki kedekatan dengan elite partai terpaksa melakukan transaksi finansial untuk mendapatkan nomor urut strategis. Temuan ini konsisten dengan laporan Bawaslu yang mencatat peningkatan aduan terkait mahar politik pada setiap siklus pemilu.',
      },
      {
        type: 'heading',
        text: 'Perbandingan dengan Praktik Internasional',
      },
      {
        type: 'paragraph',
        text: 'Sejumlah negara demokrasi telah mengembangkan model kandidasi internal yang lebih inklusif. Amerika Serikat menerapkan sistem primary terbuka yang memungkinkan pemilih terdaftar berpartisipasi langsung dalam seleksi kandidat partai. Jerman mengharuskan partai menyelenggarakan konvensi keanggotaan sebelum mengajukan daftar calon ke otoritas pemilu. Belanda bahkan mensyaratkan laporan mekanisme kandidasi sebagai bagian dari kewajiban administratif partai kepada negara.',
      },
      {
        type: 'paragraph',
        text: 'Di kawasan Asia Tenggara, Taiwan telah menerapkan sistem combined primary sejak 2008, yang menggabungkan survei opini publik dengan suara keanggotaan partai untuk menentukan kandidat. Pendekatan ini terbukti meningkatkan legitimasi kandidat sekaligus mengurangi ketergantungan pada patron finansial dalam proses seleksi.',
      },
      {
        type: 'heading',
        text: 'Rekomendasi Kebijakan',
      },
      {
        type: 'paragraph',
        text: 'SPD merekomendasikan agar KPU menerbitkan regulasi yang mewajibkan partai politik melampirkan dokumentasi proses seleksi internal sebagai syarat pendaftaran calon. Dokumentasi tersebut mencakup bukti pelibatan keanggotaan, notulensi rapat seleksi, dan tidak adanya syarat finansial yang tidak transparan. Regulasi serupa perlu didukung oleh Bawaslu melalui mekanisme pengawasan aktif terhadap laporan pelanggaran kandidasi.',
      },
      {
        type: 'paragraph',
        text: 'Dalam jangka panjang, reformasi sistemik terhadap Undang-Undang Partai Politik perlu menempatkan standar minimum demokrasi internal sebagai syarat akreditasi dan penerimaan bantuan keuangan negara. Tanpa tekanan regulatoris yang nyata, partai tidak memiliki insentif untuk membuka proses kandidasi kepada anggota dan konstituen yang lebih luas.',
      },
    ],
  },
  {
    id: 2,
    slug: 'selamat-datang-otokrasi',
    category: 'RISET',
    categoryColor: 'text-teal-500',
    image: MEDIA.collage[3].src,
    title: 'Selamat Datang Otokrasi: Pemilu, Kekuasaan dan Kemunduran Demokrasi',
    description:
      'Analisis terhadap trajektori demokrasi Indonesia pasca-Reformasi mengidentifikasi pola kemunduran demokratis yang dimanifestasikan melalui melemahnya institusi penyelenggara pemilu dan menguatnya kendali elite atas proses elektoral.',
    author: 'Erik Kurniawan',
    readTime: '11 menit baca',
    date: '10 Maret 2024',
    href: '/publikasi/selamat-datang-otokrasi',
    fullContent: [
      {
        type: 'lead',
        text: 'Dua puluh enam tahun setelah jatuhnya Orde Baru, Indonesia menghadapi paradoks demokrasi yang semakin dalam: pemilu tetap digelar secara reguler, partisipasi pemilih relatif tinggi, namun kualitas demokrasi substantif terus mengalami degradasi yang terukur.',
      },
      {
        type: 'heading',
        text: 'Demokrasi Prosedural tanpa Substansi',
      },
      {
        type: 'paragraph',
        text: 'Indeks demokrasi berbagai lembaga internasional secara konsisten mencatat penurunan skor Indonesia sepanjang dekade terakhir. Freedom House menurunkan status Indonesia dari "Bebas" menjadi "Bebas Sebagian" pada 2021. V-Dem Institute mengklasifikasikan Indonesia sebagai "electoral autocracy" dalam laporan 2023-nya—sebuah kategori yang menggambarkan negara yang mempertahankan prosedur pemilu namun dengan kebebasan sipil dan politik yang terkikis.',
      },
      {
        type: 'paragraph',
        text: 'Yang paling mengkhawatirkan bukan sekedar penurunan angka indeks, melainkan mekanisme di baliknya. Kemunduran demokrasi di Indonesia tidak datang melalui kudeta militer atau penghapusan pemilu secara formal. Ia datang secara perlahan melalui akumulasi keputusan yang masing-masing terlihat dapat dibenarkan, namun secara kolektif membentuk arsitektur kendali elit atas proses politik.',
      },
      {
        type: 'heading',
        text: 'Melemahnya Institusi Penyelenggara',
      },
      {
        type: 'paragraph',
        text: 'Komisi Pemilihan Umum (KPU) dan Badan Pengawas Pemilu (Bawaslu) dirancang sebagai lembaga independen yang menjadi tulang punggung integritas pemilu. Namun proses seleksi komisioner kedua lembaga tersebut semakin menunjukkan jejak intervensi politik. Sejumlah komisioner terpilih memiliki rekam jejak afiliasi dengan partai politik tertentu, menimbulkan pertanyaan serius tentang kapasitas mereka untuk bertindak imparsial.',
      },
      {
        type: 'paragraph',
        text: 'Pada Pemilu 2024, sejumlah keputusan administratif KPU—termasuk perubahan regulasi teknis di saat-saat terakhir—menuai kritik dari pengamat dan peserta pemilu. Bawaslu di berbagai daerah dilaporkan lambat menindaklanjuti aduan pelanggaran kampanye yang melibatkan petahana, sementara aduan dari kelompok oposisi diproses dengan kecepatan berbeda.',
      },
      {
        type: 'heading',
        text: 'Jalan Menuju Pemulihan',
      },
      {
        type: 'paragraph',
        text: 'Kemunduran demokrasi bukan proses yang irreversibel. Sejarah menunjukkan bahwa masyarakat sipil yang kuat, pers yang independen, dan oposisi yang terorganisasi mampu menjadi daya lawan efektif terhadap drift otokratis. Tantangan bagi Indonesia adalah membangun kembali kepercayaan publik terhadap institusi penyelenggara melalui reformasi seleksi pimpinan yang lebih transparan dan akuntabel.',
      },
      {
        type: 'paragraph',
        text: 'SPD mendorong penguatan peran masyarakat sipil dalam pemantauan pemilu, tidak hanya pada hari pemungutan suara, tetapi sepanjang siklus elektoral—mulai dari tahap pendaftaran calon, kampanye, hingga proses rekapitulasi suara. Transparansi data dan keterlibatan publik adalah antidot paling efektif terhadap konsolidasi kekuasaan yang menggerogoti demokrasi dari dalam.',
      },
    ],
  },
  {
    id: 3,
    slug: 'memperkuat-integritas-pemilu-di-era-digital',
    category: 'OPINI',
    categoryColor: 'text-slate-400',
    image: MEDIA.collage[6].src,
    title: 'Memperkuat Integritas Pemilu di Era Digital',
    description:
      'Ancaman disinformasi, manipulasi algoritmik, dan kerentanan sistem teknologi pemilu menjadi tantangan baru yang membutuhkan respons regulatoris dan kelembagaan yang adaptif dari penyelenggara pemilu Indonesia.',
    author: 'Aqidatul Izza Zain',
    readTime: '7 menit baca',
    date: '5 Maret 2024',
    href: '/publikasi/memperkuat-integritas-pemilu-di-era-digital',
    fullContent: [
      {
        type: 'lead',
        text: 'Pemilu 2024 adalah pemilu paling digital dalam sejarah Indonesia. Lebih dari 185 juta pemilih terdaftar, sebagian besar dari mereka aktif di media sosial, menjadikan ruang digital sebagai arena pertarungan politik yang sama pentingnya dengan lapangan kampanye.',
      },
      {
        type: 'heading',
        text: 'Ekosistem Disinformasi yang Melembaga',
      },
      {
        type: 'paragraph',
        text: 'Pemantauan SPD terhadap peredaran konten di platform digital selama masa kampanye 2024 mengidentifikasi lebih dari 4.200 konten yang mengandung narasi menyesatkan terkait pemilu. Dari jumlah tersebut, sekitar 38 persen berhasil diverifikasi sebagai disinformasi terkoordinasi—konten yang disebarkan secara simultan oleh jaringan akun dengan pola aktivitas tidak organik.',
      },
      {
        type: 'paragraph',
        text: 'Salah satu tren paling mengkhawatirkan adalah penggunaan teknologi deepfake untuk menciptakan konten audiovisual palsu yang menampilkan kandidat mengucapkan pernyataan yang tidak pernah mereka buat. Teknologi yang semakin mudah diakses ini menuntut literasi visual yang jauh melampaui kapasitas rata-rata pemilih untuk mendeteksi keaslian konten.',
      },
      {
        type: 'heading',
        text: 'Kerentanan Sistem Teknologi Pemilu',
      },
      {
        type: 'paragraph',
        text: 'Sistem Informasi Rekapitulasi (SIREKAP) yang digunakan KPU mengalami sejumlah gangguan teknis yang memicu spekulasi publik luas. Terlepas dari apakah gangguan tersebut bersifat teknis murni atau bukan, ketidakmampuan komunikasi KPU dalam menjelaskan secara transpada setiap anomali menciptakan ruang kosong yang dengan cepat diisi oleh narasi konspirasi.',
      },
      {
        type: 'paragraph',
        text: 'Pengalaman sejumlah negara menunjukkan bahwa keterbukaan proaktif tentang keterbatasan sistem teknologi justru meningkatkan kepercayaan publik. Estonia, yang telah menerapkan pemungutan suara elektronik sejak 2005, secara rutin mempublikasikan laporan keamanan sistem dan membuka kode sumber perangkat lunak pemilu untuk audit independen. Transparansi teknis semacam ini perlu diadopsi KPU dalam setiap implementasi sistem digital.',
      },
      {
        type: 'heading',
        text: 'Kerangka Regulasi yang Adaptif',
      },
      {
        type: 'paragraph',
        text: 'Regulasi kampanye digital Indonesia masih berjarak jauh dari tantangan yang dihadapi. Bawaslu memiliki mandat pengawasan media sosial tetapi kapasitas teknis dan sumber daya manusianya tidak sebanding dengan volume konten yang perlu dipantau. Kewajiban platform untuk melabeli konten politik berbayar, yang lazim di Uni Eropa, belum ada padanannya di Indonesia.',
      },
      {
        type: 'paragraph',
        text: 'SPD merekomendasikan pembentukan satuan tugas pemilu digital lintas lembaga yang melibatkan KPU, Bawaslu, Kominfo, dan perwakilan masyarakat sipil. Satuan tugas ini perlu memiliki kewenangan untuk mewajibkan platform digital melaksanakan disclosure iklan politik, merespons permintaan takedown konten disinformasi elektoral dalam tenggat waktu yang ditetapkan, serta menyediakan data pemantauan untuk audit independen.',
      },
    ],
  },
  {
    id: 4,
    slug: 'partisipasi-pemilih-muda-pemilu-2024',
    category: 'ANALISIS',
    categoryColor: 'text-blue-500',
    image: MEDIA.collage[8].src,
    title: 'Partisipasi Pemilih Muda di Pemilu 2024: Peluang dan Tantangan',
    description:
      'Dengan 107 juta pemilih berusia di bawah 40 tahun, Pemilu 2024 menjadi ujian penting bagi integrasi generasi baru ke dalam proses demokrasi elektoral Indonesia.',
    author: 'M. Adnan Maghribbi',
    readTime: '9 menit baca',
    date: '28 Februari 2024',
    href: '/publikasi/partisipasi-pemilih-muda-pemilu-2024',
    fullContent: [
      {
        type: 'lead',
        text: 'Pemilu 2024 mencatat tonggak historis: untuk pertama kalinya dalam sejarah Indonesia, mayoritas pemilih dalam Daftar Pemilih Tetap (DPT) adalah generasi milenial dan Gen Z. Dari total 204,8 juta pemilih terdaftar, sekitar 52 persen berusia di bawah 40 tahun—sebuah pergeseran demografis yang memiliki implikasi mendalam bagi masa depan demokrasi Indonesia.',
      },
      {
        type: 'heading',
        text: 'Profil Pemilih Muda Indonesia',
      },
      {
        type: 'paragraph',
        text: 'Survei pra-pemilu yang dilakukan SPD bekerja sama dengan tiga universitas menunjukkan bahwa pemilih muda Indonesia memiliki tingkat kesadaran politik yang lebih tinggi dibanding generasi sebelumnya pada usia yang sama. Namun kesadaran ini tidak linear dengan kepercayaan kepada institusi. Hanya 34 persen responden berusia 17-25 tahun menyatakan "sangat percaya" kepada KPU, dibandingkan 51 persen pada kelompok usia 40-55 tahun.',
      },
      {
        type: 'paragraph',
        text: 'Temuan ini mencerminkan dikotomi yang kompleks: pemilih muda lebih melek informasi, namun justru karena itu lebih skeptis terhadap proses. Mereka mengonsumsi konten politik dari beragam sumber—termasuk konten kritis yang mengangkat isu kecurangan dan manipulasi—yang membentuk persepsi bahwa suara mereka mungkin tidak benar-benar berpengaruh.',
      },
      {
        type: 'heading',
        text: 'Hambatan Struktural Partisipasi',
      },
      {
        type: 'paragraph',
        text: 'Di luar faktor psikologis, terdapat hambatan struktural yang secara tidak proporsional mempengaruhi pemilih muda. Mobilitas tinggi kelompok ini—berpindah kota untuk studi atau kerja—membuat pemilih mudah tidak terdaftar di tempat domisili aktual mereka. Data KPU menunjukkan bahwa sekitar 12 juta pemilih terdaftar menggunakan hak pilih di luar domisili asli melalui mekanisme pindah memilih, dan diperkirakan jumlah yang tidak berhasil mengurus administrasi ini jauh lebih besar.',
      },
      {
        type: 'paragraph',
        text: 'Selain itu, desain surat suara yang kompleks—terutama untuk pemilihan legislatif dengan ratusan nama kandidat—terbukti menjadi hambatan tersendiri. Penelitian perilaku pemilih menunjukkan korelasi negatif antara kompleksitas surat suara dan kepercayaan diri pemilih pemula, yang berujung pada tingginya angka suara tidak sah pada kelompok usia ini.',
      },
      {
        type: 'heading',
        text: 'Peluang dan Agenda ke Depan',
      },
      {
        type: 'paragraph',
        text: 'Di sisi lain, Pemilu 2024 juga menampilkan momentum positif. Gerakan pemilih muda yang terorganisir melalui platform digital berhasil memobilisasi ribuan relawan pemantau TPS dari kalangan mahasiswa—kontribusi nyata pada pengawasan pemilu akar rumput yang belum pernah terjadi pada skala ini sebelumnya.',
      },
      {
        type: 'paragraph',
        text: 'SPD merekomendasikan tiga agenda prioritas untuk memperkuat partisipasi pemilih muda pada siklus pemilu berikutnya: pertama, penguatan sistem pemutakhiran data pemilih berbasis domisili aktual yang terintegrasi dengan data kependudukan secara real-time; kedua, perluasan mekanisme pindah memilih secara digital yang dapat dilakukan tanpa kehadiran fisik di kantor kependudukan; dan ketiga, pengembangan program pendidikan pemilih yang dirancang spesifik untuk pemilih pemula yang menggunakan format dan saluran komunikasi yang relevan dengan konsumsi media generasi ini.',
      },
    ],
  },
];
