import { useEffect, useState } from "react";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import AdminSidebar from "../components/layout/AdminSidebar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getNilai, getKelas, getMapel, updateNilai, getGuru, updateKelas } from "../api/api";
import AdminLayout from "../components/layout/AdminLayout";

export default function PanelNilai() {
  const [data, setData] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [exportKelas, setExportKelas] = useState("all");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMapel, setEditMapel] = useState("");
  const [editNilai, setEditNilai] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [selectedSiswaNama, setSelectedSiswaNama] = useState("");
  const [showSetWaliModal, setShowSetWaliModal] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState("");
  const [guruList, setGuruList] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };
  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const nilaiJson = await getNilai(); // <- pakai api.js
        setData(Array.isArray(nilaiJson) ? nilaiJson : []);
        console.log("NILAI:", nilaiJson);

        const kelasJson = await getKelas(); // <- pakai api.js
        setKelasList(Array.isArray(kelasJson) ? kelasJson : []);

        const guruJson = await getGuru();
        setGuruList(Array.isArray(guruJson) ? guruJson : []);

        const mapelJson = await getMapel(); // <- pakai api.js
        setMapelList(
          Array.isArray(mapelJson) ? mapelJson.map((m) => m.mapel) : []
        );
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  // =========================
  // GROUP DATA
  // =========================
  const siswaMap = {};

  data.forEach((d) => {
    const nama = d.siswa?.nama_siswa;

    if (!nama) return;

    if (!siswaMap[nama]) {
      siswaMap[nama] = {
        kelas_id: d.kelas?.id_kelas,
        nilai: {},
      };
    }

    const mapel = d.mapel?.mapel;

    if (mapel) {
      siswaMap[nama].nilai[mapel] = Number(d.nilai);
    }
  });

  const hasil = Object.keys(siswaMap).map((nama) => {
    const nilaiObj = siswaMap[nama].nilai;

    const nilaiArr = mapelList.map((m) => nilaiObj[m] || 0);

    const total = nilaiArr.reduce((a, b) => a + b, 0);
    const rata = mapelList.length ? total / mapelList.length : 0;

    return {
      nama,
      kelas_id: siswaMap[nama].kelas_id,
      nilai: nilaiObj,
      rata: Math.round(rata),
    };
  });

  // =========================
  // EXPORT PDF
  // =========================
  const exportPDF = () => {
    const pdf = new jsPDF();

    const kelasToExport =
      exportKelas === "all"
        ? kelasList
        : kelasList.filter(k => String(k.id_kelas) === String(exportKelas));

    kelasToExport.forEach((kelas, indexKelas) => {
      const dataKelas = hasil
        .filter(h => String(h.kelas_id) === String(kelas.id_kelas))
        .sort((a, b) => b.rata - a.rata);

      // HEADER KELAS di atas tabel
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      const pageWidth = pdf.internal.pageSize.getWidth();

      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);

      pdf.text(`Daftar Nilai Siswa Kelas ${kelas.nama_kelas}`, pageWidth / 2, 15, {
        align: "center"
      });

      // Ambil mapel yang ada di dataKelas
      const mapelKelas = mapelList.filter(m =>
        dataKelas.some(s => s.nilai[m] !== undefined)
      );

      // Table Head
      const head = [
        [
          { content: "Rank", rowSpan: 2, styles: { fillColor: [59, 130, 246], textColor: 255, halign: "center", valign: "middle" } },
          { content: "Nama", rowSpan: 2, styles: { fillColor: [59, 130, 246], textColor: 255, halign: "left", valign: "middle" } },
          { content: "Mata Pelajaran", colSpan: mapelKelas.length, styles: { fillColor: [59, 130, 246], textColor: 255, halign: "center" } },
          { content: "Rata-rata", rowSpan: 2, styles: { fillColor: [34, 197, 94], textColor: 255, halign: "center", valign: "middle" } },
        ],
        [
          ...mapelKelas.map((m, idx) => {
            const colors = [
              [252, 211, 77],   // kuning
              [251, 191, 36],   // kuning tua
              [253, 186, 116],  // orange
              [254, 202, 202],  // merah muda
              [186, 230, 253]   // biru muda
            ];
            return {
              content: m,
              styles: {
                fillColor: colors[idx % colors.length],
                textColor: 0,
                halign: "center"
              }
            };
          })
        ]
      ];

      const body = dataKelas.map((s, i) => [
        i + 1,
        s.nama,
        ...mapelKelas.map(m => s.nilai[m] ?? "-"),
        s.rata
      ]);

      autoTable(pdf, {
        startY: 22,
        head: head,
        body: body,
        styles: {
          fontSize: 11,
          valign: "middle",
          halign: "center",

          // 🔥 INI KUNCI BORDER
          lineWidth: 0.3,
          lineColor: [0, 0, 0]
        },

        headStyles: {
          lineWidth: 0.5,
          lineColor: [0, 0, 0]
        },

        bodyStyles: {
          lineWidth: 0.3,
          lineColor: [0, 0, 0]
        },

        columnStyles: {
          1: { halign: "left" }
        },

        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },

        margin: { left: 14, right: 14 }
      });

      if (indexKelas < kelasToExport.length - 1) pdf.addPage();
    });
    const finalY = pdf.lastAutoTable.finalY;
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setLineWidth(1);
    pdf.rect(14, 22, pageWidth - 28, finalY - 22);
    pdf.save(
      exportKelas === "all"
        ? "nilai_semua_kelas.pdf"
        : `nilai_${kelasToExport[0].nama_kelas}.pdf`
    );
  };

  const exportWord = async () => {
    const kelasToExport =
      exportKelas === "all"
        ? kelasList
        : kelasList.filter(k => String(k.id_kelas) === String(exportKelas));

    const sections = [];

    kelasToExport.forEach((kelas) => {
      const dataKelas = hasil
        .filter(h => String(h.kelas_id) === String(kelas.id_kelas))
        .sort((a, b) => b.rata - a.rata);

      // ================= HEADER =================
      const title = new Paragraph({
        text: `Daftar Nilai Kelas ${kelas.nama_kelas}`,
        heading: "Heading1",
        alignment: AlignmentType.CENTER,
      });

      // ================= HEADER ROW 1 =================
      const headerRow1 = new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("Rank")],
            rowSpan: 2,
            shading: { fill: "3B82F6" }, // biru
          }),
          new TableCell({
            children: [new Paragraph("Nama")],
            rowSpan: 2,
            shading: { fill: "3B82F6" },
          }),
          new TableCell({
            children: [new Paragraph("Mata Pelajaran")],
            columnSpan: mapelList.length,
            shading: { fill: "3B82F6" },
          }),
          new TableCell({
            children: [new Paragraph("Rata-rata")],
            rowSpan: 2,
            shading: { fill: "22C55E" }, // hijau
          }),
        ],
      });

      // ================= HEADER ROW 2 =================
      const mapelColors = [
        "FCD34D", // kuning
        "FBBF24",
        "FDBA74",
        "FECACA",
        "BAE6FD",
      ];

      const headerRow2 = new TableRow({
        children: mapelList.map((m, i) =>
          new TableCell({
            children: [new Paragraph(m)],
            shading: { fill: mapelColors[i % mapelColors.length] },
          })
        ),
      });

      // ================= BODY =================
      const bodyRows = dataKelas.map((s, i) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph(String(i + 1))],
            }),
            new TableCell({
              children: [new Paragraph(s.nama)],
            }),
            ...mapelList.map((m) =>
              new TableCell({
                children: [new Paragraph(String(s.nilai[m] ?? "-"))],
              })
            ),
            new TableCell({
              children: [new Paragraph(String(s.rata))],
              shading: { fill: "86EFAC" }, // hijau muda
            }),
          ],
        })
      );

      // ================= TABLE =================
      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow1, headerRow2, ...bodyRows],
      });

      sections.push({
        children: [title, new Paragraph(""), table],
      });
    });

    const doc = new Document({
      sections: sections,
    });

    const blob = await Packer.toBlob(doc);

    saveAs(
      blob,
      exportKelas === "all"
        ? "nilai_semua_kelas.docx"
        : `nilai_${kelasToExport[0].nama_kelas}.docx`
    );
  };

  // =========================
  // DELETE NILAI
  // =========================
  const confirmDelete = (kelasId) => {
    setDeleteTarget(kelasId);
    setShowConfirmDelete(true);
  };

  const handleDelete = async () => {
    try {
      // ambil semua data nilai di kelas itu
      const targetData = data.filter(
        (d) => String(d.kelas?.id_kelas) === String(deleteTarget)
      );

      // hapus semua record NILAI (bukan siswa)
      await Promise.all(
        targetData.map((item) =>
          updateNilai(item.id, {
            ...item,
            nilai: 0
          })
        )
      );

      setData((prev) =>
        prev.map((d) =>
          String(d.kelas?.id_kelas) === String(deleteTarget)
            ? { ...d, nilai: 0 }
            : d
        )
      );

      setShowConfirmDelete(false);
      showToast("Semua nilai kelas berhasil dihapus", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal hapus nilai", "error");
    }
  };
  // =========================
  // EDIT NILAI (simple prompt)
  // =========================

  const availableMapel = data
    .filter(
      d =>
        d.siswa?.nama_siswa === selectedSiswaNama &&
        String(d.kelas?.id_kelas) === String(selectedKelas?.id_kelas)
    )
    .map(d => d.mapel?.mapel)
    .filter(Boolean);
  const handleSaveEdit = async () => {
    if (!selectedKelas || !selectedSiswaNama || !editMapel) return;

    try {
      const target = data.find(
        d =>
          d.siswa?.nama_siswa === selectedSiswaNama &&
          String(d.kelas?.id_kelas) === String(selectedKelas.id_kelas) &&
          d.mapel?.mapel === editMapel
      );

      if (!target) return;

      await updateNilai(target.id, {
        ...target,
        nilai: Number(editNilai),
      });

      setData(prev =>
        prev.map(d =>
          d.id === target.id
            ? { ...d, nilai: Number(editNilai) }
            : d
        )
      );

      setShowEditModal(false);
      showToast("Nilai berhasil diupdate", "success");

    } catch (err) {
      console.error(err);
      showToast("Gagal update nilai", "error");
    }
  };

  const handleSetWaliKelas = async () => {
    if (!selectedKelas || !selectedGuru) return;

    try {
      await updateKelas(selectedKelas.id_kelas, {
        wali_kelas: selectedGuru,
      });

      setKelasList(prev =>
        prev.map(k =>
          k.id_kelas === selectedKelas.id_kelas
            ? { ...k, wali_kelas: selectedGuru }
            : k
        )
      );

      setShowSetWaliModal(false);
      showToast("Wali kelas berhasil di set", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal set wali kelas", "error");
    }
  };
  const uniqueMapel = [...new Set(availableMapel)];
  // =========================
  // RENDER
  // =========================
  return (
    <AdminLayout>
      <div className="min-h-screen flex bg-black text-white">
        <AdminSidebar />

        <div className="flex-1 p-6 overflow-auto">
          <div className="flex-1 px-6 py-5 relative">

          </div>
          {/* CURSOR */}
          <div className="pointer-events-none fixed w-72 h-72 rounded-full blur-3xl opacity-30 bg-cyan-400"
            style={{ left: mouse.x - 150, top: mouse.y - 150 }} />
          <div className="pointer-events-none fixed w-96 h-96 bg-purple-500 blur-3xl opacity-20 top-10 right-10" />
          <div className="pointer-events-none fixed w-96 h-96 bg-blue-500 blur-3xl opacity-20 bottom-10 left-10" />

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
            <h1 className="text-2xl font-bold">DAFTAR NILAI</h1>

            <div className="flex gap-2 items-center flex-wrap">
              <label>Export:</label>

              <select
                value={exportKelas}
                onChange={(e) => setExportKelas(e.target.value)}
                className="p-2 rounded bg-black border border-white"
              >
                <option value="all">Semua Kelas</option>
                {kelasList.map((k) => (
                  <option key={k.id_kelas} value={k.id_kelas}>
                    {k.nama_kelas}
                  </option>
                ))}
              </select>

              <button
                onClick={exportPDF}
                className="px-4 py-2 bg-red-500 rounded"
              >
                Export PDF
              </button>

              <button
                onClick={exportWord}
                className="px-4 py-2 bg-blue-500 rounded"
              >
                Export Word
              </button>
            </div>
          </div>

          {/* BUTTON TAMBAH */}
          <div className="flex gap-2 mb-5 items-center">
            <button
              onClick={() => (window.location.href = "/addnilai")}
              className="px-4 py-2 bg-green-500 rounded"
            >
              + Tambah Nilai
            </button>
          </div>

          {/* TABLE PER KELAS */}
          {kelasList.map((kelas) => {
            if (
              exportKelas !== "all" &&
              String(exportKelas) !== String(kelas.id_kelas)
            )
              return null;

            const dataKelas = hasil
              .filter(
                (h) => String(h.kelas_id) === String(kelas.id_kelas)
              )
              .sort((a, b) => b.rata - a.rata);

            return (
              <div
                key={kelas.id_kelas}
                className="mb-6 p-4 bg-black/40 border border-white/20 rounded-xl overflow-x-auto"
              >
                {/* HEADER KELAS */}
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h2 className="font-bold">
                      Kelas {kelas.nama_kelas}
                    </h2>
                    <p className="text-xs text-gray-400">
                      Wali Kelas: {kelas.wali_kelas || "-"}
                    </p>
                  </div>

                  {/* kalau mau tombol per kelas (opsional) */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedKelas(kelas);
                        setShowEditModal(true);
                      }}
                      className="px-2 py-1 bg-yellow-400 text-black rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => confirmDelete(kelas.id_kelas)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Hapus
                    </button>
                    <button
                      onClick={() => {
                        setSelectedKelas(kelas);
                        setShowSetWaliModal(true);
                      }}
                      className="px-2 py-1 bg-blue-500 text-white rounded"
                    >
                      Set Wali
                    </button>
                  </div>
                </div>
                <table className="w-full border text-center">
                  <thead>
                    <tr className="bg-blue-500 text-white">
                      <th rowSpan="2" className="p-2">
                        Rank
                      </th>
                      <th rowSpan="2" className="text-left p-2">
                        Nama
                      </th>

                      <th colSpan={mapelList.length} className="p-2">
                        Mata Pelajaran
                      </th>

                      <th rowSpan="2" className="bg-green-500 p-2">
                        Rata-rata
                      </th>
                    </tr>

                    <tr className="bg-yellow-400 text-black">
                      {mapelList.map((m, i) => (
                        <th key={i} className="p-2">
                          {m}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {dataKelas.map((s, i) => (
                      <tr
                        key={i}
                        className="bg-white text-black text-center"
                      >
                        <td className="p-2">{i + 1}</td>
                        <td className="p-2 text-left">{s.nama}</td>

                        {mapelList.map((m, idx) => (
                          <td key={idx} className="p-2">
                            {s.nilai[m] || "-"}
                          </td>
                        ))}

                        <td className="bg-green-300 font-bold p-2">
                          {s.rata}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-black border border-white/20 p-6 rounded-xl w-[400px]">

              <h2 className="text-xl font-bold mb-4">
                Edit Nilai - Kelas {selectedKelas?.nama_kelas}
              </h2>
              {/* DROPDOWN SISWA */}
              <label className="text-sm text-gray-300">Siswa</label>
              <select
                value={selectedSiswaNama}
                onChange={(e) => setSelectedSiswaNama(e.target.value)}
                className="w-full p-2 mb-3 bg-black border border-white/20 rounded"
              >
                <option value="">Pilih Siswa</option>

                {hasil
                  .filter(h => String(h.kelas_id) === String(selectedKelas?.id_kelas))
                  .map((s, i) => (
                    <option key={i} value={s.nama}>
                      {s.nama}
                    </option>
                  ))}
              </select>
              {/* DROPDOWN MAPEL */}
              <label className="text-sm text-gray-300">Mata Pelajaran</label>
              <select
                value={editMapel}
                onChange={(e) => setEditMapel(e.target.value)}
                className="w-full p-2 mb-3 bg-black border border-white/20 rounded"
              >
                <option value="">Pilih Mapel</option>
                {uniqueMapel.map((m, i) => (
                  <option key={i} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              {/* INPUT NILAI */}
              <label className="text-sm text-gray-300">Nilai</label>
              <input
                type="number"
                value={editNilai}
                onChange={(e) => setEditNilai(e.target.value)}
                className="w-full p-2 mb-4 bg-black border border-white/20 rounded"
                placeholder="Masukkan nilai"
              />

              {/* BUTTON */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1 bg-gray-600 rounded"
                >
                  Batal
                </button>

                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-green-500 rounded"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-black border border-white/20 p-6 rounded-xl w-[350px]">

              <h2 className="text-lg font-bold mb-3">
                Konfirmasi Hapus
              </h2>

              <p className="text-gray-300 mb-4">
                Yakin ingin menghapus data ini?
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3 py-1 bg-gray-600 rounded"
                >
                  Batal
                </button>

                <button
                  onClick={handleDelete}
                  className="px-3 py-1 bg-red-500 rounded"
                >
                  Hapus
                </button>
              </div>

            </div>
          </div>
        )}
        {showSetWaliModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-black border border-white/20 p-6 rounded-xl w-[400px]">

              <h2 className="text-lg font-bold mb-4">
                Set Wali Kelas - {selectedKelas?.nama_kelas}
              </h2>

              <label className="text-sm text-gray-300">Pilih Guru</label>
              <select
                value={selectedGuru}
                onChange={(e) => setSelectedGuru(e.target.value)}
                className="w-full p-2 mb-4 bg-black border border-white/20 rounded"
              >
                <option value="">Pilih Guru</option>
                {guruList.map((g, i) => (
                  <option key={i} value={g.nama_guru}>
                    {g.nama_guru}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSetWaliModal(false)}
                  className="px-3 py-1 bg-gray-600 rounded"
                >
                  Batal
                </button>

                <button
                  onClick={handleSetWaliKelas}
                  className="px-3 py-1 bg-blue-500 rounded"
                >
                  Simpan
                </button>
              </div>

            </div>
          </div>
        )}
        {/* TOAST */}{toast.show && (
          <div className="fixed top-5 right-5 z-50">
            <div
              className={`px-4 py-3 rounded shadow-lg text-white transition-all ${toast.type === "success" ? "bg-green-500" : "bg-red-500"
                }`}
            >
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}