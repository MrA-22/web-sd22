<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Siswa;
use App\Models\Guru;
use App\Models\Kelas;
use App\Models\Mapel;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $data = [
            'total_siswa' => Siswa::count(),
            'total_guru'  => Guru::count(),
            'total_kelas' => Kelas::count(),
            'total_mapel' => Mapel::count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    public function chart()
    {
        $data = DB::table('siswa')
            ->select('kelas', DB::raw('COUNT(*) as total'))
            ->groupBy('kelas')
            ->get();

        return response()->json($data);
    }
}