<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Jadwal;

class JadwalController extends Controller
{
    // GET semua jadwal
    public function index()
    {
        $data = Jadwal::with(['mapel', 'guru'])->get();

        return response()->json($data);
    }

    // TAMBAH jadwal
    public function store(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required',
            'hari' => 'required',
            'mapel_id' => 'required',
            'guru_id' => 'required',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
        ]);

        // cek bentrok
        $bentrok = Jadwal::where('kelas_id', $request->kelas_id)
            ->where('hari', $request->hari)
            ->where(function ($q) use ($request) {
                $q->where('jam_mulai', '<', $request->jam_selesai)
                    ->where('jam_selesai', '>', $request->jam_mulai);
            })
            ->exists();

        if ($bentrok) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jadwal bentrok'
            ], 422);
        }

        Jadwal::create([
            'kelas_id' => $request->kelas_id,
            'hari' => $request->hari,
            'mapel_id' => $request->mapel_id,
            'guru_id' => $request->guru_id,
            'jam_mulai' => $request->jam_mulai,
            'jam_selesai' => $request->jam_selesai,
        ]);

        return response()->json([
            'status' => 'success'
        ]);
    }

    // DELETE 1 jadwal
    public function destroy($id)
    {
        Jadwal::findOrFail($id)->delete();

        return response()->json([
            'status' => 'success'
        ]);
    }

    // RESET jadwal per kelas
    public function reset(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required'
        ]);

        Jadwal::where('kelas_id', $request->kelas_id)->delete();

        return response()->json([
            'status' => 'success'
        ]);
    }
}
