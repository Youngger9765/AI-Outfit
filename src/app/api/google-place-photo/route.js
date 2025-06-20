export async function POST(req) {
  const { photoRef } = await req.json();

  if (!photoRef) {
    return Response.json({ error: 'Missing photoRef' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Google Maps API key is not set on the server.');
    return Response.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const url = `https://places.googleapis.com/v1/${photoRef}/media?key=${apiKey}&maxHeightPx=800&maxWidthPx=800`;

  try {
    const googleRes = await fetch(url, {
      method: 'GET',
    });

    if (!googleRes.ok) {
      const errorText = await googleRes.text();
      console.error('Google Place Photo API Error. Status:', googleRes.status, 'Body:', errorText);
      return new Response(errorText, { status: googleRes.status });
    }
    
    // 將圖片直接回傳
    const imageBlob = await googleRes.blob();
    return new Response(imageBlob, {
      status: 200,
      headers: {
        'Content-Type': googleRes.headers.get('Content-Type') || 'image/jpeg',
      },
    });

  } catch (error) {
    console.error('Error proxying Google Place Photo API:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 