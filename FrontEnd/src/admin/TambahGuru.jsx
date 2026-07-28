import { useEffect, useState } from "react";
import AdminSidebar from "../components/layout/AdminSidebar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addGuruFormData, getMapel } from "../api/api";
import AdminLayout from "../components/layout/AdminLayout";

export default function TambahGuru() {
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
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [mapelList, setMapelList] = useState([]);
  // CURSOR GLOW
  useEffect(() => {
    const handleMouseMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, foto: file, preview: reader.result });
    reader.readAsDataURL(file);
  };
  useEffect(() => {
    const fetchMapel = async () => {
      try {
        const data = await getMapel();
        setMapelList(data);
      } catch (err) {
        console.error("Gagal load mapel:", err);
      }
    };
    fetchMapel();
  }, []);
  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === "tanggal_lahir" && form[key]) {
          formData.append(key, form[key].toISOString().split("T")[0]);
        } else if (key === "nohp" && form[key]) {
          formData.append(key, form[key].replace(/\s+/g, ""));
        } else if (form[key]) {
          formData.append(key, form[key]);
        }
      });

      const data = await addGuruFormData(formData);

      setModalMessage(data.message || "Terjadi error");
      setShowModal(true);

      if (data.status === "success") {
        setForm({
          nuptk: "",
          nama: "",
          tanggal_lahir: null,
          mengajar: "",
          alamat: "",
          nohp: "",
          foto: null,
          preview: null
        });
      }

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
          <div className="pointer-events-none fixed w-96 h-96 bg-purple-500 blur-3xl opacity-20 top-10 right-10" />
          <div className="pointer-events-none fixed w-96 h-96 bg-blue-500 blur-3xl opacity-20 bottom-10 left-10" />

          {/* TITLE */}
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Tambah Guru
          </h1>
          <p className="text-center text-gray-400 mb-10 text-sm">Tambahkan data guru baru dengan lengkap</p>

          {/* FORM CARD */}
          <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-lg transition hover:shadow-cyan-500/30">
            <div className="grid md:grid-cols-2 gap-6">
              {/* FOTO */}
              <div className="col-span-2 text-center">
                <img
                  src={form.preview || "https://via.placeholder.com/150"}
                  className="w-32 h-32 object-cover rounded-2xl mx-auto mb-3 border border-white/20 shadow-md"
                />
                <input type="file" accept="image/*" onChange={handleFoto} className="text-sm text-gray-400 mt-2" />
              </div>

              {/* INPUTS */}
              <Input name="nuptk" value={form.nuptk} onChange={handleChange} placeholder="nuptk" numeric />
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
              <div className="flex flex-col">
                <label className="mb-1 text-gray-400 text-sm font-medium">Mata Pelajaran</label>
                <select
                  name="mengajar"
                  value={form.mengajar}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/10
               focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none
               transition placeholder-gray-400 text-white"
                >
                  <option value="">-- Pilih Mapel --</option>
                  {mapelList.map((m) => (
                    <option key={m.id_mapel} value={m.mapel}>
                      {m.mapel}
                    </option>
                  ))}
                </select>
              </div>
              <InputAlamat name="alamat" value={form.alamat} onChange={handleChange} placeholder="Alamat" full />
              <InputNoHP name="nohp" value={form.nohp} onChange={handleChange} placeholder="No HP" full />
            </div>

            {/* BUTTONS */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold hover:scale-105 transition shadow-lg hover:shadow-cyan-400/40"
              >
                🚀 Simpan Data
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
      </div >
    </AdminLayout>
  );
}

/* ================= COMPONENT INPUT ================= */
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