import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import Seo from '../components/Seo';
import { getBlogSEO } from '../seo/seoHelpers';

const Blogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const blogId = searchParams.get('id');

  const posts = [
    {
      id: 1,
      tag: "Deep Dive",
      title: "Which Crystal for Anxiety — The Honest Guide",
      excerpt: "We break down the minerals that actually ground your nervous system, free of pseudo-science.",
      date: "June 08, 2026",
      readTime: "6 Min Read",
      content: [
        "In a world filled with high-frequency notifications, sensory overload, and constant cognitive demands, anxiety has transitioned from an occasional reaction to a chronic state. While mainstream advice urges us to meditate or disconnect, sometimes physical anchors are needed to bring us back to reality. This is where high-density energy tools come in.",
        "From an energetic standpoint, anxiety is a state of upward scattering. Your energy leaves the root center and pools in the head, causing circular thinking, shallow breathing, and a feeling of being unmoored. To counteract this, you need minerals that carry deep physical gravity.",
        "Black Tourmaline and Obsidian are excellent starting points. Because of their rich iron and magnesium inclusion structure, they absorb ambient electric stress. Holding a heavy specimen of raw Black Tourmaline during high-stress moments physically prompts your attention downwards.",
        "We recommend a daily five‑minute grounding check: Sit with both feet flat on the floor. Hold your raw stone in your left hand (the receptive hand). Close your eyes and breathe deeply, matching the inhale and exhale duration. Visualize the excess mental static draining through your feet, anchored by the weight of the stone in your palm."
      ]
    },
    {
      id: 3,
      tag: "Practices",
      title: "The 7-Day Root Reset: A Practical Grounding Guide",
      excerpt: "A simple, actionable guide to building stability from the ground up using Red Jasper.",
      date: "May 12, 2026",
      readTime: "5 Min Read",
      content: [
        "The root center, located at the base of the spine, is the foundation of your energetic system. When this center is weak, you feel insecure, fearful, and easily overwhelmed by life's changes. The 7‑day Root Reset is designed to rebuild this foundation using Red Jasper.",
        "Red Jasper is a stone of endurance, physical vitality, and deep earth connection. Its energy is slow, steady, and grounding, making it the perfect partner for this practice.",
        "Each day of the reset, spend 10 minutes in the morning sitting quietly with your Red Jasper. Place it near the base of your spine or hold it in your lap. Focus your attention on the point of contact between your body and the chair or floor, and feel the steady energy of the stone anchoring you.",
        "By the end of the 7 days, you will notice a greater sense of stability, a reduced reactivity to stressors, and a deeper connection to your physical body."
      ]
    },
    {
      id: 4,
      tag: "Lifestyle",
      title: "Creating Your Sacred Space",
      excerpt: "How to arrange your crystals for maximum energetic flow and aesthetic balance in any room.",
      date: "May 02, 2026",
      readTime: "4 Min Read",
      content: [
        "Your environment dictates your state of mind. When a room is cluttered, noisy, or unorganized, your thoughts naturally mirror that chaos. Creating a dedicated sacred space—a corner, a shelf, or a small table—acts as an environmental anchor that cues your mind to rest.",
        "To begin, choose a space in your home that is relatively quiet. Cleanse the area physically first. Wipe down the surfaces, remove clutter, and let fresh air circulate.",
        "Next, arrange your tools. We recommend a simple three‑point grid: placing a grounding stone (like Black Tourmaline) near the entrance of the space, an amplifying stone (like Clear Quartz) in the center, and a soft healing stone (like Rose Quartz or Amethyst) at the back. This creates an energetic gradient that filters stress and anchors your intentions.",
        "Finally, introduce a sensory ritual. Light a stick of natural sandalwood incense or a beeswax candle, take three slow breaths, and sit in silence. Repeat this daily to program your subconscious to find immediate calm whenever you enter this space."
      ]
    },
  ];

  const activePost = blogId ? posts.find(p => p.id === parseInt(blogId)) : null;

  if (activePost) {
  const seoData = getBlogSEO({
    title: activePost.title,
    excerpt: activePost.excerpt,
    slug: `/blogs/${activePost.id}`,
    coverImage:
      activePost.id === 1
        ? '/assets/images/Blogs/which-crystal-anxiety-honest-guide.webp'
        : activePost.id === 3
        ? '/assets/images/Blogs/root-reset-practical-guide.webp'
        : activePost.id === 4
        ? '/assets/images/Blogs/creating-sacred-space.webp'
        : '',
  });
  return (
    <>
      <Seo {...seoData} />
      <Section className="min-h-screen pt-32 bg-background">
        <Container className="max-w-3xl mx-auto">
          <button
            onClick={() => setSearchParams({})}
            className="text-[10px] uppercase tracking-[0.2em] text-[#000000] hover:text-primary transition-colors mb-8 font-bold font-body"
          >
            ← Back to All Blogs
          </button>

          <div className="space-y-6">
            {/* Post Cover Image (Same as card view) */}
            {activePost.id === 1 && (
                  <picture>
                    <source srcSet="/assets/images/Blogs/which-crystal-anxiety-honest-guide.webp, /assets/images/Blogs/which-crystal-anxiety-honest-guide@2x.webp 2x" type="image/webp" />
                    <img src="/assets/images/Blogs/which-crystal-anxiety-honest-guide.png" alt={activePost.title} className="w-full h-full object-cover" />
                  </picture>
                )}
                {activePost.id === 3 && (
                  <picture>
                    <source srcSet="/assets/images/Blogs/root-reset-practical-guide.webp, /assets/images/Blogs/root-reset-practical-guide@2x.webp 2x" type="image/webp" />
                    <img src="/assets/images/Blogs/root-reset-practical-guide.png" alt={activePost.title} className="w-full h-full object-cover" />
                  </picture>
                )}
                {activePost.id === 4 && (
                  <picture>
                    <source srcSet="/assets/images/Blogs/creating-sacred-space.webp, /assets/images/Blogs/creating-sacred-space@2x.webp 2x" type="image/webp" />
                    <img src="/assets/images/Blogs/creating-sacred-space.png" alt={activePost.title} className="w-full h-full object-cover" />
                  </picture>
                )}

            <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-[#000000] font-bold font-body">
              {activePost.tag}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-primary leading-tight font-medium">
              {activePost.title}
            </h1>

            <div className="flex items-center space-x-6 text-[10px] uppercase tracking-[0.2em] text-muted font-bold font-body border-b border-border pb-8">
              <span>{activePost.date}</span>
              <span>·</span>
              <span>{activePost.readTime}</span>
              <span>·</span>
              <span>By The Sacred Store Editorial</span>
            </div>

            <div className="space-y-6 text-muted font-light font-body text-base leading-relaxed pt-4">
              <p className="text-xl text-primary font-display font-light leading-relaxed italic mb-8 border-l-2 border-accent pl-6">
                {activePost.excerpt}
              </p>

              {activePost.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Elegant Callout for Conversion */}
            <div className="mt-16 p-8 bg-surface border border-border flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="font-display text-lg text-primary font-medium mb-1">
                  Looking for grounding tools?
                </h4>
                <p className="text-xs text-muted font-body">
                  Explore our ethically sourced and cleansed crystal collection.
                </p>
              </div>
              <Button
                to="/shop-crystals"
                variant="primary"
                onClick={() => setSearchParams({})}
              >
                Shop Collection
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
);
  }

  return (
    <Section className="min-h-screen pt-32 bg-background">
      <Container>
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-medium text-primary mb-6">
            <span className="text-black">Insights</span> <span className="text-black">&amp; Practices</span>
          </h1>
          <p className="text-muted font-light leading-relaxed">
            Honest guidance on grounding, energy hygiene, and mindful objects. Free of excessive jargon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-16">
          {posts.map(post => (
            <div
              key={post.id}
              className="group cursor-pointer flex flex-col bg-surface border border-border p-6 hover:-translate-y-1 transition-all duration-500"
              onClick={() => setSearchParams({ id: post.id })}
            >
              <div className="w-full aspect-[16/10] bg-background border-b border-border flex items-center justify-center overflow-hidden mb-6">
                {post.id === 1 && (
                  <picture>
                    <source srcSet="/assets/images/Blogs/which-crystal-anxiety-honest-guide.webp, /assets/images/Blogs/which-crystal-anxiety-honest-guide@2x.webp 2x" type="image/webp" />
                    <img
                      src="/assets/images/Blogs/which-crystal-anxiety-honest-guide.png"
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      width="350"
                      height="218"
                      className="w-full h-full object-cover"
                    />
                  </picture>
                )}
                {post.id === 3 && (
                  <picture>
                    <source srcSet="/assets/images/Blogs/root-reset-practical-guide.webp, /assets/images/Blogs/root-reset-practical-guide@2x.webp 2x" type="image/webp" />
                    <img
                      src="/assets/images/Blogs/root-reset-practical-guide.png"
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      width="350"
                      height="218"
                      className="w-full h-full object-cover"
                    />
                  </picture>
                )}
                {post.id === 4 && (
                  <picture>
                    <source srcSet="/assets/images/Blogs/creating-sacred-space.webp, /assets/images/Blogs/creating-sacred-space@2x.webp 2x" type="image/webp" />
                    <img
                      src="/assets/images/Blogs/creating-sacred-space.png"
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      width="350"
                      height="218"
                      className="w-full h-full object-cover"
                    />
                  </picture>
                )}
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#000000] font-bold font-body">
                  {post.tag}
                </span>
                <span className="text-[9px] uppercase tracking-[0.1em] text-muted font-body">
                  {post.readTime}
                </span>
              </div>

              <h3 className="text-2xl font-display text-primary mb-3 group-hover:text-accent transition-colors font-medium">
                {post.title}
              </h3>

              <p className="text-xs text-muted font-light font-body leading-relaxed mb-6 flex-grow">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] font-bold font-body border-t border-border pt-4">
                <span className="text-muted">{post.date}</span>
                <span className="text-accent group-hover:translate-x-1 transition-transform">
                  Read Entry →
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default Blogs;

