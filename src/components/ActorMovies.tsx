import React, { useState, useEffect, useCallback } from 'react';
import type { Movie } from '../types/tmdb';
import { fetchMovies } from '../api/tmdb';
import { MovieGrid } from './MovieGrid';
import { ArrowLeft } from 'lucide-react';
import './ActorMovies.css';

interface ActorMoviesProps {
    actorId: number;
    actorName: string;
    onBack: () => void;
    onMovieClick: (movie: Movie) => void;
}

export const ActorMovies: React.FC<ActorMoviesProps> = ({ actorId, actorName, onBack, onMovieClick }) => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const currentFetchId = React.useRef(0);

    const loadMovies = useCallback(async (reset: boolean = false) => {
        const fetchId = ++currentFetchId.current;
        try {
            setIsLoading(true);
            const currentPage = reset ? 1 : page;

            const response = await fetchMovies({
                page: currentPage,
                with_cast: actorId.toString()
            });

            if (fetchId !== currentFetchId.current) return;

            if (reset) {
                setMovies(response.results);
            } else {
                setMovies((prev) => {
                    const newMovies = response.results.filter(
                        (rm) => !prev.some((pm) => pm.id === rm.id)
                    );
                    return [...prev, ...newMovies];
                });
            }

            setHasMore(response.page < response.total_pages && response.page < 10);
            if (reset) setPage(2);
            else setPage((p) => p + 1);
        } catch (err) {
            console.error('Failed to load actor movies:', err);
        } finally {
            if (fetchId === currentFetchId.current) {
                setIsLoading(false);
            }
        }
    }, [page, actorId]);

    useEffect(() => {
        setMovies([]);
        currentFetchId.current++;
        loadMovies(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actorId]);

    const handleScroll = useCallback(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            if (!isLoading && hasMore) {
                loadMovies(false);
            }
        }
    }, [isLoading, hasMore, loadMovies]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return (
        <div className="actor-movies-container">
            <header className="app-header actor-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={24} />
                    <span>Back to Search</span>
                </button>
                <h1>Movies with {actorName}</h1>
                <p>Discover the filmography of {actorName}</p>
            </header>

            <main>
                <MovieGrid
                    movies={movies}
                    onMovieClick={onMovieClick}
                    isLoading={isLoading}
                />
                {isLoading && movies.length > 0 && (
                    <div className="loading-more">Loading more movies...</div>
                )}
            </main>
        </div>
    );
};
