import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/layout/AdminSidebar";
import { getSiswa, deleteSiswa, getKelas, addKelas } from "../api/api";
import AdminLayout from "../components/layout/AdminLayout";

export default function PanelSiswa() {
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [data, setData] = useState([]);

  // ======= MODAL =======
  const [showModal, setShowModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModalKelas, setShowModalKelas] = useState(false);
  const [setKelasList] = useState([]);
  const [formTambahKelas, setFormTambahKelas] = useState({
    nama_kelas: ""
  });
  // CURSOR
  useEffect(() => {
    const handleMouseMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // LOAD DATA SISWA
  const loadData = async () => {
    try {
      const res = await getSiswa(); // <- pakai api.js
      const fixData = Array.isArray(res)
        ? res.map((d) => ({
          id: d.id_siswa,
          nisn: d.nisn,
          nama: d.nama_siswa,
          tanggal_lahir: d.tgll_siswa,
          kelas: d.kelas?.nama_kelas || "-",
          alamat: d.alamat,
          nohp: d.nohp_ortu,
          foto: d.foto_url || null,
        }))
        : [];
      setData(fixData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    loadKelas();
  }, []);

  // LOAD DATA KELAS
  const loadKelas = async () => {
    try {
      const res = await getKelas(); // <- pakai api.js
      setKelasList(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ======= SHOW MODAL DELETE =======
  const openDeleteModal = (siswa) => {
    setSelectedSiswa(siswa);
    setModalMessage("");
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSiswa(null);
    setModalMessage("");
    setShowModal(false);
    setIsDeleting(false);
  };

  // ======= HANDLE DELETE SISWA =======
  const confirmDelete = async () => {
    if (!selectedSiswa) return;
    setIsDeleting(true);

    try {
      await deleteSiswa(selectedSiswa.id); // <- pakai api.js
      setData((prev) => prev.filter((s) => s.id !== selectedSiswa.id));
      setModalMessage("Data berhasil dihapus ✅");
    } catch (err) {
      setModalMessage("Gagal hapus siswa: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // ======= TAMBAH KELAS =======
  const submitTambahKelas = async () => {
    if (!formTambahKelas.nama_kelas) {
      setModalMessage("Nama kelas wajib diisi!");
      setShowModal(true);
      return;
    }

    try {
      await addKelas({ nama_kelas: formTambahKelas.nama_kelas }); // <- pakai api.js
      setModalMessage("Kelas berhasil ditambahkan!");
      setShowModal(true);
      setShowModalKelas(false);
      setFormTambahKelas({ nama_kelas: "" });
      loadKelas(); // refresh list kelas
    } catch (err) {
      console.error(err);
      setModalMessage("Gagal koneksi ke server!");
      setShowModal(true);
    }
  };
  return (
    <AdminLayout>
      <div className="min-h-screen flex bg-black text-white">
        <AdminSidebar />
        <div className="flex-1 px-6 py-16 relative overflow-hidden">
          {/* CURSOR GLOW */}
          <div
            className="pointer-events-none fixed w-72 h-72 rounded-full blur-3xl opacity-30 bg-cyan-400"
            style={{ left: mouse.x - 150, top: mouse.y - 150 }}
          />
          <div className="pointer-events-none fixed w-96 h-96 bg-purple-500 blur-3xl opacity-20 top-10 right-10" />
          <div className="fixed w-96 h-96 bg-blue-500 blur-3xl opacity-20 bottom-10 left-10" />

          {/* HEADER */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Data Siswa
            </h1>
          </div>

          {/* 🔥 BUTTON DI BAWAH, TAPI MENYAMPING */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">

            {/* 🔵 Tambah Kelas */}
            <button
              onClick={() => setShowModalKelas(true)}
              className="group relative w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-xl 
            bg-gradient-to-r from-blue-500 to-indigo-500 
            font-semibold overflow-hidden transition-all duration-300 
            hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
              <span className="text-xl transition-transform duration-300 group-hover:rotate-12">🏫</span>
              <span className="relative z-10">Tambah Kelas</span>
            </button>

            {/* 🟢 Tambah Siswa */}
            <button
              onClick={() => navigate("/addsiswa")}
              className="group relative w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-xl 
            bg-gradient-to-r from-green-500 to-emerald-500 
            font-semibold overflow-hidden transition-all duration-300 
            hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
              <span className="text-xl transition-transform duration-300 group-hover:scale-125">👤</span>
              <span className="relative z-10">Tambah Siswa</span>
            </button>

          </div>
          {/* TABLE */}
          <div className="relative group bg-black/40 backdrop-blur-lg rounded-2xl border border-white/20 overflow-x-auto shadow-xl">
            {/* HEADER TABLE */}
            <div className="grid grid-cols-8 p-4 text-sm text-gray-400 border-b border-white/10 min-w-[800px] font-medium">
              <p>Foto</p>
              <p>NISN</p>
              <p>Nama</p>
              <p>Tgl Lahir</p>
              <p>Kelas</p>
              <p>Alamat</p>
              <p>No HP Ortu</p>
              <p>Action</p>
            </div>

            {/* DATA */}
            {data.length === 0 ? (
              <p className="p-6 text-center text-gray-500">Belum ada data</p>
            ) : (
              data.map((d, i) => (
                <div
                  key={i}
                  className="grid grid-cols-8 items-center p-4 border-b border-white/10 min-w-[800px]
                       hover:bg-white/5 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 rounded-xl"
                >
                  <img
                    src={d.foto || "https://via.placeholder.com/100"}
                    onError={(e) => (e.target.src = "https://via.placeholder.com/100")}
                    className="w-12 h-12 object-cover rounded-lg shadow-md"
                  />

                  <p>{d.nisn}</p>
                  <p>{d.nama}</p>
                  <p>
                    {d.tanggal_lahir
                      ? new Date(d.tanggal_lahir).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                      : "-"}
                  </p>
                  <p>{d.kelas}</p>
                  <p>{d.alamat}</p>
                  <p>{d.nohp}</p>

                  <div className="flex flex-col md:flex-row gap-2">
                    <button
                      onClick={() => navigate(`/ubahsiswa/${d.id}`)}
                      className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-xs w-full md:w-auto
                           hover:scale-105 hover:shadow-lg hover:shadow-yellow-300/50 transition-all duration-300"
                    >
                      Ubah
                    </button>

                    <button
                      onClick={() => openDeleteModal(d)}
                      className="bg-red-500 px-3 py-1.5 rounded-lg text-xs w-full md:w-auto
                           hover:scale-105 hover:shadow-lg hover:shadow-red-400/50 transition-all duration-300"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Modal Tambah Kelas */}
          {showModalKelas && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-black/90 p-6 rounded-xl border border-white/20 shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Tambah Kelas</h2>

                <label className="block mb-2 text-gray-300">Nama Kelas</label>
                <input
                  type="text"
                  name="nama_kelas"
                  value={formTambahKelas.nama_kelas}
                  onChange={(e) =>
                    setFormTambahKelas({
                      ...formTambahKelas,
                      nama_kelas: e.target.value
                    })
                  }
                  className="w-full p-2 rounded bg-black/60 border border-white/20 mb-4"
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowModalKelas(false)}
                    className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition"
                  >
                    Batal
                  </button>

                  <button
                    onClick={submitTambahKelas}
                    className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 transition"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* MODAL DELETE */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-black/90 p-6 rounded-xl border border-white/20 shadow-lg w-80 text-center space-y-4">
                <p className="text-white font-medium">
                  {modalMessage ? "Hasil:" : "Yakin ingin menghapus siswa ini?"}
                </p>

                {modalMessage && <p className="text-gray-300 text-sm">{modalMessage}</p>}

                {!modalMessage ? (
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={confirmDelete}
                      disabled={isDeleting}
                      className="bg-red-500 px-4 py-2 rounded-lg text-white font-semibold hover:scale-105 transition disabled:opacity-50"
                    >
                      {isDeleting ? "Menghapus..." : "Hapus"}
                    </button>
                    <button
                      onClick={closeModal}
                      className="bg-gray-600 px-4 py-2 rounded-lg text-white font-semibold hover:scale-105 transition"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={closeModal}
                    className="bg-cyan-500 px-4 py-2 rounded-lg text-white font-semibold hover:scale-105 transition"
                  >
                    Tutup
                  </button>
                )}
              </div>
            </div>
          )}
          {showMessageModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-black/90 p-6 rounded-xl border border-white/20 shadow-lg w-80 text-center space-y-4">
                <p className="text-white font-medium">Informasi</p>
                <p className="text-gray-300 text-sm">{modalMessage}</p>

                <button
                  onClick={() => setShowMessageModal(false)}
                  className="bg-cyan-500 px-4 py-2 rounded-lg text-white font-semibold hover:scale-105 transition"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}