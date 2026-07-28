import { useEffect, useState } from "react";
import AdminSidebar from "../components/layout/AdminSidebar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addSiswaFormData, getKelas } from "../api/api";
import AdminLayout from "../components/layout/AdminLayout";

export default function TambahSiswa() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [form, setForm] = useState({
    nisn: "",
    nama: "",
    tanggal_lahir: null,
    id_kelas: "",
    alamat: "",
    nohp: "",
    foto: null,
    preview: null
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [kelasList, setKelasList] = useState([]);

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const data = await getKelas();
        setKelasList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchKelas();
  }, []);

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

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      if (form.nisn) formData.append("nisn", form.nisn);
      if (form.nama) formData.append("nama", form.nama);
      if (form.tanggal_lahir)
        formData.append("tanggal_lahir", form.tanggal_lahir.toISOString().split("T")[0]);
      if (form.id_kelas) formData.append("id_kelas", form.id_kelas);
      if (form.alamat) formData.append("alamat", form.alamat);
      if (form.nohp) formData.append("nohp", form.nohp.replace(/\s+/g, ""));
      if (form.foto) formData.append("foto", form.foto);

      const data = await addSiswaFormData(formData);

      if (data.status === "success") {
        setModalMessage("Data siswa berhasil ditambahkan!");
        setShowModal(true);

        setForm({
          nisn: "",
          nama: "",
          tanggal_lahir: null,
          id_kelas: "",
          alamat: "",
          nohp: "",
          foto: null,
          preview: null
        });
      } else {
        console.log("VALIDATION ERROR:", data.errors);
        setModalMessage(
          data.message ||
          JSON.stringify(data.errors) ||
          "Gagal menambahkan data"
        );
        setShowModal(true);
      }
    } catch (err) {
      setModalMessage(err.message);
      setShowModal(true);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex bg-black text-white">
        <AdminSidebar />
        <div className="flex-1 px-6 py-16 relative overflow-hidden">
          {/* CURSOR */}
          <div className="pointer-events-none fixed w-72 h-72 rounded-full blur-3xl opacity-30 bg-cyan-400"
            style={{ left: mouse.x - 150, top: mouse.y - 150 }} />
          <div className="pointer-events-none fixed w-96 h-96 bg-purple-500 blur-3xl opacity-20 top-10 right-10" />
          <div className="pointer-events-none fixed w-96 h-96 bg-blue-500 blur-3xl opacity-20 bottom-10 left-10" />

          {/* TITLE */}
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Tambah Siswa
          </h1>
          <p className="text-center text-gray-400 mb-10 text-sm">Tambahkan data siswa baru dengan lengkap</p>

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
              <Input name="nisn" value={form.nisn} onChange={handleChange} placeholder="NISN" numeric />
              <Input name="nama" value={form.nama} onChange={handleChange} placeholder="Nama Siswa" />
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
                <label className="mb-1 text-gray-400 text-sm font-medium">Kelas</label>
                <select
                  name="id_kelas"
                  value={form.id_kelas}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white
                focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition"
                >
                  <option value="">Pilih Kelas</option>
                  {kelasList.map((k) => (
                    <option key={k.id_kelas} value={k.id_kelas}>
                      {k.nama_kelas}
                    </option>
                  ))}
                </select>
              </div>
              <InputAlamat name="alamat" value={form.alamat} onChange={handleChange} placeholder="Alamat" full />
              <InputNoHP name="nohp" value={form.nohp} onChange={handleChange} placeholder="No HP Ortu" full />
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
                    onClick={() => setShowModal(false)}
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

/* INPUT COMPONENTS sama seperti sebelumnya */
function Input({ name, value, onChange, placeholder, full, numeric }) {
  const [error, setError] = useState("");
  const handleChange = (e) => {
    let val = e.target.value;
    if (numeric) {
      if (/\D/.test(val)) {
        setError("Gunakan angka saja");
        val = val.replace(/\D/g, "");
      } else setError("");
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
        className="w-full p-3 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none text-white transition placeholder-gray-400"
      />
      {error && <span className="text-red-400 text-xs mt-1">{error}</span>}
    </div>
  );
}
function InputNoHP({ name, value, onChange, placeholder, full, maxLength = 14 }) {
  const [error, setError] = useState("");
  const handleFocus = () => { if (!value) onChange({ target: { name, value: "+62" } }); };
  const handleChange = (e) => {
    let val = e.target.value.replace(/[^\d+]/g, "");
    if (!val.startsWith("+62")) val = "+62" + val.replace(/^0+/, "");
    if (val.length > maxLength) val = val.slice(0, maxLength);
    if (val.length > maxLength) setError(`Maksimal ${maxLength} karakter`); else setError("");
    onChange({ target: { name, value: val } });
  };
  return (
    <div className={`${full ? "col-span-2" : ""} flex flex-col`}>
      <label className="mb-1 text-gray-400 text-sm font-medium">{placeholder}</label>
      <input type="tel" name={name} value={value} onFocus={handleFocus} onChange={handleChange} placeholder={placeholder}
        className="w-full p-3 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none text-white transition placeholder-gray-400" />
      {error && <span className="text-red-400 text-xs mt-1">{error}</span>}
    </div>
  );
}
function InputAlamat({ name, value, onChange, placeholder, full }) {
  const handleFocus = () => { if (!value) onChange({ target: { name, value: "Jln. " } }); };
  return (
    <div className={`${full ? "col-span-2" : ""} flex flex-col`}>
      <label className="mb-1 text-gray-400 text-sm font-medium">{placeholder}</label>
      <input type="text" name={name} value={value} onFocus={handleFocus} onChange={onChange} placeholder={placeholder}
        className="w-full p-3 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none text-white transition placeholder-gray-400" />
    </div>
  );
}