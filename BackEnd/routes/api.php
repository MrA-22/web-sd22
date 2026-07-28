<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\MapelController;
use App\Http\Controllers\NilaiController;
use App\Http\Controllers\KelasController;
use App\Http\Controllers\GuruController;
use App\Http\Controllers\IdentitasController;
use App\Http\Controllers\LatarController;
use App\Http\Controllers\ArtikelController;
use App\Http\Controllers\JadwalHariIniController;
use App\Http\Controllers\JadwalController;
use Illuminate\Support\Facades\Log;

Route::get('/test-log', function () {
    Log::info('INI TEST LOG');
    return 'OK';
});
Route::post('/login', [AuthController::class, 'login']);

// GURU
Route::get('/dashboard', [DashboardController::class, 'index']);
Route::get('/guru', [GuruController::class, 'index']);
Route::get('/guru/{id}', [GuruController::class, 'show']);
Route::post('/guru', [GuruController::class, 'store']);
Route::post('/guru/{id}', [GuruController::class, 'update']);
Route::delete('/guru/{id}', [GuruController::class, 'destroy']);
Route::post('/guru/ubah-jabatan', [GuruController::class, 'setKepalaSekolah']);

// SISWA
Route::get('/siswa', [SiswaController::class, 'index']);
Route::post('/siswa', [SiswaController::class, 'store']);
Route::delete('/siswa/{id}', [SiswaController::class, 'destroy']);
Route::post('/siswa/{id}', [SiswaController::class, 'update']);
Route::get('/siswa/{id}', [SiswaController::class, 'show']);

// MAPEL
Route::get('/mapel', [MapelController::class, 'index']);
Route::post('/mapel', [MapelController::class, 'store']);

// KELAS
Route::get('/kelas', [KelasController::class, 'index']);
Route::post('/kelas', [KelasController::class, 'store']);
Route::put('/kelas/{id}', [KelasController::class, 'update']);

// NILAI
Route::get('/nilai', [NilaiController::class, 'index']);
Route::post('/nilai', [NilaiController::class, 'store']);
Route::put('/nilai/{id}', [NilaiController::class, 'update']);
Route::delete('/nilai/{id}', [NilaiController::class, 'destroy']);
Route::get('/rekap-kelas', [NilaiController::class, 'rekapPerKelas']);
Route::get('/rekap-nilai', [NilaiController::class, 'rekapPerSiswa']);

// JADWAL
Route::get('/jadwal', [JadwalController::class, 'index']);
Route::post('/jadwal', [JadwalController::class, 'store']);
Route::delete('/jadwal/{id}', [JadwalController::class, 'destroy']);
Route::post('/jadwal/reset', [JadwalController::class, 'reset']);

// IDENTITAS
Route::get('/identitas', [IdentitasController::class, 'index']);
Route::post('/identitas/update', [IdentitasController::class, 'update']);
Route::get('/jadwal-hari-ini', [JadwalHariIniController::class, 'jadwalHariIni']);

// LATAR
Route::get('/latar', [LatarController::class, 'index']);
Route::post('/latar/update', [LatarController::class, 'update']);

// ✅ ARTIKEL (BARU)
Route::get('/artikel', [ArtikelController::class, 'index']);
Route::get('/artikel/{id}', [ArtikelController::class, 'show']);
Route::post('/artikel', [ArtikelController::class, 'store']);
Route::post('/artikel/{id}', [ArtikelController::class, 'update']);
Route::delete('/artikel/{id}', [ArtikelController::class, 'destroy']);