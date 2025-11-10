import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import validateEnv from '../src/utils/validateEnv';

interface CliOptions {
  envFile: string;
  outputJson: boolean;
  failOnWarn: boolean;
}

const parseArgs = (): CliOptions => {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    envFile: '.env',
    outputJson: false,
    failOnWarn: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case '--env-file':
        options.envFile = args[i + 1] ?? options.envFile;
        i += 1;
        break;
      case '--json':
        options.outputJson = true;
        break;
      case '--fail-on-warn':
        options.failOnWarn = true;
        break;
      default:
        console.warn(`⚠️ Unknown flag "${arg}" ignored.`);
        break;
    }
  }

  return options;
};

const { envFile, outputJson, failOnWarn } = parseArgs();
const envPath = path.resolve(process.cwd(), envFile);

if (!fs.existsSync(envPath)) {
  if (envFile === '.env') {
    dotenv.config();
  } else {
    console.error(`❌ Env file "${envFile}" not found.`);
    process.exit(1);
  }
} else {
  dotenv.config({ path: envPath });
}

const { errors, warnings } = validateEnv(process.env);
const shouldFail = errors.length > 0 || (failOnWarn && warnings.length > 0);

if (outputJson) {
  console.log(
    JSON.stringify(
      {
        ok: !shouldFail,
        errors,
        warnings,
      },
      null,
      2,
    ),
  );
} else {
  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
  } else {
    console.log('✅ Required environment variables look good.');
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Environment warnings:');
    for (const warning of warnings) {
      console.warn(`  - ${warning}`);
    }
  }
}

if (shouldFail) {
  process.exit(1);
}
