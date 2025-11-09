interface ValidationResult {
  errors: string[];
  warnings: string[];
}

type EnvCheck = {
  key: string;
  message: string;
  validator?: {
    fn: (value: string) => boolean;
    invalidMessage: string;
  };
};

const isDiscordId = (value: string) => /^\d{5,}$/.test(value);
const isUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return Boolean(parsed.protocol === 'https:' || parsed.protocol === 'http:');
  } catch {
    return false;
  }
};

const REQUIRED_VARS: EnvCheck[] = [
  {
    key: 'TOKEN',
    message: 'Variabel TOKEN wajib diisi untuk login ke Discord. Tambahkan TOKEN ke file .env.',
  },
];

const OPTIONAL_VARS: EnvCheck[] = [
  {
    key: 'TEXT_PREFIX',
    message:
      'TEXT_PREFIX belum diatur. Command hanya bisa dipicu lewat mention; isi TEXT_PREFIX untuk prefix teks.',
  },
  {
    key: 'LOG_LEVEL',
    message:
      'LOG_LEVEL belum diatur. Pino akan menggunakan level bawaan (debug/non-prod, info/prod). Atur LOG_LEVEL untuk kontrol lebih lanjut.',
  },
  {
    key: 'ADMIN_ROLE_ID',
    message:
      'ADMIN_ROLE_ID belum diatur. Guard izin berbasis role akan dilewati karena tidak ada role yang divalidasi.',
    validator: {
      fn: isDiscordId,
      invalidMessage: 'ADMIN_ROLE_ID harus berupa Discord role ID numerik.',
    },
  },
  {
    key: 'EMOJI_CHANNEL_ID',
    message:
      'EMOJI_CHANNEL_ID belum diatur. Fitur auto emoji reactor tidak akan aktif sampai variabel ini diisi.',
    validator: {
      fn: isDiscordId,
      invalidMessage: 'EMOJI_CHANNEL_ID harus berupa Discord channel ID numerik.',
    },
  },
  {
    key: 'DAILY_MEME_CHANNEL_ID',
    message:
      'DAILY_MEME_CHANNEL_ID belum diatur. Scheduler meme harian akan dilewati sampai variabel ini tersedia.',
    validator: {
      fn: isDiscordId,
      invalidMessage: 'DAILY_MEME_CHANNEL_ID harus berupa Discord channel ID numerik.',
    },
  },
  {
    key: 'WEBHOOK_URL',
    message:
      'WEBHOOK_URL belum diatur. Command webhook tidak bisa mengirim pesan sampai URL ditambahkan.',
    validator: {
      fn: isUrl,
      invalidMessage: 'WEBHOOK_URL harus berupa URL valid (https://...).',
    },
  },
  {
    key: 'VOICE_CHANNEL_ID',
    message:
      'VOICE_CHANNEL_ID belum diatur. Bot tidak akan mencoba join voice channel saat startup.',
    validator: {
      fn: isDiscordId,
      invalidMessage: 'VOICE_CHANNEL_ID harus berupa Discord voice channel ID numerik.',
    },
  },
];

export const validateEnv = (env: NodeJS.ProcessEnv): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const check of REQUIRED_VARS) {
    const value = env[check.key];
    if (!value || value.trim() === '') {
      errors.push(check.message);
      continue;
    }
    if (check.validator && !check.validator.fn(value.trim())) {
      errors.push(check.validator.invalidMessage);
    }
  }

  for (const check of OPTIONAL_VARS) {
    const value = env[check.key];
    if (!value || value.trim() === '') {
      warnings.push(check.message);
      continue;
    }
    if (check.validator && !check.validator.fn(value.trim())) {
      warnings.push(check.validator.invalidMessage);
    }
  }

  return { errors, warnings };
};

export default validateEnv;
