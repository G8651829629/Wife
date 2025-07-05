import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Search } from 'lucide-react';

interface YouTubePlayerProps {
  onMusicStateChange: (isPlaying: boolean) => void;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
}

export default function YouTubePlayer({ onMusicStateChange }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Demo playlist
  const demoPlaylist: Song[] = [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Never Gonna Give You Up',
      artist: 'Rick Astley',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      duration: '3:33'
    },
    {
      id: 'kJQP7kiw5Fk',
      title: 'Despacito',
      artist: 'Luis Fonsi ft. Daddy Yankee',
      thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
      duration: '4:42'
    },
    {
      id: '9bZkp7q19f0',
      title: 'Gangnam Style',
      artist: 'PSY',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg',
      duration: '4:13'
    }
  ];

  useEffect(() => {
    setPlaylist(demoPlaylist);
    setCurrentSong(demoPlaylist[0]);
  }, []);

  useEffect(() => {
    onMusicStateChange(isPlaying);
  }, [isPlaying, onMusicStateChange]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    if (!currentSong || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentSong(playlist[nextIndex]);
  };

  const previousSong = () => {
    if (!currentSong || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentSong(playlist[prevIndex]);
  };

  const searchMusic = () => {
    // Demo search results
    const searchResults: Song[] = [
      {
        id: 'search1',
        title: searchQuery || 'Search Result 1',
        artist: 'Demo Artist',
        thumbnail: 'https://via.placeholder.com/120x90?text=Music',
        duration: '3:45'
      }
    ];
    
    setPlaylist([...playlist, ...searchResults]);
    setSearchQuery('');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Music Player</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search music..."
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <button
            onClick={searchMusic}
            className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Current Song Display */}
      {currentSong && (
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <img
            src={currentSong.thumbnail}
            alt={currentSong.title}
            className="w-16 h-12 object-cover rounded"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-800 truncate">{currentSong.title}</h4>
            <p className="text-sm text-gray-600 truncate">{currentSong.artist}</p>
          </div>
          <span className="text-sm text-gray-500">{currentSong.duration}</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={previousSong}
          className="p-2 text-gray-600 hover:text-pink-500 transition-colors"
        >
          <SkipBack size={24} />
        </button>
        
        <button
          onClick={togglePlay}
          className="p-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        <button
          onClick={nextSong}
          className="p-2 text-gray-600 hover:text-pink-500 transition-colors"
        >
          <SkipForward size={24} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2">
        <Volume2 size={20} className="text-gray-600" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm text-gray-600 w-8">{volume}</span>
      </div>

      {/* Playlist */}
      <div className="max-h-48 overflow-y-auto">
        <h4 className="font-medium text-gray-800 mb-2">Playlist</h4>
        <div className="space-y-2">
          {playlist.map((song, index) => (
            <div
              key={`${song.id}-${index}`}
              onClick={() => setCurrentSong(song)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                currentSong?.id === song.id
                  ? 'bg-pink-100 border border-pink-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-10 h-8 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{song.title}</p>
                <p className="text-xs text-gray-600 truncate">{song.artist}</p>
              </div>
              <span className="text-xs text-gray-500">{song.duration}</span>
            </div>
          ))}
        </div>
      </div>

      {isPlaying && (
        <div className="text-center">
          <p className="text-sm text-pink-600 animate-pulse">
            🎵 Your wife is dancing to the music! 💃
          </p>
        </div>
      )}
    </div>
  );
}