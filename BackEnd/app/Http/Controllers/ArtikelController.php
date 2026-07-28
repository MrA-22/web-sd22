<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Artikel;

class ArtikelController extends Controller
{
    public function index()
    {
        $data = Artikel::all();

        foreach ($data as $a) {
            $a->foto_url = $a->foto_artikel
                ? url('uploads/Foto_Artikel/' . $a->foto_artikel)
                : null;
        }

        return response()->json($data);
    }

    public function show($id)
    {
        $artikel = Artikel::find($id);

        if (!$artikel) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $artikel->foto_url = $artikel->foto_artikel
            ? url('uploads/Foto_Artikel/' . $artikel->foto_artikel)
            : null;

        return response()->json($artikel);
    }

    public function store(Request $request)
    {
        $data = $request->all();

        if (!isset($data['tanggal_upload'])) {
            $data['tanggal_upload'] = now();
        }

        if ($request->hasFile('foto')) {
            $fotoName = time() . '.' . $request->foto->extension();
            $request->foto->move(public_path('uploads/Foto_Artikel'), $fotoName);
            $data['foto_artikel'] = $fotoName;
        }

        $artikel = Artikel::create($data);

        $artikel->foto_url = $artikel->foto_artikel
            ? url('uploads/Foto_Artikel/' . $artikel->foto_artikel)
            : null;

        return response()->json([
            'message' => 'Artikel berhasil ditambahkan',
            'data' => $artikel
        ]);
    }

    public function update(Request $request, $id)
    {
        $artikel = Artikel::find($id);

        if (!$artikel) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        if ($request->hasFile('foto')) {
            $fotoName = time() . '.' . $request->foto->extension();
            $request->foto->move(public_path('uploads/Foto_Artikel'), $fotoName);
            $artikel->foto_artikel = $fotoName;
        }

        $artikel->judul = $request->judul;
        $artikel->penulis = $request->penulis;
        $artikel->isi = $request->isi;
        $artikel->tanggal_upload = $request->tanggal_upload ?? $artikel->tanggal_upload;

        $artikel->save();

        $artikel->foto_url = $artikel->foto_artikel
            ? url('uploads/Foto_Artikel/' . $artikel->foto_artikel)
            : null;

        return response()->json([
            'message' => 'Artikel berhasil diupdate',
            'data' => $artikel
        ]);
    }

    public function destroy($id)
    {
        $artikel = Artikel::find($id);

        if (!$artikel) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        if ($artikel->foto_artikel) {
            $path = public_path('uploads/Foto_Artikel/' . $artikel->foto_artikel);
            if (file_exists($path)) {
                unlink($path);
            }
        }

        $artikel->delete();

        return response()->json([
            'message' => 'Artikel berhasil dihapus'
        ]);
    }
}