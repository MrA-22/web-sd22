import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/layout/AdminSidebar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getGuruById, updateGuruFormData } from "../api/api";
import AdminLayout from "../components/layout/AdminLayout";

export default function UbahGuru() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState(""); // <- wajib

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [form, setForm] = useState({
    nuptk: "",
    nama: "",
    tanggal_lahir: null,
    mengajar: "",
    alamat: "",
    nohp: "",
    foto: null,
    preview: null
  });

  // CURSOR GLOW
  useEffect(() => {
    const handleMouseMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // LOAD DATA
  useEffect(() => {
    getGuruById(id)
      .then(data => {
        setForm({
          nuptk: data.nuptk || "",
          nama: data.nama_guru || "",
          tanggal_lahir: data.tgll_guru ? new Date(data.tgll_guru) : null,
          mengajar: data.mengajar || "",
          alamat: data.alamat_guru || "",
          nohp: data.nohp_guru || "",
          foto: null,
          preview: data.foto_url || null
        });
      })
      .catch(err => {
        console.error(err);
        setModalMessage("Gagal memuat data guru");
        setShowModal(true);
      });
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, foto: file, preview: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("nuptk", form.nuptk);
      formData.append("nama", form.nama);
      formData.append("tanggal_lahir", form.tanggal_lahir ? form.tanggal_lahir.toISOString().split("T")[0] : "");
      formData.append("mengajar", form.mengajar);
      formData.append("alamat", form.alamat);
      formData.append("nohp", form.nohp);
      if (form.foto) formData.append("foto", form.foto);

      const data = await updateGuruFormData(id, formData);

      if (data.status === "success") {
        setModalMessage("Data guru berhasil diubah!");
      } else if (data.errors) {
        const messages = Object.values(data.errors).flat().join(", ");
        setModalMessage(messages);
      } else {
        setModalMessage(data.message || "Gagal update data");
      }

      setShowModal(true);
    } catch (err) {
      setModalMessage(err.message || "Terjadi error pada server");
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

          {/* TITLE */}
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Ubah Guru
          </h1>

          {/* FORM CARD */}
          <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-lg p-8 rounded-3xl border border-white/20 shadow-xl transition hover:shadow-cyan-500/30">
            <div className="grid md:grid-cols-2 gap-6">
              {/* FOTO */}
              <div className="col-span-2 text-center">
                <img
                  src={form.preview || "https://via.placeholder.com/150"}
                  className="w-32 h-32 object-cover rounded-2xl mx-auto mb-3 shadow-lg transition-transform duration-300 hover:scale-105"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFoto}
                  className="w-full text-sm text-gray-300 bg-black/50 border border-white/20 rounded-lg p-2 cursor-pointer hover:bg-white/10 transition"
                />
              </div>

              <Input name="nuptk" value={form.nuptk} onChange={handleChange} placeholder="nuptk" />
              <Input name="nama" value={form.nama} onChange={handleChange} placeholder="Nama Guru" />

              {/* DATE PICKER */}
              <div className="flex flex-col">
                <label className="mb-1 text-gray-400 text-sm font-medium">Tanggal Lahir</label>
                <DatePicker
                  selected={form.tanggal_lahir}
                  onChange={(date) => setForm({ ...form, tanggal_lahir: date })}
                  dateFormat="dd/MM/yyyy"
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition"
                  placeholderText="dd/mm/yyyy"
                />
              </div>

              <Input name="mengajar" value={form.mengajar} onChange={handleChange} placeholder="Mengajar" />
              <InputAlamat name="alamat" value={form.alamat} onChange={handleChange} placeholder="Alamat" full />
              <InputNoHP name="nohp" value={form.nohp} onChange={handleChange} placeholder="No HP" full />
            </div>

            {/* BUTTONS */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
              >
                💾 Simpan Perubahan
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition"
              >
                ⬅ Kembali
              </button>
            </div>
            {/* MODAL */}
            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="bg-black/90 p-6 rounded-xl border border-white/20 shadow-lg w-80 text-center">
                  <p className="mb-4 text-white">{modalMessage}</p>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      navigate("/gurupanel"); // pindah halaman setelah klik OK
                    }}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 transition text-black font-semibold"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
function Input({ name, value, onChange, placeholder, full, numeric }) {
  const [error, setError] = useState("");

  const handleChange = (e) => {
    let val = e.target.value;

    if (numeric) {
      if (/\D/.test(val)) {
        setError("Gunakan angka saja");
        val = val.replace(/\D/g, "");
      } else {
        setError("");
      }
    }

    onChange({ target: { name, value: val } });
  };

  return (
    <div className={`${full ? "col-span-2" : ""} flex flex-col`}>
      <label className="mb-1 text-gray-400 text-sm font-medium">{placeholder}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full p-3 rounded-xl bg-black/60 border border-white/10
                   focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none
                   transition placeholder-gray-400 text-white`}
      />
      {error && <span className="text-red-400 text-xs mt-1">{error}</span>}
    </div>
  );
}

function InputNoHP({ name, value, onChange, placeholder, full, maxLength = 14 }) {
  const [error, setError] = useState("");

  const handleFocus = () => {
    if (!value || value === "") onChange({ target: { name, value: "+62" } });
  };

  const handleChange = (e) => {
    let val = e.target.value;

    // hapus karakter selain angka dan +
    val = val.replace(/[^\d+]/g, "");

    // pastikan diawali +62
    if (!val.startsWith("+62")) {
      val = val.replace(/^0+/, ""); // hapus leading 0
      val = "+62" + val;
    }

    // batasi panjang sesuai maxLength
    if (val.length > maxLength) val = val.slice(0, maxLength);

    // peringatan jika lebih panjang
    if (val.length > maxLength) setError(`Maksimal ${maxLength} karakter`);
    else setError("");

    onChange({ target: { name, value: val } });
  };

  return (
    <div className={`${full ? "col-span-2" : ""} flex flex-col`}>
      <label className="mb-1 text-gray-400 text-sm font-medium">{placeholder}</label>
      <input
        type="tel"
        name={name}
        value={value}
        onFocus={handleFocus}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full p-3 rounded-xl bg-black/60 border border-white/10
                   focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none
                   transition placeholder-gray-400 text-white`}
      />
      {error && <span className="text-red-400 text-xs mt-1">{error}</span>}
    </div>
  );
}

function InputAlamat({ name, value, onChange, placeholder, full }) {
  const handleFocus = () => {
    if (!value || value === "") onChange({ target: { name, value: "Jln. " } });
  };

  return (
    <div className={`${full ? "col-span-2" : ""} flex flex-col`}>
      <label className="mb-1 text-gray-400 text-sm font-medium">{placeholder}</label>
      <input
        type="text"
        name={name}
        value={value}
        onFocus={handleFocus}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-3 rounded-xl bg-black/60 border border-white/10
                   focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none
                   transition placeholder-gray-400 text-white`}
      />
    </div>
  );
}