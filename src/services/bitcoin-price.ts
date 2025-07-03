export class BitcoinPriceService {
  private static instance: BitcoinPriceService;
  private currentPrice: number = 67000;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  static getInstance(): BitcoinPriceService {
    if (!BitcoinPriceService.instance) {
      BitcoinPriceService.instance = new BitcoinPriceService();
    }
    return BitcoinPriceService.instance;
  }

  async getCurrentPrice(): Promise<number> {
    const now = Date.now();
    
    // Return cached price if still valid
    if (now - this.lastFetch < this.CACHE_DURATION) {
      return this.currentPrice;
    }

    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.bitcoin && data.bitcoin.usd) {
        this.currentPrice = data.bitcoin.usd;
        this.lastFetch = now;
      }
      
      return this.currentPrice;
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      // Return cached price on error
      return this.currentPrice;
    }
  }

  // Subscribe to price updates
  subscribeToUpdates(callback: (price: number) => void): () => void {
    const interval = setInterval(async () => {
      const price = await this.getCurrentPrice();
      callback(price);
    }, 60000); // Update every minute

    // Initial call
    this.getCurrentPrice().then(callback);

    // Return unsubscribe function
    return () => clearInterval(interval);
  }
}

export const bitcoinPriceService = BitcoinPriceService.getInstance();