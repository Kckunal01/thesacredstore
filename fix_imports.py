import os
import glob
import re

files = glob.glob('c:/Users/Kunal/OneDrive/Desktop/7chakras/src/**/*.jsx', recursive=True)
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    orig = content
    # Replace Container and Section
    content = re.sub(r"import\s+\{\s*Container\s*,\s*Section\s*\}\s+from\s+['\"](.*?)components/ui/Container['\"];", r"import Container from '\1components/ui/Container';\nimport Section from '\1components/ui/Section';", content)
    
    # Replace single named imports
    content = re.sub(r"import\s+\{\s*Button\s*\}\s+from\s+['\"](.*?)components/ui/Button['\"];", r"import Button from '\1components/ui/Button';", content)
    content = re.sub(r"import\s+\{\s*ProductCard\s*\}\s+from\s+['\"](.*?)components/ui/ProductCard['\"];", r"import ProductCard from '\1components/ui/ProductCard';", content)
    content = re.sub(r"import\s+\{\s*SectionHeader\s*\}\s+from\s+['\"](.*?)components/ui/SectionHeader['\"];", r"import SectionHeader from '\1components/ui/SectionHeader';", content)
    content = re.sub(r"import\s+\{\s*QuoteBlock\s*\}\s+from\s+['\"](.*?)components/ui/QuoteBlock['\"];", r"import QuoteBlock from '\1components/ui/QuoteBlock';", content)
    content = re.sub(r"import\s+\{\s*FeatureCard\s*\}\s+from\s+['\"](.*?)components/ui/FeatureCard['\"];", r"import FeatureCard from '\1components/ui/FeatureCard';", content)
    content = re.sub(r"import\s+\{\s*CustomCursor\s*\}\s+from\s+['\"](.*?)components/ui/CustomCursor['\"];", r"import CustomCursor from '\1components/ui/CustomCursor';", content)
    
    if orig != content:
        print('Updated', f)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
