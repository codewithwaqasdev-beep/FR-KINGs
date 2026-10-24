import fs from 'fs';
import path from 'path';

export interface License {
  id: string;
  license_key: string;
  full_name: string;
  phone: string;
  email: string;
  amount: string;
  status: 'pending' | 'approved' | 'blocked';
  duration_label: string;
  expires_at: string | null;
  lifetime: boolean;
  max_devices: number;
  license_devices: string[];
  created_at: string;
  updated_at: string;
}

export interface SignalRecord {
  id: string;
  pair: string;
  market: string;
  timer: string;
  mode: 'live' | 'future';
  direction: 'BUY' | 'SELL';
  entry: string;
  expiry: string;
  accuracy: string;
  strength: string;
  created_at: string;
}

export interface AppConfig {
  apiKey: string;
  recoveryEmail: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  authMode: 'local' | 'api_key_only' | 'supabase_sync';
  allowMasterApiKeyBypass: boolean;
  adminPassword?: string;
  whatsappUrl: string;
  telegramUrl: string;
  phone: string;
  developer: string;
}

export interface DatabaseSchema {
  config: AppConfig;
  licenses: License[];
  signals: SignalRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'frking.db.json');

const DEFAULT_CONFIG: AppConfig = {
  apiKey: 'FRK-PRO-MASTER-KEY-2026',
  recoveryEmail: 'emailwaqas7@gmail.com',
  supabaseUrl: '',
  supabaseAnonKey: '',
  authMode: 'local',
  allowMasterApiKeyBypass: true,
  adminPassword: process.env.ADMIN_PASSWORD || 'FRK#9xQ$8mK2@vT7!2026',
  whatsappUrl: 'https://chat.whatsapp.com/G1yKmNVIntiLx7c9KX5zEu',
  telegramUrl: 'https://t.me/frking00',
  phone: '+966554573612',
  developer: '@codetrader',
};

