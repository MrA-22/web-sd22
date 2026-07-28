<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Latar extends Model
{
    protected $table = 'latar_sekolah';
    public $timestamps = false;
    protected $fillable = ['gambar'];
}
