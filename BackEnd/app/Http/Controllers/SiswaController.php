<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use Illuminate\Support\Facades\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Nilai;
class SiswaController extends Controller
{
    public function index()
    {
        $data = Siswa::with('kelas')->get();

        foreach ($data as $d) {

            // 🔥 CEK SUDAH ADA NILAI ATAU BELUM
            $d->sudah_nilai = Nilai::where('id_siswa', $d->id_siswa)->exists();

            // foto
            $d->foto_url = $d->foto_siswa
                ? url('/uploads/Gambar_Siswa/' . $d->foto_siswa)
                : null;
        }

        return response()->json($data);
    }

    public function destroy($id)
    {
        $siswa = Siswa::findOrFail($id);

        if ($siswa->foto_siswa) {
            $path = public_path('uploads/Gambar_Siswa/' . $siswa->foto_siswa);

            if (File::exists($path)) {
                File::delete($path);
            }
        }

        $siswa->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data siswa berhasil dihapus'
        ]);
    }

    public function store(Request $request)
    {
        // ✅ VALIDASI API STYLE
        $validator = Validator::make($request->all(), [
            'nisn' => 'required',
            'nama' => 'required',
            'tanggal_lahir' => 'required|date',
            'id_kelas' => 'required',
            'alamat' => 'required',
            'nohp' => 'required',
            'foto' => 'nullable|image|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        // upload foto
        $fotoName = null;
        if ($request->hasFile('foto')) {
            $fotoName = time() . '.' . $request->foto->extension();
            $request->foto->move(public_path('uploads/Gambar_Siswa'), $fotoName);
        }

        $siswa = Siswa::create([
            'nisn' => $request->nisn,
            'nama_siswa' => $request->nama,
            'tgll_siswa' => $request->tanggal_lahir,
            'alamat' => $request->alamat,
            'nohp_ortu' => $request->nohp,
            'foto_siswa' => $fotoName,
            'id_kelas' => $request->id_kelas
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data berhasil ditambahkan',
            'data' => $siswa
        ]);
    }
    public function show($id)
    {
        $siswa = Siswa::with('kelas')->find($id);

        if (!$siswa) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        return response()->json($siswa);
    }
    public function update(Request $request, $id)
    {
        // ✅ VALIDASI API STYLE
        $validator = Validator::make($request->all(), [
            'nisn' => 'required',
            'nama' => 'required',
            'tanggal_lahir' => 'required|date',
            'id_kelas' => 'required',
            'alamat' => 'required',
            'nohp' => 'required',
            'foto' => 'nullable|image|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $siswa = Siswa::findOrFail($id);

        // handle foto baru
        if ($request->hasFile('foto')) {
            // hapus foto lama
            if ($siswa->foto_siswa) {
                $oldPath = public_path('uploads/Gambar_Siswa/' . $siswa->foto_siswa);
                if (File::exists($oldPath)) {
                    File::delete($oldPath);
                }
            }

            // upload baru
            $fotoName = time() . '.' . $request->foto->extension();
            $request->foto->move(public_path('uploads/Gambar_Siswa'), $fotoName);

            $siswa->foto_siswa = $fotoName;
        }

        // update data
        $siswa->nisn = $request->nisn;
        $siswa->nama_siswa = $request->nama;
        $siswa->tgll_siswa = $request->tanggal_lahir;
        $siswa->alamat = $request->alamat;
        $siswa->nohp_ortu = $request->nohp;
        $siswa->id_kelas = $request->id_kelas;

        $siswa->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Data berhasil diupdate',
            'data' => $siswa
        ]);
    }
}
