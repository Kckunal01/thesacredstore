const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  fs.readdirSync(dir).forEach(file => {
    let filepath = path.join(dir, file);
    let stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, callback);
    } else if (stat.isFile() && (filepath.endsWith('.jsx') || filepath.endsWith('.js') || filepath.endsWith('.css'))) {
      callback(filepath);
    }
  });
};

const replaceInFile = (filepath, replacer) => {
  const content = fs.readFileSync(filepath, 'utf8');
  const newContent = replacer(content);
  if (content !== newContent) {
    fs.writeFileSync(filepath, newContent, 'utf8');
    console.log(`Updated ${filepath}`);
  }
};

walk('src', (filepath) => {
  replaceInFile(filepath, (content) => {
    let updated = content;
    // 1. small headings uppercase tracking text-accent -> text-[#000000]
    updated = updated.replace(/className="([^"]*uppercase[^"]*tracking-[^"]*)text-accent([^"]*)"/g, 'className="$1text-[#000000]$2"');
    
    // 2. background white replacements
    updated = updated.replace(/bg-white/g, 'bg-[#FEFBF1]');
    updated = updated.replace(/bg-\[\#FAF9F6\]/g, 'bg-[#FEFBF1]');
    
    // 3. Header.jsx cart badge
    if (filepath.includes('Header.jsx')) {
      updated = updated.replace(/bg-accent text-background/g, 'bg-[#000000] text-[#FFBD59]');
    }

    // 4. ProductCard.jsx Add to cart button
    if (filepath.includes('ProductCard.jsx')) {
      updated = updated.replace(/bg-primary hover:bg-accent text-background/g, 'bg-[#000000] hover:bg-[#FFBD59] text-[#FEFBF1] hover:text-[#000000]');
    }

    // 5. Home.jsx SACRED font and Testimonial arrows
    if (filepath.includes('Home.jsx')) {
      updated = updated.replace(/className="font-allura"/g, 'className="font-display italic"');
      
      // Update testimonial arrows
      updated = updated.replace(
        /<button onClick=\{prevTestimonial\}.*?&larr;<\/button>/g,
        `<button onClick={prevTestimonial} className="absolute left-0 z-10 w-12 h-12 flex items-center justify-center text-[#000000] hover:bg-[#FFBD59] bg-transparent rounded-full border border-[#000000] -ml-6 transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>`
      );
      updated = updated.replace(
        /<button onClick=\{nextTestimonial\}.*?&rarr;<\/button>/g,
        `<button onClick={nextTestimonial} className="absolute right-0 z-10 w-12 h-12 flex items-center justify-center text-[#000000] hover:bg-[#FFBD59] bg-transparent rounded-full border border-[#000000] -mr-6 transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>`
      );
    }

    // Also half-gold "Energy." and "Guided by Energy."
    // Actually the user mentioned "Guided by Energy." - "these small headings above headings are not following primary color" which I updated text-accent. 
    // They did not say anything about "Guided by Energy" needing to change color, just "small headings above headings".
    
    return updated;
  });
});
