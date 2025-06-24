import React, { useRef, useState, useEffect } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import LocationPhotoSelector from './LocationPhotoSelector';

// Define libraries as a static constant outside the component
const GOOGLE_MAPS_LIBRARIES: ("places" | "marker")[] = ['places', 'marker'];

// 添加 Google Places API 的類型定義
interface GooglePlacePhoto {
  name: string;
  widthPx?: number;
  heightPx?: number;
}

interface GooglePlaceLocation {
  latitude: number;
  longitude: number;
}

interface GooglePlace {
  name: string;
  displayName?: {
    text: string;
  };
  formattedAddress?: string;
  googleMapsUri?: string;
  location?: GooglePlaceLocation;
  photos?: GooglePlacePhoto[];
}

interface GooglePlacesResponse {
  places?: GooglePlace[];
  error?: string;
}

interface GoogleMapSearchProps {
  googleSearchInput: string;
  setGoogleSearchInput: React.Dispatch<React.SetStateAction<string>>;
  googleSearchLoading: boolean;
  setGoogleSearchLoading: React.Dispatch<React.SetStateAction<boolean>>;
  googleSearchError: string;
  setGoogleSearchError: React.Dispatch<React.SetStateAction<string>>;
  googlePlacePhotos: string[];
  setGooglePlacePhotos: React.Dispatch<React.SetStateAction<string[]>>;
  googleSelectedPhoto: string;
  setGoogleSelectedPhoto: React.Dispatch<React.SetStateAction<string>>;
  googlePlaceInfo: { name: string; address: string; url: string } | null;
  setGooglePlaceInfo: React.Dispatch<React.SetStateAction<{ name: string; address: string; url: string } | null>>;
  googleMapCenter: { lat: number; lng: number };
  setGoogleMapCenter: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>;
  googleMarkerPos: { lat: number; lng: number };
  setGoogleMarkerPos: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>;
  googleMapZoom: number;
  setGoogleMapZoom: React.Dispatch<React.SetStateAction<number>>;
  googleModalPhoto: string | null;
  setGoogleModalPhoto: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedDestination: React.Dispatch<React.SetStateAction<{ name: string; address: string; mapUrl: string; image: string } | null>>;
}

