import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getArtikelById } from "../api/api";

export default function DetailArtikel() {
  const { id } = useParams();
  const [artikel, setArtikel] = useState(null);

  useEffect(() => {
    getArtikelById(id)
      .then((res) => setArtikel(res))
      .catch(() => setArtikel(null));
  }, [id]);

  if (!artikel) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950">
        <p className="animate-pulse text-lg">Loading artikel...</p>
      </div>
    );
  }

  const words = artikel.isi?.split(" ").length || 0;
  const readingTime = Math.ceil(words / 200);

  return (
    <div className="bg-gray-950 text-white min-h-screen font-sans pt-24">

      {/* ================= HERO ================= */}
      <div className="mx-auto px-20">

        <div className="relative h-[620px] md:h-[620px] rounded-3xl overflow-hidden flex items-center justify-center bg-black">

          {/* BLUR BACKGROUND (BIAR GA KOSONG) */}
          <img
            src={artikel.foto_url || "https://via.placeholder.com/800"}
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-30"
          />

          {/* IMAGE UTAMA (GA KE POTONG) */}
          <img
            src={artikel.foto_url || "https://via.placeholder.com/800"}
            alt={artikel.judul}
            className="relative z-10 max-h-full max-w-full object-contain"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* TEXT */}
          <div className="absolute bottom-6 left-6 right-6 z-20">

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-4xl font-extrabold leading-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent"
            >
              {artikel.judul}
            </motion.h1>

            <div className="mt-3 text-sm text-gray-300 flex flex-wrap gap-2 items-center">
              <span>✍ {artikel.penulis || "Admin"}</span>
              <span>•</span>
              <span>
                {artikel.tanggal_upload
                  ? new Date(artikel.tanggal_upload).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </span>
              <span>•</span>
              <span>{readingTime} menit baca</span>
            </div>

          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px- mt-3">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-lg"
        >

          {/* AUTHOR */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold">
              {artikel.penulis?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-sm text-gray-400">Ditulis oleh</p>
              <p className="text-white font-semibold">
                {artikel.penulis || "Admin Sekolah"}
              </p>
            </div>
          </div>

          {/* ISI ARTIKEL */}
          <div className="space-y-6 text-gray-300 leading-relaxed text-[16px] md:text-[17px]">
            {artikel.isi?.split("\n").map((p, i) => (
              <p key={i} className="hover:text-white transition duration-300">
                {p}
              </p>
            ))}
          </div>

        </motion.div>

        {/* BACK BUTTON */}
        <div className="mt-10 text-center">
          <a
            href="/"
            className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:scale-105 transition"
          >
            ← Kembali ke Beranda
          </a>
        </div>

      </div>
    </div>
  );
}