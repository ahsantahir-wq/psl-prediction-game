'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import MatchCard from '@/app/components/MatchCard';
import Navigation from '@/app/components/Navigation';
import { Match } from '@/types';

const MATCHES_PER_PAGE = 5;

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    loadUserAndMatches();
  }, []);

  async function loadUserAndMatches(loadMore = false) {
    try {
      if (loadMore) setLoadingMore(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      // Calculate offset for pagination
      const currentOffset = loadMore ? offset : 0;

      // Load live matches with pagination
      const { data: matchesData, error, count } = await supabase
        .from('matches')
        .select('*', { count: 'exact' })
        .eq('status', 'live')
        .order('match_date', { ascending: true })
        .range(currentOffset, currentOffset + MATCHES_PER_PAGE - 1);

      if (error) {
        console.error('Error loading matches:', error);
        return;
      }

      // Load user favorites
      const { data: favoritesData } = await supabase
        .from('user_favorites')
        .select('match_id')
        .eq('user_id', user.id);

      if (matchesData) {
        if (loadMore) {
          setMatches(prev => [...prev, ...matchesData]);
          setOffset(prev => prev + MATCHES_PER_PAGE);
        } else {
          setMatches(matchesData);
          setOffset(MATCHES_PER_PAGE);
        }
        
        // Check if there are more matches
        setHasMore(matchesData.length === MATCHES_PER_PAGE && (count || 0) > currentOffset + MATCHES_PER_PAGE);
      }
      
      if (favoritesData) {
        setFavorites(new Set(favoritesData.map(f => f.match_id)));
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function toggleFavorite(matchId: string) {
    if (!userId) {
      console.error('No user ID');
      return;
    }

    try {
      if (favorites.has(matchId)) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('match_id', matchId);
        
        if (error) {
          console.error('Error removing favorite:', error);
          alert(`Failed to remove favorite: ${error.message}`);
          return;
        }
        
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(matchId);
          return next;
        });
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({ user_id: userId, match_id: matchId });
        
        if (error) {
          console.error('Error adding favorite:', error);
          alert(`Failed to add favorite: ${error.message}`);
          return;
        }
        
        setFavorites(prev => new Set([...prev, matchId]));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          All Live Matches
        </h1>

        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No live matches at the moment.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {matches.map((match) => (
                <div key={match.id} className="relative">
                  <MatchCard match={match} />
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(match.id)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
                    title={favorites.has(match.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {favorites.has(match.id) ? (
                      <span className="text-2xl">⭐</span>
                    ) : (
                      <span className="text-2xl text-gray-400">☆</span>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => loadUserAndMatches(true)}
                  disabled={loadingMore}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingMore ? 'Loading...' : 'Load More Matches'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
