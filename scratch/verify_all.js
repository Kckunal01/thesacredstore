import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

const productNames = [
  'Blue Lace Agate Bracelet','Carnelian Bracelet','Carnelian Crystal Tree','Clear Quartz Crystal Pyramid','Clear Quartz Bracelet','Golden Hematite Bracelet','Green Aventurine Crystal Pyramid','Green Aventurine Crystal Tree','Green Jade Bracelet','Pink Tourmaline Bracelet','Pyrite Bracelet','Pyrite Crystal Pyramid','Pyrite Crystal Tree','Red Jasper Bracelet','Rutile Quartz Bracelet','Selenite Bracelet','Sodalite Bracelet','Turquoise Bracelet'
];

function slugify(text){return text.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^[-]+/,'').replace(/[-]+$/,'');}

async function verify(){
  console.log('Verification Results:');
  for(const name of productNames){
    const slug = slugify(name);
    const {data, error} = await supabase.from('products').select('id, active, stock, image_url').eq('slug', slug).single();
    if(error){
      console.log(`${name}: NOT FOUND`);
    } else {
      const visible = data && data.active && data.stock>0 && data.image_url;
      console.log(`${name}: ${visible ? 'OK' : 'ISSUE'}`);
    }
  }
}
verify().catch(e=>console.error(e));
