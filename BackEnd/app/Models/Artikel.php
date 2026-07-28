<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Artikel extends Model
{
    protected $table = 'artikel'; // ganti jika nama tabel kamu berbeda

    protected $primaryKey = 'id_artikel';

    public $timestamps = false; // karena kamu pakai tanggal_upload manual

    protected $fillable = [
        'judul',
        'penulis',
        'isi',
        'foto_artikel',
        'tanggal_upload',
    ];
}