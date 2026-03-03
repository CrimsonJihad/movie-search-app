import React, { useEffect, useState } from 'react';
import type { Movie } from '../types/tmdb';
import { fetchMovieDetails } from '../api/tmdb';
import { X, Film, Globe, Users, DollarSign, Activity, Star } from 'lucide-react';
import './MovieModal.css';

interface MovieModalProps {
    movie: Movie;
    onClose: () => void;
}

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const PROFILE_BASE_URL = 'https://image.tmdb.org/t/p/w185';

export const MovieModal: React.FC<MovieModalProps> = ({ movie, onClose }) => {
    const [detailedMovie, setDetailedMovie] = useState<Movie>(movie);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);

        setIsLoadingDetails(true);
        fetchMovieDetails(movie.id)
            .then(data => setDetailedMovie(data))
            .catch(err => console.error("Failed to load details", err))
            .finally(() => setIsLoadingDetails(false));

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [movie.id, onClose]);

    const posterUrl = detailedMovie.poster_path
        ? `${POSTER_BASE_URL}${detailedMovie.poster_path}`
        : `https://via.placeholder.com/500x750/27272a/ffffff?text=No+Poster+Found`;

    const handleWatchClick = () => {
        const query = encodeURIComponent(`where to watch ${detailedMovie.title}`);
        window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
    };

    const formatCurrency = (val?: number) => val && val > 0 ? `$${val.toLocaleString()}` : 'Unknown';

    const getDirector = () => {
        if (!detailedMovie.credits?.crew) return null;
        return detailedMovie.credits.crew.find(c => c.job === 'Director')?.name;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose} aria-label="Close Movie Details">
                    <X size={24} />
                </button>

                <div className="modal-body">
                    {/* Left Column: Poster & Quick Actions */}
                    <div className="modal-left">
                        <div className="modal-poster-wrapper">
                            <img src={posterUrl} alt={detailedMovie.title} className="modal-poster" />
                            {detailedMovie.adult && <div className="adult-badge">18+</div>}
                        </div>

                        <div className="modal-actions">
                            <button className="watch-button" onClick={handleWatchClick}>
                                <Film size={18} /> Where to watch
                            </button>
                            {detailedMovie.homepage && (
                                <a href={detailedMovie.homepage} target="_blank" rel="noreferrer" className="action-link">
                                    <Globe size={18} /> Official Website
                                </a>
                            )}
                            {detailedMovie.imdb_id && (
                                <a href={`https://www.imdb.com/title/${detailedMovie.imdb_id}`} target="_blank" rel="noreferrer" className="action-link imdb">
                                    IMDb
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Comprehensive Details */}
                    <div className="modal-info">
                        <div className="modal-header">
                            <h2 className="modal-title">{detailedMovie.title}</h2>
                            {detailedMovie.tagline && <p className="modal-tagline">"{detailedMovie.tagline}"</p>}
                        </div>

                        <div className="modal-meta-row">
                            <span className="modal-rating"><Star size={16} /> {detailedMovie.vote_average.toFixed(1)}</span>
                            {detailedMovie.status && <span className={`status-badge ${detailedMovie.status.toLowerCase()}`}>{detailedMovie.status}</span>}
                            <span className="modal-meta-item">{detailedMovie.release_date ? new Date(detailedMovie.release_date).getFullYear() : 'Unknown'}</span>
                            {detailedMovie.runtime ? <span className="modal-meta-item">{detailedMovie.runtime} min</span> : null}
                        </div>

                        {detailedMovie.genres && detailedMovie.genres.length > 0 && (
                            <div className="modal-genres">
                                {detailedMovie.genres.map(g => (
                                    <span key={g.id} className="detail-genre-pill">{g.name}</span>
                                ))}
                            </div>
                        )}

                        <div className="modal-section">
                            <h3>Overview</h3>
                            {isLoadingDetails ? (
                                <p className="loading-pulse">Loading full details...</p>
                            ) : (
                                <p className="modal-overview">{detailedMovie.overview || 'No overview available.'}</p>
                            )}
                        </div>

                        {/* Credits Section */}
                        {detailedMovie.credits && detailedMovie.credits.cast.length > 0 && (
                            <div className="modal-section">
                                <h3>Top Cast</h3>
                                <div className="cast-list">
                                    {detailedMovie.credits.cast.slice(0, 8).map(actor => (
                                        <div key={actor.id} className="cast-card">
                                            {actor.profile_path ? (
                                                <img src={`${PROFILE_BASE_URL}${actor.profile_path}`} alt={actor.name} className="cast-image" />
                                            ) : (
                                                <div className="cast-image-placeholder"><Users size={24} /></div>
                                            )}
                                            <div className="cast-info">
                                                <div className="cast-name">{actor.name}</div>
                                                <div className="cast-character">{actor.character}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Production & Stats Grid */}
                        <div className="modal-section details-grid">
                            <div className="detail-box">
                                <DollarSign size={18} className="detail-icon" />
                                <div>
                                    <div className="detail-label">Budget</div>
                                    <div className="detail-value">{formatCurrency(detailedMovie.budget)}</div>
                                </div>
                            </div>
                            <div className="detail-box">
                                <Activity size={18} className="detail-icon" />
                                <div>
                                    <div className="detail-label">Revenue</div>
                                    <div className="detail-value">{formatCurrency(detailedMovie.revenue)}</div>
                                </div>
                            </div>
                            {getDirector() && (
                                <div className="detail-box full-width">
                                    <Users size={18} className="detail-icon" />
                                    <div>
                                        <div className="detail-label">Director</div>
                                        <div className="detail-value">{getDirector()}</div>
                                    </div>
                                </div>
                            )}
                            {detailedMovie.production_companies && detailedMovie.production_companies.length > 0 && (
                                <div className="detail-box full-width">
                                    <Globe size={18} className="detail-icon" />
                                    <div>
                                        <div className="detail-label">Production</div>
                                        <div className="detail-value">
                                            {detailedMovie.production_companies.map(c => c.name).join(', ')}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {detailedMovie.spoken_languages && detailedMovie.spoken_languages.length > 0 && (
                                <div className="detail-box full-width">
                                    <div className="detail-label">Languages</div>
                                    <div className="detail-value">
                                        {detailedMovie.spoken_languages.map(l => l.english_name).join(', ')}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
