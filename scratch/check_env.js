// scratch/check_env.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
console.log('ENV keys:', Object.keys(process.env).filter(k => k.toLowerCase().includes('pass') || k.toLowerCase().includes('secret') || k.toLowerCase().includes('db') || k.toLowerCase().includes('sql') || k.toLowerCase().includes('key') || k.toLowerCase().includes('url')));
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_PASS:', process.env.DB_PASS);
