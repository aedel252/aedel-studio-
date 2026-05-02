/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  ShoppingBag, 
  Shirt, 
  Wind, 
  Loader2, 
  ChevronRight, 
  RefreshCw, 
  Download, 
  X, 
  Smartphone, 
  Book, 
  Utensils, 
  Sofa, 
  Baby, 
  Instagram, 
  Pin,
  Palette,
  Maximize2,
  Copy,
  CheckCircle2,
  ArrowRightLeft
} from 'lucide-react';
import { generateMockup, MockupCategory, generateAIData } from './services/geminiService';

const CATEGORIES: { id: MockupCategory; name: string; icon: React.ReactNode; description: string }[] = [
  { id: 'wallpaper', name: '벽지', icon: <ImageIcon className="w-5 h-5" />, description: '인테리어 벽면에 이음새 없는 패턴 적용' },
  { id: 'bag', name: '가방', icon: <ShoppingBag className="w-5 h-5" />, description: '패션 토트백에 패턴 시각화' },
  { id: 'clothing', name: '의류', icon: <Shirt className="w-5 h-5" />, description: '의복 및 드레스에 패턴 목업' },
  { id: 'baby_clothes', name: '아기 옷', icon: <Baby className="w-5 h-5" />, description: '유아용 바디슈트 및 담요를 위한 귀여운 패턴' },
  { id: 'curtains', name: '커튼', icon: <Wind className="w-5 h-5" />, description: '창문 커튼의 질감 확인' },
  { id: 'kitchen', name: '주방', icon: <Utensils className="w-5 h-5" />, description: '타일 패턴 및 주방 패브릭 목업' },
  { id: 'living_room', name: '거실', icon: <Sofa className="w-5 h-5" />, description: '베개와 러그가 포함된 거실 전체 시각화' },
  { id: 'phone_case', name: '폰 케이스', icon: <Smartphone className="w-5 h-5" />, description: '모바일 기기용 디지털 패턴 랩' },
  { id: 'notebook', name: '노트', icon: <Book className="w-5 h-5" />, description: '문구류 및 책 표지 패턴' },
  { id: 'moodboard', name: '무드보드', icon: <Palette className="w-5 h-5" />, description: '어울리는 소품과 색상을 포함한 라이프스타일 무드보드' },
];

