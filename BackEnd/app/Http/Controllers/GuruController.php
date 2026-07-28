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
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nuptk' => 'required',
            'nama' => 'required',
            'tanggal_lahir' => 'required|date',
            'mengajar' => 'required',
            'alamat' => 'required',
            'nohp' => 'required',
            'foto' => 'nullable|image|max:10240' // Maks 10MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $guru = Guru::findOrFail($id);

        if ($request->hasFile('foto')) {
            try {
                // hapus foto lama
                if ($guru->foto_guru) {
                    $oldPath = public_path('uploads/Gambar_Guru/' . $guru->foto_guru);
                    if (File::exists($oldPath)) File::delete($oldPath);
                }

                $file = $request->file('foto');
                $fotoName = time() . '.webp';
                $path = public_path('uploads/Gambar_Guru/' . $fotoName);

                // Resize maksimal lebar 1200px, encode ke WebP 80%
                Image::make($file)
                    ->resize(1200, null, function ($constraint) {
                        $constraint->aspectRatio();
                        $constraint->upsize();
                    })
                    ->encode('webp', 80)
                    ->save($path);

                $guru->foto_guru = $fotoName;
            } catch (\Exception $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal update foto: ' . $e->getMessage()
                ], 500);
            }
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
