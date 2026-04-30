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
  Utensils
} from 'lucide-react';
import { generateMockup, MockupCategory } from './services/geminiService';

const CATEGORIES: { id: MockupCategory; name: string; icon: React.ReactNode }[] = [
  { id: 'wallpaper', name: 'Wallpaper', icon: <ImageIcon className="w-5 h-5" /> },
  { id: 'bag', name: 'Bag', icon: <ShoppingBag className="w-5 h-5" /> },
  { id: 'clothing', name: 'Clothing', icon: <Shirt className="w-5 h-5" /> },
  { id: 'curtains', name: 'Curtains', icon: <Wind className="w-5 h-5" /> },
  { id: 'kitchen', name: 'Kitchen', icon: <Utensils className="w-5 h-5" /> },
  { id: 'phone_case', name: 'Phone Case', icon: <Smartphone className="w-5 h-5" /> },
  { id: 'notebook', name: 'Notebook', icon: <Book className="w-5 h-5" /> },
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<MockupCategory>('wallpaper');
  const [patternImage, setPatternImage] = useState<string | null>(null);
  const [patternMimeType, setPatternMimeType] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPatternImage(reader.result as string);
        setPatternMimeType(file.type);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPattern = () => {
    setPatternImage(null);
    setPatternMimeType('');
    setResultImage(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!patternImage) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Extract base64 without prefix
      const base64Data = patternImage.split(',')[1];
      const result = await generateMockup(base64Data, patternMimeType, selectedCategory);
      setResultImage(result);
    } catch (err: any) {
      setError(err?.message || "Failed to generate mockup. Please try again.");
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

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#1E293B] font-sans">
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm mb-4 border border-[#E2E8F0]">
            <div className="w-2 h-2 bg-[#F27D26] rounded-full animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-semibold text-[#64748B]">Professional Mockup Generator</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-[#0F172A] mb-4">
            Bring your patterns to life
          </h1>
          <p className="text-lg text-[#64748B] max-w-xl mx-auto">
            Upload your tileable pattern and visualize it instantly on high-quality realistic mockups.
          </p>
        </motion.header>

        {/* Tab Navigation (Aesthetic only like in image) */}
        <div className="flex justify-center mb-10">
          <div className="bg-[#E2E8F0]/50 p-1.5 rounded-2xl flex space-x-1">
            <button className="px-8 py-2.5 rounded-xl text-sm font-semibold bg-white shadow-sm text-[#0F172A] transition-all">Mockup</button>
            <button className="px-8 py-2.5 rounded-xl text-sm font-semibold text-[#64748B] hover:bg-white/50 transition-all cursor-not-allowed opacity-50">Templates</button>
            <button className="px-8 py-2.5 rounded-xl text-sm font-semibold text-[#64748B] hover:bg-white/50 transition-all cursor-not-allowed opacity-50">Settings</button>
          </div>
        </div>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Input */}
          <div className="space-y-8">
            
            {/* Upload Area */}
            <motion.div 
              layout
              className="bg-white rounded-3xl p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-white relative"
            >
              <h2 className="text-lg font-bold text-[#0F172A] mb-6 flex items-center">
                <span className="bg-[#F27D26]/10 p-2 rounded-lg mr-3">
                  <UploadCloud className="w-5 h-5 text-[#F27D26]" />
                </span>
                Upload Pattern Tile
              </h2>

              <div className="relative group">
                {!patternImage ? (
                  <label className="border-2 border-dashed border-[#CBD5E1] rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#F27D26] hover:bg-[#F27D26]/5 transition-all group">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    <UploadCloud className="w-10 h-10 text-[#64748B] mb-4 group-hover:scale-110 transition-transform group-hover:text-[#F27D26]" />
                    <p className="text-sm font-medium text-[#475569]">Drag and drop or click to browse</p>
                    <p className="text-xs text-[#94A3B8] mt-2">PNG, JPG or WEBP (Max 5MB)</p>
                  </label>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-inner bg-[#F8FAFC]">
                    <img 
                      src={patternImage} 
                      alt="Uploaded pattern" 
                      className="w-full aspect-square object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                      <div className="flex justify-between items-center">
                        <span className="text-white text-xs font-semibold">Ready to apply</span>
                        <button 
                          onClick={clearPattern}
                          className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-1.5 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Category Selector */}
            <motion.div 
              layout
              className="bg-white rounded-3xl p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-white"
            >
              <h2 className="text-lg font-bold text-[#0F172A] mb-6">Select Mockup Target</h2>
              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center p-4 rounded-xl border-2 transition-all ${
                      selectedCategory === cat.id 
                      ? 'border-[#F27D26] bg-[#F27D26]/5 text-[#F27D26]' 
                      : 'border-[#E2E8F0] hover:border-[#CBD5E1] text-[#64748B]'
                    }`}
                  >
                    <span className={`p-2 rounded-lg mr-3 ${selectedCategory === cat.id ? 'bg-[#F27D26] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                      {cat.icon}
                    </span>
                    <span className="font-semibold text-sm">{cat.name}</span>
                  </button>
                ))}
              </div>

              <button
                disabled={!patternImage || isGenerating}
                onClick={handleGenerate}
                className={`w-full mt-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all ${
                  !patternImage 
                  ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                  : 'bg-[#0F172A] text-white shadow-lg hover:shadow-[#0F172A]/20 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Aesthetics...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Mockup</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.div>

          </div>

          {/* Right Column: Result Output */}
          <div className="sticky top-12">
            <AnimatePresence mode="wait">
              {!resultImage && !isGenerating && !error ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[2rem] aspect-[4/5] flex flex-col items-center justify-center p-12 text-center border-4 border-dashed border-[#E2E8F0]"
                >
                  <div className="bg-[#F8FAFC] p-8 rounded-full mb-6">
                    <ImageIcon className="w-16 h-16 text-[#CBD5E1]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#475569] mb-2">Your mockup will appear here</h3>
                  <p className="text-[#94A3B8] text-sm">Upload a pattern and choose a category to start.</p>
                </motion.div>
              ) : isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-[2rem] aspect-[4/5] flex flex-col items-center justify-center p-12 overflow-hidden relative shadow-2xl"
                >
                  {/* Skeleton Loader effects */}
                  <div className="absolute inset-0 bg-[#F1F5F9] animate-pulse" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mb-6 backdrop-blur">
                      <RefreshCw className="w-10 h-10 text-[#F27D26] animate-spin" />
                    </div>
                    <p className="text-[#0F172A] font-bold text-lg">AI is crafting your scene...</p>
                    <p className="text-[#64748B] text-sm mt-1">Applying patterns naturally with 8k quality</p>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 rounded-[2rem] aspect-[4/5] flex flex-col items-center justify-center p-12 text-center border-2 border-red-100"
                >
                  <div className="bg-red-100 p-6 rounded-full mb-6">
                    <X className="w-12 h-12 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-red-900 mb-2">Something went wrong</h3>
                  <p className="text-red-700/70 text-sm mb-6">{error}</p>
                  <button 
                    onClick={handleGenerate}
                    className="bg-white text-red-600 px-6 py-2 rounded-xl font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                  >
                    Try Again
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-white"
                >
                  <div className="relative group">
                    <img 
                      src={resultImage} 
                      alt="Mockup result" 
                      className="w-full h-full object-cover aspect-[4/5]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button 
                        onClick={downloadImage}
                        className="bg-white/90 hover:bg-white backdrop-blur shadow-lg p-3 rounded-2xl text-[#0F172A] transition-all hover:scale-110"
                        title="Download Mockup"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 bg-white flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-[#F27D26] uppercase tracking-widest mb-1">{selectedCategory}</p>
                      <h4 className="text-lg font-bold text-[#0F172A]">Visionary Render</h4>
                    </div>
                    <button 
                      onClick={handleGenerate}
                      className="flex items-center space-x-2 text-sm font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </main>
      </div>

      {/* Footer (Aesthetic) */}
      <footer className="max-w-4xl mx-auto px-4 py-12 text-center border-t border-[#E2E8F0] mt-12 bg-white/30 rounded-t-[3rem]">
        <p className="text-sm font-medium text-[#94A3B8] mb-4">
          Built with Gemini 2.5 Flash Image Model for precise aesthetic rendering.
        </p>
        <div className="flex justify-center space-x-8 opacity-50 grayscale hover:grayscale-0 transition-all">
          <img src="https://www.gstatic.com/lamda/images/favicon_v1_150160b1464da4a7a08e1.png" alt="Google AI" className="h-6" referrerPolicy="no-referrer" />
          <div className="h-6 w-px bg-[#E2E8F0]" />
          <span className="font-bold tracking-tighter text-[#1E293B]">AIS STUDIO BUILD</span>
        </div>
      </footer>

    </div>
  );
}
