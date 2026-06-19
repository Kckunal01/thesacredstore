const fs = require('fs');
const path = require('path');

const root = 'C:/Users/Kunal/OneDrive/Desktop/Ritualist/src';

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  replacements.forEach(r => {
    const regex = new RegExp(r.from, 'g');
    content = content.replace(regex, r.to);
  });
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(entry => {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (full.endsWith('.jsx') || full.endsWith('.tsx') || full.endsWith('.js')) {
      replaceInFile(full, [
        // Replace small heading color to primary (gold) by using text-accent if currently text-primary on small headings
        { from: 'text-primary\s+mb-4\s+text-xs', to: 'text-accent mb-4 text-xs' },
        // Ensure background uses offwhite surface instead of white
        { from: 'bg-white', to: 'bg-surface' },
        // Ensure cart icon primary color (use text-primary for icons)
        { from: 'text-primary', to: 'text-accent' }
      ]);
    }
  });
}

walk(root);
