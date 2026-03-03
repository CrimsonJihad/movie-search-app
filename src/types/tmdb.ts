export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  genre_ids: number[];
  overview: string;
  vote_average: number;
  runtime?: number;
  budget?: number;
  tagline?: string;
  status?: string;
  genres?: Genre[];
  revenue?: number;
  spoken_languages?: SpokenLanguage[];
  production_companies?: ProductionCompany[];
  production_countries?: ProductionCountry[];
  homepage?: string;
  imdb_id?: string;
  popularity?: number;
  vote_count?: number;
  adult?: boolean;
  credits?: Credits;
}

export interface Genre {
  id: number;
  name: string;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
