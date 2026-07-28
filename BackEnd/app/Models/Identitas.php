<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Identitas extends Model
{
    protected $table = 'identitas_sekolah';
    public $timestamps = false;
    protected $fillable = [
    'nama_sekolah',
    'namakp_sekolah',
    'nuptkkp',
    'alamat_sekolah',
    'email',
    'noponsel',
];
}