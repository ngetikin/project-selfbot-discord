import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import validateEnv from '../src/utils/validateEnv';

const envPath = path.resolve(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const { errors, warnings } = validateEnv(process.env);

if (errors.length > 0) {
  console.error('❌ Environment validation failed:');
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn('⚠️ Environment warnings:');
  for (const warning of warnings) {
    console.warn(`  - ${warning}`);
  }
}

console.log('✅ Environment variables look good.');
