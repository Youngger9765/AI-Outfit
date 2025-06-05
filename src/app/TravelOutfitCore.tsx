'use client';
import React, { useState, useRef } from 'react';
import { 
  Camera, 
  MapPin, 
  Upload, 
  Sparkles, 
  User,
  Play,
  Download,
  Share2,
  ChevronRight,
  Check,
  Search,
  X
} from 'lucide-react';

const TravelOutfitCore = () => {
  const [step, setStep] = useState(1);
  const [uploadedClothes, setUploadedClothes] = useState([]);
  const [selfieImage, setSelfieImage] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [isComposing, setIsComposing] = useState(false);
  
  const handleSearch = (query) => {
    if (isComposing) return; // 如果正在輸入注音，不執行搜尋
    
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredDestinations([]);
      return;
    }
    
    const searchTerm = query.toLowerCase();
    const filtered = allDestinations.filter(dest => 
      dest.name.toLowerCase().includes(searchTerm) ||
      dest.country.toLowerCase().includes(searchTerm) ||
      dest.style.toLowerCase().includes(searchTerm) ||
      dest.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      dest.aliases.some(alias => alias.toLowerCase().includes(searchTerm))
    );
    
    setFilteredDestinations(filtered);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // 如果不是在輸入注音，就即時搜尋
    if (!isComposing && value.trim() !== '') {
      handleSearch(value);
    } else if (value.trim() === '') {
      setFilteredDestinations([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredDestinations([]);
  };

  const getDisplayDestinations = () => {
    if (searchQuery.trim() === '') {
      return allDestinations.slice(0, 6); // 顯示前6個熱門目的地
    }
    return filteredDestinations;
  };

  const clothesInputRef = useRef(null);
  const selfieInputRef = useRef(null);

  // 擴展的旅遊目的地資料庫
  const allDestinations = [
    // 熱門城市
    { 
      id: 1, 
      name: '巴黎', 
      country: '法國', 
      style: '典雅優雅', 
      weather: '15°C', 
      image: '🗼', 
      color: 'from-pink-400 to-purple-500', 
      tags: ['歐洲', '浪漫', '時尚', '藝術'],
      aliases: ['paris', '法國巴黎', '花都', '浪漫之都', '時尚之都']
    },
    { 
      id: 2, 
      name: '首爾', 
      country: '韓國', 
      style: '韓系時尚', 
      weather: '8°C', 
      image: '🏢', 
      color: 'from-blue-400 to-cyan-500', 
      tags: ['亞洲', 'K-pop', '現代', '購物'],
      aliases: ['seoul', '漢城', '韓國首爾', '南韓', '韓式', 'kpop', 'k-pop']
    },
    { 
      id: 3, 
      name: '東京', 
      country: '日本', 
      style: '日系簡約', 
      weather: '12°C', 
      image: '🏯', 
      color: 'from-red-400 to-pink-500', 
      tags: ['亞洲', '簡約', '動漫', '科技'],
      aliases: ['tokyo', '日本東京', '櫻花', '和風', '日式', '動漫']
    },
    { 
      id: 4, 
      name: '倫敦', 
      country: '英國', 
      style: '英倫復古', 
      weather: '10°C', 
      image: '🏰', 
      color: 'from-gray-400 to-blue-500', 
      tags: ['歐洲', '復古', '紳士', '文藝'],
      aliases: ['london', '英國倫敦', '英式', '紳士', '復古']
    },
    { 
      id: 5, 
      name: '紐約', 
      country: '美國', 
      style: '都市摩登', 
      weather: '18°C', 
      image: '🏙️', 
      color: 'from-yellow-400 to-orange-500', 
      tags: ['北美', '摩登', '商務', '潮流'],
      aliases: ['new york', 'ny', 'nyc', '美國紐約', '大蘋果', '摩登']
    },
    { 
      id: 6, 
      name: '峇里島', 
      country: '印尼', 
      style: '度假休閒', 
      weather: '28°C', 
      image: '🏝️', 
      color: 'from-green-400 to-teal-500', 
      tags: ['東南亞', '度假', '海灘', '熱帶'],
      aliases: ['bali', '巴厘島', '印尼峇里島', '海島', '度假']
    },
    
    // 新增更多目的地
    { 
      id: 7, 
      name: '米蘭', 
      country: '義大利', 
      style: '奢華時尚', 
      weather: '16°C', 
      image: '🏛️', 
      color: 'from-purple-400 to-pink-500', 
      tags: ['歐洲', '時尚', '奢華', '設計'],
      aliases: ['milan', '義大利米蘭', '時尚之都', '奢華']
    },
    { 
      id: 8, 
      name: '洛杉磯', 
      country: '美國', 
      style: '加州休閒', 
      weather: '22°C', 
      image: '🌴', 
      color: 'from-orange-400 to-yellow-500', 
      tags: ['北美', '休閒', '陽光', '海灘'],
      aliases: ['los angeles', 'la', '美國洛杉磯', '加州', '陽光', '好萊塢']
    },
    { 
      id: 9, 
      name: '上海', 
      country: '中國', 
      style: '摩登東方', 
      weather: '14°C', 
      image: '🌆', 
      color: 'from-indigo-400 to-purple-500', 
      tags: ['亞洲', '現代', '商務', '國際'],
      aliases: ['shanghai', '中國上海', '魔都', '摩登', '東方']
    },
    { 
      id: 10, 
      name: '雪梨', 
      country: '澳洲', 
      style: '悠閒自然', 
      weather: '20°C', 
      image: '🦘', 
      color: 'from-blue-400 to-green-500', 
      tags: ['大洋洲', '自然', '悠閒', '海港'],
      aliases: ['sydney', '澳洲雪梨', '悉尼', '澳洲', '海港']
    },
    { 
      id: 11, 
      name: '曼谷', 
      country: '泰國', 
      style: '熱帶風情', 
      weather: '30°C', 
      image: '🛕', 
      color: 'from-yellow-400 to-red-500', 
      tags: ['東南亞', '熱帶', '文化', '美食'],
      aliases: ['bangkok', '泰國曼谷', '泰式', '熱帶', '佛教']
    },
    { 
      id: 12, 
      name: '柏林', 
      country: '德國', 
      style: '前衛藝術', 
      weather: '9°C', 
      image: '🎨', 
      color: 'from-gray-400 to-green-500', 
      tags: ['歐洲', '藝術', '前衛', '歷史'],
      aliases: ['berlin', '德國柏林', '藝術', '前衛', '歷史']
    },
    { 
      id: 13, 
      name: '新加坡', 
      country: '新加坡', 
      style: '多元現代', 
      weather: '26°C', 
      image: '🏢', 
      color: 'from-green-400 to-blue-500', 
      tags: ['東南亞', '現代', '多元', '商務'],
      aliases: ['singapore', '星國', '獅城', '花園城市']
    },
    { 
      id: 14, 
      name: '杜拜', 
      country: '阿聯酋', 
      style: '奢華未來', 
      weather: '24°C', 
      image: '🏗️', 
      color: 'from-gold to-amber-500', 
      tags: ['中東', '奢華', '未來', '沙漠'],
      aliases: ['dubai', '阿聯酋杜拜', '杜拜', '奢華', '未來', '黃金']
    },
    { 
      id: 15, 
      name: '冰島雷克雅維克', 
      country: '冰島', 
      style: '北歐簡約', 
      weather: '2°C', 
      image: '🌋', 
      color: 'from-blue-500 to-cyan-400', 
      tags: ['歐洲', '北歐', '自然', '極光'],
      aliases: ['iceland', 'reykjavik', '冰島', '極光', '北歐', '火山']
    },
    { 
      id: 16, 
      name: '里約熱內盧', 
      country: '巴西', 
      style: '熱情奔放', 
      weather: '25°C', 
      image: '🏖️', 
      color: 'from-yellow-500 to-green-400', 
      tags: ['南美', '熱情', '海灘', '嘉年華'],
      aliases: ['rio', 'rio de janeiro', '巴西里約', '嘉年華', '熱情', '桑巴']
    }
  ];

  const handleClothesUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedClothes(prev => [...prev, {
          id: Date.now() + Math.random(),
          file: file,
          preview: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSelfieUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelfieImage({
          file: file,
          preview: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateTravelContent = async () => {
    setIsGenerating(true);
    
    // 直接生成，不使用 setTimeout 避免問題
    // 使用 Promise 來模擬延遲，但確保一定會執行
    try {
      await new Promise(resolve => {
        // 使用 requestAnimationFrame 代替 setTimeout
        let count = 0;
        const animate = () => {
          count++;
          if (count >= 120) { // 約2秒 (60fps * 2)
            resolve();
          } else {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      });
    } catch (error) {
      console.log('延遲完成');
    }
    
    // 生成圖片內容
    const colors = {
      1: { primary: '#E8B4F0', secondary: '#C8A8E9', accent: '#F4A6CD' }, // 巴黎
      2: { primary: '#A8D8EA', secondary: '#AA96DA', accent: '#FCBAD3' }, // 首爾
      3: { primary: '#FFB3BA', secondary: '#FFDFBA', accent: '#FFFFBA' }, // 東京
      4: { primary: '#BAE1FF', secondary: '#BAFFC9', accent: '#FFFFBA' }, // 倫敦
      5: { primary: '#FFD93D', secondary: '#6BCF7F', accent: '#4D96FF' }, // 紐約
      6: { primary: '#6BCF7F', secondary: '#4D96FF', accent: '#FFD93D' }  // 峇里島
    };
    
    const destColors = colors[selectedDestination?.id || 1];
    
    const mockImage = `data:image/svg+xml;base64,${btoa(`
      <svg width="300" height="450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${destColors.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${destColors.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="300" height="450" fill="url(#bg)"/>
        <text x="150" y="40" text-anchor="middle" fill="white" font-size="20">${selectedDestination?.image || '✈️'}</text>
        <ellipse cx="150" cy="120" rx="35" ry="45" fill="#FDBCB4" opacity="0.9"/>
        <rect x="115" y="160" width="70" height="80" rx="10" fill="white" opacity="0.9"/>
        <rect x="125" y="240" width="50" height="100" rx="8" fill="#2C3E50" opacity="0.8"/>
        <ellipse cx="135" cy="360" rx="15" ry="8" fill="#34495E"/>
        <ellipse cx="165" cy="360" rx="15" ry="8" fill="#34495E"/>
        <circle cx="180" cy="180" r="12" fill="${destColors.accent}" opacity="0.8"/>
        <rect x="20" y="380" width="260" height="50" rx="25" fill="white" opacity="0.9"/>
        <text x="150" y="400" text-anchor="middle" fill="#2C3E50" font-size="14" font-weight="bold">
          ${selectedDestination?.name || '旅行'} ${selectedDestination?.style || '時尚'}
        </text>
        <text x="150" y="418" text-anchor="middle" fill="#7F8C8D" font-size="10">
          完美適合 ${selectedDestination?.weather || '舒適'} 天氣
        </text>
      </svg>
    `)}`;

    const coachMessages = [
      `太棒了！這套${selectedDestination?.style || '時尚'}穿搭完美展現了你的個人魅力✨`,
      `在${selectedDestination?.name || '旅行目的地'}穿這套一定超亮眼！色彩搭配很有品味👏`,
      `這個搭配充滿了${selectedDestination?.style || '獨特'}的精髓，你穿起來一定很棒🌟`,
      `完美！這套穿搭既實用又時尚，很適合${selectedDestination?.weather || '當地'}的天氣💫`,
      `你的穿搭品味真不錯！這套在${selectedDestination?.name || '目的地'}絕對是焦點🔥`
    ];

    const randomMessage = coachMessages[Math.floor(Math.random() * coachMessages.length)];

    setGeneratedContent({
      type: 'image',
      url: mockImage,
      description: `為你在${selectedDestination?.name || '旅行'}的旅行生成的${selectedDestination?.style || '時尚'}風格穿搭照片`,
      coachMessage: randomMessage,
      outfitDetails: {
        climate: selectedDestination?.weather || '舒適天氣',
        style: selectedDestination?.style || '個人風格',
        clothesUsed: uploadedClothes.length,
        recommendation: `這套搭配運用了你上傳的${uploadedClothes.length}件衣物中的精選單品，結合${selectedDestination?.name || '目的地'}當地的${selectedDestination?.style || '時尚'}風格特色。`
      }
    });
    
    setIsGenerating(false);
  };

  const StepIndicator = ({ currentStep, totalSteps }) => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
            i + 1 <= currentStep 
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent' 
              : 'bg-white text-gray-400 border-gray-300'
          }`}>
            {i + 1 <= currentStep ? <Check size={16} /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-12 h-1 mx-2 ${
              i + 1 < currentStep ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const Step1ClothesUpload = () => (
    <div className="mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">上傳你的衣服</h2>
        <p className="text-gray-600">拍照或選擇你想要搭配的衣服照片</p>
      </div>

      <div 
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
        onClick={() => clothesInputRef.current?.click()}
      >
        <Camera className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-lg font-medium text-gray-700 mb-2">點擊上傳衣服照片</h3>
        <p className="text-sm text-gray-500">支援 JPG, PNG 格式，可一次選擇多張</p>
        <input
          ref={clothesInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleClothesUpload}
          className="hidden"
        />
      </div>

      {uploadedClothes.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">已上傳的衣服 ({uploadedClothes.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
            {uploadedClothes.map(item => (
              <div key={item.id} className="relative">
                <img 
                  src={item.preview} 
                  alt={item.name}
                  className="w-full h-32 object-cover rounded-lg shadow-md"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                  <Check className="text-white opacity-0 hover:opacity-100" size={24} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadedClothes.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setStep(2)}
            className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            下一步：上傳自拍照
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );

  const Step2SelfieUpload = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">上傳你的自拍照</h2>
        <p className="text-gray-600">讓 AI 了解你的身形和風格偏好</p>
      </div>

      <div 
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
        onClick={() => selfieInputRef.current?.click()}
      >
        {selfieImage ? (
          <div className="relative">
            <img 
              src={selfieImage.preview} 
              alt="自拍照預覽"
              className="mx-auto w-48 h-64 object-cover rounded-lg shadow-lg"
            />
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
              <Check size={16} />
            </div>
          </div>
        ) : (
          <>
            <User className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-700 mb-2">點擊上傳自拍照</h3>
            <p className="text-sm text-gray-500">建議全身照或半身照，光線充足</p>
          </>
        )}
        <input
          ref={selfieInputRef}
          type="file"
          accept="image/*"
          onChange={handleSelfieUpload}
          className="hidden"
        />
      </div>

      {selfieImage && (
        <div className="flex justify-center mt-8 gap-4">
          <button
            onClick={() => setStep(1)}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all"
          >
            返回上一步
          </button>
          <button
            onClick={() => setStep(3)}
            className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            下一步：選擇目的地
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );

  const Step3DestinationSelect = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">選擇旅遊目的地</h2>
        <p className="text-gray-600">搜尋你想去的地方，我們為你推薦最適合的穿搭風格</p>
      </div>

      {/* 搜尋框 */}
      <div className="max-w-md mx-auto mb-8">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜尋城市、國家或風格..."
            value={searchQuery}
            onChange={handleInputChange}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => {
              setIsComposing(false);
              // 當注音輸入完成時，執行搜尋
              setTimeout(() => handleSearch(searchQuery), 0);
            }}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-500 text-white p-1.5 rounded-md hover:bg-purple-600 transition-colors"
          >
            <Search size={16} />
          </button>
        </form>
        
        {/* 搜尋提示 */}
        {searchQuery && filteredDestinations.length === 0 && !isComposing && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-700">找不到相關目的地，試試搜尋：</p>
            <p className="text-xs text-yellow-600 mt-1">
              中文：東京、韓國、海灘、時尚、度假、浪漫、復古<br/>
              英文：tokyo、korea、paris、london、bali
            </p>
          </div>
        )}
      </div>

      {/* 目的地顯示 */}
      <div className="mb-4">
        {searchQuery ? (
          <p className="text-sm text-gray-600 mb-4">
            {filteredDestinations.length > 0 
              ? `找到 ${filteredDestinations.length} 個相關目的地` 
              : ''}
          </p>
        ) : (
          <p className="text-sm text-gray-600 mb-4">熱門目的地推薦</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {getDisplayDestinations().map(dest => (
          <div
            key={dest.id}
            onClick={() => setSelectedDestination(dest)}
            className={`relative overflow-hidden rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
              selectedDestination?.id === dest.id 
                ? 'ring-4 ring-purple-500 shadow-xl' 
                : 'shadow-lg hover:shadow-xl'
            }`}
          >
            <div className={`bg-gradient-to-br ${dest.color} p-6 text-white`}>
              <div className="text-4xl mb-3 text-center">{dest.image}</div>
              <h3 className="text-xl font-bold text-center mb-1">{dest.name}</h3>
              <p className="text-sm text-center opacity-90 mb-3">{dest.country}</p>
              
              <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">風格</span>
                  <span className="text-sm font-medium">{dest.style}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">天氣</span>
                  <span className="text-sm font-medium">{dest.weather}</span>
                </div>
                
                {/* 標籤 */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {dest.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-white bg-opacity-30 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {selectedDestination?.id === dest.id && (
                <div className="absolute top-3 right-3 bg-white rounded-full p-1">
                  <Check className="text-purple-600" size={16} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 顯示更多選項 */}
      {!searchQuery && (
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm mb-4">找不到想要的目的地？試試搜尋功能！支援中英文輸入</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['海灘', '雪山', '沙漠', '森林', '城市', '鄉村', '時尚', '復古', '現代', '度假', '浪漫', '奢華'].map((tag, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(tag);
                  handleSearch(tag);
                }}
                className="bg-gray-100 hover:bg-purple-100 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {['paris', 'tokyo', 'seoul', 'london', 'bali', 'milan'].map((tag, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(tag);
                  handleSearch(tag);
                }}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDestination && (
        <div className="flex justify-center mt-8 gap-4">
          <button
            onClick={() => setStep(2)}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all"
          >
            返回上一步
          </button>
          <button
            onClick={() => setStep(4)}
            className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            開始生成旅遊照片
            <Sparkles size={20} />
          </button>
        </div>
      )}
    </div>
  );

  const Step4Generate = () => (
    <div className="max-w-md mx-auto text-center">
      {!generatedContent && !isGenerating && (
        <>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">準備生成你的旅遊穿搭照片</h2>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Upload className="text-purple-600" size={24} />
                </div>
                <p className="text-sm text-gray-600">
                  {uploadedClothes.length} 件衣服
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="text-pink-600" size={24} />
                </div>
                <p className="text-sm text-gray-600">
                  1 張自拍照
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MapPin className="text-blue-600" size={24} />
                </div>
                <p className="text-sm text-gray-600">
                  {selectedDestination.name}
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 mb-2">即將為你生成：</h3>
              <p className="text-gray-600">
                適合在{selectedDestination.name}穿著的{selectedDestination.style}風格旅遊照片
              </p>
            </div>
          </div>

          <button
            onClick={generateTravelContent}
            className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-lg hover:shadow-lg transition-all flex items-center gap-3 mx-auto text-lg font-medium"
          >
            <Sparkles size={24} />
            開始 AI 生成
          </button>
        </>
      )}

      {isGenerating && (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">AI 正在生成你的旅遊穿搭照片...</h2>
          <p className="text-gray-600 mb-4">分析你的衣服、身形和目的地風格</p>
          
          <div className="bg-white rounded-lg p-4 max-w-md mx-auto mb-4">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">✓ 分析 {uploadedClothes.length} 件上傳衣物</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">✓ 識別身形特徵</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">🔄 匹配 {selectedDestination?.name || '目的地'} 風格</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-400">⏳ 生成專屬穿搭照片</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">生成進度</span>
              <span className="text-sm text-purple-600 font-medium">正在處理...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full animate-pulse w-full"></div>
            </div>
          </div>
        </div>
      )}

      {generatedContent && (
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">你的專屬旅遊穿搭照片 ✨</h2>
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <img 
              src={generatedContent.url} 
              alt="生成的旅遊穿搭照片"
              className="mx-auto rounded-lg shadow-md mb-6 max-w-full h-auto"
            />
            
            {/* AI 教練評語 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-purple-600" size={18} />
                <span className="font-medium text-purple-800">AI 穿搭教練</span>
              </div>
              <p className="text-gray-700">{generatedContent.coachMessage}</p>
            </div>
            
            {/* 穿搭詳情 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-bold text-gray-800 mb-3">穿搭分析報告</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">目的地風格：</span>
                  <span className="font-medium">{generatedContent.outfitDetails.style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">當地天氣：</span>
                  <span className="font-medium">{generatedContent.outfitDetails.climate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">使用衣物：</span>
                  <span className="font-medium">{generatedContent.outfitDetails.clothesUsed} 件精選單品</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600">{generatedContent.outfitDetails.recommendation}</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 flex-wrap">
              <button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                <Download size={20} />
                下載照片
              </button>
              <button className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                <Share2 size={20} />
                分享到社群
              </button>
              <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                <Play size={20} />
                生成影片版本
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                // 重新生成另一套穿搭
                generateTravelContent();
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all"
            >
              生成另一套穿搭
            </button>
            <button
              onClick={() => {
                setStep(1);
                setUploadedClothes([]);
                setSelfieImage(null);
                setSelectedDestination(null);
                setGeneratedContent(null);
              }}
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-all"
            >
              重新開始
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">旅行穿搭助手</h1>
                <p className="text-sm text-gray-500">4步生成專屬旅遊穿搭照片</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-4 py-8">
        <div className="mx-auto">
          <StepIndicator currentStep={step} totalSteps={4} />
        </div>
        {step === 1 && <Step1ClothesUpload />}
        {step === 2 && <Step2SelfieUpload />}
        {step === 3 && <Step3DestinationSelect />}
        {step === 4 && <Step4Generate />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="w-full max-w-lg mx-auto px-4 py-6 text-center">
          <p className="text-gray-500 text-sm">
            由 AI 驅動的智能穿搭助手 • 讓每次旅行都完美搭配
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TravelOutfitCore;