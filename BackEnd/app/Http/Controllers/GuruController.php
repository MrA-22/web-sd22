<?php

namespace App\Http\Controllers;

use App\Models\Guru;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Intervention\Image\ImageManagerStatic as Image;

class GuruController extends Controller
{
    // Helper untuk upload ke Supabase Storage via HTTP REST API
    private function uploadToSupabase($file, $filename)
    {
        $supabaseUrl = env('SUPABASE_URL');
        $serviceRoleKey = env('SUPABASE_SERVICE_ROLE_KEY');

        // Render gambar ke WebP menggunakan Intervention Image di memory
        $img = Image::make($file)
            ->resize(1200, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            })
            ->encode('webp', 80);

        $response = Http::withHeaders([
            'apikey' => $serviceRoleKey,
            'Authorization' => 'Bearer ' . $serviceRoleKey,
            'Content-Type' => 'image/webp',
            'x-upsert' => 'true' // Timpa jika nama file sama
        ])->withBody($img->__toString(), 'image/webp')
          ->post("{$supabaseUrl}/storage/v1/object/uploads/Gambar_Guru/{$filename}");

        return $response->successful();
    }

    // Helper untuk hapus file dari Supabase Storage
    private function deleteFromSupabase($filename)
    {
        if (!$filename) return;
        $supabaseUrl = env('SUPABASE_URL');
        $serviceRoleKey = env('SUPABASE_SERVICE_ROLE_KEY');

        Http::withHeaders([
            'apikey' => $serviceRoleKey,
            'Authorization' => 'Bearer ' . $serviceRoleKey,
        ])->delete("{$supabaseUrl}/storage/v1/object/uploads/Gambar_Guru/{$filename}");
    }

    // Helper untuk mendapatkan Public URL dari Supabase
    private function getSupabaseFileUrl($filename)
    {
        if (!$filename) return null;
        $supabaseUrl = env('SUPABASE_URL');
        // Pastikan bucket di Supabase Anda sudah di-set ke PUBLIC agar bisa diakses langsung
        return "{$supabaseUrl}/storage/v1/object/public/uploads/Gambar_Guru/{$filename}";
    }

    // ================= GET ALL =================
    public function index()
    {
        $data = Guru::all();

        foreach ($data as $d) {
            $d->foto_url = $this->getSupabaseFileUrl($d->foto_guru);
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

        $guru->foto_url = $this->getSupabaseFileUrl($guru->foto_guru);

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
            'foto' => 'nullable|image|max:10240' // Maks 10MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $fotoName = null;

        if ($request->hasFile('foto')) {
            try {
                $file = $request->file('foto');
                $fotoName = time() . '.webp';

                $uploaded = $this->uploadToSupabase($file, $fotoName);
                if (!$uploaded) {
                    throw new \Exception('Gagal mengunggah file ke Supabase Storage');
                }
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
        $validator = Validator::make(parameter: $request->all(), rules: [
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

            if ($request->hasFile('foto')) {
                // Hapus foto lama di Supabase jika ada
                if ($guru->foto_guru) {
                    $this->deleteFromSupabase($guru->foto_guru);
                }

                $file = $request->file('foto');
                $fotoName = time() . '.webp';

                $uploaded = $this->uploadToSupabase($file, $fotoName);
                if (!$uploaded) {
                    throw new \Exception('Gagal mengunggah file baru ke Supabase Storage');
                }

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

            // Hapus relasi jadwal jika ada
            if (method_exists($guru, 'jadwal') && $guru->jadwal()) {
                $guru->jadwal()->delete();
            }

            // Hapus foto di Supabase Storage
            if ($guru->foto_guru) {
                $this->deleteFromSupabase($guru->foto_guru);
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