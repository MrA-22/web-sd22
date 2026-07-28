<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mapel extends Model
{
    protected $table = 'mapel';

    protected $primaryKey = 'id_mapel';

    public $timestamps = false;

    protected $fillable = [
        'mapel'
    ];

    // 🔥 relasi ke nilai
    public function nilai()
    {
        return $this->hasMany(Nilai::class, 'id_mapel');
    }
}
