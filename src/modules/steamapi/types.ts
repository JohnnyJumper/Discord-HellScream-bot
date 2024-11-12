export type SteamPopularResponse = {
  desc: string;
  items: {
    name: string;
    logo: string;
  }[];
};

export type SteamAppDataResponse = {
  [key: string]: {
    success: boolean;
    data: SteamAppData;
  };
};

export type UniqueTrendingGame = {
  about_the_game: string;
  categories: string;
  genres: string;
  detailed_description: string;
  release_date: string;
  name: string;
  header_image: string;
  price_formatted: string | null;
  initial_formatted: string | null;
  authors: string;
  steam_link: string;
  screenshots: string;
  is_free: boolean;
};

export interface SteamAppData {
  type: string;
  name: string;
  steam_appid: number;
  is_free: boolean;
  detailed_description: string;
  about_the_game: string;
  short_description: string;
  supported_languages: string;
  developers: string[];
  publishers: string[];
  header_image: string;
  price_overview?: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
    initial_formatted: string;
    final_formatted: string;
  };
  screenshots: {
    id: number;
    path_thumbnail: string;
    path_full: string;
  }[];
  categories: {
    id: number;
    description: string;
  }[];
  genres: {
    id: string;
    description: string;
  }[];
  movies: {
    id: number;
    name: string;
    thumbnail: string;
    webm: {
      '480': string;
      max: string;
    };
    mp4: {
      '480': string;
      max: string;
    };
    highlight: boolean;
  }[];
  recommendations: {
    total: number;
  };
  release_date: {
    coming_soon: boolean;
    date: string;
  };
}