const GoogleMapSearch: React.FC<GoogleMapSearchProps> = ({
  googleSearchInput,
  setGoogleSearchInput,
  googleSearchLoading,
  setGoogleSearchLoading,
  googleSearchError,
  setGoogleSearchError,
  googlePlacePhotos,
  setGooglePlacePhotos,
  googleSelectedPhoto,
  setGoogleSelectedPhoto,
  googlePlaceInfo,
  setGooglePlaceInfo,
  googleMapCenter,
  setGoogleMapCenter,
  googleMarkerPos,
  setGoogleMarkerPos,
  googleMapZoom,
  setGoogleMapZoom,
  googleModalPhoto,
  setGoogleModalPhoto,
  setSelectedDestination
}) => {
  // 修正 hooks 規則，mapRef 一律在頂層宣告
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  
  // 新增照片參考狀態 - 用於成本優化
  const [pendingPhotoRefs, setPendingPhotoRefs] = useState<string[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [loadedPhotoCount, setLoadedPhotoCount] = useState(0); // 新增：已載入的照片數量
  const [loadMoreLoading, setLoadMoreLoading] = useState(false); // 新增：載入更多按鈕的載入狀態

  // 添加 Google Maps API 載入檢查
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  // 使用 useEffect 來管理 AdvancedMarkerElement
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    // 清理舊的 marker
    if (markerRef.current) {
      markerRef.current.map = null;
    }

    // 創建新的 AdvancedMarkerElement
    if (window.google && window.google.maps && window.google.maps.marker) {
      const { AdvancedMarkerElement } = window.google.maps.marker;
      
      markerRef.current = new AdvancedMarkerElement({
        map: mapRef.current,
        position: googleMarkerPos,
        gmpClickable: false
      });
    }

    // 清理函數
    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
      }
    };
  }, [googleMarkerPos, isLoaded]);

  if (loadError) {
    return <div className="text-red-600">Google Maps 載入失敗，請稍後再試</div>;
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ 成本優化：修改 handleSearchLocation 只取得基本資訊，不抓照片
  const handleSearchLocation = async () => {
    if (!googleSearchInput.trim()) return;
    setGoogleSearchLoading(true);
    setGoogleSearchError('');
    setGooglePlacePhotos([]);
    setGoogleSelectedPhoto('');
    setGooglePlaceInfo(null);
    setPendingPhotoRefs([]);
    setLoadedPhotoCount(0);
    
    try {
      const res = await fetch('/api/google-places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ textQuery: googleSearchInput }),
      });
      
      const data: GooglePlacesResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '搜尋失敗');
      }

      console.log('Places API Response from server:', data);
      
      if (data.places && data.places[0] && data.places[0].location) {
        const place = data.places[0];
        const loc = place.location;
        
        if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
          setGoogleMarkerPos({ lat: loc.latitude, lng: loc.longitude });
          setGoogleMapCenter({ lat: loc.latitude, lng: loc.longitude });
          setGoogleMapZoom(16);
          
          // 地點資訊
          setGooglePlaceInfo({
            name: place.displayName?.text || '',
            address: place.formattedAddress || '',
            url: place.googleMapsUri || ''
          });
          
          // ✅ 成本優化：不在此階段取得照片，改為手動觸發
        } else {
          setGoogleSearchError('地點資訊不完整，請嘗試其他關鍵字');
        }
      } else {
        setGoogleSearchError('查無此地點，請嘗試其他關鍵字');
      }
    } catch (error) {
      console.error('Search error:', error);
      setGoogleSearchError(error instanceof Error ? error.message : '搜尋失敗，請稍後再試');
    }
    setGoogleSearchLoading(false);
  };

  // ✅ 成本優化：修改 handleMapClick 只存照片參考，不立即下載
  const handleMapClick = async (
    e: google.maps.MapMouseEvent & { placeId?: string; stop?: () => void }
  ) => {
    const placeId = e.placeId;
    if (placeId) {
      if (e.stop) e.stop();
      setGoogleSearchInput('');
      setGoogleSearchError('');
      setGooglePlacePhotos([]);
      setGoogleSelectedPhoto('');
      setGooglePlaceInfo(null);
      setPendingPhotoRefs([]);
      setLoadedPhotoCount(0);
      
      try {
        const res = await fetch('/api/google-place-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ placeId }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: '獲取地點詳細資訊失敗，且無法解析錯誤回應' }));
          console.error('Failed to fetch place details from backend:', res.status, errorData);
          throw new Error(errorData.error || `伺服器錯誤: ${res.status}`);
        }

        const data: GooglePlace & { error?: string } = await res.json();
        console.log('Place Details Response:', data);
        
        if (data.location && typeof data.location.latitude === 'number' && typeof data.location.longitude === 'number') {
          setGoogleMarkerPos({ lat: data.location.latitude, lng: data.location.longitude });
          setGoogleMapCenter({ lat: data.location.latitude, lng: data.location.longitude });
          setGoogleMapZoom(16);
          
          const placeInfo = {
            name: data.displayName?.text || '',
            address: data.formattedAddress || '',
            url: data.googleMapsUri || ''
          };
          setGooglePlaceInfo(placeInfo);
          
          // ✅ 成本優化：只存照片參考，不立即下載
          if (data.photos && data.photos.length > 0) {
            const photoRefs = data.photos.map((photo: GooglePlacePhoto) => photo.name);
            setPendingPhotoRefs(photoRefs);
            
            // 自動載入前三張照片，並傳遞 placeInfo
            await loadInitialPhotos(photoRefs.slice(0, 3), placeInfo);
          } else {
            setPendingPhotoRefs([]);
          }
        } else {
          setGoogleSearchError('地點資訊不完整');
        }
      } catch (error) {
        console.error('Map click error:', error);
        setGoogleSearchError(error instanceof Error ? error.message : '取得地點資訊失敗，請稍後再試');
      }
    }
  };

  // ✅ 成本優化：新增手動載入照片函式
  const fetchPhotosByPlace = async () => {
    if (pendingPhotoRefs.length === 0) {
      setGoogleSearchError('沒有可載入的照片');
      return;
    }

    setPhotosLoading(true);
    setGoogleSearchError('');
    
    // 使用實際照片總數，最多 12 張
    const maxPhotos = Math.min(pendingPhotoRefs.length, 12);
    const photoRefsToLoad = pendingPhotoRefs.slice(0, maxPhotos);
    
    try {
      const photoUrls = await Promise.all(
        photoRefsToLoad.map(async (photoRef) => {
          const res = await fetch('/api/google-place-photo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photoRef }),
          });
          
          if (!res.ok) {
            console.error(`Failed to fetch photo for ref: ${photoRef}`);
            return null;
          }
          const imageBlob = await res.blob();
          return URL.createObjectURL(imageBlob);
        })
      );
      
      const validPhotos = photoUrls.filter((url): url is string => url !== null);
      setGooglePlacePhotos(prev => [...prev, ...validPhotos]);
      setLoadedPhotoCount(validPhotos.length);
      console.log('Photos loaded successfully:', validPhotos.length);
      
      // 如果是第一次載入且有照片，預設選取第一張並設定 selectedDestination
      if (googlePlacePhotos.length === 0 && validPhotos.length > 0) {
        setGoogleSelectedPhoto(validPhotos[0]);
        if (googlePlaceInfo) {
          setSelectedDestination({
            name: googlePlaceInfo.name,
            address: googlePlaceInfo.address,
            mapUrl: googlePlaceInfo.url,
            image: validPhotos[0]
          });
        }
      }
    } catch (error) {
      console.error('Photo loading error:', error);
      setGoogleSearchError(error instanceof Error ? error.message : '照片載入失敗，請稍後再試');
    }
    
    setPhotosLoading(false);
  };

  // ✅ 新增：載入初始照片（前三張）
  const loadInitialPhotos = async (photoRefs: string[], placeInfo?: { name: string; address: string; url: string }) => {
    setPhotosLoading(true);
    setGooglePlacePhotos([]);
    setLoadedPhotoCount(0);
    
    try {
      const photoUrls = await Promise.all(
        photoRefs.map(async (photoRef) => {
          const res = await fetch('/api/google-place-photo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photoRef }),
          });
          
          if (!res.ok) {
            console.error(`Failed to fetch initial photo for ref: ${photoRef}`);
            return null;
          }
          const imageBlob = await res.blob();
          return URL.createObjectURL(imageBlob);
        })
      );

      const validPhotos = photoUrls.filter((url): url is string => url !== null);
      setGooglePlacePhotos(validPhotos);
      setLoadedPhotoCount(validPhotos.length);
      
      // 如果有照片，預設選取第一張並設定 selectedDestination
      if (validPhotos.length > 0) {
        setGoogleSelectedPhoto(validPhotos[0]);
        // 使用傳入的 placeInfo 或者 googlePlaceInfo
        const currentPlaceInfo = placeInfo || googlePlaceInfo;
        if (currentPlaceInfo) {
          setSelectedDestination({
            name: currentPlaceInfo.name,
            address: currentPlaceInfo.address,
            mapUrl: currentPlaceInfo.url,
            image: validPhotos[0]
          });
        }
      }
      
    } catch (error) {
      console.error('Initial photo loading error:', error);
      setGoogleSearchError(error instanceof Error ? error.message : '初始照片載入失敗，請稍後再試');
    }
    
    setPhotosLoading(false);
  };

  // ✅ 新增：載入更多照片
  const loadMorePhotos = async () => {
    // 使用實際照片總數，最多 12 張
    const maxPhotos = Math.min(pendingPhotoRefs.length, 12);
    const remainingRefs = pendingPhotoRefs.slice(loadedPhotoCount, Math.min(loadedPhotoCount + 3, maxPhotos));
    if (remainingRefs.length === 0) return;
    
    setLoadMoreLoading(true);
    setGoogleSearchError('');
    
    try {
      const photoUrls = await Promise.all(
        remainingRefs.map(async (photoRef) => {
          const res = await fetch('/api/google-place-photo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photoRef }),
          });
          
          if (!res.ok) {
            console.error(`Failed to fetch photo for ref: ${photoRef}`);
            return null;
          }
          const imageBlob = await res.blob();
          return URL.createObjectURL(imageBlob);
        })
      );
      
      const validPhotos = photoUrls.filter((url): url is string => url !== null);
      setGooglePlacePhotos(prev => [...prev, ...validPhotos]);
      setLoadedPhotoCount(prev => prev + validPhotos.length);
      console.log('More photos loaded successfully:', validPhotos.length);
    } catch (error) {
      console.error('Load more photos error:', error);
      setGoogleSearchError(error instanceof Error ? error.message : '載入更多照片失敗，請稍後再試');
    }
    
    setLoadMoreLoading(false);
  };

  return (
    <>
      <div className="w-full max-w-md mb-4 flex gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
          placeholder="搜尋地點，例如：東京塔"
          value={googleSearchInput}
          onChange={e => setGoogleSearchInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearchLocation();
            }
          }}
          autoComplete="off"
          disabled={googleSearchLoading}
        />
        <button
          onClick={handleSearchLocation}
          disabled={googleSearchLoading || !googleSearchInput.trim()}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          {googleSearchLoading ? '搜尋中...' : '搜尋'}
        </button>
      </div>
      {googleSearchError && <div className="text-red-600 mb-4">{googleSearchError}</div>}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={googleMapCenter}
        zoom={googleMapZoom}
        options={{
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          mapId: 'DEMO_MAP_ID' // 需要 mapId 才能使用 AdvancedMarkerElement
        }}
        onLoad={map => { mapRef.current = map; }}
        onClick={handleMapClick}
      >
        {/* Marker will be added using AdvancedMarkerElement in onLoad */}
      </GoogleMap>
      <div className="mt-4 text-gray-600 text-sm">目前座標：{googleMarkerPos.lat.toFixed(5)}, {googleMarkerPos.lng.toFixed(5)}</div>
      
      {/* 地點資訊卡片 */}
      {googlePlaceInfo && (
        <div className="w-full max-w-2xl bg-gray-50 rounded-lg shadow p-4 mb-4">
          <div className="font-bold text-lg mb-1">{googlePlaceInfo.name}</div>
          <div className="text-gray-700 mb-1">{googlePlaceInfo.address}</div>
          {googlePlaceInfo.url && (
            <a href={googlePlaceInfo.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">在 Google Maps 上查看</a>
          )}
          
          {/* ✅ 成本優化：手動載入照片按鈕 */}
          {pendingPhotoRefs.length > 0 && googlePlacePhotos.length === 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={fetchPhotosByPlace}
                disabled={photosLoading}
                className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-sm"
              >
                {photosLoading ? '載入中...' : `點我載入地點照片 (${pendingPhotoRefs.length} 張，可能會消耗 API)`}
              </button>
              <div className="text-xs text-gray-500 mt-1">
                點擊按鈕才會下載照片，可節省 API 成本
              </div>
            </div>
          )}
          
          {/* ✅ 新增：顯示已載入照片數量 */}
          {googlePlacePhotos.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                已載入 {loadedPhotoCount} / {Math.min(pendingPhotoRefs.length, 12)} 張照片
                {pendingPhotoRefs.length > 12 && (
                  <span className="text-gray-400 ml-1">(最多顯示 12 張)</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 地點照片選擇區塊 */}
      <div className="w-full mt-2 mx-auto">
        <div className="font-semibold mb-2">地點照片：</div>
        {googlePlacePhotos.length > 0 ? (
          <>
          <LocationPhotoSelector
            photos={googlePlacePhotos.map((url, idx) => ({ url, id: idx }))}
            selectedPhoto={googleSelectedPhoto}
            onSelect={(url) => {
              setGoogleSelectedPhoto(url);
              if (googlePlaceInfo) {
                setSelectedDestination({
                  name: googlePlaceInfo.name,
                  address: googlePlaceInfo.address,
                  mapUrl: googlePlaceInfo.url,
                  image: url
                });
              }
            }}
            className="grid-cols-3"
          />
            
            {/* ✅ 新增：載入更多照片按鈕 */}
            {loadedPhotoCount < Math.min(pendingPhotoRefs.length, 12) && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={loadMorePhotos}
                  disabled={loadMoreLoading}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all text-sm"
                >
                  {loadMoreLoading ? '載入中...' : `載入更多照片 (${Math.min(3, Math.min(pendingPhotoRefs.length, 12) - loadedPhotoCount)} 張)`}
                </button>
              </div>
            )}
          </>
        ) : pendingPhotoRefs.length > 0 ? (
          <div className="text-gray-500">點擊上方按鈕載入照片</div>
        ) : (
          <div className="text-gray-400">查無地點照片</div>
        )}
      </div>
      
      {/* Modal 放大圖 */}
      {googleModalPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setGoogleModalPhoto(null)}>
          <img src={googleModalPhoto} alt="放大地點照片" className="max-w-3xl max-h-[80vh] rounded-lg shadow-2xl border-4 border-white" />
        </div>
      )}
      
      {/* 代表照大圖 */}
      {googleSelectedPhoto && (
        <div className="mt-6 flex flex-col items-center">
          <div className="font-semibold mb-2 text-blue-700">已選擇代表照片</div>
          <img src={googleSelectedPhoto} alt="代表照片" className="max-w-md max-h-96 rounded-xl border-4 border-blue-400 shadow-lg" />
        </div>
      )}
    </>
  );
};

export default GoogleMapSearch; 