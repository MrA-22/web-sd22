<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Latar;

class LatarController extends Controller
{
    // GET semua latar
    public function index()
    {
        $latar = Latar::all();

        $latar->transform(function ($item) {
            $item->url = url('uploads/latar/' . $item->gambar);
            return $item;
        });

        return response()->json($latar);
    }

    // UPDATE / UPLOAD latar baru
    public function update(Request $request)
    {
        if ($request->hasFile('latar')) {
            $gambar = $request->file('latar');
            $name = time() . '.' . $gambar->getClientOriginalExtension();

            $gambar->move(public_path('uploads/latar'), $name);

            // ambil data pertama
            $latar = Latar::first();

            if ($latar) {
                // update jika sudah ada
                $latar->update([
                    'gambar' => $name
                ]);
            } else {
                // kalau belum ada, create
                Latar::create([
                    'gambar' => $name
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Latar berhasil diupdate'
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'gambar tidak ditemukan'
        ]);
    }
}