type ActiveTab = 'mockup' | 'pins' | 'instagram';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('mockup');
  const [selectedCategory, setSelectedCategory] = useState<MockupCategory>('wallpaper');
  const [patternScale, setPatternScale] = useState<number>(1.0);
  const [patternImage, setPatternImage] = useState<string | null>(null);
  const [patternMimeType, setPatternMimeType] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // AI Generated Data states
  const [aiData, setAiData] = useState<any>(null);
  const [isGeneratingAIData, setIsGeneratingAIData] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPatternImage(reader.result as string);
        setPatternMimeType(file.type);
        setResultImage(null);
        setError(null);
        setAiData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPattern = () => {
    setPatternImage(null);
    setPatternMimeType('');
    setResultImage(null);
    setError(null);
    setAiData(null);
  };

  const handleAIDataGeneration = async (type: 'pinterest' | 'instagram') => {
    if (!patternImage) return;
    setIsGeneratingAIData(true);
    try {
      const base64Data = patternImage.split(',')[1];
      const data = await generateAIData(base64Data, patternMimeType, type);
      setAiData(data);
    } catch (err) {
      console.error("AI Data Generation failed", err);
    } finally {
      setIsGeneratingAIData(false);
    }
  };

  const handleGenerate = async () => {
    if (!patternImage) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Extract base64 without prefix
      const base64Data = patternImage.split(',')[1];
      const result = await generateMockup(base64Data, patternMimeType, selectedCategory, patternScale);
      setResultImage(result);

      if (activeTab !== 'mockup') {
        handleAIDataGeneration(activeTab === 'pins' ? 'pinterest' : 'instagram');
      }
    } catch (err: any) {
      if (err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        setError("API Quota Exceeded. Please wait 60 seconds before trying again. (무료 호출 한도를 초과했습니다. 1분 후 다시 시도해주세요.)");
      } else {
        setError(err?.message || "Failed to generate mockup. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `mockup-${selectedCategory}.png`;
    link.click();
  };

  const downloadResized = (width: number, height: number, label: string) => {
    if (!resultImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      
      const scale = Math.max(width / img.width, height / img.height);
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2;
      
      ctx?.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `aedelstudio-${label}-${selectedCategory}.png`;
      link.click();
    };
    img.src = resultImage;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#E2FDF2] text-[#1E293B] font-sans transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-1.5 rounded-full shadow-sm mb-6 border border-[#79D2AF]/30">
            <div className="w-2.5 h-2.5 bg-[#79D2AF] rounded-full animate-pulse shadow-[0_0_10px_#79D2AF]" />
            <span className="text-xs uppercase tracking-widest font-bold text-[#2D6A4F]">Aedelstudio Engine v2.5</span>
          </div>
          <h1 className="text-6xl font-black tracking-tight text-[#2D6A4F] mb-4 drop-shadow-sm">
            aedelstudio 목업 생성기
          </h1>
          <p className="text-xl text-[#52B788] max-w-2xl mx-auto font-medium">
            AI 기반의 사실적인 목업으로 디자인의 가치를 높이세요. 시각화하고 최적화하여 공유하세요.
          </p>
        </motion.header>

        {/* Improved Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/60 p-2 rounded-[2rem] flex space-x-2 border border-[#79D2AF]/40 backdrop-blur-md shadow-lg overflow-visible">
            
            <div className="group relative">
              <button 
                onClick={() => { setActiveTab('mockup'); setAiData(null); }}
                className={`px-10 py-3 rounded-[1.5rem] text-sm font-bold transition-all flex items-center space-x-2 ${
                  activeTab === 'mockup' ? 'bg-[#79D2AF] text-white shadow-md' : 'text-[#2D6A4F] hover:bg-white/80'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                <span>목업 생성</span>
              </button>
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 hidden group-hover:block bg-[#1B4332] text-white text-[11px] py-2 px-3 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2">
                패턴 타일로 사실적인 목업을 생성합니다.
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#1B4332]" />
              </div>
            </div>
            
            <div className="group relative">
              <button 
                onClick={() => { setActiveTab('pins'); if (resultImage) handleAIDataGeneration('pinterest'); }}
                className={`px-10 py-3 rounded-[1.5rem] text-sm font-bold transition-all flex items-center space-x-2 ${
                  activeTab === 'pins' ? 'bg-[#79D2AF] text-white shadow-md' : 'text-[#2D6A4F] hover:bg-white/80'
                }`}
              >
                <Pin className="w-5 h-5" />
                <span>핀 만들기</span>
              </button>
              <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-64 hidden group-hover:block bg-[#1B4332] text-white text-[11px] py-2 px-3 rounded-xl shadow-xl z-50 leading-relaxed font-medium">
                <p className="font-bold border-b border-white/20 pb-1 mb-1">핀터레스트 스튜디오</p>
                • 1000x1500px 자동 리사이징<br/>
                • AI 제목 및 설명 생성<br/>
                • 자동 보드 분류<br/>
                • 생생한 디자인 데모
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#1B4332]" />
              </div>
            </div>

            <div className="group relative">
              <button 
                onClick={() => { setActiveTab('instagram'); if (resultImage) handleAIDataGeneration('instagram'); }}
                className={`px-10 py-3 rounded-[1.5rem] text-sm font-bold transition-all flex items-center space-x-2 ${
                  activeTab === 'instagram' ? 'bg-[#79D2AF] text-white shadow-md' : 'text-[#2D6A4F] hover:bg-white/80'
                }`}
              >
                <Instagram className="w-5 h-5" />
                <span>인스타그램</span>
              </button>
              <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-64 hidden group-hover:block bg-[#1B4332] text-white text-[11px] py-2 px-3 rounded-xl shadow-xl z-50 leading-relaxed font-medium">
                <p className="font-bold border-b border-white/20 pb-1 mb-1">인스타 최적화</p>
                • 포스트 및 스토리 비율<br/>
                • AI 캡션 및 해시태그 생성<br/>
                • 고해상도 제품 추출<br/>
                • 몰입형 무드보드 레이아웃
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#1B4332]" />
              </div>
            </div>
          </div>
        </div>

        <main className="space-y-10">
          
          {/* Top Section: Config Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Pattern Studio (Upload) */}
            <motion.div layout className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-[#79D2AF]/10 border border-white flex flex-col h-full">
              <h2 className="text-xl font-black text-[#2D6A4F] mb-6 flex items-center">
                <span className="bg-[#79D2AF]/10 p-2.5 rounded-2xl mr-4 shadow-inner">
                  <UploadCloud className="w-6 h-6 text-[#79D2AF]" />
                </span>
                패턴 스튜디오
              </h2>

              <div className="flex-1 relative min-h-[200px]">
                {!patternImage ? (
                  <label className="h-full border-3 border-dashed border-[#79D2AF]/20 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#79D2AF] hover:bg-[#79D2AF]/5 transition-all group">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    <div className="bg-[#79D2AF]/5 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-10 h-10 text-[#79D2AF]" />
                    </div>
                    <p className="font-black text-[#2D6A4F]">패턴 업로드</p>
                    <p className="text-[11px] text-[#52B788] mt-1 text-center font-medium">이음새 없는 타일이 가장 좋습니다</p>
                  </label>
                ) : (
                  <div className="h-full relative rounded-3xl overflow-hidden border-2 border-[#D8F3DC] shadow-inner bg-[#F1F8F5]">
                    <img src={patternImage} alt="Tile" className="w-full h-full object-cover" />
                    <button 
                      onClick={clearPattern}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-xl p-2 rounded-xl shadow-lg transition-all hover:scale-110"
                    >
                      <X className="w-4 h-4 text-[#2D6A4F]" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Mockup Target (Categories) */}
            <motion.div layout className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-[#79D2AF]/10 border border-white flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-[#2D6A4F]">목업 대상</h2>
                <span className="bg-[#B7E4C7] text-[#1B4332] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                  AI 준비됨
                </span>
              </div>
              
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[200px]">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className="group relative">
                    <button
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full h-full flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                        selectedCategory === cat.id 
                        ? 'border-[#79D2AF] bg-[#79D2AF]/5 text-[#2D6A4F]' 
                        : 'border-[#F1F8F5] hover:border-[#79D2AF]/40 text-[#52B788]'
                      }`}
                    >
                      <span className={`p-2 rounded-xl mb-2 flex-shrink-0 ${selectedCategory === cat.id ? 'bg-[#79D2AF] text-white shadow-lg shadow-[#79D2AF]/20' : 'bg-[#F1F8F5] text-[#79D2AF]'}`}>
                        {React.cloneElement(cat.icon as React.ReactElement, { className: 'w-5 h-5' })}
                      </span>
                      <span className="font-bold text-[10px] tracking-tight text-center leading-tight break-words uppercase">{cat.name}</span>
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#1B4332] text-white text-[10px] py-1.5 px-3 rounded-lg whitespace-nowrap z-50 pointer-events-none shadow-2xl">
                      {cat.description}
                    </div>
                  </div>
                ))}
              </div>

              <button
                disabled={!patternImage || isGenerating}
                onClick={handleGenerate}
                className={`w-full mt-6 py-4 rounded-2xl font-black flex items-center justify-center space-x-3 transition-all text-base group ${
                  !patternImage 
                  ? 'bg-[#D8F3DC] text-[#95D5B2] cursor-not-allowed'
                  : 'bg-[#1B4332] text-[#D8F3DC] shadow-2xl shadow-[#1B4332]/30 hover:shadow-[#1B4332]/40 hover:-translate-y-1 active:translate-y-0'
                }`}
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /><span>렌더링 중...</span></>
                ) : (
                  <><span>장면에 적용</span><ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </motion.div>
          </div>

          {/* Advanced Editor (New Section) */}
          <motion.div layout className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-[#79D2AF]/10 border border-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-[#2D6A4F] flex items-center">
                <span className="bg-[#79D2AF]/10 p-2.5 rounded-2xl mr-4 shadow-inner">
                  <Palette className="w-6 h-6 text-[#79D2AF]" />
                </span>
                고급 편집 기능
              </h2>
              <div className="flex items-center space-x-2 bg-[#F1F8F5] px-4 py-2 rounded-2xl">
                <span className="text-xs font-bold text-[#52B788]">배율: {patternScale.toFixed(1)}x</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm font-bold text-[#2D6A4F]">패턴 크기</label>
                  <span className="text-[10px] font-black text-[#79D2AF] uppercase tracking-widest">AI 정밀도</span>
                </div>
                <input 
                  type="range" 
                  min="0.7" 
                  max="1.5" 
                  step="0.1" 
                  value={patternScale}
                  onChange={(e) => setPatternScale(parseFloat(e.target.value))}
                  className="w-full h-3 bg-[#F1F8F5] rounded-lg appearance-none cursor-pointer accent-[#79D2AF]"
                />
                <div className="flex justify-between mt-2 text-[10px] font-bold text-[#95D5B2]">
                  <span>작고 섬세하게</span>
                  <span>표준</span>
                  <span>크고 대담하게</span>
                </div>
              </div>

              <div className="p-4 bg-[#79D2AF]/5 rounded-2xl border border-[#79D2AF]/20">
                <p className="text-[11px] text-[#40916C] leading-relaxed">
                  <span className="font-bold">팁:</span> Gemini AI가 장면의 맥락에 맞춰 패턴 크기를 자연스럽게 재해석합니다. 작은 크기는 아기 옷에, 큰 크기는 벽지나 가방에 잘 어울립니다.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bottom Section: Result Area */}
          <div className="space-y-10">
            <div className="w-full">
              <AnimatePresence mode="wait">
              {!resultImage && !isGenerating && !error ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-[3rem] aspect-[16/10] flex flex-col items-center justify-center p-12 text-center border-4 border-dashed border-[#D8F3DC]"
                >
                  <div className="bg-[#F1F8F5] p-12 rounded-full mb-8 shadow-inner">
                    <ImageIcon className="w-24 h-24 text-[#B7E4C7]" />
                  </div>
                  <h3 className="text-3xl font-black text-[#2D6A4F] mb-3">비저너리 캔버스 준비됨</h3>
                  <p className="text-[#52B788] text-lg font-medium max-w-md">패턴을 업로드하고 대상을 선택하여 AI 생성을 시작하세요.</p>
                </motion.div>
              ) : isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-[3rem] aspect-[16/10] flex flex-col items-center justify-center p-12 overflow-hidden relative shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#F1F8F5] via-white to-[#E8F5E9] animate-pulse" />
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-32 h-32 bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl backdrop-blur-xl">
                      <RefreshCw className="w-16 h-16 text-[#79D2AF] animate-spin" />
                    </div>
                    <p className="text-[#1B4332] font-black text-3xl mb-2">기하학 및 조명 분석 중</p>
                    <p className="text-[#40916C] text-lg font-semibold animate-bounce">{selectedCategory} 질감 적용 중...</p>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 rounded-[3rem] aspect-[16/10] flex flex-col items-center justify-center p-12 text-center border-2 border-red-100"
                >
                  <div className="bg-red-100 p-8 rounded-[2rem] mb-8 shadow-inner">
                    <X className="w-16 h-16 text-red-500" />
                  </div>
                  <h3 className="text-3xl font-black text-red-900 mb-2">알고리즘 오류</h3>
                  <p className="text-red-700/80 text-lg font-medium mb-8 max-w-md">{error}</p>
                  <button onClick={handleGenerate} className="bg-white text-red-600 px-10 py-3 rounded-2xl font-black shadow-lg hover:shadow-xl transition-all active:scale-95 border-2 border-red-100">
                    다시 렌더링
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_-30px_rgba(45,106,79,0.25)] border-4 border-white"
                >
                  <div className="relative w-full aspect-[16/10]">
                    <img src={resultImage!} alt="Render" className="w-full h-full object-cover" />
                    <div className="absolute top-8 right-8 flex space-x-4">
                      
                      <div className="group relative">
                        <button onClick={() => downloadResized(2000, 2000, 'master-4k')} className="bg-white/95 hover:bg-white backdrop-blur shadow-2xl p-4 rounded-3xl text-[#1B4332] transition-all hover:scale-110 active:scale-90 border border-[#D8F3DC]">
                          <Download className="w-6 h-6" />
                        </button>
                        <div className="absolute top-full right-0 mt-3 hidden group-hover:block bg-[#1B4332] text-white text-[11px] font-bold py-2 px-4 rounded-xl shadow-2xl z-[100] whitespace-nowrap">
                          마스터 렌더링 다운로드 (고해상도)
                        </div>
                      </div>

                      <div className="group relative">
                        <button onClick={() => setResultImage(null)} className="bg-white/95 hover:bg-white backdrop-blur shadow-2xl p-4 rounded-3xl text-red-400 transition-all hover:scale-110 active:scale-90 border border-red-50">
                          <X className="w-6 h-6" />
                        </button>
                        <div className="absolute top-full right-0 mt-3 hidden group-hover:block bg-red-800 text-white text-[11px] font-bold py-2 px-4 rounded-xl shadow-2xl z-[100]">
                          미리보기 닫기
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                      <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 shadow-2xl">
                        <p className="text-[10px] font-black text-[#52B788] uppercase tracking-[0.2em] mb-1">{selectedCategory.replace('_', ' ')} 적용됨</p>
                        <h4 className="text-2xl font-black text-[#1B4332]">비저너리 렌더링</h4>
                      </div>
                      <div className="group relative">
                        <button onClick={handleGenerate} className="bg-[#1B4332] text-white p-5 rounded-[2rem] shadow-2xl transition-all hover:scale-110 active:rotate-45">
                          <RefreshCw className="w-7 h-7" />
                        </button>
                        <div className="absolute bottom-full right-0 mb-4 hidden group-hover:block bg-[#1B4332] text-white text-[11px] font-bold py-2 px-4 rounded-xl shadow-2xl z-50">
                          새로운 AI 변형으로 반복 생성
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Functional Panels for Pins & Instagram */}
            <AnimatePresence>
              {resultImage && activeTab !== 'mockup' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-white rounded-[3rem] p-10 border-4 border-[#D8F3DC] shadow-xl"
                >
                  <div className="flex items-center justify-between mb-8 border-b-2 border-dashed border-[#D8F3DC] pb-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-[#79D2AF] p-4 rounded-3xl text-white">
                        {activeTab === 'pins' ? <Pin className="w-8 h-8" /> : <Instagram className="w-8 h-8" />}
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-[#1B4332] leading-tight">
                          {activeTab === 'pins' ? '핀터레스트 파워 스튜디오' : '인스타그램 인게이지먼트 팩'}
                        </h3>
                        <p className="text-[#52B788] font-bold text-lg">AI 지원 소셜 콘텐츠 생성</p>
                      </div>
                    </div>
                    {isGeneratingAIData && (
                      <div className="flex items-center space-x-2 text-[#79D2AF] font-bold animate-pulse">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>AI 초안 작성 중...</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left: Aspect Ratio Controls */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-black text-[#2D6A4F] flex items-center">
                        <ArrowRightLeft className="w-5 h-5 mr-3" /> 최적 규격
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-4">
                        {activeTab === 'pins' ? (
                          <>
                            <button onClick={() => downloadResized(1000, 1500, 'pinterest-standard')} className="flex items-center justify-between p-6 bg-[#F1F8F5] rounded-3xl border-2 border-transparent hover:border-[#79D2AF] transition-all group">
                              <div className="text-left">
                                <p className="font-black text-[#1B4332]">표준 핀</p>
                                <p className="text-xs text-[#52B788]">1000 x 1500px (2:3)</p>
                              </div>
                              <Download className="w-6 h-6 text-[#79D2AF] group-hover:translate-y-1 transition-transform" />
                            </button>

                          </>
                        ) : (
                          <>
                            <button onClick={() => downloadResized(1080, 1080, 'insta-feed')} className="flex items-center justify-between p-6 bg-[#F1F8F5] rounded-3xl border-2 border-transparent hover:border-[#79D2AF] transition-all group">
                              <div className="text-left">
                                <p className="font-black text-[#1B4332]">피드 포스트</p>
                                <p className="text-xs text-[#52B788]">1:1 정사각형 최적화</p>
                              </div>
                              <Download className="w-6 h-6 text-[#79D2AF] group-hover:translate-y-1 transition-transform" />
                            </button>
                            <button onClick={() => downloadResized(1080, 1350, 'insta-portrait')} className="flex items-center justify-between p-6 bg-[#F1F8F5] rounded-3xl border-2 border-transparent hover:border-[#79D2AF] transition-all group">
                              <div className="text-left">
                                <p className="font-black text-[#1B4332]">세로 피드</p>
                                <p className="text-xs text-[#52B788]">4:5 참여도 향상</p>
                              </div>
                              <Download className="w-6 h-6 text-[#79D2AF] group-hover:translate-y-1 transition-transform" />
                            </button>
                            <button onClick={() => downloadResized(1080, 1920, 'insta-story')} className="flex items-center justify-between p-6 bg-[#F1F8F5] rounded-3xl border-2 border-transparent hover:border-[#79D2AF] transition-all group">
                              <div className="text-left">
                                <p className="font-black text-[#1B4332]">스토리 / 릴스</p>
                                <p className="text-xs text-[#52B788]">9:16 전체화면 세로형</p>
                              </div>
                              <Download className="w-6 h-6 text-[#79D2AF] group-hover:translate-y-1 transition-transform" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: AI Data Content */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-black text-[#2D6A4F] flex items-center">
                        <Copy className="w-5 h-5 mr-3" /> AI 스마트 카피
                      </h4>
                      <div className="bg-[#F8FAFC] rounded-[2.5rem] p-8 border-2 border-[#D8F3DC] shadow-inner relative min-h-[250px] flex flex-col">
                        {aiData ? (
                          <div className="space-y-6">
                            {activeTab === 'pins' ? (
                              <>
                                <div>
                                  <label className="text-[10px] font-black uppercase tracking-widest text-[#52B788] block mb-2">자동 테마</label>
                                  <span className="bg-[#79D2AF] text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg shadow-[#79D2AF]/20">
                                    {aiData.theme}
                                  </span>
                                </div>
                                <div>
                                  <label className="text-[10px] font-black uppercase tracking-widest text-[#52B788] block mb-2">핀 제목</label>
                                  <p className="font-black text-[#1B4332] text-lg">{aiData.title}</p>
                                </div>
                                <div>
                                  <label className="text-[10px] font-black uppercase tracking-widest text-[#52B788] block mb-2">설명</label>
                                  <p className="text-sm text-[#40916C] leading-relaxed font-medium italic">"{aiData.description}"</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <label className="text-[10px] font-black uppercase tracking-widest text-[#52B788] block mb-2">캡션</label>
                                  <p className="text-sm text-[#1B4332] font-semibold leading-relaxed line-clamp-6">{aiData.caption}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {(Array.isArray(aiData.hashtags) ? aiData.hashtags : []).map((h: string) => {
                                    const tag = h.startsWith('#') ? h : `#${h}`;
                                    return (
                                      <span key={h} className="text-[#79D2AF] font-black text-xs hover:underline cursor-pointer">{tag}</span>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                            <button 
                              onClick={() => {
                                const tags = Array.isArray(aiData.hashtags) ? aiData.hashtags : [];
                                const textToCopy = activeTab === 'pins' 
                                  ? `${aiData.title}\n\n${aiData.description}` 
                                  : `${aiData.caption}\n\n${tags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' ')}`;
                                copyToClipboard(textToCopy);
                              }}
                              className="mt-auto w-full py-3 bg-[#1B4332] text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-xl hover:-translate-y-1 transition-all"
                            >
                              {copied ? <><CheckCircle2 className="w-5 h-5"/><span>복사됨!</span></> : <><Copy className="w-5 h-5"/><span>텍스트 복사</span></>}
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                            <RefreshCw className="w-12 h-12 text-[#D8F3DC] mb-4 animate-spin-slow" />
                            <p className="text-[#95D5B2] font-black">장면 생성을 기다리는 중...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      </div>

      {/* Footer Design */}
      <footer className="max-w-6xl mx-auto px-4 py-16 text-center border-t border-[#79D2AF]/20 mt-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#79D2AF]/50 to-transparent" />
        <p className="text-sm font-black text-[#52B788] mb-8 uppercase tracking-[0.3em]">
          Gemini 생성형 이미지를 활용한 aedelstudio 기술
        </p>
        <div className="flex justify-center items-center space-x-12">
          <img src="https://www.gstatic.com/lamda/images/favicon_v1_150160b1464da4a7a08e1.png" alt="Google AI" className="h-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all pointer-events-none" />
          <div className="h-12 w-[2px] bg-[#79D2AF]/20" />
          <span className="text-3xl font-black italic tracking-tighter text-[#1B4332] opacity-30 select-none">AEDELSTUDIO BUILD</span>
        </div>
      </footer>
    </div>
  );
}
