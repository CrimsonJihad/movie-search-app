import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { MovieGrid } from './components/MovieGrid';
import { FilterPanel } from './components/FilterPanel';
import { MovieModal } from './components/MovieModal';
import { PersonMovies } from './components/PersonMovies';
import { fetchGenres, fetchMovies } from './api/tmdb';
import type { Genre, Movie } from './types/tmdb';
import './App.css';

type ViewState =
  | { type: 'search' }
  | { type: 'person'; personId: number; personName: string; role: 'actor' | 'director' };

function App() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([1960, 2026]);

  // Debounce the filter values
  const [debouncedYearRange] = useDebounce(yearRange, 500);
  const [debouncedSelectedGenres] = useDebounce(selectedGenres, 500);

  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [viewState, setViewState] = useState<ViewState>({ type: 'search' });
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Load genres on mount
  useEffect(() => {
    fetchGenres()
      .then(setGenres)
      .catch((err) => console.error('Failed to load genres:', err));
  }, []);

  const currentFetchId = React.useRef(0);

  // Fetch movies when filters or page changes
  const loadMovies = useCallback(async (reset: boolean = false) => {
    const fetchId = ++currentFetchId.current;
    try {
      setIsLoading(true);
      const currentPage = reset ? 1 : page;

      const response = await fetchMovies({
        page: currentPage,
        primary_release_date_gte: `${debouncedYearRange[0]}-01-01`,
        primary_release_date_lte: `${debouncedYearRange[1]}-12-31`,
        with_genres: debouncedSelectedGenres.length > 0 ? debouncedSelectedGenres.join(',') : undefined,
      });

      // Ignore if a newer request has been made
      if (fetchId !== currentFetchId.current) return;

      if (reset) {
        setMovies(response.results);
      } else {
        setMovies((prev) => {
          // Prevent duplicate items if same page fetched twice
          const newMovies = response.results.filter(
            (rm) => !prev.some((pm) => pm.id === rm.id)
          );
          return [...prev, ...newMovies];
        });
      }

      setHasMore(response.page < response.total_pages && response.page < 15);
      if (reset) setPage(2);
      else setPage((p) => p + 1);
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      if (fetchId === currentFetchId.current) {
        setIsLoading(false);
      }
    }
  }, [page, debouncedYearRange, debouncedSelectedGenres]);

  useEffect(() => {
    setMovies([]); // Clear UI immediately so old movies disappear and scroll rests
    currentFetchId.current++; // Invalidate pending fetches
    loadMovies(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedYearRange, debouncedSelectedGenres]);

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      if (!isLoading && hasMore) {
        loadMovies(false);
      }
    }
  }, [isLoading, hasMore, loadMovies]);

  // Infinite scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="app-container">
      <main>
        {viewState.type === 'search' ? (
          <>
            <header className="app-header">
              <h1>Movie Discovery</h1>
              <p>Find your next favorite film, filtering by year and genre.</p>
            </header>
            <MovieGrid
              movies={movies}
              onMovieClick={setSelectedMovie}
              isLoading={isLoading}
            />
            {isLoading && movies.length > 0 && (
              <div className="loading-more">Loading more movies...</div>
            )}
          </>
        ) : (
          <PersonMovies
            personId={viewState.personId}
            personName={viewState.personName}
            role={viewState.role}
            onBack={() => setViewState({ type: 'search' })}
            onMovieClick={setSelectedMovie}
          />
        )}
      </main>

      {viewState.type === 'search' && (
        <FilterPanel
          genres={genres}
          selectedGenres={selectedGenres}
          onGenreToggle={handleGenreToggle}
          yearRange={yearRange}
          onYearRangeChange={setYearRange}
        />
      )}

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onPersonClick={(personId, personName, role) => {
            setSelectedMovie(null);
            setViewState({ type: 'person', personId, personName, role });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}

export default App;
