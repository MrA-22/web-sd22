import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay } from "swiper/modules";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import {
  getGuru,
  getArtikel,
  getLatar,
  getSiswa,
  rekapNilai,
  getIdentitas
} from "../../api/api";

export default function Home() {
  const [artikel, setArtikel] = useState([]);
  const [guru, setGuru] = useState([]);
  const [backgrounds, setBackgrounds] = useState([
    "https://wallpaperaccess.com/full/34325.jpg"
  ]);
  const [currentBg] = useState(0);

  const marqueeTexts = [
    "Selamat datang di SD Negeri 22 Parepare! 🌟",
    "Ikuti semua update terbaru artikel sekolah di sini.",
    "Cek jadwal kegiatan sekolah terbaru setiap minggu.",
    "Baca artikel inspiratif dari guru dan siswa.",
    "Dapatkan informasi penting seputar pendidikan di sini.",
    "Jangan lewatkan berita terbaru tentang prestasi siswa!"
  ];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [text, setText] = useState(marqueeTexts[0]);
  const [chartData, setChartData] = useState([]);
  const [filterKelas, setFilterKelas] = useState("all");
  const [jumlahguru, setJumlahGuru] = useState(0);
  const [ready, setReady] = useState(false);
  const [identitas, setIdentitas] = useState({
    nama_sekolah: "",
    alamat_sekolah: "",
  });


  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setReady(true);
      });
    });
  }, []);


  const filteredData =
    filterKelas === "all"
      ? chartData
      : chartData.filter(d => d.kelas === filterKelas);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Identitas sekolah
        const identitasRes = await getIdentitas();
        setIdentitas({
          nama_sekolah: identitasRes?.nama_sekolah || "",
          alamat_sekolah: identitasRes?.alamat_sekolah || "",
        });

        // 2️⃣ Latar/background
        const latarRes = await getLatar();
        if (Array.isArray(latarRes) && latarRes.length > 0) {
          setBackgrounds(latarRes.map(d => d.url));
        }

        // 3️⃣ Guru
        const guruRes = await getGuru();
        setGuru(Array.isArray(guruRes) ? guruRes : []);

        // 4️⃣ Artikel
        const artikelRes = await getArtikel();
        setArtikel(Array.isArray(artikelRes) ? artikelRes : []);

        // 5️⃣ Siswa & rekap nilai
        const siswaRes = await getSiswa();
        setJumlahGuru(Array.isArray(siswaRes) ? siswaRes.length : 0);

        const chartRes = await rekapNilai();
        const uniqueKelas = {};

        chartRes.forEach((item) => {
          if (!uniqueKelas[item.kelas]) {
            uniqueKelas[item.kelas] = new Set();
          }
          uniqueKelas[item.kelas].add(item.id_siswa);
        });

        const cleanData = Object.keys(uniqueKelas).map((kelas) => ({
          kelas,
          total: uniqueKelas[kelas].size
        }));

        setChartData(cleanData);

        // 6️⃣ Tandai siap render konten
        setReady(true);
      } catch (error) {
        console.error("Gagal fetch data:", error);
      }
    };

    fetchData();
  }, []);

  // MARQUEE TEXT INTERVAL (FIXED)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex(prev => {
        const next = (prev + 1) % marqueeTexts.length;
        setText(marqueeTexts[next]);
        return next;
      });
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Hitung total halaman
  const totalPages = Math.ceil(artikel.length / itemsPerPage);

  // Ambil artikel yang akan ditampilkan sesuai halaman aktif
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArtikel = artikel.slice(indexOfFirstItem, indexOfLastItem);

  // Fungsi navigasi halaman
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  return (
    <div className="font-sans bg-gray-950 text-white min-h-screen">
      {/* HERO */}
      <div className="relative h-[70vh] md:h-[840px] overflow-hidden">
        {/* Background sekolah */}
        <div
          className="absolute inset-0 w-full h-full bg-contain bg-no-repeat bg-center"
          style={{ backgroundImage: `url(${backgrounds[currentBg]})` }}
        ></div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

        {/* Glow */}
        <div className="absolute w-[300px] h-[300px] bg-cyan-500/20 blur-[120px] top-10 left-10"></div>
        <div className="absolute w-[300px] h-[300px] bg-purple-500/20 blur-[120px] bottom-10 right-10"></div>

        {/* Hero Text */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center h-full text-center px-4 pt-10 md:pt-0">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent"
          >
            {identitas.nama_sekolah || "Loading..."}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 w-full text-gray-200"
          >
            {identitas.alamat_sekolah || "Loading alamat..."}
          </motion.p>

          {/* 3. Slider gambar artikel (Swipe hanya untuk artikel) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 w-full overflow-hidden"
        >
          <div className="max-w-2xl mx-auto px-4">
            <Swiper
              modules={[Autoplay]}
              slidesPerView={3}
              spaceBetween={10}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false
              }}
              breakpoints={{
                0: { slidesPerView: 1, spaceBetween: 5 },
                640: { slidesPerView: 1, spaceBetween: 10 },
                768: { slidesPerView: 2, spaceBetween: 10 },
                1024: { slidesPerView: 3, spaceBetween: 10 },
              }}
              className="w-full"
            >
              {artikel.map((a) => (
                <SwiperSlide key={a.id_artikel}>
                  <div className="
                    mx-auto 
                    w-full 
                    max-w-[280px] sm:max-w-full   /* Disesuaikan agar pas di HP */
                    rounded-xl 
                    shadow-lg 
                    border border-white/10 
                    overflow-hidden
                  ">
                    <img
                      src={a.foto_url || "https://via.placeholder.com/300"}
                      alt={a.judul}
                      className="w-full aspect-[16/9] object-cover"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/300")}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Marquee Text */}
            <div className="overflow-hidden whitespace-nowrap mt-4 w-full">
              <motion.div
                key={currentTextIndex}
                animate={{ x: ["100%", "-100%"] }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="inline-block text-white text-sm md:text-lg font-semibold"
              >
                {text}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>

      {/* CONTENT */}
      {/* Ubah grid-cols-1 di HP agar section artikel memanjang penuh (1 kolom), lalu jadi 3 kolom saat di desktop (md) */}
      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 min-w-0">
        
        {/* ARTIKEL */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="col-span-1 md:col-span-2 bg-white/5 backdrop-blur-xl p-4 md:p-6 rounded-3xl border border-white/10 overflow-hidden"
        >
          <h2 className="text-cyan-400 mb-4 uppercase text-sm font-semibold">
            Artikel Sekolah
          </h2>
          
          {
            currentArtikel.length > 0 ? (
              <>
                {currentArtikel.map((a) => (
                  <Link key={a.id_artikel} to={`/artikel/${a.id_artikel}`}>
                    <div className="mb-4 md:mb-6 bg-white/5 p-3 md:p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start gap-4 hover:bg-white/10 transition cursor-pointer">
                      {/* Gambar */}
                      <div className="w-full sm:w-1/3 overflow-hidden rounded-lg">
                        <img
                          src={a.foto_url || "https://via.placeholder.com/300"}
                          alt={a.judul}
                          className="w-full aspect-[16/9] object-cover rounded-lg"
                          onError={(e) => (e.target.src = "https://via.placeholder.com/300")}
                        />
                      </div>

                      {/* Teks */}
                      <div className="w-full sm:w-2/3 flex flex-col min-w-0">
                        <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base truncate">{a.judul}</h3>
                        <p className="text-gray-400 text-xs md:text-sm line-clamp-2">{a.isi.substring(0, 100)}...</p>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* PAGINATION / TOMBOL NAVIGASI */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-4 border-t border-white/10 text-xs md:text-sm">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg border transition ${
                      currentPage === 1
                        ? "border-white/10 text-gray-600 cursor-not-allowed"
                        : "border-white/20 text-white hover:border-cyan-400 hover:text-cyan-400"
                    }`}
                  >
                    ← Previous
                  </button>

                  <span className="text-gray-400 text-center">
                    Hal {currentPage} dari {totalPages || 1}
                  </span>

                  <button
                    onClick={handleNext}
                    disabled={currentPage >= totalPages}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg border transition ${
                      currentPage >= totalPages
                        ? "border-white/10 text-gray-600 cursor-not-allowed"
                        : "border-white/20 text-white hover:border-cyan-400 hover:text-cyan-400"
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-gray-300 text-sm">
                Tidak ada artikel untuk ditampilkan
              </div>
            )
          }
        </motion.div>

        {/* SIDEBAR GURU */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="col-span-1 min-w-0 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10"
        >
          <h2 className="text-purple-400 mb-4 uppercase text-sm">Aparat Sekolah</h2>

          <div className="max-w-6xl mx-auto">
            <Swiper
              modules={[Autoplay]}
              slidesPerView={3}       
              spaceBetween={10}
              loop={true}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false
              }}
              breakpoints={{
                0: { slidesPerView: 1, spaceBetween: 5 },     // HP kecil
                640: { slidesPerView: 2, spaceBetween: 10 },  // HP sedang
                768: { slidesPerView: 2, spaceBetween: 10 },  // Tablet
                1024: { slidesPerView: 3, spaceBetween: 10 }, // Desktop
              }}
              className="w-full"
            >
              {guru.length > 0 ? (
                guru.map((g, i) => (
                  <SwiperSlide key={i}>
                    <div className="mx-auto w-full md:max-w-full bg-white/5 p-3 md:p-4 rounded-xl border border-white/10 hover:scale-105 transition">
                      <div className="w-full aspect-square overflow-hidden rounded-lg mb-2">
                        <img
                          src={g.foto_url || "https://via.placeholder.com/100"}
                          onError={(e) => (e.target.src = "https://via.placeholder.com/100")}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-sm md:text-base truncate">{g.nama_guru || "Tidak ada nama"}</h3>
                      <p className="text-xs md:text-sm text-gray-400 leading-tight">{g.jabatan || "-"}</p>
                      <p className="text-xs md:text-sm text-gray-400 leading-tight">{g.mengajar || "-"}</p>
                    </div>
                  </SwiperSlide>
                ))
              ) : (
                <p className="text-gray-400">Tidak ada guru untuk ditampilkan</p>
              )}
            </Swiper>
          </div>
          {/* CARD JUMLAH GURU */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 
            backdrop-blur-xl p-6 rounded-3xl border border-white/10 mt-6 text-center"
          >
            <h2 className="text-sm uppercase text-gray-300 mb-2">
              Jumlah Guru
            </h2>

            <h1 className="text-4xl font-bold text-white">
              {jumlahguru}
            </h1>

            <p className="text-gray-400 mt-2 text-sm">
              Total Guru aktif saat ini
            </p>
          </motion.div>
        </motion.div>
      </div>
      <div className="p-6 min-w-0">
      {/* CHART JUMLAH SISWA */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 mt-6"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-cyan-400 uppercase text-sm">
                Jumlah Siswa per Kelas
              </h2>

              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="bg-black/40 text-white text-sm px-3 py-1 rounded-lg border border-white/10"
              >
                <option value="all">Semua</option>
                {[...new Set(chartData.map(d => d.kelas))].map((kelas, i) => (
                  <option key={i} value={kelas}>
                    {kelas}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full h-[300px]">
              {ready && filteredData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="kelas" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip
                      contentStyle={{
                        background: "#111",
                        border: "none",
                        borderRadius: "10px"
                      }}
                    />
                    <Bar
                      dataKey="total"
                      fill="url(#colorUv)"
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
      {/* MAP */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 mt-6"
          >
            <h2 className="text-cyan-400 mb-4 uppercase text-sm">Lokasi Sekolah</h2>
            <div className="w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden">
              <iframe
                title="map"
                src="https://www.google.com/maps?q=UPTD+SD+Negeri+22+Parepare&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
    </div>
    </div>
  );
}