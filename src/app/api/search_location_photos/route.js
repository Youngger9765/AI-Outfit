export async function POST(req) {
  const { location_name } = await req.json();

  // Debug log: 印出金鑰有無
  console.log('PEXELS_API_KEY:', process.env.PEXELS_API_KEY ? '[存在]' : '[不存在]');

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Pexels API key not set' }, { status: 500 });
  }

  // 呼叫 Pexels API 搜尋地點照片
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(location_name)}&per_page=6`;
  const res = await fetch(url, {
    headers: {
      Authorization: apiKey
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Pexels API error detail:', errorText);
    return Response.json({ error: 'Pexels API error', detail: errorText }, { status: 500 });
  }

  const data = await res.json();
  const images = (data.photos || []).map(photo => photo.src.large);

  return Response.json({
    name: location_name,
    address: '查無地址', // 如需真實地址可再串 Google Maps API
    map_url: `https://www.google.com/maps/search/${encodeURIComponent(location_name)}`,
    images
  });
} 