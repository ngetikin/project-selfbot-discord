import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import validateEnv from '../src/utils/validateEnv';

interface CliOptions {
  envFiles: string[];
  outputJson: boolean;
  failOnWarn: boolean;
  checkAll: boolean;
}

const parseArgs = (): CliOptions => {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    envFiles: [],
    outputJson: false,
    failOnWarn: false,
    checkAll: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case '--env-file':
        if (args[i + 1]) {
          options.envFiles.push(args[i + 1]);
          i += 1;
        }
        break;
      case '--json':
        options.outputJson = true;
        break;
      case '--fail-on-warn':
        options.failOnWarn = true;
        break;
      case '--all':
        options.checkAll = true;
        break;
      case '--help':
        console.log(
          'Usage: pnpm validate:env -- [--env-file path] [--all] [--json] [--fail-on-warn]',
        );
        process.exit(0);
      default:
        console.warn(`⚠️ Unknown flag "${arg}" ignored.`);
        break;
    }
  }

  if (options.checkAll) {
    options.envFiles = Array.from(new Set([...options.envFiles, '.env', '.env.example']));
  }

  if (options.envFiles.length === 0) {
    options.envFiles = ['.env'];
  }

  return options;
};

const loadEnvFromFile = (file: string): NodeJS.ProcessEnv => {
  const envPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(envPath)) {
    if (file === '.env') {
      return process.env;
    }
    throw new Error(`Env file "${file}" not found.`);
  }
  const buffer = fs.readFileSync(envPath);
  const parsed = dotenv.parse(buffer);
  return parsed as NodeJS.ProcessEnv;
};

const runValidation = (file: string) => {
  let envVars: NodeJS.ProcessEnv;
  try {
    envVars = loadEnvFromFile(file);
  } catch (err) {
    return {
      file,
      errors: [(err as Error).message],
      warnings: [],
      ok: false,
    };
  }
  const { errors, warnings } = validateEnv(envVars);
  const ok = errors.length === 0;
  return { file, errors, warnings, ok };
};

const { envFiles, outputJson, failOnWarn } = parseArgs();
const results = envFiles.map(runValidation);
const overallOk = results.every(
  result => result.ok && (!failOnWarn || result.warnings.length === 0),
);

if (outputJson) {
  console.log(
    JSON.stringify(
      {
        ok: overallOk,
        results,
      },
      null,
      2,
    ),
  );
} else {
  for (const result of results) {
    const header = result.ok ? '✅' : '❌';
    console.log(`${header} ${result.file}`);
    if (result.errors.length > 0) {
      for (const error of result.errors) {
        console.error(`  - ${error}`);
      }
    }
    if (result.warnings.length > 0) {
      console.warn('  ⚠️ Warnings:');
      for (const warning of result.warnings) {
        console.warn(`    - ${warning}`);
      }
    }
  }
}

if (!overallOk) {
  process.exit(1);
}
