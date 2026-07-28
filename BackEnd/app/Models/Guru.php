<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guru extends Model
{
    protected $table = 'guru';
    protected $primaryKey = 'id_guru';

    public $timestamps = false;

    protected $fillable = [
        'nuptk',
        'nama_guru',
        'tgll_guru',
        'mengajar',
        'alamat_guru',
        'nohp_guru',
        'foto_guru',
        'jabatan',
    ];

    public function jadwal()
    {
        return $this->hasMany(Jadwal::class, 'guru_id');
    }
}
