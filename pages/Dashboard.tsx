import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PlayCircle, Clock, BookOpen, Search, Bell, ChevronRight, CheckCircle, Heart, Settings, X, User as UserIcon, Camera, LayoutGrid, ArrowLeft, Play, FileText, Download, Check, Upload, ListMusic, ChevronDown, LogOut, Bot, Sparkles, Menu } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { VideoLesson, ModuleResource } from '../types';
import AIAssistant from '../components/AIAssistant';

interface ModuleData {
  name: string;
  videos: VideoLesson[];
  count: number;
  completedCount: number;
  progress: number;
  thumbnail: string;
  description: string;
}

interface SidebarContentProps {
  handleBackToModules: () => void;
  sidebarTab: 'videos' | 'resources';
  setSidebarTab: (tab: 'videos' | 'resources') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sidebarGroupedVideos: Record<string, VideoLesson[]>;
  completedVideoIds: string[];
  activeVideoId: string | undefined;
  setActiveVideoId: (id: string) => void;
  filteredResources: ModuleResource[];
  isMobile?: boolean;
}

const Dashboard: React.FC = () => {
  const { user, videos, resources, plans, completedVideoIds, toggleVideoCompletion, favoriteVideoIds, toggleVideoFavorite, updateUserProfile, markNotificationAsRead, requestNotificationPermission, modulesMetadata, logout } = useApp();
  const navigate = useNavigate();
  
  // State for Navigation
  const [viewMode, setViewMode] = useState<'modules' | 'player' | 'ai'>('modules');
  const [activeVideoId, setActiveVideoId] = useState<string | undefined>(undefined);
  const [activeModuleFilter, setActiveModuleFilter] = useState<string | null>(null); // For sidebar filtering
  const [searchTerm, setSearchTerm] = useState('');
  
  // Playlist State
  const [expandedModulePlaylist, setExpandedModulePlaylist] = useState<string | null>(null);
  
  // Mobile Playlist State
  const [isMobilePlaylistOpen, setIsMobilePlaylistOpen] = useState(false);

  // Sidebar State (Videos vs Resources)
  const [sidebarTab, setSidebarTab] = useState<'videos' | 'resources'>('videos');
  
  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // --- ACCESS LOGIC ---
  const accessibleVideos = useMemo(() => {
    if (!user) return [];
    if (user.role !== 'member') return videos;

    const userPlan = plans.find(p => p.id === user.planId);
    const planModules = userPlan?.allowedModules || [];
    const userSpecificModules = user.allowedModules || [];
    const allAllowedModules = new Set([...planModules, ...userSpecificModules]);

    if (allAllowedModules.size === 0) return [];

    return videos.filter(v => allAllowedModules.has(v.module));
  }, [videos, user, plans]);

  // --- MODULE AGGREGATION ---
  const modulesData = useMemo<ModuleData[]>(() => {
    const groups: Record<string, VideoLesson[]> = {};
    accessibleVideos.forEach(video => {
      if (!groups[video.module]) groups[video.module] = [];
      groups[video.module].push(video);
    });

    return Object.entries(groups).map(([name, vids]) => {
      const completedCount = vids.filter(v => completedVideoIds.includes(v.id)).length;
      const progress = Math.round((completedCount / vids.length) * 100);
      
      // Derive metadata from context (custom) OR first video of module (fallback)
      const firstVideo = vids[0];
      const metadata = modulesMetadata.find(m => m.name === name);
      
      return {
        name,
        videos: vids,
        count: vids.length,
        completedCount,
        progress,
        thumbnail: metadata?.thumbnail || firstVideo.thumbnail,
        description: metadata?.description || `Domine ${name} com ${vids.length} aulas exclusivas.`
      };
    });
  }, [accessibleVideos, completedVideoIds, modulesMetadata]);

  // --- FILTERED VIDEOS (FOR SEARCH) ---
  const filteredVideos = useMemo(() => {
    let result = accessibleVideos;
    
    // Filter by module if in player mode and filter is set (usually active module)
    if (activeModuleFilter) {
      result = result.filter(v => v.module === activeModuleFilter);
    }

    // Filter by search
    if (searchTerm) {
      result = result.filter(v => 
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.module.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [accessibleVideos, searchTerm, activeModuleFilter]);

  // --- FILTERED RESOURCES ---
  const filteredResources = useMemo(() => {
      if (!activeModuleFilter) return [];
      return resources.filter(r => r.module === activeModuleFilter);
  }, [resources, activeModuleFilter]);

  // --- NAVIGATION HANDLERS ---
  const handleModuleClick = (moduleName: string) => {
    const module = modulesData.find(m => m.name === moduleName);
    if (!module) return;

    setActiveModuleFilter(moduleName);
    setSidebarTab('videos'); // Reset to videos tab
    
    // Resume logic: Find first uncompleted video, or default to first
    const firstUncompleted = module.videos.find(v => !completedVideoIds.includes(v.id));
    setActiveVideoId(firstUncompleted ? firstUncompleted.id : module.videos[0].id);
    
    setViewMode('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaySpecificLesson = (moduleName: string, videoId: string) => {
      setActiveModuleFilter(moduleName);
      setSidebarTab('videos');
      setActiveVideoId(videoId);
      setViewMode('player');
      setIsMobilePlaylistOpen(false); // Close mobile menu if open
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToModules = () => {
    setViewMode('modules');
    setActiveModuleFilter(null);
    setSearchTerm('');
  };

  const togglePlaylistModule = (moduleName: string) => {
      setExpandedModulePlaylist(expandedModulePlaylist === moduleName ? null : moduleName);
  };

  // Group filtered videos by module for the sidebar
  const sidebarGroupedVideos = useMemo(() => {
    const groups: Record<string, VideoLesson[]> = {};
    filteredVideos.forEach(video => {
      if (!groups[video.module]) groups[video.module] = [];
      groups[video.module].push(video);
    });
    return groups;
  }, [filteredVideos]);

  // Handle Profile Update with File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfileAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(profileName, profileAvatar);
    setIsProfileModalOpen(false);
  };

  const handleLogout = async () => {
      await logout();
      navigate('/login');
  };

  if (!user) return <Navigate to="/login" replace />;
  if (user.status === 'pending') {
      return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md text-center">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="text-amber-500" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Aguardando Aprovação</h2>
                  <p className="text-slate-400 mb-6">
                      Sua conta foi criada, mas o acesso à área de membros ainda não foi aprovado pelo administrador. 
                      Verifique se o pagamento foi concluído e aguarde.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => navigate('/')} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors">
                        Voltar a página inicial
                    </button>
                    <button onClick={handleLogout} className="w-full py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                        <LogOut size={16} /> Sair da conta
                    </button>
                  </div>
              </div>
          </div>
      );
  }

  const activeVideo = videos.find(v => v.id === activeVideoId);
  const isCompleted = activeVideo ? completedVideoIds.includes(activeVideo.id) : false;
  const isFavorite = activeVideo ? favoriteVideoIds.includes(activeVideo.id) : false;
  const userPlanName = plans.find(p => p.id === user.planId)?.name || 'Plano Básico';
  const unreadNotifications = user.notifications?.filter(n => !n.read).length || 0;

  const isEmbed = (url: string) => {
    return url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo') || url.includes('embed');
  };

  return (
    <div className="min-h-screen bg-black pt-24 relative overflow-hidden">
      
      {/* BACKGROUND IMAGE - Fixed for Dashboard */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <img 
            src="https://i.ibb.co/0y04kDk1/Whisk-b3242647bfe5403b0614d6233e6f09d5dr.jpg" 
            alt="Dashboard Background" 
            className="w-full h-full object-cover opacity-20" 
         />
         {/* Dark overlay specifically for content readability */}
         <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black"></div>
      </div>

      <div className="relative z-10">
      
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Bem-vindo, <span className="text-red-600">{user.name.split(' ')[0]}</span>.
                    </h1>
                    <p className="text-slate-400">Continue sua jornada rumo à consistência.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Botão AI Assistant Switcher */}
                    <button 
                        onClick={() => setViewMode(viewMode === 'ai' ? 'modules' : 'ai')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${viewMode === 'ai' ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-600'}`}
                    >
                        {viewMode === 'ai' ? <Sparkles size={18} /> : <Bot size={18} />}
                        <span className="font-bold text-xs uppercase tracking-wide">FXBROS AI</span>
                    </button>

                    <div className="relative group w-full md:w-48 hidden md:block">
                        <Search className="absolute left-3 top-3 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); if(e.target.value && viewMode !== 'ai') setViewMode('player'); }} 
                            className="w-full bg-slate-900 border border-slate-800 rounded-full py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-red-600 transition-all placeholder-slate-600"
                        />
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-red-600 transition-colors relative"
                        >
                            <Bell size={18} className="text-slate-400" />
                            {unreadNotifications > 0 && (
                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full border-2 border-black animate-pulse"></span>
                            )}
                        </button>
                        
                        {isNotificationsOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                                    <h3 className="font-bold text-white text-sm">Notificações</h3>
                                    <button onClick={() => setIsNotificationsOpen(false)}><X size={16} className="text-slate-500" /></button>
                                </div>
                                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                    {user.notifications && user.notifications.length > 0 ? (
                                        user.notifications.map(notif => (
                                            <div 
                                                key={notif.id} 
                                                onClick={() => {
                                                    if(!notif.read) markNotificationAsRead(user.id, notif.id);
                                                }}
                                                className={`p-4 border-b border-slate-900 hover:bg-slate-900 cursor-pointer transition-colors ${!notif.read ? 'bg-red-900/10 border-l-2 border-red-500' : ''}`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-xs font-bold ${!notif.read ? 'text-white' : 'text-slate-400'}`}>{notif.title}</h4>
                                                    {!notif.read && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                                                </div>
                                                <p className="text-xs text-slate-500 leading-snug">{notif.message}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-500 text-xs">
                                            Nenhuma notificação recente.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
                        <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-slate-800 hover:border-red-600 transition-colors object-cover" alt="Profile" />
                        <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1">
                            <Settings size={12} className="text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

      {/* --- AI ASSISTANT VIEW --- */}
      {viewMode === 'ai' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 animation-fade-in">
              <AIAssistant />
          </div>
      )}

      {/* --- MODULES GRID VIEW --- */}
      {viewMode === 'modules' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
             <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Aulas Concluídas</p>
                <p className="text-3xl font-bold text-white">{completedVideoIds.length}</p>
             </div>
             <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Módulos Ativos</p>
                <p className="text-3xl font-bold text-white">{modulesData.length}</p>
             </div>
             <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Plano Atual</p>
                <p className="text-xl font-bold text-red-500 truncate">{userPlanName}</p>
             </div>
             <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Progresso Geral</p>
                <p className="text-3xl font-bold text-white">
                  {accessibleVideos.length > 0 ? Math.round((completedVideoIds.length / accessibleVideos.length) * 100) : 0}%
                </p>
             </div>
          </div>

          {/* --- SMART PLAYLIST SECTION --- */}
          <div className="mb-16">
             <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ListMusic size={20} className="text-red-600" /> Playlist Inteligente
             </h2>
             <div className="space-y-4">
                {modulesData.map((module) => (
                    <div key={module.name} className="bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden transition-all">
                        {/* Module Header */}
                        <div 
                            className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-slate-900/50 transition-colors gap-4"
                            onClick={() => togglePlaylistModule(module.name)}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${module.progress === 100 ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-400'}`}>
                                    {module.progress === 100 ? <CheckCircle size={20} /> : <BookOpen size={20} />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white text-sm md:text-base">{module.name}</h3>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <div className="h-1.5 w-full max-w-[150px] bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${module.progress === 100 ? 'bg-green-500' : 'bg-red-600'}`} 
                                                style={{ width: `${module.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-xs font-medium ${module.progress === 100 ? 'text-green-500' : 'text-slate-500'}`}>
                                            {module.progress}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                                <span className="text-xs text-slate-500">{module.videos.length} aulas</span>
                                <ChevronDown className={`text-slate-500 transition-transform duration-300 ${expandedModulePlaylist === module.name ? 'rotate-180' : ''}`} size={20} />
                            </div>
                        </div>

                        {/* Lessons List */}
                        {expandedModulePlaylist === module.name && (
                            <div className="border-t border-slate-900 bg-black/20 divide-y divide-slate-900">
                                {module.videos.map((video) => {
                                    const isFav = favoriteVideoIds.includes(video.id);
                                    const isDone = completedVideoIds.includes(video.id);
                                    
                                    return (
                                        <div key={video.id} className="p-4 pl-6 md:pl-16 flex items-center gap-4 group hover:bg-slate-900/30 transition-colors">
                                            <button 
                                                onClick={() => handlePlaySpecificLesson(module.name, video.id)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isDone ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-red-600 group-hover:text-white'}`}
                                            >
                                                {isDone ? <Check size={14} /> : <Play size={12} fill="currentColor" />}
                                            </button>
                                            
                                            <div 
                                                className="flex-1 cursor-pointer"
                                                onClick={() => handlePlaySpecificLesson(module.name, video.id)}
                                            >
                                                <h4 className={`text-sm font-medium transition-colors ${isDone ? 'text-slate-500 line-through' : 'text-slate-300 group-hover:text-white'}`}>
                                                    {video.title}
                                                </h4>
                                                <span className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                                                    <Clock size={10} /> {video.duration}
                                                </span>
                                            </div>

                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleVideoFavorite(video.id); }}
                                                className={`p-2 rounded-full transition-colors ${isFav ? 'text-red-500' : 'text-slate-600 hover:text-red-500'}`}
                                                title="Favoritar"
                                            >
                                                <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
             </div>
          </div>

          {/* Modules Grid */}
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
             <LayoutGrid size={20} className="text-slate-400" /> Grade de Módulos
          </h2>
          
          {modulesData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {modulesData.map((module) => (
                <div 
                  key={module.name}
                  onClick={() => handleModuleClick(module.name)}
                  className="group relative bg-slate-950/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-red-600/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-red-900/10 flex flex-col h-full"
                >
                  {/* Cover Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={module.thumbnail} 
                      alt={module.name} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                       <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-500 transition-colors">{module.name}</h3>
                       <div className="flex items-center gap-3 text-xs text-slate-300">
                          <span className="flex items-center gap-1"><BookOpen size={12} /> {module.count} Aulas</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> ~{module.count * 15} min</span>
                       </div>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
                       <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/50 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                          <Play size={20} fill="white" className="text-white ml-1" />
                       </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-sm text-slate-400 mb-6 flex-1 leading-relaxed line-clamp-3">
                      {module.description}
                    </p>
                    
                    {/* Progress */}
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-500">{module.progress}% Concluído</span>
                          <span className={module.progress === 100 ? "text-green-500" : "text-slate-300"}>
                             {module.completedCount}/{module.count}
                          </span>
                       </div>
                       <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${module.progress === 100 ? 'bg-green-500' : 'bg-red-600'}`} 
                            style={{ width: `${module.progress}%` }}
                          ></div>
                       </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-900">
                       <button className="w-full py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 group-hover:bg-red-600/10 group-hover:text-red-500">
                          {module.progress > 0 ? 'Continuar Curso' : 'Iniciar Módulo'} <ChevronRight size={16} />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-950 rounded-3xl border border-slate-800">
               <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="text-slate-600" size={32} />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Nenhum Módulo Disponível</h3>
               <p className="text-slate-500 text-center max-w-md">
                 Parece que seu plano atual não possui módulos liberados. 
                 Entre em contato com o suporte ou faça um upgrade.
               </p>
            </div>
          )}
        </div>
      )}

      {/* --- PLAYER VIEW (SIDEBAR + CONTENT) --- */}
      {viewMode === 'player' && (
        <div className="flex h-[calc(100vh-160px)] md:h-[calc(100vh-96px)]">
          {/* Sidebar (Desktop) */}
          <aside className="w-80 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800 hidden lg:flex flex-col h-full overflow-hidden">
            {/* Sidebar Content Render */}
            <SidebarContent 
                handleBackToModules={handleBackToModules}
                sidebarTab={sidebarTab}
                setSidebarTab={setSidebarTab}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sidebarGroupedVideos={sidebarGroupedVideos}
                completedVideoIds={completedVideoIds}
                activeVideoId={activeVideoId}
                setActiveVideoId={(id) => setActiveVideoId(id)}
                filteredResources={filteredResources}
            />
          </aside>

          {/* Main Video Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-10 w-full custom-scrollbar relative">
             {/* Content Background for Player Mode */}
            <div className="lg:hidden mb-6 flex justify-between items-center">
                <button 
                    onClick={handleBackToModules}
                    className="flex items-center gap-2 text-slate-300 bg-slate-900 px-4 py-2 rounded-lg text-sm font-bold"
                >
                    <ArrowLeft size={16} /> Módulos
                </button>
                <button
                    onClick={() => setIsMobilePlaylistOpen(true)}
                    className="flex items-center gap-2 text-white bg-red-600 px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-red-900/20"
                >
                    <ListMusic size={16} /> Playlist
                </button>
            </div>

            <header className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                 <span 
                    className="hover:text-white cursor-pointer transition-colors"
                    onClick={handleBackToModules}
                 >
                    Dashboard
                 </span>
                 <ChevronRight size={14} />
                 <span className="text-red-500 font-medium truncate max-w-[200px]">
                    {activeVideo ? activeVideo.module : 'Geral'}
                 </span>
              </div>
            </header>

            {activeVideo ? (
              <div className="max-w-5xl mx-auto animation-fade-in pb-20 relative z-10">
                {/* Video Player Container */}
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl shadow-red-900/10 border border-slate-800 mb-10 group">
                  {isEmbed(activeVideo.videoUrl) ? (
                      <iframe 
                      src={`${activeVideo.videoUrl}${activeVideo.videoUrl.includes('?') ? '&' : '?'}autoplay=1&modestbranding=1&rel=0`}
                      title={activeVideo.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                      <video 
                        key={activeVideo.id} // Important for forcing re-render on video change
                        controls 
                        autoPlay
                        playsInline
                        controlsList="nodownload"
                        className="w-full h-full object-contain focus:outline-none"
                        poster={activeVideo.thumbnail}
                      >
                          <source src={activeVideo.videoUrl} type="video/mp4" />
                          Seu navegador não suporta a tag de vídeo.
                      </video>
                  )}
                </div>

                <div className="bg-slate-950/80 rounded-2xl p-6 md:p-8 border border-slate-800 backdrop-blur-md">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="text-xl md:text-3xl font-bold text-white mb-2 leading-tight">{activeVideo.title}</h2>
                        <button 
                            onClick={() => toggleVideoFavorite(activeVideo.id)}
                            className={`p-2 rounded-full transition-all flex-shrink-0 ${isFavorite ? 'text-red-500 bg-red-500/10' : 'text-slate-500 hover:text-red-500 hover:bg-slate-900'}`}
                            title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                        >
                            <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="inline-block px-3 py-1 bg-red-600/10 text-red-500 text-[10px] md:text-xs font-bold rounded-full border border-red-600/20 uppercase tracking-wider">
                            {activeVideo.module}
                        </span>
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Clock size={12} /> Duração: {activeVideo.duration}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => toggleVideoCompletion(activeVideo.id)}
                      className={`w-full md:w-auto px-8 py-3 rounded-lg text-sm font-bold transition-all uppercase shadow-lg flex items-center justify-center gap-2
                        ${isCompleted 
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20' 
                            : 'bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white border border-slate-700 hover:border-red-500 hover:shadow-red-900/20'
                        }`}
                    >
                      {isCompleted ? <><CheckCircle size={18} /> Aula Concluída</> : 'Marcar como Concluído'}
                    </button>
                  </div>
                  
                  <hr className="border-slate-800 my-8" />
                  
                  <h3 className="text-lg font-bold text-white mb-4">Sobre esta aula</h3>
                  <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                    {activeVideo.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-slate-500">
                <Search size={48} className="mb-4 opacity-50" />
                <p>Nenhuma aula selecionada.</p>
              </div>
            )}
          </main>
        </div>
      )}
      
      {/* Mobile Playlist Drawer */}
      {isMobilePlaylistOpen && viewMode === 'player' && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobilePlaylistOpen(false)}></div>
              <div className="relative w-4/5 max-w-sm bg-slate-950 border-r border-slate-800 flex flex-col h-full animate-[slideInRight_0.3s_ease-out]">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-black">
                      <h3 className="text-white font-bold">Playlist do Módulo</h3>
                      <button onClick={() => setIsMobilePlaylistOpen(false)}><X size={20} className="text-slate-400" /></button>
                  </div>
                  <SidebarContent 
                    handleBackToModules={handleBackToModules}
                    sidebarTab={sidebarTab}
                    setSidebarTab={setSidebarTab}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sidebarGroupedVideos={sidebarGroupedVideos}
                    completedVideoIds={completedVideoIds}
                    activeVideoId={activeVideoId}
                    setActiveVideoId={(id: string) => { setActiveVideoId(id); setIsMobilePlaylistOpen(false); }}
                    filteredResources={filteredResources}
                    isMobile={true}
                  />
              </div>
          </div>
      )}

      </div>

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsProfileModalOpen(false)}></div>
            <div className="relative bg-slate-950 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
                <button 
                    onClick={() => setIsProfileModalOpen(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white"
                >
                    <X size={24} />
                </button>
                <h3 className="text-2xl font-bold text-white mb-6">Editar Perfil</h3>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome Completo</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 text-slate-600" size={18} />
                            <input 
                                type="text" 
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className="w-full bg-black border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-red-600 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Foto de Perfil</label>
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <img src={profileAvatar || user.avatar} alt="Preview" className="w-24 h-24 rounded-full border-2 border-slate-800 object-cover" />
                            </div>
                            
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-800 rounded-xl cursor-pointer hover:bg-slate-900/50 hover:border-red-600/50 transition-colors group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-6 h-6 text-slate-500 group-hover:text-red-500 mb-2" />
                                    <p className="text-xs text-slate-500">Clique para carregar imagem</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-900/20 uppercase tracking-wide"
                    >
                        Salvar Alterações
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

// Extracted for reuse in mobile drawer
const SidebarContent: React.FC<SidebarContentProps> = ({ 
    handleBackToModules, sidebarTab, setSidebarTab, searchTerm, setSearchTerm, 
    sidebarGroupedVideos, completedVideoIds, activeVideoId, setActiveVideoId, filteredResources, isMobile 
}) => (
    <>
    <div className="p-6 border-b border-slate-800">
      {!isMobile && (
          <button 
            onClick={handleBackToModules}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-4"
          >
            <ArrowLeft size={16} /> Voltar aos Módulos
          </button>
      )}
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
        <input 
          type="text" 
          placeholder={sidebarTab === 'videos' ? "Filtrar aulas..." : "Filtrar arquivos..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-red-600 transition-colors placeholder-slate-600"
        />
      </div>

      <div className="flex bg-slate-900 p-1 rounded-lg">
          <button
            onClick={() => setSidebarTab('videos')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${sidebarTab === 'videos' ? 'bg-black text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Aulas
          </button>
          <button
            onClick={() => setSidebarTab('resources')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${sidebarTab === 'resources' ? 'bg-black text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Materiais
          </button>
      </div>
    </div>
    
    <div className="overflow-y-auto flex-1 p-4 custom-scrollbar bg-slate-950/50">
      {sidebarTab === 'videos' ? (
          Object.keys(sidebarGroupedVideos).length > 0 ? (
            Object.entries(sidebarGroupedVideos).map(([moduleName, moduleVideos]) => (
              <div key={moduleName} className="mb-8 last:mb-0">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-3 sticky top-0 bg-slate-950/95 py-2 z-10">
                  {moduleName}
                </h3>
                
                <div className="space-y-2">
                  {(moduleVideos as VideoLesson[]).map((video) => {
                    const isVidCompleted = completedVideoIds.includes(video.id);
                    const isActive = activeVideoId === video.id;
                    
                    return (
                      <div 
                        key={video.id}
                        onClick={() => setActiveVideoId(video.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all flex gap-3 group relative border ${
                          isActive
                            ? 'bg-red-600/10 border-red-600/30' 
                            : 'hover:bg-slate-900/50 border-transparent hover:border-slate-800'
                        }`}
                      >
                        <div className="relative w-16 h-10 flex-shrink-0 bg-slate-800 rounded overflow-hidden">
                          <img src={video.thumbnail} alt={video.title} className={`w-full h-full object-cover transition-opacity ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
                          {isActive && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
                            </div>
                          )}
                          {isVidCompleted && !isActive && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                  <CheckCircle size={12} className="text-green-500" />
                              </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                          <h4 className={`text-xs font-medium line-clamp-2 leading-snug ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                          }`}>
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-slate-600 flex items-center gap-1">
                              <Clock size={8} /> {video.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-500 py-10 px-4">
              <p className="text-sm">Nenhuma aula encontrada.</p>
            </div>
          )
      ) : (
          <div className="space-y-3">
             <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2 sticky top-0 bg-slate-950/95 py-2 z-10">
                Arquivos do Módulo
             </h3>
             {filteredResources.length > 0 ? (
                filteredResources.map((res) => (
                    <a 
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 transition-all group"
                    >
                        <div className="flex items-start gap-3">
                            <div className="bg-red-900/20 p-2.5 rounded text-red-500">
                                <FileText size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-slate-300 group-hover:text-white truncate mb-1">
                                    {res.title}
                                </h4>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <Download size={10} /> Clique para baixar
                                </div>
                            </div>
                        </div>
                    </a>
                ))
             ) : (
                <div className="text-center text-slate-500 py-10 px-4 border border-dashed border-slate-800 rounded-lg">
                   <FileText size={24} className="mx-auto mb-2 opacity-30" />
                   <p className="text-xs">Nenhum material disponível para este módulo.</p>
                </div>
             )}
          </div>
      )}
    </div>
    </>
);

export default Dashboard;