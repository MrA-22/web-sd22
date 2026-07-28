<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Mapel;

class MapelController extends Controller
{
    public function index()
    {
        return response()->json(Mapel::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'mapel' => 'required'
        ]);

        Mapel::create([
            'mapel' => $request->mapel
        ]);

        return response()->json([
            'status' => 'success'
        ]);
    }
}
