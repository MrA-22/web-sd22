import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getArtikel } from "../../api/api";

export default function ArtikelHero() {
  const [artikel, setArtikel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getArtikel()
      .then((data) => {
        setArtikel(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setArtikel([]);
        setLoading(false);
      });
  }, []);

  // 🔎 FILTER SEARCH
  const filteredArtikel = artikel.filter((a) =>
    a.judul.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 pt-24">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
          Semua Artikel
        </h1>

        <p className="text-gray-400 mb-6">
          Kumpulan semua artikel terbaru dari sekolah
        </p>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Cari artikel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:outline-none"
        />
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : filteredArtikel.length > 0 ? (
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArtikel.map((a, i) => (
              <motion.div
                key={a.id_artikel}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/artikel/${a.id_artikel}`}>
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:scale-[1.02] transition cursor-pointer">
                    
                    {/* IMAGE */}
                    <div className="w-full aspect-[16/9] overflow-hidden">
                      <img
                        src={a.foto_url || "https://via.placeholder.com/300"}
                        alt={a.judul}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.target.src = "https://via.placeholder.com/300")
                        }
                      />
                    </div>

                    {/* TEXT */}
                    <div className="p-4">
                      <h2 className="font-bold text-lg mb-2 line-clamp-2">
                        {a.judul}
                      </h2>

                      <p className="text-gray-400 text-sm line-clamp-3">
                        {a.isi?.substring(0, 120)}...
                      </p>

                      <div className="mt-3 text-cyan-400 text-sm">
                        Baca Selengkapnya →
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-center">
            Tidak ada artikel ditemukan
          </div>
        )}
      </div>
    </div>
  );
}