import React, { useState, useRef, useEffect } from 'react';
import Container from './Container';
import Section from './Section';
import { Play, Pause } from 'lucide-react';

const reelsData = [
  {
    id: 1,
    title: 'Founder Story',
    badge: 'FOUNDER STORY',
    video: '/assets/videos/video1.mp4',
  },
  {
    id: 2,
    title: 'Recommendations',
    badge: 'RECOMMENDATIONS',
    video: '/assets/videos/video2.mp4',
  },
  {
    id: 3,
    title: '3 Step Guide',
    badge: '3 STEP GUIDE',
    video: '/assets/videos/video3.mp4',
  },
  {
    id: 4,
    title: 'FAQ',
    badge: 'FAQ',
    video: '/assets/videos/video4.mp4',
  },
];

const ReelCard = ({ reel, isPlaying, onPlay, onPause }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      // Ensure volume is set to full browser volume (1.0)
      videoRef.current.volume = 1.0;
      if (isPlaying) {
        videoRef.current.play().catch((err) => {
          console.log('Play request was interrupted:', err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleTogglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      onPause(reel.id);
    } else {
      onPlay(reel.id);
    }
  };

  return (
    <div className="group relative bg-background border border-border overflow-hidden rounded-md flex flex-col hover:border-accent transition-all duration-300 shadow-sm hover:shadow-md">
      <div 
        onClick={handleTogglePlay}
        className="relative aspect-[9/16] w-full bg-surface overflow-hidden flex items-center justify-center bg-gray-200 cursor-pointer"
      >
        {/* Floating Badge (Pill) - Premium Rectangular Pill */}
        <div className="absolute top-4 right-4 bg-[#D4A24A] px-2.5 py-1 rounded shadow-sm z-20">
          <span className="text-[9px] font-sans font-bold tracking-[0.1em] text-black uppercase">
            {reel.badge}
          </span>
        </div>

        <video
          ref={videoRef}
          src={reel.video}
          preload="metadata"
          className="w-full h-full object-cover"
          onPlay={() => onPlay(reel.id)}
          onPause={() => onPause(reel.id)}
          onEnded={() => onPause(reel.id)}
          playsInline
        />

        {/* Custom Play/Pause Overlay Button */}
        <div 
          className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-300 bg-black/10 ${
            isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100 bg-black/25'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-[#faf9f6] border border-[#D4AF37]/60 text-[#D4AF37] flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105 active:scale-95">
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-[#D4AF37] text-[#D4AF37]" />
            ) : (
              <Play className="w-6 h-6 ml-0.5 fill-[#D4AF37] text-[#D4AF37]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReelsSection = () => {
  const [activeReelId, setActiveReelId] = useState(null);

  const handlePlay = (id) => {
    setActiveReelId(id);
  };

  const handlePause = (id) => {
    if (activeReelId === id) {
      setActiveReelId(null);
    }
  };

  return (
    <Section className="bg-surface border-b border-border py-16">
      <Container>
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-medium text-primary">
            <span className="text-primary">Watch Us</span> <span className="half-gold">More</span>
          </h2>
          <p className="text-xs text-muted font-light mt-2">
            Step into our space and discover the energy behind our curation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reelsData.map((reel) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              isPlaying={activeReelId === reel.id}
              onPlay={handlePlay}
              onPause={handlePause}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default ReelsSection;
