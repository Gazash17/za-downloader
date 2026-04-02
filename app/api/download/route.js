import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL tidak boleh kosong' }, { status: 400 });
    }

    console.log("Memproses URL TikTok:", url);

    // Filter: Tolak otomatis kalau bukan link TikTok
    if (!url.includes('tiktok.com')) {
       return NextResponse.json({ success: false, error: 'Aplikasi ini khusus untuk link TikTok!' }, { status: 400 });
    }

    // ==========================================
    // MESIN TIKTOK KHUSUS (Sudah diperbaiki &hd=1 nya)
    // ==========================================
    const res = await fetch(`https://www.tikwm.com/api/?url=${url}&hd=1`);
    const data = await res.json();
    
    if (data.code === 0) {
      return NextResponse.json({
        success: true,
        data: {
          platform: "TikTok",
          title: data.data.title || "Video TikTok",
          thumbnail: data.data.cover,
          // Mengambil ukuran paling besar (HD) jika tersedia
          hd: data.data.hdplay || data.data.play, 
          // Mengambil ukuran standar
          sd: data.data.play,
          audio: data.data.music
        }
      });
    } else {
      return NextResponse.json({ success: false, error: 'Gagal mengekstrak! Pastikan link benar dan akun tidak di-private.' }, { status: 400 });
    }

  } catch (error) {
    console.error("API Error Backend:", error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada mesin server.' }, { status: 500 });
  }
}