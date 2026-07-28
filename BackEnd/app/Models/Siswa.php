<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Kelas;
use App\Models\Nilai;
class Siswa extends Model
{
    protected $table = 'siswa';

    protected $primaryKey = 'id_siswa';

    public $timestamps = false;

    protected $fillable = [
        'nisn',
        'nama_siswa',
        'tgll_siswa',
        'alamat',
        'nohp_ortu',
        'foto_siswa',
        'id_kelas'
    ];

    // relasi ke kelas
    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'id_kelas');
    }

    // 🔥 relasi ke nilai
    public function nilai()
    {
        return $this->hasMany(Nilai::class, 'id_siswa');
    }

    
}