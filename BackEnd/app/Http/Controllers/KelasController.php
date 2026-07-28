<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use Illuminate\Http\Request;

class KelasController extends Controller
{
    // GET semua data kelas
    public function index()
    {
        return response()->json(Kelas::all());
    }

    // ✅ TAMBAH KELAS
    public function store(Request $request)
    {
        // 🔥 VALIDASI
        $request->validate([
            'nama_kelas' => 'required|string|max:50'
        ]);

        // 🔥 SIMPAN
        $kelas = Kelas::create([
            'nama_kelas' => $request->nama_kelas
        ]);

        // 🔥 RESPONSE
        return response()->json([
            'status' => 'success',
            'message' => 'Kelas berhasil ditambahkan',
            'data' => $kelas
        ]);
    }

    public function update(Request $request, $id)
    {
        $kelas = Kelas::findOrFail($id);

        $kelas->update([
            'nama_kelas' => $request->nama_kelas ?? $kelas->nama_kelas,
            'wali_kelas' => $request->wali_kelas ?? $kelas->wali_kelas,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kelas berhasil diupdate',
            'data' => $kelas
        ]);
    }
}
