export interface SearchResult {
  service: string;
  searchUrl: string;
  description: string;
}

export interface TinEyeResult {
  totalMatches: number;
  matches: {
    url: string;
    domain: string;
    crawlDate: string;
    imageUrl: string;
  }[];
}

// Generate search URLs for manual searching (always free)
export const generateSearchUrls = (imageDataUrl: string): SearchResult[] => {
  return [
    {
      service: 'Google Lens',
      searchUrl: 'https://lens.google.com/',
      description: 'Best for identifying objects, people, and finding similar images.'
    },
    {
      service: 'TinEye',
      searchUrl: 'https://tineye.com/',
      description: 'Specializes in finding exact duplicates and modified copies.'
    },
    {
      service: 'Yandex Images',
      searchUrl: 'https://yandex.com/images/',
      description: 'Powerful facial recognition algorithms (good for social profiles).'
    },
    {
      service: 'Bing Visual Search',
      searchUrl: 'https://www.bing.com/visualsearch',
      description: 'Microsoft\'s search engine with solid face matching capabilities.'
    }
  ];
};

// If user has TinEye API key, perform actual search
export const searchTinEye = async (
  imageBase64: string, 
  apiKey: string
): Promise<TinEyeResult | null> => {
  if (!apiKey) return null;
  
  try {
    const response = await fetch('https://api.tineye.com/rest/search/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        api_key: apiKey,
        image_base64: imageBase64,
      }),
    });
    
    if (!response.ok) throw new Error('TinEye search failed');
    
    const data = await response.json();
    return {
      totalMatches: data.total_results || 0,
      matches: (data.matches || []).slice(0, 10).map((m: any) => ({
        url: m.backlinks?.[0]?.url || m.domain,
        domain: m.domain,
        crawlDate: m.crawl_date,
        imageUrl: m.image_url,
      })),
    };
  } catch (error) {
    console.error('TinEye search error:', error);
    return null;
  }
};