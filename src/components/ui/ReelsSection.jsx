import React from 'react';
import Container from './Container';
import Section from './Section';
import { Play } from 'lucide-react';

const reelsData = [
  {
    id: 1,
    title: 'Cleansing Black Tourmaline',
    duration: '0:45',
    views: '14.2K',
    image: '/assets/images/Black Tourmaline Raw/Black Tourmaline Raw 1.webp',
  },
  {
    id: 2,
    title: 'Setting Morning Intention with Clear Quartz',
    duration: '1:02',
    views: '19.8K',
    image: '/assets/images/Clear Quartz Point/Clear Quartz Point 1.webp',
  },
  {
    id: 3,
    title: 'Why Citrine Never Needs Cleansing',
    duration: '0:58',
    views: '28.4K',
    image: '/assets/images/Citrine Point/Citrine Point 1.webp',
  },
  {
    id: 4,
    title: '7 Chakra Balancing Ritual',
    duration: '1:15',
    views: '32.1K',
    image: '/assets/images/7 Chakra Bracelet/7 Chakra Bracelet 1.webp',
  },
];

const ReelsSection = () => {
  return (
    <Section className="bg-surface border-b border-border py-16">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-medium text-black">Watch Us More</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reelsData.map((reel) => (
            <div
              key={reel.id}
              className="group relative bg-background border border-border overflow-hidden rounded-md flex flex-col hover:border-accent transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="relative aspect-[9/16] w-full bg-surface overflow-hidden flex items-center justify-center bg-gray-200">
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </div>
                </div>

                

                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded text-[9px] font-bold">
                  {reel.duration}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default ReelsSection;
