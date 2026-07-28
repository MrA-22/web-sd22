import { useEffect, useState } from "react";
import AdminSidebar from "../components/layout/AdminSidebar";
import AdminLayout from "../components/layout/AdminLayout";
import {
  getLatar,
  getIdentitas,
  getGuru,
  updateIdentitas as updateIdentitasAPI,
  updateLatar as updateLatarAPI
} from "../api/api";
export default function LatarSekolah() {

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [backgrounds, setBackgrounds] = useState([]);
  const [identitas, setIdentitas] = useState(null);
  const [guru, setGuru] = useState([]);
  const [showIdentitasForm, setShowIdentitasForm] = useState(false);
  const [showLatarForm, setShowLatarForm] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false); // ✅ FIX
  const [previewLatar, setPreviewLatar] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formIdentitas, setFormIdentitas] = useState({
    nama_sekolah: "",
    kepala_sekolah: "",
    nuptkkp: "",
    tahun_ajaran: "",
    semester: "",
    alamat_sekolah: "",
    email: "",
    noponsel: "",
  });

  const [formLatar, setFormLatar] = useState({
    latarGambar: null,
    latarPreview: null,
  });

  // CURSOR EFFECT
  useEffect(() => {
    const handleMouseMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (showIdentitasForm && identitas) {
      setFormIdentitas({
        nama_sekolah: identitas.nama_sekolah || "",
        kepala_sekolah: identitas.namakp_sekolah || "",
        nuptkkp: identitas.nuptkkp || "",
        tahun_ajaran: identitas.tahun_ajaran || "",
        semester: identitas.semester || "",
        alamat_sekolah: identitas.alamat_sekolah || "",
        email: identitas.email || "",
        noponsel: identitas.noponsel || "",
      });
    }
  }, [showIdentitasForm, identitas]);

  const handleFile = (file) => {
    if (!file) return;

    // 🔥 hapus preview lama
    if (previewLatar) {
      URL.revokeObjectURL(previewLatar);
    }

    const preview = URL.createObjectURL(file);

    setPreviewLatar(preview);

    setFormLatar({
      latarGambar: file,
      latarPreview: preview,
    });
  };

  // LOAD DATA
  const loadData = async () => {
    try {
      const [latar, id, g] = await Promise.all([
        getLatar(),
        getIdentitas(),
        getGuru()
      ]);

      setBackgrounds(Array.isArray(latar) ? latar.map(d => d.url) : []);
      setIdentitas(id || null);
      setGuru(Array.isArray(g) ? g : []);
    } catch (err) {
      setModalMessage(err.message);
      setShowModal(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // HANDLE FORM CHANGE
  const handleChangeIdentitas = (e) =>
    setFormIdentitas({ ...formIdentitas, [e.target.name]: e.target.value });

  // input klik
  const handleChangeLatar = (e) => {
    handleFile(e.target.files[0]);

    // 🔥 reset input biar bisa pilih file yang sama lagi
    e.target.value = null;

  };

  const handleKepalaSekolahChange = (nuptk) => {
    const selectedGuru = guru.find(g => String(g.nuptk) === String(nuptk));
    if (!selectedGuru) return;

    setFormIdentitas(prev => ({
      ...prev,
      kepala_sekolah: selectedGuru.nama_guru,
      nuptkkp: selectedGuru.nuptk,
    }));
  };

  // UPDATE IDENTITAS
  const updateIdentitas = async () => {
    try {
      const res = await updateIdentitasAPI({
        nama_sekolah: formIdentitas.nama_sekolah,
        tahun_ajaran: formIdentitas.tahun_ajaran,
        semester: formIdentitas.semester,
        nuptk: formIdentitas.nuptkkp,
        alamat_sekolah: formIdentitas.alamat_sekolah,
        email: formIdentitas.email,
        noponsel: formIdentitas.noponsel,
      });

      if (res.status === "success") {
        setModalMessage("Identitas berhasil diperbarui");
        setShowModal(true);
        setShowIdentitasForm(false);
        loadData();
      } else {
        setModalMessage(res.message || "Gagal update identitas");
        setShowModal(true);
      }
    } catch (err) {
      setModalMessage("Error: " + err.message);
      setShowModal(true);
    }
  };

  // UPDATE LATAR
  const updateLatar = async () => {
    if (!formLatar.latarGambar) return;

    const formData = new FormData();
    formData.append("latar", formLatar.latarGambar);

    const res = await updateLatarAPI(formData);

    if (res.status === "success") {
      setModalMessage("Background berhasil diperbarui");
      setShowModal(true);
      setShowLatarForm(false);
      setFormLatar({ latarGambar: null, latarPreview: null });
      loadData();
    } else {
      setModalMessage(res.message || "Gagal update background");
      setShowModal(true);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex bg-black text-white">
        {/* GLOW */}
        <div
          className="pointer-events-none fixed w-80 h-80 rounded-full blur-3xl opacity-30 bg-cyan-400"
          style={{ left: mouse.x - 150, top: mouse.y - 150 }}
        />
        <div className="fixed w-96 h-96 bg-purple-500 blur-3xl opacity-20 top-10 right-10" />
        <div className="fixed w-96 h-96 bg-blue-500 blur-3xl opacity-20 bottom-10 left-10" />

        <AdminSidebar />

        <div className="flex-1 px-6 py-16 relative z-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-10">
            Latar Sekolah
          </h1>

          <div className="grid md:grid-cols-2 gap-10">

            {/* LATAR */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition-all duration-500"></div>
              <div className="relative bg-black/40 backdrop-blur-lg p-6 rounded-3xl border border-white/20 shadow-xl">
                <img
                  src={
                    formLatar.latarPreview ||
                    (backgrounds.length > 0 ? backgrounds[0] : "https://via.placeholder.com/500")
                  }
                  className="rounded-xl w-full h-85 object-cover mb-5 border border-white/20"
                />
                <button
                  onClick={() => setShowLatarForm(true)}
                  className="w-full py-2 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-500"
                >
                  Ubah Latar
                </button>
              </div>
            </div>

            {/* IDENTITAS */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-3xl blur opacity-30"></div>
              <div className="relative bg-black/40 backdrop-blur-lg p-6 rounded-3xl border border-white/20 shadow-xl space-y-4">
                {identitas ? (
                  <>
                    {[
                      ["Nama :", identitas.nama_sekolah],
                      ["Kepala Sekolah :", identitas.namakp_sekolah],
                      ["NUPTK :", identitas.nuptkkp],
                      ["Tahun Ajaran :", identitas.tahun_ajaran],
                      ["Semester :", identitas.semester],
                      ["Alamat :", identitas.alamat_sekolah],
                      ["Email :", identitas.email],
                      ["No HP :", identitas.noponsel],
                    ].map(([label, value]) => (
                      <div key={label} className="flex gap-4 border-b border-white/20 py-2">
                        <span className="text-gray-300 w-36">{label}</span>
                        <span>{value}</span>
                      </div>
                    ))}

                    <button
                      onClick={() => setShowIdentitasForm(true)}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500"
                    >
                      Edit Identitas
                    </button>
                  </>
                ) : (
                  <p className="text-gray-400 text-center">Tidak ada data</p>
                )}
              </div>
            </div>
          </div>

          {/* MODAL IDENTITAS */}
          {showIdentitasForm && (
            <Modal title="Edit Identitas" onClose={() => setShowIdentitasForm(false)}>
              <label className="text-black block">
                Nama Sekolah
              </label>
              <InputField
                name="nama_sekolah"
                value={formIdentitas.nama_sekolah}
                onChange={handleChangeIdentitas}
              />
              <label className="text-black block">
                Kepala Sekolah
              </label>
              <select
                value={formIdentitas.nuptkkp || ""}
                onChange={(e) => handleKepalaSekolahChange(e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-800 mb-1"
              >
                <option value="">-- Pilih Guru --</option>
                {guru.map(g => (
                  <option key={g.nuptk} value={String(g.nuptk)}>
                    {g.nama_guru}
                  </option>
                ))}
              </select>
              <label className="text-black block">
                Tahun Ajaran
              </label>
              <select
                value={formIdentitas.tahun_ajaran || ""}
                onChange={(e) =>
                  setFormIdentitas({
                    ...formIdentitas,
                    tahun_ajaran: e.target.value,
                  })
                }
                className="w-full p-3 rounded-xl bg-gray-800 mb-1"
              >
                <option value="">-- Tahun Ajaran --</option>

                {Array.from({ length: 2200 - 2027 + 1 }, (_, i) => {
                  const start = 2027 + i;
                  const end = start + 1;
                  return (
                    <option key={start} value={`${start}/${end}`}>
                      {start}/{end}
                    </option>
                  );
                })}
              </select>
              <label className="text-black block">
                Semester
              </label>
              <select
                name="semester"
                value={formIdentitas.semester || ""}
                onChange={(e) =>
                  setFormIdentitas({
                    ...formIdentitas,
                    semester: e.target.value,
                  })
                }
                className="w-full p-3 rounded-xl bg-gray-800 mb-1"
              >
                <option value="">-- Semester --</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
              <label className="text-black block">
                Alamat Sekolah
              </label>
              <InputField name="alamat_sekolah" value={formIdentitas.alamat_sekolah} onChange={handleChangeIdentitas} />
              <label className="text-black block">
                Email
              </label>
              <InputField name="email" value={formIdentitas.email} onChange={handleChangeIdentitas} />
              <label className="text-black block">
                No. Telepon
              </label>
              <InputField name="noponsel" value={formIdentitas.noponsel} onChange={handleChangeIdentitas} />

              <ModalButton onClick={updateIdentitas} text="Simpan" />
            </Modal>
          )}

          {/* MODAL LATAR */}
          {showLatarForm && (
            <Modal title="Ubah Latar" onClose={() => setShowLatarForm(false)}>

              {/* Upload Box */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer
                  ${isDragging ? "border-cyan-400 bg-cyan-400/10" : "border-white/20"}
                `}

                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}

                onDragLeave={() => setIsDragging(false)}

                // drag drop
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);

                  const file = e.dataTransfer.files[0];
                  handleFile(file);
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChangeLatar}
                  className="hidden"
                  id="uploadLatar"
                />

                <label htmlFor="uploadLatar" className="cursor-pointer">
                  <p className="text-sm text-gray-300">
                    Drag & drop atau klik untuk upload
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG / JPG (max 2MB)
                  </p>
                </label>
              </div>

              {/* Preview */}
              {previewLatar && (
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-2">Preview:</p>
                  <img
                    key={previewLatar}
                    src={previewLatar}s
                    className="w-full h-40 object-cover rounded-lg border border-white/10"
                  />
                </div>
              )}

              {/* Button */}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowLatarForm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm"
                >
                  Batal
                </button>

                <button
                  onClick={updateLatar}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold rounded-lg hover:scale-105 transition"
                >
                  Simpan
                </button>
              </div>

            </Modal>
          )}

          {/* MODAL MESSAGE */}
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
    </AdminLayout>
  );
}

/* COMPONENTS */
function Modal({ title, children, onClose, className = "" }) {
  return (
    <div className={`fixed inset-0 flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>

      <div className="relative z-10 w-full max-w-md p-6 bg-white/60 rounded-2xl">
        <div className="flex justify-between mb-4">
          <h2>{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ModalButton({ onClick, text }) {
  return (
    <button onClick={onClick} className="w-full py-2 bg-cyan-500 rounded-xl">
      {text}
    </button>
  );
}

function InputField({ name, value, onChange, placeholder }) {
  return (
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-3 rounded-xl bg-gray-800 mb-1"
    />
  );
}