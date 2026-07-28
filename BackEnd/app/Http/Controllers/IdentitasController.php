<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Identitas;
use App\Models\Guru;
use Illuminate\Support\Facades\DB;

class IdentitasController extends Controller
{
    // GET identitas sekolah
    public function index()
    {
        $data = Identitas::first();

        if (!$data) {
            return response()->json([
                'email' => '',
                'alamat_sekolah' => '',
                'noponsel' => ''
            ]);
        }

        return response()->json($data);
    }

    // UPDATE identitas + set kepala sekolah
    public function update(Request $request)
    {
        DB::beginTransaction();

        try {
            // ✅ VALIDASI DULU
            $request->validate([
                'nama_sekolah' => 'required',
                'nuptk' => 'required',
                'alamat_sekolah' => 'required',
                'email' => 'nullable|email',
                'noponsel' => 'nullable|string|max:20',
                'tahun_ajaran' => 'required',
                'semester' => 'required',
            ]);

            $data = Identitas::first();

            if (!$data) {
                $data = new Identitas();
            }

            // ✅ CARI GURU
            $guru = Guru::where('nuptk', (string)$request->nuptk)->first();

            if (!$guru) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Guru tidak ditemukan'
                ], 404);
            }

            // ✅ SIMPAN DATA
            $data->nama_sekolah   = $request->nama_sekolah;
            $data->namakp_sekolah = $guru->nama_guru;
            $data->nuptkkp        = (string)$request->nuptk;
            $data->alamat_sekolah = $request->alamat_sekolah;
            $data->email          = $request->email;
            $data->noponsel       = $request->noponsel;
            $data->tahun_ajaran   = $request->tahun_ajaran;
            $data->semester       = $request->semester;

            $data->save();

            // ✅ RESET SEMUA JABATAN
            Guru::where('jabatan', 'Kepala Sekolah')
                ->update(['jabatan' => 'Guru']);

            // ✅ SET KEPALA SEKOLAH BARU
            $guru->jabatan = 'Kepala Sekolah';
            $guru->save();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Identitas berhasil diupdate'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
