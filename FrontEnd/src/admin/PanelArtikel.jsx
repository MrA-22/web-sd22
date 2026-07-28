import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/layout/AdminSidebar";
import { getArtikel, deleteArtikel } from "../api/api"; // pastikan api.js ada getArtikel & deleteArtikel
import AdminLayout from "../components/layout/AdminLayout";

export default function PanelArtikel() {
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [data, setData] = useState([]);

  // ======= MODAL =======
  const [showModal, setShowModal] = useState(false);
  const [selectedArtikel, setSelectedArtikel] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // CURSOR
  useEffect(() => {
    const handleMouseMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // LOAD DATA ARTIKEL
  const loadData = async () => {
    try {
      const res = await getArtikel();
      const fixData = Array.isArray(res)
        ? res.map((d) => ({
          id: d.id_artikel,
          judul: d.judul,
          penulis: d.penulis,
          tanggal_upload: d.tanggal_upload,
          isi: d.isi,
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
  }, []);

  // ======= SHOW MODAL DELETE =======
  const openDeleteModal = (artikel) => {
    setSelectedArtikel(artikel);
    setModalMessage("");
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedArtikel(null);
    setModalMessage("");
    setShowModal(false);
    setIsDeleting(false);
  };

  // ======= HANDLE DELETE ARTIKEL =======
  const confirmDelete = async () => {
    if (!selectedArtikel) return;
    setIsDeleting(true);

    try {
      await deleteArtikel(selectedArtikel.id);
      setData((prev) => prev.filter((a) => a.id !== selectedArtikel.id));

      setModalMessage("Artikel berhasil dihapus ✅");
      setIsSuccess(true); // tandai berhasil

      // Tutup modal otomatis setelah 1.5 detik
      setTimeout(() => {
        closeModal();
        setIsSuccess(false); // reset flag
      }, 1500);

    } catch (err) {
      setModalMessage("Gagal hapus artikel: " + err.message);
      setIsSuccess(false); // gagal
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
          <div className="mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Data Artikel
            </h1>
          </div>

          {/* 🔵 Tambah Artikel */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => navigate("/addartikel")}
              className="group relative w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-xl 
            bg-gradient-to-r from-green-500 to-emerald-500 font-semibold overflow-hidden transition-all duration-300 
            hover:scale-105 active:scale-95"
            >
              <span className="text-xl">📝</span>
              <span>Tambah Artikel</span>
            </button>
          </div>

          {/* TABLE */}
          <div className="relative group bg-black/40 backdrop-blur-lg rounded-2xl border border-white/20 overflow-x-auto shadow-xl">
            {/* HEADER TABLE */}
            <div className="grid grid-cols-6 p-4 text-sm text-gray-400 border-b border-white/10 min-w-[800px] font-medium">
              <p>Foto</p>
              <p>Judul</p>
              <p>Penulis</p>
              <p>Tanggal Upload</p>
              <p>Isi</p>
              <p>Action</p>
            </div>

            {/* DATA */}
            {data.length === 0 ? (
              <p className="p-6 text-center text-gray-500">Belum ada data</p>
            ) : (
              data.map((d, i) => (
                <div
                  key={i}
                  className="grid grid-cols-6 items-center p-4 border-b border-white/10 min-w-[800px]
                       hover:bg-white/5 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 rounded-xl"
                >
                  <img
                    src={d.foto || "https://via.placeholder.com/100"}
                    onError={(e) => (e.target.src = "https://via.placeholder.com/100")}
                    className="w-12 h-12 object-cover rounded-lg shadow-md"
                  />

                  <p>{d.judul}</p>
                  <p>{d.penulis}</p>
                  <p>
                    {d.tanggal_upload
                      ? new Date(d.tanggal_upload).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                      : "-"}
                  </p>
                  <p className="truncate max-w-[200px]">{d.isi}</p>

                  <div className="flex flex-col md:flex-row gap-2">
                    <button
                      onClick={() => navigate(`/ubahartikel/${d.id}`)}
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
                  {modalMessage ? "Hasil:" : "Yakin ingin menghapus artikel ini?"}
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
                ) : !isSuccess ? (
                  // Kalau gagal, tombol Tutup muncul
                  <button
                    onClick={closeModal}
                    className="bg-cyan-500 px-4 py-2 rounded-lg text-white font-semibold hover:scale-105 transition"
                  >
                    Tutup
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}