function calculateExpiry(durationLabel: string): { expires_at: string | null; lifetime: boolean } {
  if (durationLabel === 'Lifetime') {
    return { expires_at: null, lifetime: true };
  }
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  let ms = 30 * dayMs;

  switch (durationLabel) {
    case '1 Day': ms = 1 * dayMs; break;
    case '2 Days': ms = 2 * dayMs; break;
    case '3 Days': ms = 3 * dayMs; break;
    case '5 Days': ms = 5 * dayMs; break;
    case '1 Week': ms = 7 * dayMs; break;
    case '15 Days': ms = 15 * dayMs; break;
    case '1 Month': ms = 30 * dayMs; break;
    case '3 Months': ms = 90 * dayMs; break;
    case '6 Months': ms = 180 * dayMs; break;
    case '1 Year': ms = 365 * dayMs; break;
    default: ms = 30 * dayMs; break;
  }

  return {
    expires_at: new Date(now + ms).toISOString(),
    lifetime: false,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          config: { ...DEFAULT_CONFIG, ...(parsed.config || {}) },
          licenses: parsed.licenses || [],
          signals: parsed.signals || [],
        };
      }
    } catch (err) {
      console.error('Error loading DB file, fallback to seed:', err);
    }

    const initial: DatabaseSchema = {
      config: DEFAULT_CONFIG,
      licenses: [
        {
          id: 'lic_master_001',
          license_key: 'FRK-PRO-MASTER-KEY-2026',
          full_name: 'VIP Master Admin',
          phone: '+966554573612',
          email: 'emailwaqas7@gmail.com',
          amount: 'VIP Master Key',
          status: 'approved',
          duration_label: 'Lifetime',
          expires_at: null,
          lifetime: true,
          max_devices: 10,
          license_devices: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'lic_vip_waqas',
          license_key: 'FRK-7482-9912-3401',
          full_name: 'Waqas Pro Trader',
          phone: '+966554573612',
          email: 'codewithwaqas.dev@gmail.com',
          amount: '100 USD',
          status: 'approved',
          duration_label: '3 Months',
          expires_at: new Date(Date.now() + 90 * 86400000).toISOString(),
          lifetime: false,
          max_devices: 3,
          license_devices: [],
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'lic_pending_alex',
          license_key: 'FRK-5510-4492-8821',
          full_name: 'Alex Rivera',
          phone: '+14155552671',
          email: 'alex.trader@gmail.com',
          amount: '20 USD',
          status: 'pending',
          duration_label: '1 Month',
          expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
          lifetime: false,
          max_devices: 1,
          license_devices: [],
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      signals: [],
    };

    this.persist(initial);
    return initial;
  }

  private persist(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist DB:', err);
    }
  }

  public getConfig(): AppConfig {
    return { ...this.data.config };
  }

  public updateConfig(updates: Partial<AppConfig>): AppConfig {
    this.data.config = {
      ...this.data.config,
      ...updates,
    };
    this.persist(this.data);
    return this.getConfig();
  }

  public getLicenses(): License[] {
    return this.data.licenses;
  }

  public findLicenseByKey(key: string): License | undefined {
    const cleanKey = key.trim().toUpperCase();
    return this.data.licenses.find(
      (lic) => lic.license_key.trim().toUpperCase() === cleanKey
    );
  }

  public findLicenseById(id: string): License | undefined {
    return this.data.licenses.find((lic) => lic.id === id || lic.license_key === id);
  }

  public createLicense(input: {
    custom_key?: string;
    full_name: string;
    phone: string;
    email: string;
    amount: string;
    duration?: string;
    max_devices?: number;
    status?: 'pending' | 'approved' | 'blocked';
  }): License {
    const rawKey = input.custom_key?.trim().toUpperCase();
    let licenseKey = rawKey;

    if (!licenseKey) {
      const part1 = Math.floor(1000 + Math.random() * 9000);
      const part2 = Math.floor(1000 + Math.random() * 9000);
      const part3 = Math.floor(1000 + Math.random() * 9000);
      licenseKey = `FRK-${part1}-${part2}-${part3}`;
    }

    const durationLabel = input.duration || '1 Month';
    const { expires_at, lifetime } = calculateExpiry(durationLabel);

    const newLic: License = {
      id: `lic_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      license_key: licenseKey,
      full_name: input.full_name.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      amount: input.amount.trim() || 'Paid',
      status: input.status || 'pending',
      duration_label: durationLabel,
      expires_at: expires_at,
      lifetime: lifetime,
      max_devices: input.max_devices || 1,
      license_devices: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.licenses.unshift(newLic);
    this.persist(this.data);
    return newLic;
  }

  public updateLicenseAction(
    idOrKey: string,
    action: string,
    duration?: string,
    maxDevices?: number,
    deviceId?: string
  ): { ok: boolean; error?: string; license?: License } {
    const licIndex = this.data.licenses.findIndex(
      (lic) => lic.id === idOrKey || lic.license_key === idOrKey
    );

    if (licIndex === -1) {
      return { ok: false, error: 'License not found.' };
    }

    const lic = this.data.licenses[licIndex];

    if (action === 'delete') {
      this.data.licenses.splice(licIndex, 1);
      this.persist(this.data);
      return { ok: true };
    }

    if (action === 'approve') {
      lic.status = 'approved';
      if (duration) {
        lic.duration_label = duration;
        const expiry = calculateExpiry(duration);
        lic.expires_at = expiry.expires_at;
        lic.lifetime = expiry.lifetime;
      }
      if (maxDevices !== undefined && maxDevices > 0) {
        lic.max_devices = maxDevices;
      }
      lic.updated_at = new Date().toISOString();
    } else if (action === 'block') {
      lic.status = 'blocked';
      lic.updated_at = new Date().toISOString();
    } else if (action === 'reset_devices') {
      lic.license_devices = [];
      lic.updated_at = new Date().toISOString();
    } else if (action === 'remove_device' && deviceId) {
      lic.license_devices = (lic.license_devices || []).filter(
        (d) => d.trim().toLowerCase() !== deviceId.trim().toLowerCase()
      );
      lic.updated_at = new Date().toISOString();
    } else {
      return { ok: false, error: `Unknown action: ${action}` };
    }

    this.persist(this.data);
    return { ok: true, license: lic };
  }

  public bindDevice(licKey: string, deviceId: string): { ok: boolean; error?: string; license?: License } {
    const cleanKey = licKey.trim().toUpperCase();
    const lic = this.findLicenseByKey(cleanKey);

    if (!lic) {
      return { ok: false, error: 'License key not found.' };
    }

    if (lic.status === 'blocked') {
      return { ok: false, error: 'This license has been blocked by administrator.' };
    }

    if (lic.status === 'pending') {
      return { ok: false, error: 'Payment verification pending. Please wait for admin approval.' };
    }

    if (!lic.lifetime && lic.expires_at && new Date(lic.expires_at) < new Date()) {
      return { ok: false, error: 'License key expired. Please contact admin to renew.' };
    }

    if (!lic.license_devices) {
      lic.license_devices = [];
    }

    const hasDevice = lic.license_devices.some(
      (d) => d.trim().toLowerCase() === deviceId.trim().toLowerCase()
    );

    if (!hasDevice) {
      if (lic.license_devices.length >= lic.max_devices) {
        return {
          ok: false,
          error: `Device limit reached (${lic.license_devices.length}/${lic.max_devices} bound). Please ask admin to reset devices or upgrade limit.`,
        };
      }
      lic.license_devices.push(deviceId.trim());
      lic.updated_at = new Date().toISOString();
      this.persist(this.data);
    }

    return { ok: true, license: lic };
  }

  public addSignal(sig: Omit<SignalRecord, 'created_at'>): SignalRecord {
    const record: SignalRecord = {
      ...sig,
      created_at: new Date().toISOString(),
    };
    this.data.signals.unshift(record);
    if (this.data.signals.length > 500) {
      this.data.signals = this.data.signals.slice(0, 500);
    }
    this.persist(this.data);
    return record;
  }

  public getSignals(limit = 50): SignalRecord[] {
    return this.data.signals.slice(0, limit);
  }
}

export const db = new Database();
