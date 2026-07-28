import { useEffect, useState } from "react";
import AdminSidebar from "../components/layout/AdminSidebar";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun } from "docx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AdminLayout from "../components/layout/AdminLayout";

export default function JadwalPage() {
  const [data, setData] = useState([]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [guruList, setGuruList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showModalJadwal, setShowModalJadwal] = useState(false);
  const [showModalMapel, setShowModalMapel] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmKelasId, setConfirmKelasId] = useState(null);
  const [exportKelas, setExportKelas] = useState("all"); // default: export all
  const normalizeHari = (h) => h?.trim().toLowerCase();

  const normalizeJam = (time) => {
    if (!time) return "";
    return time.substring(0, 5);
  };
  const loadImageBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // penting kalau dari server

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = reject;
      img.src = url;
    });
  };

  const exportPDF = async () => {
    const kelasToExport = exportKelas === "all"
      ? kelasList
      : kelasList.filter(k => String(k.id_kelas) === String(exportKelas));

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    // 🔥 LOAD LOGO
    let logoBase64 = null;
    try {
      logoBase64 = await loadImageBase64("/uploads/logo/logo.png");
    } catch (e) {
      console.log("Logo gagal dimuat");
    }

    kelasToExport.forEach((kelas, index) => {
      const jadwalKelas = data.filter(j => String(j.kelas_id) === String(kelas.id_kelas));
      const slots = generateSlots();

      // 🏫 LOGO
      if (logoBase64) {
        pdf.addImage(logoBase64, "PNG", 15, 8, 15, 15); // x, y, width, height
      }

      // 🔥 JUDUL
      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
      pdf.text(
        `JADWAL PELAJARAN KELAS ${kelas.nama_kelas}`,
        pageWidth / 2,
        12,
        { align: "center" }
      );

      // 🔵 HEADER
      const tableHead = [
        [
          { content: "JAM KE", rowSpan: 2 },
          { content: "WAKTU", rowSpan: 2 },
          { content: "HARI", colSpan: hariList.length }
        ],
        hariList.map(h => ({ content: h.toUpperCase() }))
      ];

      // 🔽 BODY
      const tableBody = slots.map((slot, i) => {
        const row = [
          i + 1,
          `${formatHHMM(slot.jamMulai)}-${formatHHMM(slot.jamSelesai)}`
        ];

        hariList.forEach(hari => {
          if (slot.type === "mapel") {
            const mapel = jadwalKelas.find(j =>
              normalizeHari(j.hari) === normalizeHari(hari) &&
              normalizeJam(j.jam_mulai) === formatHHMM(slot.jamMulai)
            );

            row.push(
              mapel
                ? `${mapel.mapel?.mapel || "-"}\n${mapel.guru?.nama_guru || "-"}`
                : "-"
            );
          } else {
            row.push("ISTIRAHAT");
          }
        });

        return row;
      });

      autoTable(pdf, {
        head: tableHead,
        body: tableBody,
        startY: 25,

        styles: {
          fontSize: 8,
          halign: "center",
          valign: "middle"
        },
        didParseCell: (data) => {
          // 🔵 BARIS PERTAMA (JAM KE, WAKTU, HARI)
          if (data.section === "head" && data.row.index === 0) {
            data.cell.styles.fillColor = [0, 176, 240]; // biru
            data.cell.styles.textColor = 255;
            data.cell.styles.fontStyle = "bold";
          }

          // 🟡 BARIS KEDUA (SENIN - SABTU SAJA)
          if (data.section === "head" && data.row.index === 1) {
            data.cell.styles.fillColor = [255, 165, 0]; // kuning
            data.cell.styles.textColor = 255;
            data.cell.styles.fontStyle = "bold";
          }

          // ⚪ DEFAULT BODY (PUTIH)
          if (data.section === "body") {
            data.cell.styles.fillColor = [255, 255, 255]; // putih
          }

          // 🟢 KHUSUS ISTIRAHAT
          if (data.cell.raw === "ISTIRAHAT") {
            data.cell.styles.fillColor = [146, 208, 80]; // hijau
            data.cell.styles.fontStyle = "bold";
          }
        },

        theme: "grid",
        margin: { left: 10, right: 10 }
      });

      // 📄 FOOTER
      pdf.setFontSize(9);
      pdf.setTextColor(100);
      pdf.text(
        `Halaman ${index + 1} / ${kelasToExport.length}`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );

      if (index < kelasToExport.length - 1) pdf.addPage();
    });

    pdf.save(
      exportKelas === "all"
        ? `Jadwal_Semua_Kelas.pdf`
        : `Jadwal_Kelas_${kelasToExport[0].nama_kelas}.pdf`
    );
  };

  const exportWord = async () => {
    const kelasToExport = exportKelas === "all"
      ? kelasList
      : kelasList.filter(k => String(k.id_kelas) === String(exportKelas));

    const sections = [];

    for (const kelas of kelasToExport) {
      const jadwalKelas = data.filter(j => String(j.kelas_id) === String(kelas.id_kelas));
      const slots = generateSlots();

      const tableRows = [

        // 🔵 HEADER ATAS (JAM KE, WAKTU, HARI merge)
        new TableRow({
          children: [
            new TableCell({
              rowSpan: 2,
              children: [new Paragraph({ text: "JAM KE", bold: true, alignment: "center" })],
              shading: { fill: "f4cccc" },
            }),
            new TableCell({
              rowSpan: 2,
              children: [new Paragraph({ text: "WAKTU", bold: true, alignment: "center" })],
              shading: { fill: "f4cccc" },
            }),
            new TableCell({
              columnSpan: hariList.length,
              children: [new Paragraph({ text: "HARI", bold: true, alignment: "center" })],
              shading: { fill: "00b0f0" },
            }),
          ]
        }),

        // 🟡 NAMA HARI
        new TableRow({
          children: hariList.map(h => new TableCell({
            children: [new Paragraph({ text: h.toUpperCase(), bold: true, alignment: "center" })],
            shading: { fill: "ffff00" },
          }))
        }),

        // 🔽 ISI
        ...slots.map((slot, index) => new TableRow({
          children: [
            // JAM KE
            new TableCell({
              children: [new Paragraph({
                text: String(index + 1),
                alignment: "center"
              })],
            }),

            // WAKTU
            new TableCell({
              children: [new Paragraph({
                text: `${formatHHMM(slot.jamMulai)}-${formatHHMM(slot.jamSelesai)}`,
                alignment: "center"
              })],
            }),

            // MAPEL / ISTIRAHAT
            ...hariList.map(hari => {
              if (slot.type === "istirahat") {
                return new TableCell({
                  children: [new Paragraph({
                    text: "ISTIRAHAT",
                    bold: true,
                    alignment: "center"
                  })],
                  shading: { fill: "92d050" } // hijau
                });
              }

              const mapel = jadwalKelas.find(j =>
                normalizeHari(j.hari) === normalizeHari(hari) &&
                normalizeJam(j.jam_mulai) === formatHHMM(slot.jamMulai)
              );

              return new TableCell({
                children: [new Paragraph({
                  text: mapel
                    ? `${mapel.mapel?.mapel || "-"}\n${mapel.guru?.nama_guru || "-"}`
                    : "-",
                  alignment: "center"
                })],
              });
            })
          ]
        }))
      ];

      sections.push({
        properties: {},
        children: [

          // 🔥 JUDUL BESAR (SEPERTI GAMBAR)
          new Paragraph({
            text: `DAFTAR PELAJARAN KELAS ${kelas.nama_kelas}`,
            bold: true,
            size: 32,
            alignment: "center",
            spacing: { after: 300 }
          }),

          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE }
          })
        ]
      });
    }

    const doc = new Document({ sections });
    const blob = await Packer.toBlob(doc);

    saveAs(
      blob,
      exportKelas === "all"
        ? `Jadwal_Semua_Kelas.docx`
        : `Jadwal_Kelas_${kelasToExport[0].nama_kelas}.docx`
    );
  };

  const showMessage = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const [formMapel, setFormMapel] = useState({
    kelas_id: "",
    hari: "Senin",
    mapel: "",
    guru: "",
    slot: ""
  });

  const [formTambahMapel, setFormTambahMapel] = useState({ mapel: "" });
  const [istirahatPerHari, setIstirahatPerHari] = useState(2);

  const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const jamBelajar = 40;
  const istirahat = 30;
  const startDay = 7 * 60 + 30; // 07:30
  const endDay = 15 * 60;       // 15:00

  const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  // Generate slot belajar & istirahat untuk dropdown
  const generateSlots = () => {
    const slots = [];
    const totalMinutes = endDay - startDay;
    const interval = Math.floor(totalMinutes / (istirahatPerHari + 1));
    const istirahatTimes = [];
    for (let i = 1; i <= istirahatPerHari; i++) {
      istirahatTimes.push(startDay + interval * i);
    }

    let current = startDay;
    while (current < endDay) {
      const jamMulaiStr = `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`;
      let jamSelesai = current + jamBelajar;
      if (jamSelesai > endDay) jamSelesai = endDay;
      const jamSelesaiStr = `${String(Math.floor(jamSelesai / 60)).padStart(2, "0")}:${String(jamSelesai % 60).padStart(2, "0")}`;

      const isIstirahat = istirahatTimes.some(t => t >= current && t < jamSelesai);
      if (isIstirahat) {
        const istStart = istirahatTimes.find(t => t >= current && t < jamSelesai);
        const istEnd = istStart + istirahat;
        const istStartStr = `${String(Math.floor(istStart / 60)).padStart(2, "0")}:${String(istStart % 60).padStart(2, "0")}`;
        const istEndStr = `${String(Math.floor(istEnd / 60)).padStart(2, "0")}:${String(istEnd % 60).padStart(2, "0")}`;
        slots.push({ type: "istirahat", jamMulai: istStartStr + ":00", jamSelesai: istEndStr + ":00" });
        current = istEnd;
      } else {
        slots.push({ type: "mapel", jamMulai: jamMulaiStr + ":00", jamSelesai: jamSelesaiStr + ":00" });
        current = jamSelesai;
      }
    }
    return slots;
  };
  // Tambahkan ini di dalam function JadwalPage
  const handleResetClick = (kelasId) => {
    setConfirmKelasId(kelasId); // simpan ID kelas yang akan di-reset
    setShowConfirm(true);       // tampilkan modal konfirmasi
  };

  const submitJadwal = async () => {
    if (!formMapel.kelas_id || !formMapel.mapel || !formMapel.guru || !formMapel.slot) {
      showMessage("Semua field wajib diisi!");
      return;
    }

    const [jam_mulai, jam_selesai] = formMapel.slot.split(" - ");

    const jadwalKelas = data.filter(
      d => String(d.kelas_id) === String(formMapel.kelas_id) && d.hari === formMapel.hari
    );

    const startMin = toMinutes(jam_mulai);
    const endMin = toMinutes(jam_selesai);

    const bentrok = jadwalKelas.some(j => {
      const jStart = toMinutes(j.jam_mulai);
      const jEnd = toMinutes(j.jam_selesai);
      return startMin < jEnd && endMin > jStart;
    });

    if (bentrok) {
      showMessage("Slot jadwal bertabrakan!");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/jadwal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          kelas_id: Number(formMapel.kelas_id),
          hari: formMapel.hari,
          mapel_id: Number(formMapel.mapel),
          guru_id: Number(formMapel.guru),
          jam_mulai,
          jam_selesai
        })

      });
      console.log("KIRIM KE BACKEND:", {
        kelas_id: formMapel.kelas_id,
        mapel_id: formMapel.mapel,
        guru_id: formMapel.guru
      });
      // ❌ HAPUS ini
      // const text = await res.text();
      // console.log(text);

      // ✅ GANTI dengan ini
      const result = await res.json();
      console.log(result);
      if (result.status === "success") {
        showMessage("Jadwal berhasil ditambahkan!");
        setShowModalJadwal(false);
        setFormMapel({ kelas_id: "", hari: "Senin", mapel: "", guru: "", slot: "" });

        // refresh data dari Laravel
        fetch("http://localhost:8000/api/jadwal")
          .then(res => res.json())
          .then(setData);
        console.log("DATA KIRIM:", {
          kelas_id: formMapel.kelas_id,
          hari: formMapel.hari,
          mapel_id: formMapel.mapel,
          guru_id: formMapel.guru,
          jam_mulai,
          jam_selesai
        });
      } else {
        showMessage("Gagal: " + (result.error || "Tidak diketahui"));
      }
    } catch (err) {
      console.error(err);
      showMessage("Gagal koneksi ke server!");
    }
  };

  const submitTambahMapel = async () => {
    if (!formTambahMapel.mapel) {
      showMessage("Masukkan nama Mapel!");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/mapel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mapel: formTambahMapel.mapel
        })
      });

      const result = await res.json();

      if (result.status === "success") {
        showMessage("Mapel berhasil ditambahkan!");
        setShowModalMapel(false);
        setFormTambahMapel({ mapel: "" });

        fetch("http://localhost:8000/api/mapel")
          .then(res => res.json())
          .then(setMapelList);

      } else {
        showMessage("Gagal: " + (result.error || "Tidak diketahui"));
      }
    } catch (err) {
      console.error(err);
      showMessage("Gagal koneksi ke server!");
    }
  };

  const confirmReset = async () => {
    setShowConfirm(false);
    if (!confirmKelasId) return;

    try {
      const res = await fetch("http://localhost:8000/api/jadwal/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          kelas_id: confirmKelasId
        })
      });

      const result = await res.json();

      if (result.status === "success") {
        showMessage("Jadwal berhasil di-reset!");

        fetch("http://localhost:8000/api/jadwal")
          .then(res => res.json())
          .then(setData);

      } else {
        showMessage("Gagal reset: " + (result.error || "Tidak diketahui"));
      }
    } catch (err) {
      console.error(err);
      showMessage("Gagal koneksi ke server!");
    }
  };

  useEffect(() => {
    fetch("http://localhost:8000/api/jadwal")
      .then(res => res.json())
      .then(setData);

    fetch("http://localhost:8000/api/guru").then(res => res.json()).then(setGuruList);
    fetch("http://localhost:8000/api/kelas").then(res => res.json()).then(setKelasList);
    fetch("http://localhost:8000/api/mapel").then(res => res.json()).then(setMapelList);
  }, []);

  useEffect(() => {
    const move = e => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const handleChange = e => setFormMapel({ ...formMapel, [e.target.name]: e.target.value });
  const handleTambahMapelChange = e => setFormTambahMapel({ ...formTambahMapel, [e.target.name]: e.target.value });
  const formatHHMM = time => time.slice(0, 5);

  const slotOptions = generateSlots().filter(s => s.type === "mapel").map(s => ({ value: `${s.jamMulai} - ${s.jamSelesai}`, label: `${s.jamMulai} - ${s.jamSelesai}` }));

  return (
    <AdminLayout>
      <div className="min-h-screen flex bg-black text-white">
        <AdminSidebar />

        {/* CURSOR GLOW */}
        <div
          className="pointer-events-none fixed w-72 h-72 rounded-full blur-3xl opacity-30 bg-cyan-400"
          style={{ left: mouse.x - 150, top: mouse.y - 150 }}
        />
        <div className="pointer-events-none fixed w-96 h-96 bg-purple-500 blur-3xl opacity-20 top-10 right-10" />
        <div className="fixed w-96 h-96 bg-blue-500 blur-3xl opacity-20 bottom-10 left-10" />
        <div className="flex-1 px-6 py-16 relative">
          <div className="mb-6">
            <label>Jumlah Istirahat per Hari: </label>
            <select value={istirahatPerHari} onChange={e => setIstirahatPerHari(Number(e.target.value))} className="ml-2 p-1 rounded bg-black/60 border border-white/20">
              <option value={0}>0x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={3}>3x</option>
              <option value={4}>4x</option>
              <option value={5}>5x</option>
            </select>
          </div>

          <div className="pointer-events-none fixed w-72 h-72 rounded-full blur-3xl opacity-30 bg-cyan-400"
            style={{ left: mouse.x - 150, top: mouse.y - 150 }} />

          <div className="flex justify-between items-center mb-6 gap-2 flex-wrap">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Jadwal Kelas</h1>
            <div className="flex gap-2 items-center mb-6">
              <label className="font-semibold">Export Jadwal:</label>
              <select
                value={exportKelas}
                onChange={e => setExportKelas(e.target.value)}
                className="p-2 rounded bg-black/60 border border-white/30"
              >
                <option value="all">Semua Kelas</option>
                {kelasList.map(k => <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>)}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={exportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Export PDF
                </button>
                <button
                  onClick={exportWord}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Export Word
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mb-4 items-center">
            <button onClick={() => setShowModalJadwal(true)} className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition">＋ Tambah Jadwal</button>
            <button onClick={() => setShowModalMapel(true)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition">＋ Tambah Mapel</button>

          </div>
          {/* Tabel Jadwal */}
          {kelasList.map(kelas => {
            const jadwalKelas = data.filter(j => String(j.kelas_id) === String(kelas.id_kelas));
            const slots = generateSlots();
            return (
              <div key={kelas.id_kelas} id={`jadwal-${kelas.id_kelas}`} className="mb-6 overflow-x-auto bg-black/40 p-4 rounded-xl border border-white/20">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold mb-2 text-lg md:text-xl">Kelas {kelas.nama_kelas}</h2>
                  <button
                    onClick={() => handleResetClick(kelas.id_kelas)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold transition"
                  >
                    Reset Jadwal
                  </button>
                </div>
                <table className="min-w-full text-xs md:text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-500 text-white text-center text-[10px] md:text-sm">
                      <th className="p-2 border">Jam</th>
                      {hariList.map(hari => <th key={hari} className="p-2 border">{hari}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((slot, index) => (
                      <tr key={index} className="text-center text-[10px] md:text-sm">
                        <td className="p-1 md:p-2 border">{formatHHMM(slot.jamMulai)}-{formatHHMM(slot.jamSelesai)}</td>
                        {hariList.map(hari => {
                          if (slot.type === "mapel") {
                            const mapel = jadwalKelas.find(j => {
                              return (
                                normalizeHari(j.hari) === normalizeHari(hari) &&
                                normalizeJam(j.jam_mulai) === formatHHMM(slot.jamMulai)
                              );
                            });
                            return (
                              <td key={hari} className="p-1 md:p-2 border">
                                {mapel ? (
                                  <div>
                                    {mapel.mapel?.mapel || "-"}
                                    <br />
                                    <span className="text-[8px] md:text-xs text-gray-300">
                                      {mapel.guru?.nama_guru || "-"}
                                    </span>
                                  </div>
                                ) : "-"}
                              </td>
                            );
                          } else {
                            return <td key={hari} className="p-1 md:p-2 border bg-green-500 text-black font-bold text-[8px] md:text-xs">ISTIRAHAT</td>;
                          }
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}

          {/* Modal Tambah Jadwal */}
          {showModalJadwal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-black/90 p-6 rounded-xl border border-white/20 shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Tambah Jadwal</h2>

                <label className="block mb-2 text-gray-300">Kelas</label>
                <select name="kelas_id" value={formMapel.kelas_id} onChange={handleChange} className="w-full p-2 rounded bg-black/60 border border-white/20 mb-3">
                  <option value="">Pilih Kelas</option>
                  {kelasList.map(k => <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>)}
                </select>

                <label className="block mb-2 text-gray-300">Hari</label>
                <select name="hari" value={formMapel.hari} onChange={handleChange} className="w-full p-2 rounded bg-black/60 border border-white/20 mb-3">
                  {hariList.map(h => <option key={h}>{h}</option>)}
                </select>

                <label className="block mb-2 text-gray-300">Mapel</label>
                <select
                  name="mapel"
                  value={formMapel.mapel}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-black/60 border border-white/20 mb-3"
                >
                  <option value="">Pilih Mapel</option>
                  {mapelList.map(m => (
                    <option key={m.id_mapel} value={m.id_mapel}>
                      {m.mapel}
                    </option>
                  ))}
                </select>

                <label className="block mb-2 text-gray-300">Guru</label>
                <select
                  name="guru"
                  value={formMapel.guru}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-black/60 border border-white/20 mb-3"
                >
                  <option value="">Pilih Guru</option>
                  {guruList.map(g => (
                    <option key={g.id_guru} value={g.id_guru}>
                      {g.nama_guru}
                    </option>
                  ))}
                </select>

                <label className="block mb-2 text-gray-300">Pilih Slot Jam</label>
                <select name="slot" value={formMapel.slot} onChange={handleChange} className="w-full p-2 rounded bg-black/60 border border-white/20 mb-4">
                  <option value="">Pilih Slot</option>
                  {slotOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>

                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowModalJadwal(false)} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition">Batal</button>
                  <button onClick={submitJadwal} className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 transition">Simpan</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Tambah Mapel */}
          {showModalMapel && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-black/90 p-6 rounded-xl border border-white/20 shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Tambah Mapel Baru</h2>
                <label className="block mb-2 text-gray-300">Nama Mapel</label>
                <input type="text" name="mapel" value={formTambahMapel.mapel} onChange={handleTambahMapelChange} className="w-full p-2 rounded bg-black/60 border border-white/20 mb-4" />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowModalMapel(false)} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition">Batal</button>
                  <button onClick={submitTambahMapel} className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 transition">Simpan</button>
                </div>
              </div>
            </div>
          )}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-black/90 p-6 rounded-xl border border-white/20 shadow-lg w-80">
                <p className="text-white text-center">{modalMessage}</p>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 transition"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
          {showConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-black/90 p-6 rounded-xl border border-white/20 shadow-lg w-80">
                <p className="text-white text-center">Apakah kamu yakin ingin mereset semua jadwal kelas ini?</p>
                <div className="flex justify-center mt-4 gap-4">
                  <button onClick={() => setShowConfirm(false)} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">Batal</button>
                  <button onClick={confirmReset} className="px-4 py-2 rounded bg-red-500 hover:bg-red-600">Ya, Reset</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}