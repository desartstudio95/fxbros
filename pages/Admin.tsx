import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Navigate, useLocation } from 'react-router-dom';
import { UploadCloud, Link as LinkIcon, Plus, Video, Trash2, Check, Edit3, X, CreditCard, LayoutList, Star, Globe, Save, ShieldCheck, Palette, Type, Users, UserCheck, UserX, AlertCircle, Layers, CheckCircle2, FileText, Download, Loader2, Megaphone, Send, User, AlignLeft, Image as ImageIcon, Box, Film, Clock } from 'lucide-react';
import { VideoLesson, PricingPlan, HomeContent, User as UserType, ModuleResource, PlansPageContent, ModuleMetadata, WelcomeContent } from '../types';

const Admin: React.FC = () => {
  const { user, videos, addVideo, deleteVideo, updateVideo, resources, addResource, deleteResource, plans, addPlan, deletePlan, updatePlan, homeContent, updateHomeContent, themeSettings, updateThemeSettings, allUsers, updateUserStatus, updateUserModules, updateUserPlan, deleteUser, sendGlobalAnnouncement, plansPageContent, updatePlansPageContent, updateModuleMetadata, deleteModuleMetadata, modulesMetadata, welcomeContent, updateWelcomeContent } = useApp();
  const location = useLocation();
  
  const initialSection = user?.role === 'super_admin' ? 'cms' : 'members';

  const [activeSection, setActiveSection] = useState<'videos' | 'plans' | 'cms' | 'appearance' | 'members' | 'announcements'>(initialSection);
  const [activeContentTab, setActiveContentTab] = useState<'videos' | 'resources' | 'modules'>('modules');
  const [activePlanTab, setActivePlanTab] = useState<'cards' | 'page_settings'>('cards');
  const [activeCmsTab, setActiveCmsTab] = useState<'home' | 'plans' | 'welcome'>('home');

  // --- UPLOAD STATE ---
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'completed' | 'error'>('idle');
  const [uploadTimeRemaining, setUploadTimeRemaining] = useState<string>('');

  // --- VIDEO STATE ---
  const [videoSourceType, setVideoSourceType] = useState<'link' | 'upload'>('link');
  const [isVideoEditing, setIsVideoEditing] = useState(false);
  const [editVideoId, setEditVideoId] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    description: '',
    url: '',
    module: ''
  });

  // --- RESOURCE STATE ---
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resourceFormData, setResourceFormData] = useState({
    title: '',
    module: '',
    url: ''
  });

  // --- MODULE METADATA STATE ---
  const [moduleImageFile, setModuleImageFile] = useState<File | null>(null);
  const [moduleImagePreview, setModuleImagePreview] = useState<string | null>(null);
  const [moduleMetaFormData, setModuleMetaFormData] = useState({
      id: '',
      name: '',
      description: '',
      thumbnail: ''
  });
  const [isEditingModule, setIsEditingModule] = useState(false);

  // --- PLAN STATE ---
  const [isPlanEditing, setIsPlanEditing] = useState(false);
  const [editPlanId, setEditPlanId] = useState<string | null>(null);
  const [planFormData, setPlanFormData] = useState({
    name: '',
    price: '',
    features: '', 
    isPopular: false,
    isElite: false,
    allowedModules: [] as string[],
    paymentLink: ''
  });

  // --- ANNOUNCEMENT STATE ---
  const [announcementData, setAnnouncementData] = useState({
      title: '',
      message: ''
  });

  // --- MEMBER MODULES STATE ---
  const [isManageMemberOpen, setIsManageMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<UserType | null>(null);
  const [tempAllowedModules, setTempAllowedModules] = useState<string[]>([]);
  const [tempSelectedPlan, setTempSelectedPlan] = useState<string>('starter');

  // --- CMS STATE ---
  const [cmsData, setCmsData] = useState<HomeContent>(homeContent);
  const [plansCmsData, setPlansCmsData] = useState<PlansPageContent>(plansPageContent);
  const [welcomeCmsData, setWelcomeCmsData] = useState<WelcomeContent>(welcomeContent);

  // CMS Image Files State
  const [heroBgFile, setHeroBgFile] = useState<File | null>(null);
  const [aboutImgFile, setAboutImgFile] = useState<File | null>(null);
  const [founderImgFile, setFounderImgFile] = useState<File | null>(null);
  
  // Plans Page Image File
  const [plansHeroBgFile, setPlansHeroBgFile] = useState<File | null>(null);
  
  // Welcome Page Image Files State
  const [welcomeBgFile, setWelcomeBgFile] = useState<File | null>(null);
  
  // Image Input Modes
  const [heroMode, setHeroMode] = useState<'upload' | 'url'>('upload');
  const [aboutMode, setAboutMode] = useState<'upload' | 'url'>('upload');
  const [founderMode, setFounderMode] = useState<'upload' | 'url'>('upload');
  const [welcomeMode, setWelcomeMode] = useState<'upload' | 'url'>('upload');
  const [plansHeroMode, setPlansHeroMode] = useState<'upload' | 'url'>('upload');

  const [localThemeSettings, setLocalThemeSettings] = useState(themeSettings);
  const [successMsg, setSuccessMsg] = useState('');

  // Extract all unique modules available in the system
  const allSystemModules = useMemo(() => {
    // Combine modules from metadata and existing videos to ensure none are lost, but prioritize metadata
    const modules = new Set(modulesMetadata.map(m => m.name));
    return Array.from(modules);
  }, [modulesMetadata]);

  // --- Handle Navigation from External Pages (e.g., Edit Plan from Plans page) ---
  useEffect(() => {
    if (location.state) {
      const state = location.state as { targetSection?: string; editPlanId?: string };
      
      if (state.targetSection === 'plans') {
        setActiveSection('plans');
        
        if (state.editPlanId) {
          const planToEdit = plans.find(p => p.id === state.editPlanId);
          if (planToEdit) {
            // Replicate handleEditPlan logic here to ensure it runs correctly on mount
            setIsPlanEditing(true);
            setEditPlanId(planToEdit.id);
            setPlanFormData({ 
                name: planToEdit.name, 
                price: planToEdit.price, 
                features: planToEdit.features.join('\n'), 
                isPopular: planToEdit.isPopular || false, 
                isElite: planToEdit.isElite || false, 
                allowedModules: planToEdit.allowedModules || [],
                paymentLink: planToEdit.paymentLink || ''
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }

      // Clear state to avoid reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location, plans]);

  useEffect(() => {
    setCmsData(homeContent);
    setPlansCmsData(plansPageContent);
    setWelcomeCmsData(welcomeContent);
  }, [homeContent, plansPageContent, welcomeContent]);

  useEffect(() => {
    setLocalThemeSettings(themeSettings);
  }, [themeSettings]);

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) return <Navigate to="/login" replace />;

  const isSuperAdmin = user.role === 'super_admin';
  const isAdmin = user.role === 'admin';
  const hasMemberControl = isAdmin || isSuperAdmin;

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // --- HELPERS FOR UPLOAD (UPDATED FOR PERSISTENCE) ---
  const simulateUpload = async (file: File | null, onComplete: (url: string) => void) => {
      if (!file) return;

      setIsUploading(true);
      setUploadStatus('uploading');
      setUploadProgress(0);
      setUploadTimeRemaining('Processando...');
      
      // Simulação visual rápida
      for (let i = 0; i <= 80; i += 20) {
          setUploadProgress(i);
          await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Converte para Base64 para persistir no localStorage
      return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
              setUploadProgress(100);
              const result = reader.result as string;
              
              setIsUploading(false);
              setUploadStatus('completed');
              setUploadTimeRemaining('');
              
              onComplete(result);
              resolve();
          };
          reader.onerror = () => {
              setIsUploading(false);
              setUploadStatus('error');
              reject(new Error("Falha ao ler arquivo"));
          };
          reader.readAsDataURL(file);
      });
  };

  // --- MODULE HANDLERS ---
  const handleModuleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setModuleImageFile(file);
          
          // Create preview
          const reader = new FileReader();
          reader.onloadend = () => {
              setModuleImagePreview(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const resetModuleForm = () => {
      setModuleMetaFormData({ id: '', name: '', description: '', thumbnail: '' });
      setModuleImageFile(null);
      setModuleImagePreview(null);
      setIsEditingModule(false);
      setUploadStatus('idle');
      setUploadProgress(0);
  };

  const handleEditModule = (module: ModuleMetadata) => {
      setIsEditingModule(true);
      setModuleMetaFormData({
          id: module.id,
          name: module.name,
          description: module.description,
          thumbnail: module.thumbnail
      });
      setModuleImagePreview(module.thumbnail);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteModule = (id: string) => {
      if (window.confirm('Tem certeza? Isso removerá o módulo da lista de gerenciamento.')) {
          deleteModuleMetadata(id);
          showToast('Módulo removido.');
      }
  };

  const handleModuleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      let finalThumbnail = moduleMetaFormData.thumbnail;

      if (moduleImageFile) {
          await simulateUpload(moduleImageFile, (url) => {
              finalThumbnail = url; 
          });
      } else if (!finalThumbnail) {
          // If editing and no new file, keep old thumbnail. If new and no file...
          if (!isEditingModule) {
             alert("A imagem do módulo é obrigatória.");
             return;
          }
      }

      // Use name as ID for simplicity if creating new, or keep existing ID
      const moduleId = isEditingModule ? moduleMetaFormData.id : moduleMetaFormData.name;

      updateModuleMetadata({
          id: moduleId,
          name: moduleMetaFormData.name,
          description: moduleMetaFormData.description,
          thumbnail: finalThumbnail
      });

      showToast(isEditingModule ? 'Módulo atualizado!' : 'Módulo criado com sucesso!');
      resetModuleForm();
  };

  // --- VIDEO HANDLERS ---
  const resetVideoForm = () => {
    setVideoFormData({ title: '', description: '', url: '', module: '' });
    setVideoFile(null);
    setIsVideoEditing(false);
    setEditVideoId(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setIsUploading(false);
    setUploadTimeRemaining('');
    setVideoSourceType('link');
  };

  const handleEditVideo = (video: VideoLesson) => {
    setIsVideoEditing(true);
    setEditVideoId(video.id);
    setVideoFormData({
      title: video.title,
      description: video.description,
      url: video.videoUrl.replace('embed/', 'watch?v='),
      module: video.module
    });
    
    if (video.videoUrl.startsWith('data:') || video.videoUrl.startsWith('blob:') || !video.videoUrl.includes('http') || video.videoUrl.endsWith('.mp4')) {
         setVideoSourceType('upload');
    } else {
         setVideoSourceType('link');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteVideo = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este vídeo permanentemente?')) {
      deleteVideo(id);
      showToast('Vídeo removido com sucesso.');
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setVideoFile(e.target.files[0]);
    }
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalVideoUrl = videoFormData.url;

    if (videoSourceType === 'upload') {
        if (videoFile) {
            await simulateUpload(videoFile, (url) => {
                finalVideoUrl = url;
            });
        } else if (!isVideoEditing) {
            alert("Selecione um arquivo de vídeo para enviar.");
            return;
        }
    } else {
        // Link logic
        if (!finalVideoUrl) {
            alert("Insira um link do YouTube.");
            return;
        }
        finalVideoUrl = videoFormData.url.includes('watch?v=') 
            ? videoFormData.url.replace('watch?v=', 'embed/') 
            : videoFormData.url;
    }

    const timestamp = Date.now();
    // Logic to get module thumbnail for video cover if no specific video thumbnail logic (simplified)
    const moduleInfo = modulesMetadata.find(m => m.name === videoFormData.module);
    const thumbnail = moduleInfo?.thumbnail || `https://picsum.photos/seed/${timestamp}/800/450`;

    if (isVideoEditing && editVideoId) {
      const existingVideo = videos.find(v => v.id === editVideoId);
      if (existingVideo) {
         const updatedVideo: VideoLesson = {
          ...existingVideo,
          title: videoFormData.title,
          description: videoFormData.description,
          videoUrl: finalVideoUrl,
          module: videoFormData.module,
          thumbnail: thumbnail 
        };
        updateVideo(updatedVideo);
        showToast('Aula atualizada com sucesso!');
      }
    } else {
      const newVideo: VideoLesson = {
        id: timestamp.toString(),
        title: videoFormData.title,
        description: videoFormData.description,
        thumbnail: thumbnail,
        videoUrl: finalVideoUrl,
        duration: '10:00', // Mock duration
        module: videoFormData.module,
        dateAdded: new Date().toISOString()
      };
      addVideo(newVideo);
      showToast('Aula criada e adicionada ao módulo!');
    }

    resetVideoForm();
  };

  // --- Other Handlers (Resources, Plans, Members, etc - Simplified or kept same) ---
  const handleAnnouncementSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(announcementData.title && announcementData.message) {
          sendGlobalAnnouncement(announcementData.title, announcementData.message);
          showToast('Comunicado enviado!');
          setAnnouncementData({ title: '', message: '' });
      }
  };
  
  // --- MEMBER LOGIC ---
  const openMemberManagement = (member: UserType) => { 
      setSelectedMember(member); 
      setTempAllowedModules(member.allowedModules || []); 
      setTempSelectedPlan(member.planId || 'starter');
      setIsManageMemberOpen(true); 
  };

  const toggleModuleAccess = (moduleName: string) => { setTempAllowedModules(prev => prev.includes(moduleName) ? prev.filter(m => m !== moduleName) : [...prev, moduleName]); };
  
  const saveMemberChanges = () => { 
      if (selectedMember) { 
          updateUserModules(selectedMember.id, tempAllowedModules); 
          updateUserPlan(selectedMember.id, tempSelectedPlan);
          showToast(`Membro atualizado com sucesso.`); 
          setIsManageMemberOpen(false); 
      } 
  };
  
  const handleApproveMember = (member: UserType) => { 
      updateUserStatus(member.id, 'active'); 
      showToast(`Membro aprovado! Notificação e E-mail enviados.`);
  };
  
  const handleBlockMember = (member: UserType) => { updateUserStatus(member.id, 'blocked'); showToast(`Acesso bloqueado.`); };
  const handleDeleteUserWrapper = (userId: string) => { if (window.confirm('Remover usuário?')) { deleteUser(userId); showToast('Usuário removido.'); } };

  // --- PLAN LOGIC ---
  const resetPlanForm = () => { setPlanFormData({ name: '', price: '', features: '', isPopular: false, isElite: false, allowedModules: [], paymentLink: '' }); setIsPlanEditing(false); setEditPlanId(null); };
  const handleEditPlan = (plan: PricingPlan) => { setIsPlanEditing(true); setEditPlanId(plan.id); setPlanFormData({ name: plan.name, price: plan.price, features: plan.features.join('\n'), isPopular: plan.isPopular || false, isElite: plan.isElite || false, allowedModules: plan.allowedModules || [], paymentLink: plan.paymentLink || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleDeletePlan = (id: string) => { if(window.confirm('Excluir plano?')) { deletePlan(id); showToast('Plano removido.'); } };
  const handlePlanSubmit = (e: React.FormEvent) => { e.preventDefault(); const features = planFormData.features.split('\n').filter(l => l.trim()); const p = { id: isPlanEditing && editPlanId ? editPlanId : `plan-${Date.now()}`, name: planFormData.name, price: planFormData.price, features, isPopular: planFormData.isPopular, isElite: planFormData.isElite, allowedModules: planFormData.allowedModules, paymentLink: planFormData.paymentLink }; if(isPlanEditing) updatePlan(p); else addPlan(p); showToast(isPlanEditing ? 'Plano atualizado' : 'Plano criado'); resetPlanForm(); };

  // --- CMS LOGIC ---
  const handlePlansCmsSubmit = async (e: React.FormEvent) => { 
      e.preventDefault(); 
      let updatedData = JSON.parse(JSON.stringify(plansCmsData));

      if (plansHeroMode === 'upload' && plansHeroBgFile) {
          await new Promise<void>((resolve) => {
              simulateUpload(plansHeroBgFile, (url) => {
                  updatedData.hero.bgImage = url;
                  resolve();
              });
          });
      }

      updatePlansPageContent(updatedData);
      setPlansHeroBgFile(null); 
      showToast('Página de Planos salva!'); 
  };
  
  const handleCmsSubmit = async (e: React.FormEvent) => { 
      e.preventDefault(); 
      
      let updatedData = JSON.parse(JSON.stringify(cmsData));

      // Helper for sequential upload
      const upload = async (file: File) => {
          return new Promise<string>((resolve) => {
              simulateUpload(file, (url) => resolve(url));
          });
      };

      if (heroMode === 'upload' && heroBgFile) {
          const url = await upload(heroBgFile);
          updatedData.hero.bgImage = url;
      }
      if (aboutMode === 'upload' && aboutImgFile) {
          const url = await upload(aboutImgFile);
          updatedData.about.imageUrl = url;
      }
      if (founderMode === 'upload' && founderImgFile) {
          const url = await upload(founderImgFile);
          updatedData.founder.imageUrl = url;
      }

      updateHomeContent(updatedData); 
      setHeroBgFile(null);
      setAboutImgFile(null);
      setFounderImgFile(null);
      showToast('Home Page salva!'); 
  };
  
  const handleWelcomeCmsSubmit = async (e: React.FormEvent) => { 
      e.preventDefault(); 
      
      let updatedData = JSON.parse(JSON.stringify(welcomeCmsData));

      if (welcomeMode === 'upload' && welcomeBgFile) {
          await new Promise<void>((resolve) => {
              simulateUpload(welcomeBgFile, (url) => {
                  updatedData.hero.bgImage = url;
                  resolve();
              });
          });
      }

      updateWelcomeContent(updatedData); 
      setWelcomeBgFile(null);
      showToast('Página de Boas-vindas salva!'); 
  };
  const handleThemeSubmit = (e: React.FormEvent) => { e.preventDefault(); updateThemeSettings(localThemeSettings); showToast('Tema aplicado!'); };

  // --- RESOURCE LOGIC ---
  const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setResourceFile(e.target.files[0]);
    }
  };

  const handleDeleteResource = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este material?')) {
        deleteResource(id);
        showToast('Material removido.');
    }
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      let finalUrl = resourceFormData.url;

      if (resourceFile) {
          // Use the file based simulation for resources too
          await new Promise<void>((resolve) => {
              simulateUpload(resourceFile, (url) => {
                  finalUrl = url;
                  resolve();
              });
          });
      }
      
      addResource({ id: `res-${Date.now()}`, title: resourceFormData.title, module: resourceFormData.module, url: finalUrl, type: 'pdf', dateAdded: new Date().toISOString() });
      showToast('Material adicionado!');
      setResourceFormData({ title: '', module: '', url: '' }); setResourceFile(null);
  };

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-6 sm:px-10">
      
      {successMsg && (
        <div className="fixed bottom-8 right-8 z-[100] flex items-center gap-4 bg-slate-900/90 backdrop-blur-md border border-emerald-500/50 pl-4 pr-6 py-4 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-[slideIn_0.3s_ease-out] cursor-pointer" onClick={() => setSuccessMsg('')}>
            <div className="bg-emerald-500/20 p-2 rounded-full flex-shrink-0"><CheckCircle2 size={24} className="text-emerald-500" /></div>
            <div className="flex-1"><p className="font-bold text-sm text-white">Sucesso</p><p className="text-xs text-slate-300 mt-0.5">{successMsg}</p></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white uppercase tracking-tight">{isSuperAdmin ? 'Painel Super Admin' : 'Painel Admin'}</h1>
            <p className="text-slate-400 mt-2 text-lg">Gerencie conteúdo, alunos e configurações.</p>
          </div>
          <div className={`border px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-widest flex items-center gap-3 ${isSuperAdmin ? 'bg-red-900/20 text-red-500 border-red-600/50' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
            {isSuperAdmin ? <ShieldCheck size={18} /> : null} {isSuperAdmin ? 'Acesso Root' : 'Administrador'}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-black p-1.5 rounded-xl mb-10 w-fit border border-slate-800">
          {hasMemberControl && (
             <>
                <button onClick={() => setActiveSection('members')} className={`px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${activeSection === 'members' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}><Users size={18} /> Membros</button>
                <button onClick={() => setActiveSection('videos')} className={`px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${activeSection === 'videos' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}><Video size={18} /> Conteúdo</button>
                <button onClick={() => setActiveSection('plans')} className={`px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${activeSection === 'plans' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}><CreditCard size={18} /> Planos</button>
                <button onClick={() => setActiveSection('announcements')} className={`px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${activeSection === 'announcements' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}><Megaphone size={18} /> Avisos</button>
             </>
          )}
          {isSuperAdmin && (
            <>
              <button onClick={() => setActiveSection('cms')} className={`px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${activeSection === 'cms' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}><Globe size={18} /> Site</button>
              <button onClick={() => setActiveSection('appearance')} className={`px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${activeSection === 'appearance' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}><Palette size={18} /> Visual</button>
            </>
          )}
        </div>

        {/* --- SECTION: CONTENT (VIDEOS & MODULES) --- */}
        {activeSection === 'videos' && hasMemberControl && (
            <div className="space-y-8">
                 <div className="flex bg-black p-1.5 rounded-xl border border-slate-800 w-fit gap-1">
                    <button onClick={() => setActiveContentTab('modules')} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeContentTab === 'modules' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Gerenciar Módulos</button>
                    <button onClick={() => setActiveContentTab('videos')} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeContentTab === 'videos' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Gerenciar Aulas</button>
                    <button onClick={() => setActiveContentTab('resources')} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeContentTab === 'resources' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Materiais (PDF)</button>
                </div>
                
                {/* SUB-TAB: MODULES */}
                {activeContentTab === 'modules' && (
                     <div className="grid lg:grid-cols-12 gap-10">
                        {/* Module Form */}
                        <div className="lg:col-span-4">
                            <div className="bg-black rounded-3xl p-8 border border-slate-800 shadow-2xl sticky top-28">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                                    <Box size={20} className="text-amber-500" /> {isEditingModule ? 'Editar Módulo' : 'Criar Módulo'}
                                </h2>
                                
                                <form onSubmit={handleModuleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nome do Módulo</label>
                                        <input 
                                            type="text" 
                                            value={moduleMetaFormData.name} 
                                            onChange={(e) => setModuleMetaFormData({...moduleMetaFormData, name: e.target.value})} 
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:border-amber-500 focus:outline-none" 
                                            placeholder="Ex: Módulo 1 - Iniciante"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Descrição Curta</label>
                                        <textarea 
                                            rows={3} 
                                            value={moduleMetaFormData.description} 
                                            onChange={(e) => setModuleMetaFormData({...moduleMetaFormData, description: e.target.value})} 
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:border-amber-500 focus:outline-none" 
                                            placeholder="O que o aluno vai aprender?"
                                        />
                                    </div>
                                    
                                    {/* Module Image Upload */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Imagem de Capa</label>
                                        <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center hover:border-amber-500 transition-colors cursor-pointer relative group">
                                            <input type="file" onChange={handleModuleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                            {moduleImagePreview ? (
                                                <div className="relative">
                                                    <img src={moduleImagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                        <span className="text-xs text-white font-bold">Alterar Imagem</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-4">
                                                    <ImageIcon size={24} className="mx-auto text-slate-500 mb-2 group-hover:text-amber-500" />
                                                    <span className="text-xs text-slate-400">Clique para carregar imagem</span>
                                                </div>
                                            )}
                                        </div>
                                        {isUploading && <div className="w-full bg-slate-900 h-1 mt-2 rounded overflow-hidden"><div className="bg-amber-500 h-full transition-all" style={{width: `${uploadProgress}%`}}></div></div>}
                                    </div>

                                    <div className="flex gap-2">
                                        <button type="submit" disabled={isUploading} className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-black font-bold py-3.5 rounded-lg uppercase text-xs tracking-wider">
                                            {isUploading ? 'Salvando...' : (isEditingModule ? 'Atualizar' : 'Criar Módulo')}
                                        </button>
                                        {isEditingModule && (
                                            <button type="button" onClick={resetModuleForm} className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg">
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Module List */}
                        <div className="lg:col-span-8">
                            <div className="bg-black rounded-3xl p-8 border border-slate-800">
                                <h3 className="text-white font-bold mb-6 flex items-center gap-2"><LayoutList size={20} /> Módulos Existentes</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {modulesMetadata.map(meta => (
                                        <div key={meta.id} className="flex gap-4 p-4 border border-slate-900 rounded-xl bg-slate-950/50 hover:border-slate-700 transition-all group relative">
                                            <img src={meta.thumbnail || 'https://via.placeholder.com/150'} className="w-20 h-20 object-cover rounded-lg bg-slate-800" alt={meta.name} />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-bold text-sm mb-1 truncate">{meta.name}</h4>
                                                <p className="text-slate-500 text-xs line-clamp-2 mb-3">{meta.description || 'Sem descrição'}</p>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditModule(meta)} className="text-xs bg-slate-900 hover:bg-amber-600/20 hover:text-amber-500 text-slate-400 px-3 py-1.5 rounded border border-slate-800 transition-colors flex items-center gap-1">
                                                        <Edit3 size={10} /> Editar
                                                    </button>
                                                    <button onClick={() => handleDeleteModule(meta.id)} className="text-xs bg-slate-900 hover:bg-red-600/20 hover:text-red-500 text-slate-400 px-3 py-1.5 rounded border border-slate-800 transition-colors flex items-center gap-1">
                                                        <Trash2 size={10} /> Remover
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {modulesMetadata.length === 0 && <div className="col-span-2 text-center py-10 text-slate-500 border border-dashed border-slate-800 rounded-xl">Nenhum módulo criado. Comece criando um ao lado.</div>}
                                </div>
                            </div>
                        </div>
                     </div>
                )}

                {/* SUB-TAB: VIDEOS */}
                {activeContentTab === 'videos' && (
                    <div className="grid lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-1">
                            <div className="bg-black rounded-3xl p-8 border border-slate-800 shadow-2xl sticky top-28">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><Plus size={20} className="text-red-500" /> Nova Aula</h2>
                                
                                <form onSubmit={handleVideoSubmit} className="space-y-6">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Título da Aula</label>
                                        <input type="text" value={videoFormData.title} onChange={(e) => setVideoFormData({...videoFormData, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:border-red-500 focus:outline-none" placeholder="Ex: Introdução ao Price Action" required />
                                    </div>

                                    {/* Module Select */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Módulo</label>
                                        {modulesMetadata.length > 0 ? (
                                            <div className="relative">
                                                <select 
                                                    value={videoFormData.module} 
                                                    onChange={(e) => setVideoFormData({...videoFormData, module: e.target.value})} 
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:border-red-500 focus:outline-none appearance-none cursor-pointer"
                                                    required
                                                >
                                                    <option value="">Selecione um módulo...</option>
                                                    {modulesMetadata.map(m => (
                                                        <option key={m.id} value={m.name}>{m.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-4 pointer-events-none text-slate-500"><LayoutList size={16} /></div>
                                            </div>
                                        ) : (
                                            <div className="p-3 border border-red-900/50 bg-red-900/10 rounded-xl text-xs text-red-400">
                                                Você precisa criar um módulo na aba "Gerenciar Módulos" antes de adicionar aulas.
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Descrição</label>
                                        <textarea rows={3} value={videoFormData.description} onChange={(e) => setVideoFormData({...videoFormData, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:border-red-500 focus:outline-none" placeholder="Resumo do conteúdo..." />
                                    </div>

                                    {/* Video Source Switch */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Fonte do Vídeo</label>
                                        <div className="flex bg-slate-900 p-1 rounded-lg mb-4">
                                            <button type="button" onClick={() => setVideoSourceType('link')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${videoSourceType === 'link' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}>Link YouTube</button>
                                            <button type="button" onClick={() => setVideoSourceType('upload')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${videoSourceType === 'upload' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}>Upload Direto (MP4)</button>
                                        </div>

                                        {videoSourceType === 'link' ? (
                                            <input type="text" value={videoFormData.url} onChange={(e) => setVideoFormData({...videoFormData, url: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:border-red-500 focus:outline-none" placeholder="https://youtube.com/..." />
                                        ) : (
                                            <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center hover:border-red-500 transition-colors cursor-pointer relative group">
                                                <input type="file" onChange={handleVideoFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="video/mp4,video/x-m4v,video/*" />
                                                <Film size={32} className="mx-auto text-slate-500 mb-2 group-hover:text-red-500" />
                                                <p className="text-xs text-slate-400">{videoFile ? videoFile.name : 'Clique para carregar vídeo (MP4)'}</p>
                                                
                                                {isUploading && (
                                                    <div className="mt-4">
                                                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                                            <span>Enviando...</span>
                                                            <div className="flex items-center gap-1">
                                                                {uploadTimeRemaining && <span className="text-amber-500 flex items-center gap-1 mr-2"><Clock size={10} /> {uploadTimeRemaining}</span>}
                                                                <span>{uploadProgress}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                                            <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                                        </div>
                                                    </div>
                                                )}
                                                {uploadStatus === 'completed' && <div className="mt-2 text-xs text-green-500 font-bold flex items-center justify-center gap-1"><Check size={12}/> Upload Concluído</div>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button type="submit" disabled={isUploading || !videoFormData.module} className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3.5 rounded-lg uppercase text-xs tracking-wider transition-all">
                                            {isUploading ? <><Loader2 className="animate-spin inline mr-2" size={14}/> Enviando</> : (isVideoEditing ? 'Atualizar Aula' : 'Publicar Aula')}
                                        </button>
                                        {isVideoEditing && (
                                            <button type="button" onClick={resetVideoForm} className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg">
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                             <div className="bg-black rounded-3xl p-8 border border-slate-800">
                                 <h3 className="text-white font-bold mb-6">Biblioteca de Aulas</h3>
                                 <div className="space-y-2">
                                     {videos.map(v => (
                                         <div key={v.id} className="flex justify-between items-center p-4 border border-slate-900 rounded-xl hover:bg-slate-950 transition-colors">
                                             <div className="flex-1">
                                                <span className="text-white font-bold text-sm block mb-1">{v.title}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{v.module}</span>
                                                    <span className="text-[10px] text-slate-600">{v.duration}</span>
                                                </div>
                                             </div>
                                             <div className="flex items-center gap-2">
                                                <button onClick={() => handleEditVideo(v)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"><Edit3 size={16} /></button>
                                                <button onClick={() => handleDeleteVideo(v.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-900/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                             </div>
                                         </div>
                                     ))}
                                     {videos.length === 0 && <div className="text-center py-8 text-slate-500">Nenhuma aula cadastrada.</div>}
                                 </div>
                             </div>
                        </div>
                    </div>
                )}

                {/* SUB-TAB: RESOURCES */}
                {activeContentTab === 'resources' && (
                    <div className="grid lg:grid-cols-3 gap-10">
                         <div className="lg:col-span-1">
                            <div className="bg-black rounded-3xl p-8 border border-slate-800 shadow-2xl sticky top-28">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><FileText size={20} className="text-blue-500" /> Novo Material</h2>
                                <form onSubmit={handleResourceSubmit} className="space-y-6">
                                    <input type="text" value={resourceFormData.title} onChange={(e) => setResourceFormData({...resourceFormData, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white" placeholder="Título do Arquivo" required />
                                    
                                    <div className="relative">
                                        <select 
                                            value={resourceFormData.module} 
                                            onChange={(e) => setResourceFormData({...resourceFormData, module: e.target.value})} 
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Selecione um módulo...</option>
                                            {modulesMetadata.map(m => (
                                                <option key={m.id} value={m.name}>{m.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-4 pointer-events-none text-slate-500"><LayoutList size={16} /></div>
                                    </div>
                                    
                                    <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer relative group">
                                        <input type="file" onChange={handleResourceFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.doc,.docx" />
                                        <UploadCloud size={24} className="mx-auto text-slate-500 mb-2 group-hover:text-blue-500" />
                                        <span className="text-xs text-slate-400">Clique para carregar PDF</span>
                                        {resourceFile && <div className="text-xs text-green-500 mt-2 font-bold">{resourceFile.name}</div>}
                                    </div>

                                    {isUploading && (
                                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                        </div>
                                    )}

                                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg uppercase text-xs tracking-wider">Salvar PDF</button>
                                </form>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="bg-black rounded-3xl p-8 border border-slate-800">
                                 {resources.map(r => (
                                     <div key={r.id} className="flex justify-between items-center p-4 border-b border-slate-900">
                                         <div>
                                            <span className="text-white font-bold block text-sm">{r.title}</span>
                                            <span className="text-xs text-slate-500">{r.module}</span>
                                         </div>
                                         <button onClick={() => handleDeleteResource(r.id)} className="text-red-500"><Trash2 size={16}/></button>
                                     </div>
                                 ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* MEMBER SECTION */}
        {activeSection === 'members' && hasMemberControl && (
             <div className="bg-black rounded-3xl p-6 md:p-10 border border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between mb-8"><div><h2 className="text-2xl font-bold text-white flex items-center gap-3"><Users size={24} className="text-slate-400" /> Gestão de Membros</h2></div></div>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full min-w-[800px] text-left border-collapse">
                    <thead><tr className="bg-slate-950 border-b border-slate-800"><th className="py-5 px-6 text-xs font-bold text-slate-500">Usuário</th><th className="py-5 px-6 text-xs font-bold text-slate-500">Plano</th><th className="py-5 px-6 text-xs font-bold text-slate-500">Status</th><th className="py-5 px-6 text-xs font-bold text-slate-500 text-right">Ações</th></tr></thead>
                    <tbody className="divide-y divide-slate-800">
                      {allUsers.filter(u => u.role === 'member').sort((a,b) => (a.status === 'pending' ? -1 : 1)).map((member) => (
                        <tr key={member.id} className="bg-black hover:bg-slate-900/50">
                          <td className="py-4 px-6"><div className="flex items-center gap-4"><img src={member.avatar} className="w-10 h-10 rounded-full border border-slate-700" /><div className="font-bold text-white text-sm">{member.name}<br/><span className="text-slate-500 font-normal text-xs">{member.email}</span></div></div></td>
                          <td className="py-4 px-6"><span className="text-xs text-slate-400 font-medium bg-slate-900 px-2 py-1 rounded border border-slate-800">{plans.find(p => p.id === member.planId)?.name || 'N/A'}</span></td>
                          <td className="py-4 px-6"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${member.status==='active'?'bg-green-900/20 text-green-500':member.status==='blocked'?'bg-red-900/20 text-red-500':'bg-yellow-900/20 text-yellow-500'}`}>{member.status === 'pending' ? 'Pendente' : member.status === 'blocked' ? 'Bloqueado' : 'Ativo'}</span></td>
                          <td className="py-4 px-6 text-right"><div className="flex justify-end gap-2"><button onClick={()=>openMemberManagement(member)} className="p-2 bg-slate-800 rounded hover:bg-slate-700"><Layers size={14}/></button>{member.status!=='active' ? <button onClick={()=>handleApproveMember(member)} className="p-2 bg-green-900/20 text-green-500 rounded hover:bg-green-900/40" title="Aprovar Membro"><Check size={14}/></button> : <button onClick={()=>handleBlockMember(member)} className="p-2 bg-amber-900/20 text-amber-500 rounded hover:bg-amber-900/40" title="Bloquear Acesso"><UserX size={14}/></button>}<button onClick={()=>handleDeleteUserWrapper(member.id)} className="p-2 bg-red-900/20 text-red-500 rounded hover:bg-red-900/40" title="Excluir"><Trash2 size={14}/></button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {isManageMemberOpen && selectedMember && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsManageMemberOpen(false)}></div>
                        <div className="relative bg-slate-950 border border-slate-800 p-8 rounded-2xl w-full max-w-lg shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-6">Gerenciar Acesso</h3>
                            
                            {/* Plan Selection */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Plano de Assinatura</label>
                                <div className="relative">
                                    <select 
                                        value={tempSelectedPlan} 
                                        onChange={(e) => setTempSelectedPlan(e.target.value)}
                                        className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none appearance-none cursor-pointer"
                                    >
                                        {plans.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} - {p.price}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-3 pointer-events-none text-slate-500"><CreditCard size={16} /></div>
                                </div>
                            </div>

                            {/* Module Selection */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Módulos Liberados (Overrides)</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar border border-slate-900 rounded-lg p-2">
                                    {allSystemModules.map(m => (
                                        <label key={m} className="flex items-center gap-3 p-3 border border-slate-800 rounded bg-black hover:bg-slate-900 cursor-pointer transition-colors">
                                            <input type="checkbox" checked={tempAllowedModules.includes(m)} onChange={()=>toggleModuleAccess(m)} className="accent-red-600 w-4 h-4" />
                                            <span className="text-slate-300 text-sm font-medium">{m}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button onClick={saveMemberChanges} className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold text-white transition-colors">Salvar Alterações</button>
                        </div>
                    </div>
                )}
             </div>
        )}

        {/* ANNOUNCEMENTS */}
        {activeSection === 'announcements' && hasMemberControl && (
            <div className="bg-black rounded-3xl p-8 border border-slate-800 max-w-2xl"><h2 className="text-xl font-bold text-white mb-6">Novo Comunicado</h2><form onSubmit={handleAnnouncementSubmit} className="space-y-4"><input type="text" value={announcementData.title} onChange={e=>setAnnouncementData({...announcementData, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white" placeholder="Título" required /><textarea rows={4} value={announcementData.message} onChange={e=>setAnnouncementData({...announcementData, message: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white" placeholder="Mensagem" required /><button className="w-full bg-red-600 py-3 rounded-lg text-white font-bold">Enviar</button></form></div>
        )}

        {/* PLANS */}
        {activeSection === 'plans' && hasMemberControl && (
             <div className="space-y-8">
                <div className="flex bg-black p-1.5 rounded-xl border border-slate-800 w-fit gap-1">
                    <button onClick={() => setActivePlanTab('cards')} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activePlanTab === 'cards' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Cards</button>
                    {isSuperAdmin && <button onClick={() => setActivePlanTab('page_settings')} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activePlanTab === 'page_settings' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Página</button>}
                </div>
                {activePlanTab === 'cards' && (
                    <div className="grid lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-1"><div className="bg-black rounded-3xl p-8 border border-slate-800"><form onSubmit={handlePlanSubmit} className="space-y-4"><input type="text" value={planFormData.name} onChange={e=>setPlanFormData({...planFormData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white" placeholder="Nome" required /><input type="text" value={planFormData.price} onChange={e=>setPlanFormData({...planFormData, price: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white" placeholder="Preço" required /><input type="text" value={planFormData.paymentLink} onChange={e=>setPlanFormData({...planFormData, paymentLink: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white" placeholder="Link de Pagamento (Opcional)" /><textarea value={planFormData.features} onChange={e=>setPlanFormData({...planFormData, features: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white text-xs" rows={5} placeholder="Features" /><button className="w-full bg-red-600 py-3 rounded text-white font-bold">Salvar</button></form></div></div>
                        <div className="lg:col-span-2"><div className="bg-black rounded-3xl p-8 border border-slate-800 space-y-2">{plans.map(p=><div key={p.id} className="flex justify-between p-3 border border-slate-900 rounded"><span className="text-white font-bold">{p.name}</span><div className="flex gap-2"><button onClick={()=>handleEditPlan(p)}><Edit3 size={16} className="text-slate-500"/></button><button onClick={()=>handleDeletePlan(p.id)}><Trash2 size={16} className="text-red-500"/></button></div></div>)}</div></div>
                    </div>
                )}
                {activePlanTab === 'page_settings' && isSuperAdmin && (
                     <div className="bg-black rounded-3xl p-10 border border-slate-800">
                        <div className="flex justify-between mb-6">
                            <h2 className="text-white font-bold">Conteúdo da Página de Planos</h2>
                            <button onClick={handlePlansCmsSubmit} disabled={isUploading} className="bg-purple-600 px-4 py-2 rounded text-white font-bold text-xs uppercase disabled:opacity-50 flex items-center gap-2">
                                {isUploading ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Salvar'}
                            </button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs text-slate-500 uppercase font-bold">Imagem de Fundo (Hero)</label>
                                    <div className="flex bg-slate-900 rounded p-1">
                                        <button onClick={() => setPlansHeroMode('upload')} className={`p-1.5 rounded transition-all ${plansHeroMode === 'upload' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`} title="Upload"><UploadCloud size={14}/></button>
                                        <button onClick={() => setPlansHeroMode('url')} className={`p-1.5 rounded transition-all ${plansHeroMode === 'url' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`} title="Link URL"><LinkIcon size={14}/></button>
                                    </div>
                                </div>
                                
                                {plansHeroMode === 'upload' ? (
                                    <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center hover:border-purple-500 transition-colors cursor-pointer relative group h-48 flex flex-col items-center justify-center">
                                        <input type="file" onChange={(e) => {if(e.target.files) setPlansHeroBgFile(e.target.files[0])}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                        {plansHeroBgFile ? (
                                            <p className="text-green-500 text-xs font-bold">{plansHeroBgFile.name}</p>
                                        ) : (
                                            plansCmsData.hero.bgImage ? (
                                                <img src={plansCmsData.hero.bgImage} alt="Hero Bg" className="h-full w-full object-cover rounded opacity-50 group-hover:opacity-30" />
                                            ) : <ImageIcon className="text-slate-600 mb-2" />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="bg-black/70 px-3 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">Trocar Imagem</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-48 flex flex-col gap-2">
                                        <input 
                                            type="text" 
                                            value={plansCmsData.hero.bgImage} 
                                            onChange={e => setPlansCmsData({...plansCmsData, hero: {...plansCmsData.hero, bgImage: e.target.value}})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white text-xs" 
                                            placeholder="https://..." 
                                        />
                                        <div className="flex-1 bg-slate-900 rounded border border-slate-800 overflow-hidden relative">
                                            {plansCmsData.hero.bgImage && <img src={plansCmsData.hero.bgImage} className="w-full h-full object-cover opacity-50" alt="Preview" />}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Título Hero</label><input type="text" value={plansCmsData.hero.title} onChange={e=>setPlansCmsData({...plansCmsData, hero: {...plansCmsData.hero, title: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/></div>
                                <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Subtítulo Hero</label><textarea value={plansCmsData.hero.subtitle} onChange={e=>setPlansCmsData({...plansCmsData, hero: {...plansCmsData.hero, subtitle: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white" rows={4}/></div>
                            </div>
                        </div>
                    </div>
                )}
             </div>
        )}

        {/* CMS */}
        {activeSection === 'cms' && isSuperAdmin && (
          <div className="space-y-8">
             <div className="flex bg-black p-1.5 rounded-xl border border-slate-800 w-fit gap-1">
                <button onClick={() => setActiveCmsTab('home')} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeCmsTab === 'home' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Home</button>
                <button onClick={() => setActiveCmsTab('welcome')} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeCmsTab === 'welcome' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Boas-Vindas</button>
            </div>
            
            {/* HOME TAB */}
            {activeCmsTab === 'home' && (
               <div className="bg-black rounded-3xl p-10 border border-slate-800">
                  <div className="flex justify-between mb-8">
                      <h2 className="text-white font-bold">Editor Site (Home)</h2>
                      <button 
                        onClick={handleCmsSubmit} 
                        disabled={isUploading}
                        className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-bold text-xs uppercase disabled:opacity-50 flex items-center gap-2 transition-all"
                      >
                         {isUploading ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Salvar Alterações'}
                      </button>
                  </div>
                  
                  {/* HERO SECTION */}
                  <div className="mb-10 p-6 bg-slate-950/50 border border-slate-900 rounded-2xl">
                    <h3 className="text-white font-bold text-sm mb-4 border-b border-slate-900 pb-2">Seção Hero (Principal)</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs text-slate-500 uppercase font-bold">Imagem de Fundo (Hero)</label>
                                <div className="flex bg-slate-900 rounded p-1">
                                    <button onClick={() => setHeroMode('upload')} className={`p-1.5 rounded transition-all ${heroMode === 'upload' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`} title="Upload"><UploadCloud size={14}/></button>
                                    <button onClick={() => setHeroMode('url')} className={`p-1.5 rounded transition-all ${heroMode === 'url' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`} title="Link URL"><LinkIcon size={14}/></button>
                                </div>
                            </div>
                            
                            {heroMode === 'upload' ? (
                                <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center hover:border-red-500 transition-colors cursor-pointer relative group h-48 flex flex-col items-center justify-center">
                                    <input type="file" onChange={(e) => {if(e.target.files) setHeroBgFile(e.target.files[0])}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                    {heroBgFile ? (
                                        <p className="text-green-500 text-xs font-bold">{heroBgFile.name}</p>
                                    ) : (
                                        cmsData.hero.bgImage ? (
                                            <img src={cmsData.hero.bgImage} alt="Hero Bg" className="h-full w-full object-cover rounded opacity-50 group-hover:opacity-30" />
                                        ) : <ImageIcon className="text-slate-600 mb-2" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="bg-black/70 px-3 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">Trocar Imagem</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 flex flex-col gap-2">
                                    <input 
                                        type="text" 
                                        value={cmsData.hero.bgImage} 
                                        onChange={e => setCmsData({...cmsData, hero: {...cmsData.hero, bgImage: e.target.value}})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white text-xs" 
                                        placeholder="https://..." 
                                    />
                                    <div className="flex-1 bg-slate-900 rounded border border-slate-800 overflow-hidden relative">
                                        {cmsData.hero.bgImage && <img src={cmsData.hero.bgImage} className="w-full h-full object-cover opacity-50" alt="Preview" />}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Título Principal (Linha 1)</label><input type="text" value={cmsData.hero.titleLine1} onChange={e=>setCmsData({...cmsData, hero: {...cmsData.hero, titleLine1: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/></div>
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Destaque (Cor)</label><input type="text" value={cmsData.hero.titleHighlight} onChange={e=>setCmsData({...cmsData, hero: {...cmsData.hero, titleHighlight: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/></div>
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Descrição</label><textarea value={cmsData.hero.description} onChange={e=>setCmsData({...cmsData, hero: {...cmsData.hero, description: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white" rows={3}/></div>
                        </div>
                    </div>
                  </div>

                  {/* ABOUT SECTION */}
                  <div className="mb-10 p-6 bg-slate-950/50 border border-slate-900 rounded-2xl">
                    <h3 className="text-white font-bold text-sm mb-4 border-b border-slate-900 pb-2">Seção Sobre</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs text-slate-500 uppercase font-bold">Imagem Ilustrativa</label>
                                <div className="flex bg-slate-900 rounded p-1">
                                    <button onClick={() => setAboutMode('upload')} className={`p-1.5 rounded transition-all ${aboutMode === 'upload' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`} title="Upload"><UploadCloud size={14}/></button>
                                    <button onClick={() => setAboutMode('url')} className={`p-1.5 rounded transition-all ${aboutMode === 'url' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`} title="Link URL"><LinkIcon size={14}/></button>
                                </div>
                            </div>
                            
                            {aboutMode === 'upload' ? (
                                <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center hover:border-red-500 transition-colors cursor-pointer relative group h-48 flex flex-col items-center justify-center">
                                    <input type="file" onChange={(e) => {if(e.target.files) setAboutImgFile(e.target.files[0])}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                    {aboutImgFile ? (
                                        <p className="text-green-500 text-xs font-bold">{aboutImgFile.name}</p>
                                    ) : (
                                        cmsData.about.imageUrl ? (
                                            <img src={cmsData.about.imageUrl} alt="About Img" className="h-full w-full object-cover rounded opacity-50 group-hover:opacity-30" />
                                        ) : <ImageIcon className="text-slate-600 mb-2" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="bg-black/70 px-3 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">Trocar Imagem</span>
                                    </div>
                                </div>
                            ) : (
                                 <div className="h-48 flex flex-col gap-2">
                                    <input 
                                        type="text" 
                                        value={cmsData.about.imageUrl} 
                                        onChange={e => setCmsData({...cmsData, about: {...cmsData.about, imageUrl: e.target.value}})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white text-xs" 
                                        placeholder="https://..." 
                                    />
                                    <div className="flex-1 bg-slate-900 rounded border border-slate-800 overflow-hidden relative">
                                        {cmsData.about.imageUrl && <img src={cmsData.about.imageUrl} className="w-full h-full object-cover opacity-50" alt="Preview" />}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Título da Seção</label><input type="text" value={cmsData.about.title} onChange={e=>setCmsData({...cmsData, about: {...cmsData.about, title: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/></div>
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Descrição</label><textarea value={cmsData.about.description} onChange={e=>setCmsData({...cmsData, about: {...cmsData.about, description: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white" rows={5}/></div>
                        </div>
                    </div>
                  </div>

                  {/* FOUNDER SECTION */}
                  <div className="mb-10 p-6 bg-slate-950/50 border border-slate-900 rounded-2xl">
                    <h3 className="text-white font-bold text-sm mb-4 border-b border-slate-900 pb-2">Seção Fundador</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                             <div className="flex justify-between items-center mb-2">
                                <label className="text-xs text-slate-500 uppercase font-bold">Foto do Fundador</label>
                                <div className="flex bg-slate-900 rounded p-1">
                                    <button onClick={() => setFounderMode('upload')} className={`p-1.5 rounded transition-all ${founderMode === 'upload' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`} title="Upload"><UploadCloud size={14}/></button>
                                    <button onClick={() => setFounderMode('url')} className={`p-1.5 rounded transition-all ${founderMode === 'url' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`} title="Link URL"><LinkIcon size={14}/></button>
                                </div>
                            </div>

                            {founderMode === 'upload' ? (
                                <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center hover:border-red-500 transition-colors cursor-pointer relative group h-64 flex flex-col items-center justify-center">
                                    <input type="file" onChange={(e) => {if(e.target.files) setFounderImgFile(e.target.files[0])}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                    {founderImgFile ? (
                                        <p className="text-green-500 text-xs font-bold">{founderImgFile.name}</p>
                                    ) : (
                                        cmsData.founder.imageUrl ? (
                                            <img src={cmsData.founder.imageUrl} alt="Founder Img" className="h-full w-full object-cover rounded opacity-50 group-hover:opacity-30" />
                                        ) : <ImageIcon className="text-slate-600 mb-2" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="bg-black/70 px-3 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">Trocar Imagem</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col gap-2">
                                    <input 
                                        type="text" 
                                        value={cmsData.founder.imageUrl} 
                                        onChange={e => setCmsData({...cmsData, founder: {...cmsData.founder, imageUrl: e.target.value}})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white text-xs" 
                                        placeholder="https://..." 
                                    />
                                    <div className="flex-1 bg-slate-900 rounded border border-slate-800 overflow-hidden relative">
                                        {cmsData.founder.imageUrl && <img src={cmsData.founder.imageUrl} className="w-full h-full object-cover opacity-50" alt="Preview" />}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Nome</label><input type="text" value={cmsData.founder.name} onChange={e=>setCmsData({...cmsData, founder: {...cmsData.founder, name: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/></div>
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Cargo / Título</label><input type="text" value={cmsData.founder.role} onChange={e=>setCmsData({...cmsData, founder: {...cmsData.founder, role: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/></div>
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Bio / Descrição</label><textarea value={cmsData.founder.description} onChange={e=>setCmsData({...cmsData, founder: {...cmsData.founder, description: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white" rows={6}/></div>
                        </div>
                    </div>
                  </div>

                  {/* FOOTER SECTION */}
                  <div className="p-6 bg-slate-950/50 border border-slate-900 rounded-2xl">
                    <h3 className="text-white font-bold text-sm mb-4 border-b border-slate-900 pb-2">Rodapé Global</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                             <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Descrição Curta (Slogan)</label><textarea value={cmsData.footer?.description} onChange={e=>setCmsData({...cmsData, footer: {...(cmsData.footer || {}), description: e.target.value} as any})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white" rows={3}/></div>
                        </div>
                        <div className="space-y-4">
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Instagram Link</label><input type="text" value={cmsData.footer?.instagramLink} onChange={e=>setCmsData({...cmsData, footer: {...(cmsData.footer || {}), instagramLink: e.target.value} as any})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/></div>
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">YouTube Link</label><input type="text" value={cmsData.footer?.youtubeLink} onChange={e=>setCmsData({...cmsData, footer: {...(cmsData.footer || {}), youtubeLink: e.target.value} as any})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/></div>
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">WhatsApp Link</label><input type="text" value={cmsData.footer?.whatsappLink} onChange={e=>setCmsData({...cmsData, footer: {...(cmsData.footer || {}), whatsappLink: e.target.value} as any})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/></div>
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">E-mail Suporte</label><input type="text" value={cmsData.footer?.supportEmail} onChange={e=>setCmsData({...cmsData, footer: {...(cmsData.footer || {}), supportEmail: e.target.value} as any})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/></div>
                             <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Texto Copyright</label><input type="text" value={cmsData.footer?.copyrightText} onChange={e=>setCmsData({...cmsData, footer: {...(cmsData.footer || {}), copyrightText: e.target.value} as any})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/></div>
                        </div>
                    </div>
                  </div>

                  {isUploading && (
                        <div className="mt-6 w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                            <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                  )}

               </div>
            )}

            {/* WELCOME TAB */}
            {activeCmsTab === 'welcome' && (
              <div className="bg-black rounded-3xl p-10 border border-slate-800">
                 <div className="flex justify-between mb-8">
                     <h2 className="text-white font-bold">Editor Página de Boas-vindas (Welcome)</h2>
                     <button 
                        onClick={handleWelcomeCmsSubmit} 
                        disabled={isUploading}
                        className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-bold text-xs uppercase disabled:opacity-50 flex items-center gap-2 transition-all"
                      >
                         {isUploading ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Salvar'}
                      </button>
                 </div>
                 
                 <div className="space-y-8">
                     {/* Hero Section */}
                     <div className="p-4 border border-slate-900 rounded-xl bg-slate-950/30">
                         <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><Star size={14} className="text-red-500"/> Seção Principal</h3>
                         
                         <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs text-slate-500 uppercase font-bold">Imagem de Fundo</label>
                                <div className="flex bg-slate-900 rounded p-1">
                                    <button onClick={() => setWelcomeMode('upload')} className={`p-1.5 rounded transition-all ${welcomeMode === 'upload' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`} title="Upload"><UploadCloud size={14}/></button>
                                    <button onClick={() => setWelcomeMode('url')} className={`p-1.5 rounded transition-all ${welcomeMode === 'url' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`} title="Link URL"><LinkIcon size={14}/></button>
                                </div>
                            </div>

                            {welcomeMode === 'upload' ? (
                                <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center hover:border-red-500 transition-colors cursor-pointer relative group h-48 flex flex-col items-center justify-center">
                                    <input type="file" onChange={(e) => {if(e.target.files) setWelcomeBgFile(e.target.files[0])}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                    {welcomeBgFile ? (
                                        <p className="text-green-500 text-xs font-bold">{welcomeBgFile.name}</p>
                                    ) : (
                                        welcomeCmsData.hero.bgImage ? (
                                            <img src={welcomeCmsData.hero.bgImage} alt="Welcome Bg" className="h-full w-full object-cover rounded opacity-50 group-hover:opacity-30" />
                                        ) : <ImageIcon className="text-slate-600 mb-2" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="bg-black/70 px-3 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">Trocar Imagem</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 flex flex-col gap-2">
                                    <input 
                                        type="text" 
                                        value={welcomeCmsData.hero.bgImage} 
                                        onChange={e => setWelcomeCmsData({...welcomeCmsData, hero: {...welcomeCmsData.hero, bgImage: e.target.value}})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white text-xs" 
                                        placeholder="https://..." 
                                    />
                                    <div className="flex-1 bg-slate-900 rounded border border-slate-800 overflow-hidden relative">
                                        {welcomeCmsData.hero.bgImage && <img src={welcomeCmsData.hero.bgImage} className="w-full h-full object-cover opacity-50" alt="Preview" />}
                                    </div>
                                </div>
                            )}
                        </div>

                         <div className="grid md:grid-cols-2 gap-6">
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Título Principal</label><input type="text" value={welcomeCmsData.hero.title} onChange={e=>setWelcomeCmsData({...welcomeCmsData, hero: {...welcomeCmsData.hero, title: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/></div>
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Prefixo Saudação</label><input type="text" value={welcomeCmsData.hero.subtitlePrefix} onChange={e=>setWelcomeCmsData({...welcomeCmsData, hero: {...welcomeCmsData.hero, subtitlePrefix: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white" placeholder="Olá,"/></div>
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Sufixo Saudação</label><input type="text" value={welcomeCmsData.hero.subtitleSuffix} onChange={e=>setWelcomeCmsData({...welcomeCmsData, hero: {...welcomeCmsData.hero, subtitleSuffix: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/></div>
                         </div>
                     </div>

                     {/* Features Lists */}
                     <div className="grid md:grid-cols-2 gap-6">
                         <div className="p-4 border border-slate-900 rounded-xl bg-slate-950/30">
                             <h3 className="text-white font-bold text-sm mb-4">Seção 1 (Aprendizado)</h3>
                             <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Título</label>
                             <input type="text" value={welcomeCmsData.section1.title} onChange={e=>setWelcomeCmsData({...welcomeCmsData, section1: {...welcomeCmsData.section1, title: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white mb-4"/>
                             <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Itens (Um por linha)</label>
                             <textarea rows={5} value={welcomeCmsData.section1.items.join('\n')} onChange={e=>setWelcomeCmsData({...welcomeCmsData, section1: {...welcomeCmsData.section1, items: e.target.value.split('\n')}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/>
                         </div>
                         <div className="p-4 border border-slate-900 rounded-xl bg-slate-950/30">
                             <h3 className="text-white font-bold text-sm mb-4">Seção 2 (Expectativas)</h3>
                             <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Título</label>
                             <input type="text" value={welcomeCmsData.section2.title} onChange={e=>setWelcomeCmsData({...welcomeCmsData, section2: {...welcomeCmsData.section2, title: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white mb-4"/>
                             <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Itens (Um por linha)</label>
                             <textarea rows={5} value={welcomeCmsData.section2.items.join('\n')} onChange={e=>setWelcomeCmsData({...welcomeCmsData, section2: {...welcomeCmsData.section2, items: e.target.value.split('\n')}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/>
                         </div>
                     </div>

                     {/* Terms & Link */}
                     <div className="p-4 border border-slate-900 rounded-xl bg-slate-950/30">
                         <div className="grid md:grid-cols-2 gap-6">
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Link WhatsApp</label><input type="text" value={welcomeCmsData.whatsappLink} onChange={e=>setWelcomeCmsData({...welcomeCmsData, whatsappLink: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/></div>
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Texto de Termos</label><textarea rows={3} value={welcomeCmsData.terms.text} onChange={e=>setWelcomeCmsData({...welcomeCmsData, terms: {...welcomeCmsData.terms, text: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"/></div>
                         </div>
                     </div>
                 </div>
              </div>
            )}
            
          </div>
        )}

        {/* APPEARANCE */}
        {activeSection === 'appearance' && isSuperAdmin && (
             <div className="bg-black rounded-3xl p-10 border border-slate-800 max-w-md mx-auto"><h2 className="text-white font-bold mb-6">Aparência</h2><button onClick={handleThemeSubmit} className="w-full bg-white text-black font-bold py-3 rounded">Aplicar Padrões</button></div>
        )}

      </div>
    </div>
  );
};

export default Admin;