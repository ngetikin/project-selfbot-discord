import validateEnv from '../src/utils/validateEnv';

describe('validateEnv', () => {
  it('requires TOKEN', () => {
    const result = validateEnv({} as any);
    expect(result.errors).toContain(
      'Variabel TOKEN wajib diisi untuk login ke Discord. Tambahkan TOKEN ke file .env.',
    );
  });

  it('enforces AUTO_STATUS_ROTATOR dependency', () => {
    const result = validateEnv({
      TOKEN: 'abc',
      AUTO_STATUS_ROTATOR: 'true',
    } as any);
    expect(result.errors).toContain(
      'AUTO_STATUS_ROTATOR aktif, tetapi VOICE_CHANNEL_ID belum diatur. Tambahkan VOICE_CHANNEL_ID atau matikan AUTO_STATUS_ROTATOR.',
    );
  });

  it('accepts valid configuration', () => {
    const result = validateEnv({
      TOKEN: 'abc',
      VOICE_CHANNEL_ID: '123456',
      AUTO_STATUS_ROTATOR: 'true',
      WEBHOOK_URL: 'https://example.com/hook',
    } as any);
    expect(result.errors).toHaveLength(0);
  });
});
