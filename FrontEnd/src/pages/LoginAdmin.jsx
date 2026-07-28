import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { loginUser } from "../api/api"

export default function LoginAdmin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Username & Password wajib diisi")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await loginUser({
        username,
        password,
      })

      if (res.status === "success") {
        localStorage.setItem("user", JSON.stringify(res.data))
        localStorage.setItem("role", res.role)

        if (res.role === "admin") {
          navigate("/adminhome")
        } else if (res.role === "guru") {
          navigate("/guru")
        }

      } else {
        setError(res.message)
      }

    } catch (err) {
      setError("Server error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-black text-white px-4">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 w-full max-w-md"
      >
        <h1 className="text-xl font-bold text-center mb-6 text-cyan-400">
          Login Admin / Guru
        </h1>

        <input
          type="text"
          placeholder="Username / Nama Guru"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-black/50 border border-white/10"
        />

        <input
          type="password"
          placeholder="Password / NUPTK"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-black/50 border border-white/10"
        />

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500"
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </motion.div>
    </div>
  )
}