import type { Genre, Movie, PaginatedResponse } from '../types/tmdb';

const BASE_URL = 'https://api.themoviedb.org/3';

const getHeaders = () => {
    const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
    if (!token) {
        console.warn('VITE_TMDB_ACCESS_TOKEN is not defined in .env');
    }
    return {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

export const fetchGenres = async (): Promise<Genre[]> => {
    const response = await fetch(`${BASE_URL}/genre/movie/list?language=en`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch genres');
    const data = await response.json();
    return data.genres;
};

export interface FetchMoviesParams {
    page: number;
    primary_release_date_gte?: string;
    primary_release_date_lte?: string;
    with_genres?: string; // Comma-separated genre IDs
    with_cast?: string; // Comma-separated cast IDs
}

export const fetchMovies = async (params: FetchMoviesParams): Promise<PaginatedResponse<Movie>> => {
    const urlParams = new URLSearchParams({
        include_adult: 'false',
        include_video: 'false',
        language: 'en-US',
        page: params.page.toString(),
        sort_by: 'popularity.desc',
    });

    if (params.primary_release_date_gte) {
        urlParams.append('primary_release_date.gte', params.primary_release_date_gte);
    }
    if (params.primary_release_date_lte) {
        urlParams.append('primary_release_date.lte', params.primary_release_date_lte);
    }
    if (params.with_genres) {
        urlParams.append('with_genres', params.with_genres);
    }
    if (params.with_cast) {
        urlParams.append('with_cast', params.with_cast);
    }

    const response = await fetch(`${BASE_URL}/discover/movie?${urlParams.toString()}`, {
        headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch movies');
    return response.json();
};

export const fetchMovieDetails = async (movieId: number): Promise<Movie> => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?language=en-US&append_to_response=credits`, {
        headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch movie details');
    return response.json();
};
