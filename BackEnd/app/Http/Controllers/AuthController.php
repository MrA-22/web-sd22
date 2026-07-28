<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Admin;
use App\Models\Guru;
use App\Models\Siswa;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $username = $request->input('username');
        $password = $request->input('password');

        if (!$username) {
            return response()->json([
                'status' => 'error',
                'message' => 'Username kosong'
            ]);
        }

        // ADMIN
        $admin = Admin::where('username', $username)
            ->where('password', $password)
            ->first();

        if ($admin) {
            return response()->json([
                'status' => 'success',
                'role' => 'admin',
                'data' => $admin
            ]);
        }

        // GURU
        $guru = Guru::where('nama_guru', $username)
            ->where('nuptk', $password)
            ->first();

        if ($guru) {
            $guru->foto_url = $guru->foto_guru
                ? url('/uploads/Gambar_Guru/' . $guru->foto_guru)
                : null;

            return response()->json([
                'status' => 'success',
                'role' => 'guru',
                'data' => $guru
            ]);
        }

        // ================= LOGIN SISWA =================
        $siswa = Siswa::where('nisn', $username)->first();

        if ($siswa) {

            // ✅ TAMBAHKAN INI
            $siswa->foto_url = $siswa->foto_siswa
                ? url('/uploads/Gambar_Siswa/' . $siswa->foto_siswa)
                : null;

            return response()->json([
                'status' => 'success',
                'role' => 'siswa',
                'data' => $siswa
            ]);
        }
    }
}
