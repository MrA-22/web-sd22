import { useEffect, useState } from "react"
import AdminSidebar from "../layout/AdminSidebar"
import { jadwalHariIni } from "../../api/api"
import { motion } from "framer-motion"
import { HiOutlineCalendar, HiOutlineAcademicCap } from "react-icons/hi"

export default function GuruHome() {
  const [jadwal, setJadwal] = useState([])
  const [loading, setLoading] = useState(true)

  const user = JSON.parse(localStorage.getItem("user"))

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      const res = await jadwalHariIni()

      const filtered = res.data.filter(
        (j) => j.mengajar === user?.mengajar
      )

      setJadwal(filtered)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const formatTanggal = (tgl) => {
    if (!tgl) return "-"
    return new Date(tgl).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="flex bg-[#050505] min-h-screen text-white">

      <AdminSidebar />

      <div className="ml-0 md:ml-64 w-full p-6 relative">

        {/* BACKGROUND */}
        <div className="absolute w-[400px] h-[400px] bg-cyan-500/10 blur-[140px] top-0 left-0" />
        <div className="absolute w-[400px] h-[400px] bg-purple-500/10 blur-[140px] bottom-0 right-0" />

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mb-6"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Dashboard Guru
          </h1>
          <p className="text-gray-400 text-sm">
            Halo,{" "}
            <span className="text-white font-semibold">
              {user?.nama_guru}
            </span>
          </p>
        </motion.div>

        {/* GRID */}
        <div className="grid lg:grid-cols-2 gap-6 relative z-10">

          {/* ================= PROFIL ================= */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-lg text-center"
          >
            {/* AVATAR BESAR */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative mx-auto w-44 h-44"
            >
              {/* GLOW */}
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-2xl" />

              {/* FOTO */}
              <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-cyan-400 shadow-[0_0_60px_rgba(34,211,238,0.6)]">
                {user?.foto_url ? (
                  <img
                    src={user.foto_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Img
                  </div>
                )}
              </div>

              {/* BADGE ONLINE */}
              <span className="absolute bottom-3 right-3 w-4 h-4 bg-green-400 rounded-full border-2 border-black animate-pulse"></span>
            </motion.div>

            {/* NAMA */}
            <h2 className="text-xl font-bold mt-4">
              {user?.nama_guru}
            </h2>

            <p className="text-cyan-400 text-sm">
              {user?.mengajar}
            </p>

            <p className="text-gray-400 text-xs mt-1">
              NUPTK: {user?.nuptk}
            </p>

            {/* BADGE */}
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                Active
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {user?.jabatan}
              </span>
            </div>

            {/* DETAIL */}
            <div className="mt-6 space-y-2 text-sm">
              <Row label="Tanggal Lahir" value={formatTanggal(user?.tgll_guru)} />
              <Row label="No HP" value={user?.nohp_guru} />
              <Row label="Alamat" value={user?.alamat_guru} />
            </div>
          </motion.div>

          {/* ================= JADWAL ================= */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg"
          >
            <h2 className="text-lg font-semibold mb-4 text-cyan-400 flex items-center gap-2">
              <HiOutlineCalendar />
              Jadwal Hari Ini
            </h2>

            {loading ? (
              <p className="text-gray-400 text-sm animate-pulse">
                Mengambil jadwal...
              </p>
            ) : jadwal.length === 0 ? (
              <p className="text-gray-400 text-sm">
                🚀 Tidak ada jadwal hari ini
              </p>
            ) : (
              <div className="space-y-3">
                {jadwal.map((j, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.03 }}
                    className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-400 transition"
                  >
                    <p className="font-semibold flex items-center gap-2">
                      <HiOutlineAcademicCap />
                      {j.mapel}
                    </p>

                    <div className="text-sm text-gray-400 mt-2">
                      <p>📚 {j.nama_kelas}</p>
                      <p>⏰ {j.jam}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  )
}

/* ROW */
function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-white/10 pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-right max-w-[60%]">
        {value || "-"}
      </span>
    </div>
  )
}