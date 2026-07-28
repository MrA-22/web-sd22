import { useState, useEffect } from "react";
import AdminSidebar from "../components/layout/AdminSidebar";
import { addArtikel } from "../api/api";
import AdminLayout from "../components/layout/AdminLayout";

export default function TambahArtikel() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [form, setForm] = useState({
    judul: "",
    penulis: "",
    tanggal_upload: new Date(),
    isi: "",
    foto: null,
    preview: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [autoClose, setAutoClose] = useState(false); // kontrol auto-close

  // CURSOR GLOW
  useEffect(() => {
    const handleMouseMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setForm({ ...form, foto: file, preview: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("judul", form.judul);
      formData.append("penulis", form.penulis);
      formData.append(
        "tanggal_upload",
        form.tanggal_upload.toISOString().split("T")[0]
      );
      formData.append("isi", form.isi);
      if (form.foto) formData.append("foto", form.foto);

      const data = await addArtikel(formData);

      setModalMessage(data.message || "Artikel berhasil disimpan ✅");
      setShowModal(true);
      setAutoClose(true);

      if (data.data) { // <-- gunakan data.data
        setForm({
          judul: "",
          penulis: "",
          tanggal_upload: new Date(),
          isi: "",
          foto: null,
          preview: null,
        });

        setTimeout(() => {
          setShowModal(false);
          setAutoClose(false);
        }, 1500);
      } else {
        setAutoClose(false);
      }
    } catch (err) {
      setModalMessage(err.message || "Terjadi error server");
      setShowModal(true);
      setAutoClose(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex bg-black text-white">
        <AdminSidebar />
        <div className="flex-1 px-6 py-16 relative overflow-hidden">
          {/* CURSOR EFFECT */}
          <div
            className="pointer-events-none fixed w-72 h-72 rounded-full blur-3xl opacity-30 bg-cyan-400"
            style={{ left: mouse.x - 150, top: mouse.y - 150 }}
          />
          <div className="pointer-events-none fixed w-96 h-96 bg-purple-500 blur-3xl opacity-20 top-10 right-10" />
          <div className="pointer-events-none fixed w-96 h-96 bg-blue-500 blur-3xl opacity-20 bottom-10 left-10" />

          {/* TITLE */}
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Tambah Artikel
          </h1>
          <p className="text-center text-gray-400 mb-10 text-sm">
            Tambahkan data artikel baru
          </p>

          {/* FORM CARD */}
          <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-lg transition hover:shadow-cyan-500/30">
            <div className="grid md:grid-cols-2 gap-6">
              {/* FOTO */}
              <div className="col-span-2 text-center">
                <img
                  src={form.preview || "https://via.placeholder.com/150"}
                  className="w-32 h-32 object-cover rounded-2xl mx-auto mb-3 border border-white/20 shadow-md"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFoto}
                  className="text-sm text-gray-400 mt-2"
                />
              </div>

              {/* INPUTS */}
              <Input
                name="judul"
                value={form.judul}
                onChange={handleChange}
                placeholder="Judul Artikel"
                full
              />
              <Input
                name="penulis"
                value={form.penulis}
                onChange={handleChange}
                placeholder="Penulis"
              />

              {/* TANGGAL */}
              <div className="flex flex-col">
                <label className="mb-1 text-gray-400 text-sm font-medium">
                  Tanggal
                </label>
                <input
                  type="text"
                  value={form.tanggal_upload.toLocaleDateString("id-ID")}
                  disabled
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white"
                />
              </div>

              {/* ISI */}
              <div className="col-span-2 flex flex-col">
                <label className="mb-1 text-gray-400 text-sm font-medium">
                  Isi
                </label>
                <textarea
                  name="isi"
                  value={form.isi}
                  onChange={handleChange}
                  placeholder="Isi artikel"
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition resize-y h-32"
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold hover:scale-105 transition shadow-lg hover:shadow-cyan-400/40"
              >
                🚀 Simpan Artikel
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
              >
                ⬅ Kembali
              </button>
            </div>

            {/* MODAL */}
            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="bg-black/90 p-6 rounded-xl border border-white/20 shadow-lg w-80 text-center transition-all">
                  <p className="mb-4 text-white">{modalMessage}</p>
                  {!autoClose && (
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 transition text-black font-semibold"
                    >
                      OK
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ================= COMPONENT INPUT ================= */
function Input({ name, value, onChange, placeholder, full }) {
  return (
    <div className={`${full ? "col-span-2" : ""} flex flex-col`}>
      <label className="mb-1 text-gray-400 text-sm font-medium">{placeholder}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 rounded-xl bg-black/60 border border-white/10
                   focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none
                   transition placeholder-gray-400 text-white"
      />
    </div>
  );
}