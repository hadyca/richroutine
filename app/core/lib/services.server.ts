import YahooFinance from "yahoo-finance2";

export async function getMarketData() {
  const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
  const indexSymbols: Record<string, string> = {
    "^GSPC": "S&P 500",
    "^IXIC": "Nasdaq",
    "^DJI": "Dow Jones",
    "^KS11": "KOSPI",
    "^KQ11": "KOSDAQ",
    "BTC-USD": "Bitcoin",
    "GC=F": "Gold",
    "KRW=X": "USD/KRW",
    "DX-Y.NYB": "Dollar Idx",
    "CL=F": "Crude Oil",
  };

  const marketData = await Promise.all(
    Object.keys(indexSymbols).map(async (symbol) => {
      try {
        const quote = await yahooFinance.quote(symbol);
        return {
          symbol,
          name: indexSymbols[symbol],
          price: quote.regularMarketPrice ?? 0,
          changePercent: quote.regularMarketChangePercent ?? 0,
        };
      } catch (e) {
        return null;
      }
    }),
  );

  return marketData.filter((d) => d !== null);
}
