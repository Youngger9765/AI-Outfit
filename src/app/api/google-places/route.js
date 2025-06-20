export async function POST(req) {
  const { textQuery } = await req.json();

  if (!textQuery) {
    return Response.json({ error: 'Missing textQuery' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Google Maps API key is not set on the server.');
    return Response.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const url = `https://places.googleapis.com/v1/places:searchText`;

  try {
    const googleRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.photos'
      },
      body: JSON.stringify({
        textQuery,
        languageCode: 'zh-TW',
        maxResultCount: 1
      })
    });

    if (!googleRes.ok) {
      const errorText = await googleRes.text();
      console.error('Google Places API Error. Status:', googleRes.status, 'Body:', errorText);
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        return Response.json({ error: 'Google API returned a non-JSON error', detail: errorText }, { status: googleRes.status });
      }
      return Response.json({ error: errorJson?.error?.message || 'Failed to fetch from Google Places API', detail: errorJson }, { status: googleRes.status });
    }
    
    const data = await googleRes.json();
    return Response.json(data);

  } catch (error) {
    console.error('Error proxying Google Places API:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 