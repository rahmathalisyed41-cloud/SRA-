/**
 * SRA Group HYD - Universal Ad Architecture
 * Decouples advertising logic from UI components.
 * Supports Web (Google AdSense) and Mobile (Google AdMob placeholders & test IDs).
 */

export interface AdConfiguration {
  enabled: boolean;
  adSenseClientId: string;
  adSenseSlotId: string;
  adMobBannerId: string;
  adMobInterstitialId: string;
  isMobileDevice: boolean;
}

const DEFAULT_CONFIG: AdConfiguration = {
  enabled: true,
  adSenseClientId: 'ca-pub-test-sra-hyd-12345',
  adSenseSlotId: '1234567890',
  adMobBannerId: 'ca-app-pub-3940256099942544/6300978111', // Official Google AdMob test banner ID
  adMobInterstitialId: 'ca-app-pub-3940256099942544/1033173712', // Official Google AdMob test interstitial ID
  isMobileDevice: typeof window !== 'undefined' ? /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) : false,
};

class MobileAdService {
  private bannerId: string;
  private interstitialId: string;

  constructor(bannerId: string, interstitialId: string) {
    this.bannerId = bannerId;
    this.interstitialId = interstitialId;
  }

  public showInterstitial(contextName: string): void {
    // Critical policy: NEVER interrupt OTP, login, publishing, calling or WhatsApp
    const blockedContexts = ['otp', 'login', 'listing_publish', 'call_seller', 'whatsapp_seller'];
    if (blockedContexts.includes(contextName.toLowerCase())) {
      return;
    }
    console.log(`[AdMob] Showing test interstitial (${this.interstitialId}) for context: ${contextName}`);
  }

  public getBannerUnitId(): string {
    return this.bannerId;
  }
}

class WebAdService {
  private clientId: string;
  private defaultSlotId: string;

  constructor(clientId: string, defaultSlotId: string) {
    this.clientId = clientId;
    this.defaultSlotId = defaultSlotId;
  }

  public getClientId(): string {
    return this.clientId;
  }

  public getSlotId(customSlot?: string): string {
    return customSlot || this.defaultSlotId;
  }
}

export class AdService {
  private static instance: AdService;
  public config: AdConfiguration;
  public mobile: MobileAdService;
  public web: WebAdService;

  private constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.mobile = new MobileAdService(this.config.adMobBannerId, this.config.adMobInterstitialId);
    this.web = new WebAdService(this.config.adSenseClientId, this.config.adSenseSlotId);
  }

  public static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  public updateConfig(newConfig: Partial<AdConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
    this.mobile = new MobileAdService(this.config.adMobBannerId, this.config.adMobInterstitialId);
    this.web = new WebAdService(this.config.adSenseClientId, this.config.adSenseSlotId);
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }
}

export const adService = AdService.getInstance();
