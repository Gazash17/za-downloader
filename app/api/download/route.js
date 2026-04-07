import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || !url.includes('tiktok.com')) {
      return NextResponse.json({ success: false, error: 'Masukkan URL video TikTok yang valid.' }, { status: 400 });
    }

    console.log("Memproses URL TikTok:", url);

    // Memanggil API TikWM
    const res = await fetch(`https://www.tikwm.com/api/?url=${url}&hd=1`);
    const data = await res.json();
    
    if (data.code === 0) {
      // Memastikan semua link terambil, termasuk link rahasia MP3 (music_info)
      const hdUrl = data.data.hdplay || data.data.play;
      const sdUrl = data.data.play || data.data.wmplay || hdUrl;
      const audioUrl = data.data.music || (data.data.music_info ? data.data.music_info.play : null);

      return NextResponse.json({
        success: true,
        data: {
          platform: "TikTok",
          title: data.data.title || "Video TikTok",
          thumbnail: data.data.cover,
          hd: hdUrl,
          sd: sdUrl,
          audio: audioUrl
        }
      });
    } else {
      return NextResponse.json({ success: false, error: 'Gagal ekstrak! Pastikan link video bukan private.' }, { status: 400 });
    }

  } catch (error) {
    console.error("API Error Backend:", error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada mesin server.' }, { status: 500 });
  }
}