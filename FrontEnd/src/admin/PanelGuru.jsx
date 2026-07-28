import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/layout/AdminSidebar";
import { getGuru, deleteGuru } from "../api/api";
import AdminLayout from "../components/layout/AdminLayout";

export default function PanelGuru() {
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [data, setData] = useState([]);

  // ======= MODAL =======
  const [showModal, setShowModal] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [modalMessage, setModalMessage] = useState(""); // pesan di modal
  const [isDeleting, setIsDeleting] = useState(false); // loading delete

  // CURSOR
  useEffect(() => {
    const handleMouseMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // LOAD DATA
  const loadData = async () => {
    try {
      const json = await getGuru(); // <- pakai api.js
      const fixData = Array.isArray(json)
        ? json.map((d) => ({
          id: d.id_guru,
          nisn: d.nuptk,
          nama: d.nama_guru,
          tanggal_lahir: d.tgll_guru,
          mengajar: d.mengajar,
          alamat: d.alamat_guru,
          nohp: d.nohp_guru,
          foto: d.foto_url,
        }))
        : [];
      setData(fixData);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ======= MODAL DELETE =======
  const openDeleteModal = (guru) => {
    setSelectedGuru(guru);
    setModalMessage("");
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedGuru(null);
    setModalMessage("");
    setShowModal(false);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    if (!selectedGuru) return;
    setIsDeleting(true);

    try {
      const res = await deleteGuru(selectedGuru.id); // <- pakai api.js

      if (res.status === "success") {
        setData((prev) => prev.filter((g) => g.id !== selectedGuru.id));
        setModalMessage("Data berhasil dihapus ✅");
      } else {
        setModalMessage("Gagal hapus guru");
      }
    } catch (err) {
      setModalMessage("Error: " + err.message);
    } finally {
      setIsDeleting(false);
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Data Guru
          </h1>

          <button
            onClick={() => navigate("/addguru")}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl 
            bg-gradient-to-r from-cyan-500 to-blue-500 
            hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 
            transition-all duration-300 font-semibold"
          >
            <span className="text-lg">＋</span>
            Tambah Guru
          </button>
        </div>

        {/* TABLE */}
        <div className="relative group bg-black/40 backdrop-blur-lg rounded-2xl border border-white/20 overflow-x-auto shadow-xl">
          {/* HEADER TABLE */}
          <div className="grid grid-cols-8 p-4 text-sm text-gray-400 border-b border-white/10 min-w-[800px] font-medium">
            <p>Foto</p>
            <p>NUPTK</p>
            <p>Nama</p>
            <p>Tgl Lahir</p>
            <p>Mengajar</p>
            <p>Alamat</p>
            <p>No HP</p>
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
                  src={d.foto}
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
                <p>{d.mengajar}</p>
                <p>{d.alamat}</p>
                <p>{d.nohp}</p>

                <div className="flex flex-col md:flex-row gap-2">
                  <button
                    onClick={() => navigate(`/ubahguru/${d.id}`)}
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

        {/* MODAL DELETE */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-black/90 p-6 rounded-xl border border-white/20 shadow-lg w-80 text-center space-y-4">
              <p className="text-white font-medium">
                {modalMessage ? "Hasil:" : "Yakin ingin menghapus guru ini?"}
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
      </div>
    </div>
    </AdminLayout>
  );
}