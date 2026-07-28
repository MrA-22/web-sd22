<?php

namespace App\Models;

use App\Models\Mapel;
use App\Models\Guru;
use App\Models\Kelas;
use Illuminate\Database\Eloquent\Model;

class Jadwal extends Model
{
    protected $table = 'jadwal'; // sesuaikan nama tabel

    protected $fillable = [
        'kelas_id',
        'hari',
        'mapel_id',
        'guru_id',
        'jam_mulai',
        'jam_selesai',
        'istirahat'
    ];

    public function mapel()
    {
        return $this->belongsTo(Mapel::class, 'mapel_id');
    }

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }
}
