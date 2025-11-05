interface ValidationResult {
  errors: string[];
  warnings: string[];
}

type EnvCheck = {
  key: string;
  message: string;
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
    key: 'ADMIN_ROLE_ID',
    message:
      'ADMIN_ROLE_ID belum diatur. Guard izin berbasis role akan dilewati karena tidak ada role yang divalidasi.',
  },
  {
    key: 'EMOJI_CHANNEL_ID',
    message:
      'EMOJI_CHANNEL_ID belum diatur. Fitur auto emoji reactor tidak akan aktif sampai variabel ini diisi.',
  },
  {
    key: 'DAILY_MEME_CHANNEL_ID',
    message:
      'DAILY_MEME_CHANNEL_ID belum diatur. Scheduler meme harian akan dilewati sampai variabel ini tersedia.',
  },
  {
    key: 'WEBHOOK_URL',
    message:
      'WEBHOOK_URL belum diatur. Command webhook tidak bisa mengirim pesan sampai URL ditambahkan.',
  },
  {
    key: 'VOICE_CHANNEL_ID',
    message:
      'VOICE_CHANNEL_ID belum diatur. Bot tidak akan mencoba join voice channel saat startup.',
  },
];

export const validateEnv = (env: NodeJS.ProcessEnv): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const check of REQUIRED_VARS) {
    const value = env[check.key];
    if (!value || value.trim() === '') {
      errors.push(check.message);
    }
  }

  for (const check of OPTIONAL_VARS) {
    const value = env[check.key];
    if (!value || value.trim() === '') {
      warnings.push(check.message);
    }
  }

  return { errors, warnings };
};

export default validateEnv;
