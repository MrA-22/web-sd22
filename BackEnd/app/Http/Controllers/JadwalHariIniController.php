<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Jadwal;

class JadwalHariIniController extends Controller
{
    public function jadwalHariIni()
    {
        $hari = date('l');

        $mapHari = [
            'Monday' => 'Senin',
            'Tuesday' => 'Selasa',
            'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis',
            'Friday' => 'Jumat',
            'Saturday' => 'Sabtu',
            'Sunday' => 'Minggu',
        ];

        $jadwal = Jadwal::with(['mapel', 'guru', 'kelas'])
            ->where('hari', $mapHari[$hari])
            ->orderBy('jam_mulai')
            ->get();

        return response()->json([
            'data' => $jadwal
        ]);
    }
}
