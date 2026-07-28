<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Nilai;

class NilaiController extends Controller
{
    // ambil semua nilai
    public function index()
    {
        return response()->json(
            Nilai::with(['siswa', 'kelas', 'mapel'])->get()
        );
    }

    // simpan nilai
    public function store(Request $request)
    {
        try {
            $request->validate([
                'id_siswa' => 'required',
                'id_kelas' => 'required',
                'nilaiList' => 'required|array'
            ]);

            $saved = [];
            $skipped = [];

            foreach ($request->nilaiList as $item) {

                // skip kalau kosong
                if (!isset($item['nilai']) || $item['nilai'] === "") {
                    continue;
                }

                // 🔥 cek duplikat
                $exists = Nilai::where('id_siswa', $request->id_siswa)
                    ->where('id_mapel', $item['id_mapel'])
                    ->where('id_kelas', $request->id_kelas)
                    ->first();

                if ($exists) {
                    $skipped[] = [
                        'id_mapel' => $item['id_mapel'],
                        'message' => 'Sudah ada'
                    ];
                    continue;
                }

                $nilai = Nilai::create([
                    'id_siswa' => $request->id_siswa,
                    'id_kelas' => $request->id_kelas,
                    'id_mapel' => $item['id_mapel'],
                    'nilai' => $item['nilai']
                ]);

                $saved[] = $nilai;
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Proses selesai',
                'saved' => $saved,
                'skipped' => $skipped
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // =========================
    // UPDATE NILAI
    // =========================
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'nilai' => 'required|numeric'
            ]);

            $nilai = Nilai::findOrFail($id);

            $nilai->update([
                'nilai' => $request->nilai
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Nilai berhasil diupdate',
                'data' => $nilai
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // hapus nilai (optional)
    public function destroy($id)
    {
        $nilai = Nilai::findOrFail($id);
        $nilai->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Nilai berhasil dihapus'
        ]);
    }

    public function rekapPerKelas()
    {
        $data = Nilai::selectRaw('id_kelas, COUNT(DISTINCT id_siswa) as total')
            ->with('kelas')
            ->groupBy('id_kelas')
            ->get()
            ->map(function ($item) {
                return [
                    'kelas' => $item->kelas->nama_kelas ?? 'Unknown',
                    'total' => $item->total
                ];
            });

        return response()->json($data);
    }

    public function rekapPerSiswa()
    {
        return Nilai::with(['siswa', 'mapel', 'kelas'])
            ->get()
            ->groupBy(['id_siswa', 'id_mapel'])
            ->map(function ($items) {
                return $items->map(function ($group) {
                    $first = $group->first();

                    return [
                        'id_siswa' => $first->id_siswa,
                        'nama_siswa' => $first->siswa->nama_siswa ?? '-',
                        'mata_pelajaran' => $first->mapel->mapel ?? '-',
                        'kelas' => $first->kelas->nama_kelas ?? '-',
                        'nilai' => $group->avg('nilai'),
                    ];
                });
            })
            ->flatten(1)
            ->values();
    }
}
