import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY! });

export async function GET() {
  // Fetch latest portfolio from Notion
  const portfolioRes = await notion.databases.query({
    database_id: 'ec71fec4a3144254b2a5ad92f81816a2',
    sorts: [{ property: 'Date', direction: 'descending' }],
    page_size: 1,
  });

  const latest = portfolioRes.results[0]?.properties || {};

  // Fetch TSLA data (server-side - reliable)
  const tslaRes = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/TSLA?interval=1d&range=1mo');
  const tslaData = await tslaRes.json();
  
  const result = tslaData.chart.result[0];
  const prices = result.indicators.quote[0].close;
  const currentPrice = result.meta.regularMarketPrice;
  
  const today = prices[prices.length - 1];
  const sevenDaysAgo = prices[prices.length - 8] || prices[0];
  const change7d = ((today - sevenDaysAgo) / sevenDaysAgo * 100);

  return NextResponse.json({
    tsla: {
      price: currentPrice,
      change7d: change7d.toFixed(1),
    },
    portfolio: {
      eric: latest.Eric?.number || 0,
      bridget: latest.Bridget?.number || 0,
      jensen: latest.Jensen?.number || 0,
      taylor: latest.Taylor?.number || 0,
      total: latest.Total?.number || 0,
      date: latest.Date?.date?.start || '',
    },
  });
}
