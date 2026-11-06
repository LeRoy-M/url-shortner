export interface URLRecord {
  id: number;
  original_url: string;
  short_code: string;
  short_url: string;
  clicks: number;
  created_at: string;
}

export interface URLListResponse {
  urls: URLRecord[];
  total: number;
}
