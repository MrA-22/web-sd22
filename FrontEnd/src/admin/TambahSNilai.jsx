import { useEffect, useState } from "react";
import AdminSidebar from "../components/layout/AdminSidebar";
import { getKelas, getMapel, getSiswa, addNilai } from "../api/api";
import AdminLayout from "../components/layout/AdminLayout";

export default function TambahNilaiS() {
  const [form, setForm] = useState({
    id_siswa: "",
    id_kelas: "",
    nilaiList: []
  });
  const user = JSON.parse(localStorage.getItem("user"));
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const kelasWali = kelasList.find(
    (k) => k.wali_kelas === user?.nama_guru
  );
  const siswaFiltered = siswaList.filter(
    (s) => String(s.id_kelas) === String(kelasWali?.id_kelas)
  );
  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kelas, mapel, siswa] = await Promise.all([
          getKelas(),
          getMapel(),
          getSiswa()
        ]);

        setKelasList(kelas || []);
        setMapelList(mapel || []);
        setSiswaList(siswa || []);

        if (Array.isArray(mapel)) {
          setForm((prev) => ({
            ...prev,
            nilaiList: mapel.map((m) => ({
              id_mapel: m.id_mapel,
              nilai: ""
            }))
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // ================= CURSOR =================
  useEffect(() => {
    const move = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // ================= RESET =================
  const resetForm = () => {
    setForm({
      id_siswa: "",
      id_kelas: "",
      nilaiList: mapelList.map((m) => ({
        id_mapel: m.id_mapel,
        nilai: ""
      }))
    });
  };

  // ================= SISWA =================
  const handleSiswa = (value) => {
    const selected = siswaFiltered.find(
      (s) => String(s.id_siswa) === String(value)
    );

    if (!selected) return;

    if (selected.sudah_nilai) {
      setModalMessage(
        `Siswa ${selected.nama_siswa} sudah mempunyai nilai`
      );
      setShowModal(true);
      resetForm();
      return;
    }

    setForm((prev) => ({
      ...prev,
      id_siswa: value,
      id_kelas: kelasWali?.id_kelas // 🔥 fix dari sini
    }));
  };

  // ================= NILAI =================
  const handleNilaiChange = (id_mapel, value) => {
    const clean = value.replace(/\D/g, "");

    setForm((prev) => ({
      ...prev,
      nilaiList: prev.nilaiList.map((n) =>
        n.id_mapel === id_mapel
          ? { ...n, nilai: clean }
          : n
      )
    }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!form.id_siswa) {
      setModalMessage("Pilih siswa dulu!");
      setShowModal(true);
      return;
    }

    try {
      const res = await addNilai(form);

      if (res?.status === "success") {
        setModalMessage("Semua nilai berhasil disimpan!");
        resetForm();
      } else {
        setModalMessage("Gagal menyimpan nilai");
      }
    } catch (err) {
      setModalMessage(err.message || "Terjadi error");
    }

    setShowModal(true);
  };

  const kelasName = kelasWali?.nama_kelas || "-";
  useEffect(() => {
    if (kelasWali) {
      setForm((prev) => ({
        ...prev,
        id_kelas: kelasWali.id_kelas
      }));
    }
  }, [kelasWali]);
  return (
    <AdminLayout>
      <div className="min-h-screen flex bg-black text-white">
        <AdminSidebar />

        {/* Glow */}
        <div
          className="pointer-events-none fixed w-80 h-80 rounded-full blur-3xl opacity-30 bg-cyan-400"
          style={{ left: mouse.x - 160, top: mouse.y - 160 }}
        />

        <div className="flex-1 flex justify-center items-center p-6">
          <div className="w-full max-w-5xl bg-black/50 backdrop-blur p-8 rounded-2xl border border-white/10 shadow-2xl">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => window.history.back()}
                className="text-sm px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
              >
                ← Kembali
              </button>

              <h1 className="text-2xl font-bold tracking-wide text-cyan-400">
                Tambah Nilai
              </h1>

              <div />
            </div>

            {/* GRID ATAS */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">

              {/* SISWA */}
              <div>
                <label className="text-sm text-gray-300">
                  Nama Siswa
                </label>
                <select
                  value={form.id_siswa}
                  onChange={(e) => handleSiswa(e.target.value)}
                  className="w-full mt-2 p-3 text-sm bg-black border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {siswaFiltered.map((s) => (
                    <option key={s.id_siswa} value={s.id_siswa}>
                      {s.sudah_nilai
                        ? `${s.nama_siswa} (Sudah ada nilai)`
                        : s.nama_siswa}
                    </option>
                  ))}
                </select>
              </div>

              {/* KELAS */}
              <div>
                <label className="text-sm text-gray-300">
                  Kelas
                </label>
                <input
                  disabled
                  value={kelasName}
                  className="w-full mt-2 p-3 text-sm bg-black border border-white/20 rounded-lg opacity-70"
                />
              </div>
            </div>

            {/* MAPEL */}
            <div>
              <h3 className="text-sm text-cyan-400 mb-4 uppercase tracking-wider">
                Input Nilai
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {mapelList.map((m) => {
                  const nilai =
                    form.nilaiList.find(
                      (n) => n.id_mapel === m.id_mapel
                    )?.nilai || "";

                  return (
                    <div
                      key={m.id_mapel}
                      className="flex items-center justify-between gap-4 bg-white/5 p-3 rounded-lg"
                    >
                      <span className="text-sm text-gray-300 w-1/2">
                        {m.mapel}
                      </span>

                      <input
                        type="text"
                        value={nilai}
                        onChange={(e) =>
                          handleNilaiChange(
                            m.id_mapel,
                            e.target.value
                          )
                        }
                        className="w-24 p-2 text-sm text-center bg-black border border-white/20 rounded focus:ring-2 focus:ring-cyan-400"
                        placeholder="0-100"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BUTTON */}
            <button
              onClick={handleSubmit}
              className="w-full mt-8 bg-green-500 hover:bg-green-600 py-3 text-sm rounded-lg font-semibold tracking-wide transition"
            >
              Simpan Nilai
            </button>
          </div>
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
            <div className="bg-black p-6 rounded-xl border border-white/20 text-center w-80 shadow-xl">
              <p className="text-sm">{modalMessage}</p>

              <button
                onClick={() => setShowModal(false)}
                className="mt-4 px-4 py-2 bg-cyan-500 rounded text-black text-sm"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}