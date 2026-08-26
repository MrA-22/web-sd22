import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import AdminSidebar from "../layout/AdminSidebar"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { jadwalHariIni as fetchJadwalHariIni, getIdentitas, getDashboard } from "../../api/api";
import AdminLayout from "../layout/AdminLayout";

export default function AdminHero() {
    const [mouse, setMouse] = useState({ x: 0, y: 0 })
    const [identitas, setIdentitas] = useState(null);
    const [jadwalHariIniData, setJadwalHariIniData] = useState([]);

    useEffect(() => {
        const loadJadwal = async () => {
            try {
                const res = await fetchJadwalHariIni();
                setJadwalHariIniData(res.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        loadJadwal();
    }, []);

    const getHariSekarang = () => {
        const hariMap = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const today = new Date().getDay();
        return hariMap[today];
    };

    const jadwalHariIniSorted = Array.isArray(jadwalHariIniData)
        ? [...jadwalHariIniData].sort((a, b) =>
            (a.jam_mulai || "").localeCompare(b.jam_mulai || "")
        )
        : [];

    useEffect(() => {
        const loadIdentitas = async () => {
            try {
                const res = await getIdentitas()  // pakai fungsi dari api.js
                setIdentitas(res)
            } catch (err) {
                console.error(err)
            }
        }
        loadIdentitas()
    }, [])
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const res = await getDashboard()  // buat fungsi baru di api.js
                if (!res?.data) return
                setStats({
                    siswa: Number(res.data.total_siswa) || 0,
                    guru: Number(res.data.total_guru) || 0,
                    kelas: Number(res.data.total_kelas) || 0,
                    mapel: Number(res.data.total_mapel) || 0,
                })
            } catch (err) {
                console.error(err)
            }
        }
        loadDashboard()
    }, [])
    const [stats, setStats] = useState({
        siswa: 0,
        guru: 0,
        kelas: 0,
        mapel: 0,
    })

    // CURSOR
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMouse({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    // FETCH
    useEffect(() => {
        let isMounted = true

        const loadDashboard = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/dashboard")
                const json = await res.json()

                if (!json?.data) return

                if (isMounted) {
                    setStats({
                        siswa: Number(json.data.total_siswa) || 0,
                        guru: Number(json.data.total_guru) || 0,
                        kelas: Number(json.data.total_kelas) || 0,
                        mapel: Number(json.data.total_mapel) || 0,
                    })
                }
            } catch (err) {
                console.error(err)
            }
        }

        loadDashboard()

        return () => {
            isMounted = false
        }
    }, [])

    const chartData = [
        { name: "Siswa", total: stats.siswa },
        { name: "Guru", total: stats.guru },
        { name: "Kelas", total: stats.kelas },
        { name: "Mapel", total: stats.mapel },
    ];
    return (
        <AdminLayout>
            <div className="min-h-screen flex bg-black text-white">

                {/* GLOW BACKGROUND */}
                <div
                    className="pointer-events-none fixed w-80 h-80 rounded-full blur-3xl opacity-30 bg-cyan-400"
                    style={{
                        left: mouse.x - 150,
                        top: mouse.y - 150,
                    }}
                />
                <div className="fixed w-96 h-96 bg-purple-500 blur-3xl opacity-20 top-10 right-10" />
                <div className="fixed w-96 h-96 bg-blue-500 blur-3xl opacity-20 bottom-10 left-10" />

                {/* SIDEBAR */}
                <AdminSidebar />

                {/* CONTENT */}
                <div className="flex-1 px-6 py-6 relative z-10">

                    {/* HEADER */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10 mt-12"
                    >
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            Hallo Admin!
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Ringkasan data sekolah dan jadwal hari ini
                        </p>
                    </motion.div>

                    {/* STATS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
                        <StatCard title="Siswa" value={stats.siswa} color="from-cyan-500 to-blue-500" />
                        <StatCard title="Guru" value={stats.guru} color="from-purple-500 to-indigo-500" />
                        <StatCard title="Kelas" value={stats.kelas} color="from-blue-500 to-indigo-500" />
                        <StatCard title="Mapel" value={stats.mapel} color="from-pink-500 to-red-500" />
                    </div>

                    {/* GRID */}
                    <div className="grid md:grid-cols-3 gap-6">

                        {/* OVERVIEW */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.02 }}
                            className="md:col-span-2 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-lg"
                        >
                            <h2 className="text-cyan-400 mb-4 font-semibold">
                                Dashboard Overview
                            </h2>

                            {/* CHART */}
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="name" stroke="#aaa" />
                                        <YAxis stroke="#aaa" />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="total" stroke="#22d3ee" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* INSIGHT */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-gray-400">Total Siswa</p>
                                    <p className="text-cyan-400 font-bold">{stats.siswa}</p>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-gray-400">Total Guru</p>
                                    <p className="text-purple-400 font-bold">{stats.guru}</p>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-gray-400">Total Kelas</p>
                                    <p className="text-blue-400 font-bold">{stats.kelas}</p>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-gray-400">Total Mapel</p>
                                    <p className="text-pink-400 font-bold">{stats.mapel}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* INFO */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-lg"
                        >
                            <h2 className="mb-11 text-purple-400 mb-4 font-semibold">
                                Info Sekolah
                            </h2>

                            <div className="space-y-8 text-sm text-gray-300">

                                <InfoItem
                                    label="Nama Sekolah"
                                    value={identitas?.nama_sekolah || "-"}
                                />

                                <InfoItem
                                    label="Kepala Sekolah"
                                    value={identitas?.namakp_sekolah || "-"}
                                />

                                <InfoItem
                                    label="Tahun Ajaran"
                                    value={identitas?.tahun_ajaran || "-"}
                                />

                                <InfoItem
                                    label="Semester"
                                    value={identitas?.semester || "-"}
                                />

                                <InfoItem
                                    label="Status Sistem"
                                    value={identitas?.status || "Aktif"}
                                />
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-10 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-lg"
                    >
                        <h2 className="text-cyan-400 mb-5 font-semibold">
                            Jadwal Hari Ini ({getHariSekarang()})
                        </h2>

                        <div className="mt-10 bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">

                            <h2 className="text-xl font-bold text-white mb-4">
                                Kelas 1A
                            </h2>

                            <div className="overflow-hidden rounded-xl border border-white/20">
                                <table className="w-full text-sm text-white">

                                    {/* HEADER */}
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-500 to-blue-400 text-white text-center">
                                            <th className="p-3 border border-white/20">Jam</th>
                                            <th className="p-3 border border-white/20">Senin</th>
                                        </tr>
                                    </thead>

                                    {/* BODY */}
                                    <tbody>
                                        {jadwalHariIniSorted.length === 0 ? (
                                            <tr>
                                                <td colSpan="2" className="p-4 text-center text-gray-400">
                                                    Tidak ada jadwal hari ini
                                                </td>
                                            </tr>
                                        ) : (
                                            jadwalHariIniSorted.map((j, index) => (
                                                <tr
                                                    key={index}
                                                    className="text-center border-t border-white/10 hover:bg-white/5 transition"
                                                >
                                                    {/* JAM */}
                                                    <td className="p-3 border border-white/10">
                                                        {j.jam_mulai.slice(0, 5)} - {j.jam_selesai.slice(0, 5)}
                                                    </td>

                                                    {/* MAPEL */}
                                                    <td className="p-3 border border-white/10">
                                                        {j.mapel?.nama_mapel || "-"}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </AdminLayout>
    )
}

/* COMPONENT */

function StatCard({ title, value, color }) {
    return (
        <motion.div
            whileHover={{ scale: 1.08 }}
            className={`relative overflow-hidden bg-gradient-to-r ${color} p-5 rounded-2xl shadow-xl`}
        >
            <div className="absolute inset-0 bg-white/10 blur-xl opacity-10" />

            <p className="text-sm text-white/80">{title}</p>
            <h1 className="text-3xl font-bold">{value}</h1>
        </motion.div>
    )
}

function InfoItem({ label, value }) {
    return (
        <div className="flex justify-between border-b border-white/10 pb-2">
            <span>{label}</span>
            <span className="text-cyan-400 font-semibold">{value}</span>
        </div>
    )
}
