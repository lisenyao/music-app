import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Repeat,
  Repeat1,
  Music,
  Heart,
  MoreHorizontal
} from 'lucide-react';

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  src: string;
  genre: string;
  year: number;
  cover: string;
}

type RepeatMode = 'off' | 'one' | 'all';

const MusicPlayer: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // 加载音乐数据
  useEffect(() => {
    const loadSongs = async () => {
      try {
        const response = await fetch('/music/music-data.json');
        const songsData = await response.json();
        setSongs(songsData);
        if (songsData.length > 0) {
          setCurrentSong(songsData[0]);
        }
      } catch (error) {
        console.error('加载音乐数据失败:', error);
      }
    };

    loadSongs();
  }, []);

  // 音频事件监听
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => handleNext();
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentSong]);

  // 播放/暂停
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 上一首
  const handlePrevious = () => {
    if (songs.length === 0) return;
    
    let newIndex;
    if (isShuffled) {
      newIndex = Math.floor(Math.random() * songs.length);
    } else {
      newIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    }
    setCurrentIndex(newIndex);
    setCurrentSong(songs[newIndex]);
  };

  // 下一首
  const handleNext = () => {
    if (songs.length === 0) return;

    let newIndex;
    if (repeatMode === 'one') {
      // 单曲循环
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    if (isShuffled) {
      newIndex = Math.floor(Math.random() * songs.length);
    } else if (currentIndex === songs.length - 1) {
      newIndex = repeatMode === 'all' ? 0 : currentIndex;
    } else {
      newIndex = currentIndex + 1;
    }
    
    setCurrentIndex(newIndex);
    setCurrentSong(songs[newIndex]);
  };

  // 切换随机播放
  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  // 切换循环模式
  const toggleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'one', 'all'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  // 进度条点击
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickTime = (clickX / width) * duration;
    
    audio.currentTime = clickTime;
    setCurrentTime(clickTime);
  };

  // 音量控制
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // 静音切换
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 选择歌曲
  const selectSong = (song: Song, index: number) => {
    setCurrentSong(song);
    setCurrentIndex(index);
  };

  // 进度百分比
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentSong) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <audio ref={audioRef} src={currentSong.src} preload="metadata" />
      
      {/* 主容器 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Music className="text-purple-400" size={40} />
              在线音乐播放器
            </h1>
            <p className="text-gray-300">享受高品质音乐体验</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 当前播放信息 */}
            <div className="lg:col-span-2">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                {/* 专辑封面 */}
                <div className="relative mb-8">
                  <div className="w-80 h-80 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                    <Music size={120} className="text-white/80" />
                  </div>
                  {isPlaying && (
                    <div className="absolute inset-0 rounded-2xl bg-purple-500/20 animate-pulse" />
                  )}
                </div>

                {/* 歌曲信息 */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">{currentSong.title}</h2>
                  <p className="text-xl text-gray-300 mb-1">{currentSong.artist}</p>
                  <p className="text-gray-400">{currentSong.album} • {currentSong.genre}</p>
                </div>

                {/* 进度条 */}
                <div className="mb-6">
                  <div 
                    ref={progressRef}
                    className="w-full h-2 bg-gray-700 rounded-full cursor-pointer group"
                    onClick={handleProgressClick}
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative group-hover:h-3 transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* 播放控制 */}
                <div className="flex items-center justify-center gap-6 mb-6">
                  {/* 随机播放 */}
                  <button
                    onClick={toggleShuffle}
                    className={`p-3 rounded-full transition-all ${
                      isShuffled 
                        ? 'bg-purple-500 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Shuffle size={20} />
                  </button>

                  {/* 上一首 */}
                  <button
                    onClick={handlePrevious}
                    className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  >
                    <SkipBack size={24} />
                  </button>

                  {/* 播放/暂停 */}
                  <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isPlaying ? (
                      <Pause size={24} />
                    ) : (
                      <Play size={24} />
                    )}
                  </button>

                  {/* 下一首 */}
                  <button
                    onClick={handleNext}
                    className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  >
                    <SkipForward size={24} />
                  </button>

                  {/* 循环模式 */}
                  <button
                    onClick={toggleRepeat}
                    className={`p-3 rounded-full transition-all ${
                      repeatMode !== 'off' 
                        ? 'bg-purple-500 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                  </button>
                </div>

                {/* 音量控制 */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleMute}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8b5cf6 0%, #ec4899 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-10">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 播放列表 */}
            <div className="lg:col-span-1">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10 h-fit">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Music size={20} />
                  播放列表
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {songs.map((song, index) => (
                    <div
                      key={song.id}
                      onClick={() => selectSong(song, index)}
                      className={`p-3 rounded-lg cursor-pointer transition-all group ${
                        currentSong.id === song.id
                          ? 'bg-purple-500/30 border border-purple-400'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Music size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium truncate ${
                            currentSong.id === song.id ? 'text-white' : 'text-gray-200'
                          }`}>
                            {song.title}
                          </h4>
                          <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                          <p className="text-xs text-gray-500">{song.duration}</p>
                        </div>
                        {currentSong.id === song.id && isPlaying && (
                          <div className="flex gap-1">
                            <div className="w-1 h-4 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '0ms' }} />
                            <div className="w-1 h-4 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
                            <div className="w-1 h-4 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '300ms' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;