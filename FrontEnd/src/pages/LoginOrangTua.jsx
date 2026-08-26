import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { loginUser } from "../api/api" // 🔥 import ini

export default function LoginOrangTua() {
    const [nisn, setNisn] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleLogin = async () => {
        if (!nisn) {
            setError("NISN wajib diisi")
            return
        }

        const res = await loginUser({
            username: nisn,
            password: ""
        })

        // 👀 Cek lewat F12 Console browser, apa isi asli dari res ini?
        console.log("RESPONSE LOGIN:", res);

        // Terkadang struktur dari backend tidak persis "res.status === 'success'", 
        // melainkan hanya mengecek apakah datanya ada.
        if (res && res.data) {
            localStorage.setItem("siswa", JSON.stringify(res.data))
            navigate("/orangtua", { replace: true })
        } else {
            setError(res.message || "NISN tidak ditemukan")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">

            {/* Glow */}
            <div className="absolute w-[400px] h-[400px] bg-cyan-500/20 blur-[140px] top-10 left-10"></div>
            <div className="absolute w-[400px] h-[400px] bg-purple-500/20 blur-[140px] bottom-10 right-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 w-full max-w-md"
            >
                <h1 className="text-2xl font-bold text-center mb-6 text-cyan-400">
                    Login Orang Tua
                </h1>

                <input
                    type="text"
                    placeholder="Masukkan NISN"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="w-full p-3 rounded-lg bg-black/50 border border-white/10 mb-4"
                />

                {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

                <button
                    onClick={handleLogin}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500"
                >
                    Login
                </button>
            </motion.div>
        </div>
    )
}