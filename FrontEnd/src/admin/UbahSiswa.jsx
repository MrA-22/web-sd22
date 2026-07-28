import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/layout/AdminSidebar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AdminLayout from "../components/layout/AdminLayout";

export default function UbahSiswa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

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

  // CURSOR GLOW
  useEffect(() => {
    const handleMouseMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // LOAD DATA SISWA
  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/siswa/${id}`, {
          headers: { "Accept": "application/json" }
        });
        if (!res.ok) throw new Error("Gagal memuat data siswa");

        const data = await res.json();

        setForm({
          nisn: data.nisn || "",
          nama: data.nama_siswa || "",
          tanggal_lahir: data.tgll_siswa ? new Date(data.tgll_siswa) : null,
          id_kelas: data.id_kelas || "",
          alamat: data.alamat || "",
          nohp: data.nohp_ortu || "",
          foto: null,
          preview: data.foto_siswa
            ? `http://localhost:8000/uploads/Gambar_Siswa/${data.foto_siswa}`
            : null
        });
      } catch (err) {
        console.error(err);
        setModalMessage(err.message || "Gagal mengambil data siswa");
        setShowModal(true);
      }
    };

    fetchSiswa();
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
      formData.append("nisn", form.nisn);
      formData.append("nama", form.nama);
      formData.append("alamat", form.alamat);
      formData.append("nohp", form.nohp);
      formData.append("id_kelas", form.id_kelas);
      if (form.tanggal_lahir) {
        formData.append(
          "tanggal_lahir",
          form.tanggal_lahir.toISOString().split("T")[0]
        );
      }
      if (form.foto) {
        formData.append("foto", form.foto);
      }

      // ✅ gunakan method PUT
      const res = await fetch(`http://localhost:8000/api/siswa/${id}`, {
        method: "POST", // tetap POST kalau pakai _method
        body: formData,
        headers: {
          "Accept": "application/json" // Laravel akan balikin JSON
        }
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setModalMessage("Server tidak merespon JSON atau data belum lengkap");
        setShowModal(true);
        return;
      }

      if (data.status === "success") {
        setModalMessage("Data siswa berhasil diubah!");
        setShowModal(true);
      } else {
        // Laravel Validator balikin errors object
        if (data.errors) {
          const errMsg = Object.values(data.errors).flat().join("\n");
          setModalMessage(errMsg);
        } else {
          setModalMessage(data.message || "Data belum terisi semua");
        }
        setShowModal(true);
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

          {/* TITLE */}
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Ubah Siswa
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

              <Input name="nisn" value={form.nisn} onChange={handleChange} placeholder="NISN" />
              <Input name="nama" value={form.nama} onChange={handleChange} placeholder="Nama Siswa" />

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

              <Input name="id_kelas" value={form.id_kelas} onChange={handleChange} placeholder="Kelas" />
              <InputAlamat name="alamat" value={form.alamat} onChange={handleChange} placeholder="Alamat" full />
              <InputNoHP name="nohp" value={form.nohp} onChange={handleChange} placeholder="No HP Orang Tua" full />
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
                      navigate("/siswapanel"); // pindah halaman setelah klik OK
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

/* ================= COMPONENT INPUT ================= */
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
    val = val.replace(/[^\d+]/g, "");
    if (!val.startsWith("+62")) {
      val = val.replace(/^0+/, "");
      val = "+62" + val;
    }
    if (val.length > maxLength) val = val.slice(0, maxLength);
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