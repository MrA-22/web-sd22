import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { getSiswa, rekapNilai } from "../api/api"

export default function OrangTua() {
  const [siswa, setSiswa] = useState(null)
  const [nilai, setNilai] = useState([])
  const [rataRata, setRataRata] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const navigate = useNavigate()

  // ================= PROTEKSI & FETCH SISWA =================
  useEffect(() => {
    const data = localStorage.getItem("siswa")

    if (!data) {
      // Jika tidak ada data sesi login, lempar kembali ke halaman login
      navigate("/login-orangtua", { replace: true })
      return
    }

    setSiswa(JSON.parse(data))
    setLoading(false)
  }, [navigate])
  
  // ================= FETCH NILAI =================
  useEffect(() => {
    if (!siswa) return

    const loadNilai = async () => {
      try {
        const res = await rekapNilai()

        if (Array.isArray(res)) {
          const filtered = res.filter(
            (n) => n.id_siswa === siswa.id_siswa
          )

          setNilai(filtered)

          const total = filtered.reduce(
            (sum, item) => sum + Number(item.nilai || 0),
            0
          )

          const rata =
            filtered.length > 0 ? total / filtered.length : 0

          setRataRata(rata.toFixed(2))
        }
      } catch (err) {
        console.error("Gagal ambil nilai:", err)
      }
    }

    loadNilai()
  }, [siswa])

  // ================= CURSOR EFFECT =================
  useEffect(() => {
    const move = (e) =>
      setMouse({ x: e.clientX, y: e.clientY })

    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [])

  // ================= UTIL =================
  const getGradeColor = (nilai) => {
    if (nilai >= 85) return "text-green-400"
    if (nilai >= 70) return "text-cyan-400"
    if (nilai >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getStatus = () => {
    return rataRata >= 75
      ? { text: "🟢 Baik", color: "text-green-400" }
      : { text: "🟡 Perlu peningkatan", color: "text-yellow-400" }
  }

  // ================= UI =================
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden px-6 py-16">

      {/* Cursor Glow */}
      <div
        className="pointer-events-none fixed w-72 h-72 rounded-full blur-3xl opacity-25 bg-cyan-400 transition"
        style={{ left: mouse.x - 150, top: mouse.y - 150 }}
      />

      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[140px] top-10 left-10" />
      <div className="absolute w-[400px] h-[400px] bg-purple-500/10 blur-[140px] bottom-10 right-10" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl mt-12 md:text-4xl font-semibold">
          Dashboard Orang Tua
        </h1>
        <div className="w-16 h-1 bg-cyan-400 mx-auto mt-3 rounded-full" />
        <p className="text-gray-400 mt-3 text-sm">
          Pantau perkembangan dan hasil belajar anak Anda
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto">

        {/* LOADING */}
        {loading && (
          <div className="text-center text-gray-400 animate-pulse">
            🔄 Memuat data...
          </div>
        )}

        {/* DATA */}
        {!loading && siswa && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl"
          >

            {/* PROFILE */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img
                src={siswa?.foto_url || "https://via.placeholder.com/150"}
                alt={siswa?.nama_siswa}
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/150")
                }
                className="w-28 h-28 rounded-full object-cover border-4 border-cyan-400 shadow-[0_0_25px_#22d3ee]"
              />

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold">
                  {siswa.nama_siswa}
                </h2>
                <p className="text-gray-400 text-sm">
                  NISN: {siswa.nisn}
                </p>

                <div className="mt-2 text-sm text-gray-300 space-y-1">
                  <p>Kelas: {siswa.kelas?.nama_kelas || siswa.id_kelas?.nama_kelas || "Tidak ada kelas"}</p>
                  <p>Alamat: {siswa.alamat}</p>
                  <p>No HP Ortu: {siswa.nohp_ortu}</p>
                </div>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                <p className="text-gray-400 text-sm">
                  Rata-rata Nilai
                </p>
                <p className="text-3xl font-bold text-cyan-400">
                  {rataRata}
                </p>
              </div>

              <div className="col-span-2 bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">
                  Status Akademik
                </p>
                <p className={`text-lg ${getStatus().color}`}>
                  {getStatus().text}
                </p>
              </div>
            </div>

            {/* NILAI */}
            <div className="mt-8">
              <h3 className="text-cyan-400 text-sm uppercase mb-3">
                Nilai Semester
              </h3>

              {nilai.length > 0 ? (
                <div className="space-y-2">
                  {nilai.map((n) => (
                    <motion.div
                      key={`${n.id_siswa}-${n.mata_pelajaran}`}
                      whileHover={{ scale: 1.02 }}
                      className="flex justify-between items-center bg-white/5 hover:bg-white/10 transition px-4 py-3 rounded-xl border border-white/10"
                    >
                      <span className="text-gray-300">
                        {n.mata_pelajaran}
                      </span>

                      <span
                        className={`font-bold ${getGradeColor(n.nilai)}`}
                      >
                        {n.nilai}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">
                  Belum ada nilai tersedia
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* EMPTY */}
        {!loading && !siswa && (
          <p className="text-center text-gray-400">
            Data tidak ditemukan / belum login
          </p>
        )}
      </div>
    </div>
  )
}