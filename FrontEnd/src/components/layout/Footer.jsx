import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getIdentitas } from "../../api/api";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone
} from "react-icons/fa";

export default function Footer() {
  const [identitas, setIdentitas] = useState({
    nama_sekolah: "",
    alamat_sekolah: "",
    email: "",
    noponsel: "",
  });

  useEffect(() => {
    getIdentitas()
      .then(res => {
        const rawData = res?.data || res;
        const data = Array.isArray(rawData) ? rawData[0] : rawData;
        if (data) {
          setIdentitas({
            nama_sekolah: data.nama_sekolah || "",
            alamat_sekolah: data.alamat_sekolah || data.alamat || "",
            email: data.email || "",
            noponsel: data.noponsel || data.telepon || data.no_telp || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  // ================= FORMAT WA =================
  const formatPhone = (phone) => {
    if (!phone) return "";
    const str = String(phone);
    return str.startsWith("0") ? "62" + str.slice(1) : str;
  };

  return (
    <>
      <motion.footer
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-black/50 backdrop-blur-xl border-t border-white/10 mt-5"
      >
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10 text-gray-300">

          {/* LEFT */}
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
              {identitas.nama_sekolah || "Nama Sekolah"}
            </h2>
            <p className="text-sm leading-relaxed">
              Sekolah ini berkomitmen memberikan pendidikan terbaik dengan fasilitas modern
              dan tenaga pengajar profesional.
            </p>
          </div>

          {/* MIDDLE */}
          <div>
            <h2 className="text-white font-semibold mb-4">
              Informasi Kontak
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-cyan-400" />
                <span>{identitas.alamat_sekolah || "-"}</span>
              </div>

              <div className="flex items-center gap-3">
                <FaEnvelope className="text-purple-400" />
                <span>{identitas.email || "-"}</span>
              </div>

              <div className="flex items-center gap-3">
                <FaPhone className="text-green-400" />
                <span>{identitas.noponsel || "-"}</span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <h2 className="text-white font-semibold mb-4">
              Ikuti Kami
            </h2>

            <div className="flex gap-4 text-xl">
              <a href="#" className="hover:text-blue-500 transition">
                <FaFacebookF />
              </a>
              <a href="#" className="hover:text-pink-500 transition">
                <FaInstagram />
              </a>
              <a href="#" className="hover:text-sky-400 transition">
                <FaTwitter />
              </a>
              
              {/* PERBAIKAN LINK WHATSAPP */}
              <a
                href={
                  identitas.noponsel
                    ? `https://wa.me/${formatPhone(identitas.noponsel)}`
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-400 transition"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>

        </div>
      </motion.footer>

      {/* BOTTOM */}
      <div className="text-center text-gray-400 text-sm py-4 border-t border-white/10 bg-black/60">
        © {new Date().getFullYear()} - {identitas.nama_sekolah || "Sekolah"}.
        All Rights Reserved.
      </div>
    </>
  );
}