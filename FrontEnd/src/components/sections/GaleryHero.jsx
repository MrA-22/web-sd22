import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getArtikel } from "../../api/api";

export default function GaleryHero() {
  const [artikel, setArtikel] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-950 text-white p-3 pt-24 md:p-6 md:pt-28">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10 md:mb-6">
        <h1 className="text-3xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
          Gallery Artikel
        </h1>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : artikel.length > 0 ? (
          
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {artikel.map((a, i) => (
              <motion.div
                key={a.id_artikel}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
              >
                <Link to={`/artikel/${a.id_artikel}`}>
                  <div className="overflow-hidden rounded-lg border border-white/10 hover:scale-105 transition cursor-pointer">
                    
                    <img
                      src={a.foto_url || "https://via.placeholder.com/300"}
                      alt={a.judul}
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/300")
                      }
                      className="w-full h-full object-cover aspect-square"
                    />

                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

        ) : (
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
            Tidak ada gambar artikel
          </div>
        )}
      </div>
    </div>
  );
}