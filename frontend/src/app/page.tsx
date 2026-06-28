"use client";

import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Manim Default Colors
const MANIM_CYAN = "#58C4DD";
const MANIM_RED = "#FC6255";
const MANIM_GREEN = "#83C167";
const MANIM_YELLOW = "#FFFF00";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyboard, setStoryboard] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsGenerating(true);
    setStoryboard([]);
    setVideoUrl(null);
    setIsModalOpen(false);

    try {
      const response = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ problem_text: inputText }),
      });

      if (!response.ok) {
        throw new Error("서버에서 에러가 발생했습니다. (API 키를 확인해주세요)");
      }

      const data = await response.json();
      setStoryboard(data.storyboard);
      
      // Mock video ready delay (since we haven't implemented real Manim yet)
      setTimeout(() => {
        setVideoUrl(data.video_url); 
        setIsGenerating(false);
      }, 3000);

    } catch (error: any) {
      alert(error.message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans selection:bg-[#58C4DD]/30">
      
      {/* Storyboard Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 lg:p-12">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-5xl max-h-full flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-neutral-900 bg-black">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                 <div className="w-6 h-6 flex items-center justify-center font-bold text-sm text-black" style={{ backgroundColor: MANIM_CYAN }}>M</div> 
                 AI 풀이 스토리보드 상세
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-white transition-colors p-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 lg:p-10 overflow-y-auto space-y-4 bg-neutral-950">
              {storyboard.map((step, idx) => (
                 <div key={idx} className="flex gap-6 items-start p-6 bg-black border border-neutral-800 w-full">
                   <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-base font-bold text-black" style={{ backgroundColor: MANIM_CYAN }}>
                     {idx + 1}
                   </div>
                   <div className="text-base text-neutral-200 leading-relaxed w-full min-w-0">
                     <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                       {step}
                     </ReactMarkdown>
                   </div>
                 </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-neutral-900 bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="Manim Univ Logo" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                // Fallback if image is not yet uploaded
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.classList.remove('hidden');
              }}
            />
            <div 
              className="hidden w-8 h-8 flex items-center justify-center font-bold text-lg text-black"
              style={{ backgroundColor: MANIM_CYAN }}
            >
              M
            </div>
            <h1 
              className="text-xl font-bold tracking-tight"
              style={{ color: MANIM_CYAN }}
            >
              manim_univ
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium px-3 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400">
              Basic Plan (3 Credits)
            </span>
            <button 
              className="text-sm font-medium transition-colors"
              style={{ color: MANIM_CYAN }}
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Pane: Input & Storyboard Preview */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-black border border-neutral-800 p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">수식 및 문제 입력</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <textarea
                  className="w-full h-32 bg-neutral-950 border border-neutral-800 p-4 text-neutral-200 focus:outline-none transition-colors resize-none placeholder-neutral-600"
                  style={{ focusVisible: { borderColor: MANIM_CYAN } }}
                  placeholder="풀고 싶은 수식이나 수학 문제를 입력하세요. (Ctrl+V로 사진 붙여넣기도 곧 지원됩니다!)"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <style jsx>{`
                  textarea:focus { border-color: ${MANIM_CYAN}; }
                `}</style>
                <button 
                  type="submit"
                  disabled={isGenerating || !inputText.trim()}
                  className="w-full py-3 px-4 text-black font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: isGenerating ? MANIM_YELLOW : MANIM_CYAN }}
                >
                  {isGenerating ? "AI 분석 중..." : "Manim 애니메이션 생성"}
                </button>
              </form>
            </div>

            {/* Storyboard Preview Area */}
            <div className={`transition-all duration-500 ${storyboard.length > 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <div 
                className="bg-neutral-950 border border-neutral-800 p-6 cursor-pointer hover:border-neutral-600 transition-colors group relative overflow-hidden"
                onClick={() => setIsModalOpen(true)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-white transition-colors" style={{ color: MANIM_CYAN }}>AI 풀이 분석 완료!</h2>
                  <svg className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                </div>
                <p className="text-sm text-neutral-400 mb-6">총 {storyboard.length}개의 애니메이션 씬이 기획되었습니다. 클릭하여 전체 수식과 상세 내용을 확인하세요.</p>
                
                {/* Faded Preview of steps */}
                <div className="space-y-3 opacity-40 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)' }}>
                  {storyboard.slice(0, 3).map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start p-3 bg-black border border-neutral-900">
                      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-xs font-bold text-black" style={{ backgroundColor: MANIM_CYAN }}>
                        {idx + 1}
                      </div>
                      <div className="text-xs text-neutral-300 line-clamp-2">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{step}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Overlay Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                   <span className="px-4 py-2 bg-black border text-sm font-semibold text-white" style={{ borderColor: MANIM_CYAN }}>
                     상세 보기 확대
                   </span>
                </div>
              </div>
              
              {isGenerating && storyboard.length > 0 && !videoUrl && (
                <div className="mt-4 p-4 flex items-center gap-3 text-neutral-400 text-sm border border-neutral-800 bg-black">
                  <div 
                    className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: MANIM_YELLOW, borderTopColor: 'transparent' }}
                  ></div>
                  Manim 렌더링 중... (최대 30초 소요)
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Video Player */}
          <div className="lg:col-span-7">
            <div className="bg-black border border-neutral-800 overflow-hidden h-[400px] lg:h-[600px] flex flex-col relative group">
              {/* Toolbar */}
              <div className="h-12 bg-black border-b border-neutral-800 flex items-center px-4 justify-between absolute w-full top-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-xs font-mono text-neutral-500">output.mp4</div>
                <div className="flex gap-2">
                  <button className="text-xs border border-neutral-800 hover:bg-neutral-900 px-3 py-1 text-neutral-400 transition-colors">HD 1080p</button>
                  <button className="text-xs border border-neutral-800 hover:bg-neutral-900 px-3 py-1 text-neutral-400 transition-colors">Export GIF</button>
                </div>
              </div>

              {/* Video Area */}
              <div className="flex-1 flex items-center justify-center bg-black relative">
                {!videoUrl ? (
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 border border-neutral-800 flex items-center justify-center bg-neutral-950">
                      <svg className="w-8 h-8 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <p className="text-neutral-600 font-medium">문제를 입력하면 애니메이션이 생성됩니다.</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black relative">
                    {/* Mockup of a Manim shape inside the video player */}
                    <div className="absolute flex flex-col items-center justify-center gap-8">
                       <div className="flex gap-8">
                          {/* Triangle (Green) */}
                          <svg width="100" height="100" viewBox="0 0 100 100" fill={MANIM_GREEN}>
                            <polygon points="50,10 90,90 10,90" stroke={MANIM_GREEN} strokeWidth="2" strokeLinejoin="round" />
                          </svg>
                          {/* Square (Red) */}
                          <svg width="100" height="100" viewBox="0 0 100 100" fill={MANIM_RED}>
                            <rect x="10" y="10" width="80" height="80" stroke={MANIM_RED} strokeWidth="2" strokeLinejoin="round" />
                          </svg>
                       </div>
                       
                       <div className="text-center mt-4">
                          <h3 className="text-xl font-mono text-white mb-2" style={{ color: MANIM_CYAN }}>렌더링 완료!</h3>
                          <p className="text-neutral-400 font-mono text-sm">Manim 영상이 재생됩니다.</p>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
