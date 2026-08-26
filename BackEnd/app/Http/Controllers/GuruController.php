<?php

namespace App\Http\Controllers;

use App\Models\Guru;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\ImageManagerStatic as Image;

class GuruController extends Controller
{
    // ================= GET ALL =================
    public function index()
    {
        $data = Guru::all();

        foreach ($data as $d) {
            $d->foto_url = $d->foto_guru
                ? url('/uploads/Gambar_Guru/' . $d->foto_guru)
                : null;
        }

        return response()->json($data);
    }

    // ================= GET BY ID =================
    public function show($id)
    {
        $guru = Guru::find($id);

        if (!$guru) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        $guru->foto_url = $guru->foto_guru
            ? url('/uploads/Gambar_Guru/' . $guru->foto_guru)
            : null;

        return response()->json($guru);
    }
    // ================= STORE =================
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nuptk' => 'required',
            'nama' => 'required',
            'tanggal_lahir' => 'required|date',
            'mengajar' => 'required',
            'alamat' => 'required',
            'nohp' => 'required',
            // Maks 10MB sekarang
            'foto' => 'nullable|image|max:10240' // 10240 KB = 10MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $fotoName = null;
        $uploadPath = public_path('uploads/Gambar_Guru');
        if (!file_exists($uploadPath)) mkdir($uploadPath, 0777, true);

        // 🔥 UPLOAD + COMPRESS + WEBP
        if ($request->hasFile('foto')) {
            try {
                $file = $request->file('foto');
                $fotoName = time() . '.webp';
                $path = $uploadPath . '/' . $fotoName;

                // Resize maksimal lebar 1200px, kompres jadi WebP 80%
                Image::make($file)
                    ->resize(1200, null, function ($constraint) {
                        $constraint->aspectRatio();
                        $constraint->upsize();
                    })
                    ->encode('webp', 80)
                    ->save($path);
            } catch (\Exception $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal upload foto: ' . $e->getMessage()
                ], 500);
            }
        }

        $guru = Guru::create([
            'nuptk' => $request->nuptk,
            'nama_guru' => $request->nama,
            'tgll_guru' => $request->tanggal_lahir,
            'mengajar' => $request->mengajar,
            'alamat_guru' => $request->alamat,
            'nohp_guru' => $request->nohp,
            'foto_guru' => $fotoName,
            'jabatan' => 'Guru',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data berhasil ditambahkan',
            'data' => $guru
        ]);
    }

    // ================= UPDATE =================
    // ================= UPDATE =================
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nuptk' => 'required',
            'nama' => 'required',
            'tanggal_lahir' => 'required|date',
            'mengajar' => 'required',
            'alamat' => 'required',
            'nohp' => 'required',
            'foto' => 'nullable|image|max:10240'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $guru = Guru::findOrFail($id);
            $uploadPath = public_path('uploads/Gambar_Guru');

            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0777, true);
            }

            if ($request->hasFile('foto')) {
                // Hapus foto lama di lokal jika ada
                if ($guru->foto_guru) {
                    $oldPath = $uploadPath . '/' . $guru->foto_guru;
                    if (File::exists($oldPath)) {
                        File::delete($oldPath);
                    }
                }

                $file = $request->file('foto');
                $fotoName = time() . '.' . $file->getClientOriginalExtension();
                
                // Jika ingin langsung simpan tanpa intervention image dulu untuk test amannya:
                $file->move($uploadPath, $fotoName);
                
                // Atau jika pakai Intervention Image, pastikan library-nya aman:
                /*
                $fotoName = time() . '.webp';
                $path = $uploadPath . '/' . $fotoName;
                Image::make($file)
                    ->resize(1200, null, function ($constraint) {
                        $constraint->aspectRatio();
                        $constraint->upsize();
                    })
                    ->encode('webp', 80)
                    ->save($path);
                */

                $guru->foto_guru = $fotoName;
            }

            $guru->nuptk = $request->nuptk;
            $guru->nama_guru = $request->nama;
            $guru->tgll_guru = $request->tanggal_lahir;
            $guru->mengajar = $request->mengajar;
            $guru->alamat_guru = $request->alamat;
            $guru->nohp_guru = $request->nohp;
            $guru->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Data berhasil diupdate',
                'data' => $guru
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan server: ' . $e->getMessage()
            ], 500);
        }
    }

    // ================= DELETE =================
    public function destroy($id)
    {
        try {
            $guru = Guru::findOrFail($id);

            // hapus relasi
            $guru->jadwal()->delete();

            // hapus foto
            if ($guru->foto_guru) {
                $path = public_path('uploads/Gambar_Guru/' . $guru->foto_guru);
                if (File::exists($path)) {
                    File::delete($path);
                }
            }

            $guru->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Data guru berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
