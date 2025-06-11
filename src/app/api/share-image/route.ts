import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('Missing image ID', { status: 400 });
  }

  try {
    // 這裡應該實現將 base64 ID 轉換回完整的圖片
    // 在實際應用中，您可能需要：
    // 1. 將圖片存儲在 CDN 或雲存儲中
    // 2. 使用數據庫來追踪圖片 ID 和 URL 的映射
    // 3. 實現適當的緩存策略
    
    // 目前為了演示，我們返回一個臨時的圖片 URL
    const imageUrl = `data:image/jpeg;base64,${id}`;
    
    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error('Error processing image:', error);
    return new NextResponse('Error processing image', { status: 500 });
  }
} 