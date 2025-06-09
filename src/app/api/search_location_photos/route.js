export async function POST(req) {
  const { query } = await req.json();

  // Debug log: 印出金鑰有無
  console.log('PEXELS_API_KEY:', process.env.PEXELS_API_KEY ? '[存在]' : '[不存在]');

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Pexels API key not set' }, { status: 500 });
  }

  // 檢查是否為台灣相關搜尋
  const isTaiwanSearch = query.toLowerCase().includes('taiwan') || 
                        query.includes('台灣') || 
                        query.includes('臺灣');

  // 檢查是否為日本相關搜尋
  const isJapanSearch = query.toLowerCase().includes('japan') ||
                       query.includes('日本') ||
                       query.toLowerCase().includes('tokyo') ||
                       query.includes('東京');

  // 優化搜尋參數
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape&size=large&locale=zh-TW`;
  
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
  
  // 過濾並排序結果
  if (data.photos) {
    data.photos = data.photos
      .filter(photo => {
        // 過濾條件
        const photoText = (photo.alt || '').toLowerCase();
        const isPersonPhoto = photoText.includes('person') || 
                            photoText.includes('portrait') ||
                            photoText.includes('people');
        
        // 如果是台灣搜尋，優先保留包含台灣相關關鍵字的照片
        if (isTaiwanSearch) {
          const hasNonTaiwanKeywords = photoText.includes('china') || 
                                     photoText.includes('japan') || 
                                     photoText.includes('korea');
          return !isPersonPhoto && !hasNonTaiwanKeywords;
        }

        // 如果是日本搜尋，優先保留包含日本相關關鍵字的照片
        if (isJapanSearch) {
          const hasNonJapanKeywords = photoText.includes('china') ||
                                    photoText.includes('korea') ||
                                    photoText.includes('taiwan');
          return !isPersonPhoto && !hasNonJapanKeywords;
        }
        
        return !isPersonPhoto;
      })
      .sort((a, b) => {
        // 優先顯示較新和較高質量的圖片
        const qualityScore = (photo) => {
          let score = photo.width * photo.height;
          
          // 如果是台灣搜尋，提升包含台灣關鍵字的照片權重
          if (isTaiwanSearch) {
            const photoText = (photo.alt || '').toLowerCase();
            if (photoText.includes('taiwan') || 
                photoText.includes('台灣') || 
                photoText.includes('臺灣')) {
              score *= 2;
            }
          }

          // 如果是日本搜尋，提升包含日本關鍵字的照片權重
          if (isJapanSearch) {
            const photoText = (photo.alt || '').toLowerCase();
            if (photoText.includes('japan') ||
                photoText.includes('tokyo') ||
                photoText.includes('日本') ||
                photoText.includes('東京')) {
              score *= 2;
            }
          }
          
          return score;
        };
        
        return qualityScore(b) - qualityScore(a);
      });

    // 移除固定數量限制，讓前端決定要顯示多少張
    // data.photos = data.photos.slice(0, 9);
  }
  
  return Response.json(data);
} 