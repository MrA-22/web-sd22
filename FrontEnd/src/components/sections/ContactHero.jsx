import { useState } from "react";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";

export default function ContactHero() {
  // ================= STATE =================
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [identitas, setIdentitas] = useState({
    email: "",
    alamat: "",
    telepon: "",
  });

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ================= FETCH API =================


  // ================= SUBMIT =================
  const handleSubmit = (e) => {
    e.preventDefault();

    // VALIDASI
    if (!form.name || !form.email || !form.message) {
      alert("Semua field wajib diisi!");
      return;
    }

    emailjs
      .send(
        "service_mr4",
        "template_diwbyo2",
        {
          name: form.name,
          email: form.email,
          message: form.message,
        },
        "XY0qy8JKTPjFN75-e"
      )
      .then(() => {
        alert("Message sent successfully!");
        setForm({ name: "", email: "", message: "" });
      })
      .catch(() => {
        alert("Failed to send message");
      });
  };

  // ================= FORMAT WA =================
  const formatPhone = (phone) => {
    if (!phone) return "";

    const str = String(phone); // 🔥 paksa jadi string

    return str.startsWith("0")
      ? "62" + str.slice(1)
      : str;
  };

  // ================= UI =================
  return (
    <div className=" bg-gray-950 text-white p-6 pt-24">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
          Hubungi Kami
        </h1>

        <p className="text-gray-400 mt-6">
          Kirim pesan kepada kami terkait informasi sekolah, kerjasama, atau pertanyaan lainnya.
        </p>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">


        {/* RIGHT */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10"
        >
          <h2 className="text-purple-400 uppercase text-sm mb-4">
            Kirim Pesan
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama"
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-400 outline-none"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-400 outline-none"
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="5"
              placeholder="Tulis pesan..."
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-400 outline-none"
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 font-semibold"
            >
              Kirim Pesan
            </motion.button>

          </form>
        </motion.div>

      </div>
    </div>
  );
}