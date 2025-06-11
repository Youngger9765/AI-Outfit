import React, { useRef } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import LocationPhotoSelector from './LocationPhotoSelector';

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

  // 添加 Google Maps API 載入檢查
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

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

  const handleSearchLocation = async () => {
    if (!googleSearchInput.trim()) return;
    setGoogleSearchLoading(true);
    setGoogleSearchError('');
    setGooglePlacePhotos([]);
    setGoogleSelectedPhoto('');
    setGooglePlaceInfo(null);
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places:searchText`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.photos,places.googleMapsUri'
          },
          body: JSON.stringify({
            textQuery: googleSearchInput,
            languageCode: 'zh-TW',
            maxResultCount: 1
          })
        }
      );
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error('Google Places API Error:', errorData);
        throw new Error(errorData?.error?.message || '搜尋失敗');
      }

      const data: GooglePlacesResponse = await res.json();
      console.log('Places API Response:', data); // 添加调试日志
      
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
          
          // 取得地點照片
          if (place.photos && place.photos.length > 0) {
            const photoUrls = place.photos.map((photo: GooglePlacePhoto) =>
              `https://places.googleapis.com/v1/${photo.name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&maxHeightPx=800&maxWidthPx=800`
            );
            setGooglePlacePhotos(photoUrls);
          } else {
            setGooglePlacePhotos([]);
          }
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
      try {
        const res = await fetch(
          `https://places.googleapis.com/v1/places/${placeId}`,
          {
            method: 'GET',
            headers: {
              'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
              'X-Goog-FieldMask': 'displayName,formattedAddress,location,photos,googleMapsUri'
            }
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          console.error('Google Places API Error:', errorData);
          throw new Error(errorData?.error?.message || '取得地點資訊失敗');
        }

        const data: GooglePlace = await res.json();
        console.log('Place Details Response:', data); // 添加调试日志
        
        if (data.location && typeof data.location.latitude === 'number' && typeof data.location.longitude === 'number') {
          setGoogleMarkerPos({ lat: data.location.latitude, lng: data.location.longitude });
          setGoogleMapCenter({ lat: data.location.latitude, lng: data.location.longitude });
          setGoogleMapZoom(16);
          
          setGooglePlaceInfo({
            name: data.displayName?.text || '',
            address: data.formattedAddress || '',
            url: data.googleMapsUri || ''
          });
          
          if (data.photos && data.photos.length > 0) {
            const photoUrls = data.photos.map(
              (photo: GooglePlacePhoto) =>
                `https://places.googleapis.com/v1/${photo.name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&maxHeightPx=800&maxWidthPx=800`
            );
            setGooglePlacePhotos(photoUrls);
          } else {
            setGooglePlacePhotos([]);
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
          fullscreenControl: true
        }}
        onLoad={map => { mapRef.current = map; }}
        onClick={handleMapClick}
      >
        <Marker position={googleMarkerPos} />
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
        </div>
      )}
      {/* 地點照片選擇區塊 */}
      <div className="w-full mt-2 mx-auto">
        <div className="font-semibold mb-2">地點照片：</div>
        {googlePlacePhotos.length > 0 ? (
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