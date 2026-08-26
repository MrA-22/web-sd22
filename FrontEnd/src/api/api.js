// src/api/api.js
const BASE_URL = "https://data.mrapro.site/api";

const BASE_STORAGE_URL = "https://data.mrapro.site/uploads";
async function request(url, options = {}) {
    try {
        const isFormData = options.body instanceof FormData;

        const res = await fetch(`${BASE_URL}${url}`, {
            headers: {
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                ...options.headers,
            },
            ...options,
        });

        const text = await res.text();

        try {
            return JSON.parse(text);
        } catch {
            console.error("Bukan JSON:", text);
            return { status: "error", message: "Response bukan JSON" };
        }

    } catch (err) {
        console.error("API ERROR:", err);
        return { status: "error", message: err.message };
    }
}

// ==================== AUTH ====================
export const loginUser = (data) =>
    request("/login", {
        method: "POST",
        body: JSON.stringify(data),
    });

//============= Guru & Siswa (pakai FormData) =============
export const addSiswaFormData = async (formData) => {
    try {
        const res = await fetch(`${BASE_URL}/siswa`, {
            method: "POST",
            body: formData,
        });

        const text = await res.text();
        console.log("RESPONSE SISWA:", text);

        try {
            return JSON.parse(text);
        } catch {
            return { status: "error", message: "Data Tidak Lengkap!!!" };
        }
    } catch (err) {
        return { status: "error", message: err.message };
    }
};

export const addGuruFormData = async (formData) => {
    try {
        const res = await fetch(`${BASE_URL}/guru`, {
            method: "POST",
            body: formData,
        });

        const text = await res.text(); // ambil text mentah
        console.log("Response server:", text); // <-- log ini, lihat isi error Laravel

        try {
            return JSON.parse(text);
        } catch (err) {
            return { status: "error", message: "Server tidak merespon JSON, cek console" };
        }
    } catch (err) {
        console.error("Fetch error:", err);
        return { status: "error", message: "Terjadi error koneksi ke server" };
    }
};

export const updateGuruFormData = async (id, formData) => {
    try {
        // Pastikan kita menggunakan POST (sesuai route Laravel Anda) 
        // dan biarkan browser mengatur boundary FormData secara otomatis (jangan set Content-Type manual)
        const res = await fetch(`${BASE_URL}/guru/${id}`, {
            method: "POST",
            body: formData,
        });

        const text = await res.text();
        console.log("RESPONSE UPDATE GURU:", text);

        try {
            return JSON.parse(text);
        } catch {
            console.error("Bukan JSON:", text);
            return { status: "error", message: "Gagal memproses response server (Bukan JSON)" };
        }
    } catch (err) {
        console.error("Fetch error:", err);
        return { status: "error", message: err.message };
    }
};


// ==================== DASHBOARD ====================
export const getDashboard = () => request("/dashboard");
// ==================== GURU ====================
export const getGuru = () => request("/guru");
export const getGuruById = (id) => request(`/guru/${id}`);

export const updateGuru = (id, data) => request(`/guru/${id}`, { method: "POST", body: JSON.stringify(data) });
export const deleteGuru = (id) => request(`/guru/${id}`, { method: "DELETE" });
export const setKepalaSekolah = (data) => request("/guru/ubah-jabatan", { method: "POST", body: JSON.stringify(data) });

// ==================== SISWA ====================
export const getSiswa = () => request("/siswa");
export const getSiswaById = (id) => request(`/siswa/${id}`);
export const addSiswa = (data) => request("/siswa", { method: "POST", body: JSON.stringify(data) });
export const updateSiswa = (id, data) => request(`/siswa/${id}`, { method: "POST", body: JSON.stringify(data) });
export const deleteSiswa = (id) => request(`/siswa/${id}`, { method: "DELETE" });

// ==================== MAPEL ====================
export const getMapel = () => request("/mapel");
export const addMapel = (data) => request("/mapel", { method: "POST", body: JSON.stringify(data) });

// ==================== KELAS ====================
export const getKelas = () => request("/kelas");
export const addKelas = (data) => request("/kelas", { method: "POST", body: JSON.stringify(data) });
export async function updateKelas(id, data) {
    return request(`/kelas/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}
// ==================== NILAI ====================
export const getNilai = () => request("/nilai");
export const addNilai = (data) => request("/nilai", { method: "POST", body: JSON.stringify(data) });
export const deleteNilai = (id) => request(`/nilai/${id}`, { method: "DELETE" });

export const updateNilai = (id, data) =>
    request(`/nilai/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });

export const rekapNilai = () => request("/rekap-nilai");
// ==================== JADWAL ====================
export const getJadwal = () => request("/jadwal");
export const addJadwal = (data) => request("/jadwal", { method: "POST", body: JSON.stringify(data) });
export const deleteJadwal = (id) => request(`/jadwal/${id}`, { method: "DELETE" });
export const resetJadwal = (data) => request("/jadwal/reset", { method: "POST", body: JSON.stringify(data) });

// ==================== IDENTITAS ====================
export const getIdentitas = () => request("/identitas");
export const updateIdentitas = (data) => request("/identitas/update", { method: "POST", body: JSON.stringify(data) });
export const jadwalHariIni = () => request("/jadwal-hari-ini");

// ==================== LATAR ====================
export const getLatar = () => request("/latar");
export const updateLatar = (formData) =>
    request("/latar/update", {
        method: "POST",
        body: formData // ✅ LANGSUNG kirim FormData
    });

// ==================== ARTIKEL ====================
export const getArtikel = () => request("/artikel");
export const getArtikelById = (id) => request(`/artikel/${id}`);
export const addArtikel = (formData) =>
    fetch(`${BASE_URL}/artikel`, {
        method: "POST",
        body: formData, // kirim FormData langsung
    })
        .then(async (res) => {
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch {
                console.error("Response bukan JSON:", text);
                return { status: "error", message: "Data Tidak Lengkap!!!" };
            }
        });

export const updateArtikel = (id, formData) =>
    fetch(`${BASE_URL}/artikel/${id}`, {
        method: "POST",
        body: formData,
    })
        .then(async (res) => {
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch {
                console.error("Response bukan JSON:", text);
                return { status: "error", message: "Data Tidak Lengkap!!!" };
            }
        });
export const deleteArtikel = (id) => request(`/artikel/${id}`, { method: "DELETE" });

export const updateSiswaFormData = (id, data) => updateSiswa(id, data);

export const getFotoSiswaUrl = (filename) => {
  return `${BASE_STORAGE_URL}/Gambar_Siswa/${filename}`;
};