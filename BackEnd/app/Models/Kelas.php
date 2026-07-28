<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    protected $table = 'kelas';
    protected $primaryKey = 'id_kelas';
    public $timestamps = false;

    protected $fillable = [
        'nama_kelas',
        'wali_kelas'
    ];

    // relasi ke siswa
    public function siswa()
    {
        return $this->hasMany(Siswa::class, 'id_kelas');
    }
}