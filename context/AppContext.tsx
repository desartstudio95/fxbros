import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, VideoLesson, PricingPlan, HomeContent, ThemeSettings, Testimonial, ModuleResource, AppNotification, PlansPageContent, ModuleMetadata, WelcomeContent } from '../types';
import { supabase } from '../supabaseClient';

interface AppContextType {
  user: User | null;
  login: (identifier: string, role: 'admin' | 'member' | 'super_admin', password?: string) => Promise<'active' | 'pending' | 'blocked' | 'invalid_code' | 'not_found' | 'error'>;
  register: (email: string, name: string, planId?: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  videos: VideoLesson[];
  addVideo: (video: VideoLesson) => void;
  deleteVideo: (id: string) => void;
  updateVideo: (video: VideoLesson) => void;
  resources: ModuleResource[];
  addResource: (resource: ModuleResource) => void;
  deleteResource: (id: string) => void;
  plans: PricingPlan[];
  addPlan: (plan: PricingPlan) => void;
  deletePlan: (id: string) => void;
  updatePlan: (plan: PricingPlan) => void;
  plansPageContent: PlansPageContent;
  updatePlansPageContent: (content: PlansPageContent) => void;
  modulesMetadata: ModuleMetadata[];
  updateModuleMetadata: (metadata: ModuleMetadata) => void;
  deleteModuleMetadata: (id: string) => void;
  homeContent: HomeContent;
  updateHomeContent: (content: HomeContent) => void;
  welcomeContent: WelcomeContent;
  updateWelcomeContent: (content: WelcomeContent) => void;
  themeSettings: ThemeSettings;
  updateThemeSettings: (settings: ThemeSettings) => void;
  testimonials: Testimonial[];
  addTestimonial: (testimonial: Testimonial) => void;
  completedVideoIds: string[];
  toggleVideoCompletion: (id: string) => void;
  favoriteVideoIds: string[];
  toggleVideoFavorite: (id: string) => void;
  allUsers: User[];
  updateUserStatus: (userId: string, status: 'active' | 'pending' | 'blocked') => void;
  updateUserProfile: (name: string, avatar: string) => void;
  updateUserModules: (userId: string, modules: string[]) => void;
  updateUserPlan: (userId: string, planId: string) => void;
  deleteUser: (userId: string) => void;
  markNotificationAsRead: (userId: string, notificationId: string) => void;
  sendGlobalAnnouncement: (title: string, message: string) => void;
  requestNotificationPermission: () => void;
}

// --- DEFAULTS (Content & Data) ---

const defaultHomeContent: HomeContent = {
  hero: {
    badge: 'Educação de Nível Institucional',
    titleLine1: 'Domine a Arte da',
    titleHighlight: 'Precisão no Trading',
    description: 'Junte-se ao círculo de elite de traders lucrativos. Combinamos análise técnica, dados institucionais e treinamento psicológico rigoroso.',
    bgImage: 'https://i.ibb.co/8Lt4Yrb1/Whisk-76888b109aec7939e59491f4a2baecafdr.jpg'
  },
  about: {
    badge: 'Nossa Metodologia',
    title: 'Trading Baseado em Dados. Sem Achismos.',
    description: 'Ensinamos você a interpretar o mercado pela ótica institucional.',
    imageUrl: 'https://i.ibb.co/bjrMzyJP/Whisk-b7b5d8d9cc7bdb4b2c94e4cb8a9d59addr.jpg',
    items: ["Análise Institucional", "Gestão de Risco", "Algoritmos", "Psicologia"]
  },
  founder: {
    name: 'Isaac Mugabe',
    role: 'Coach - Fundador',
    description: `Fundador e Trader Profissional com 6 anos de experiência no mercado Forex, dedicou sua carreira ao estudo profundo dos mercados financeiros, gestão de risco e desenvolvimento de estratégias consistentes. Ao longo desses anos, construiu uma metodologia própria baseada em disciplina, análise técnica e controle emocional — pilares essenciais para a longevidade no trading.\n\nCom experiência prática em diferentes ciclos de mercado, seu foco sempre foi transformar conhecimento técnico em resultados reais e sustentáveis. A academia nasceu com o propósito de ensinar Forex de forma clara, profissional e responsável, ajudando traders a evoluírem com método, mentalidade correta e visão de longo prazo.\n\nMais do que ensinar a operar, o fundador acredita em formar traders preparados para tomar decisões conscientes, gerir risco com inteligência e atuar no mercado com consistência e profissionalismo.`,
    imageUrl: 'https://i.ibb.co/qYvQNZrY/FXBROS-WORLD-2.png',
    yearsExp: '6+',
    assetsManaged: '2B MT'
  },
  footer: {
    description: 'A primeira academia High-Tech de Forex. Formamos traders consistentes através de dados institucionais e psicologia avançada.',
    instagramLink: 'https://www.instagram.com/_forexbros_/',
    youtubeLink: 'https://youtube.com/@fxbroscapital',
    whatsappLink: 'https://wa.link/r71g96',
    supportEmail: 'suporte@fxbros.com',
    copyrightText: '© 2026 FXBROS SCHOOL OF SKILLS.'
  }
};

const defaultPlansPageContent: PlansPageContent = {
  hero: {
    badge: 'Investimento em Você',
    title: 'Escolha Seu Nível de Excelência',
    subtitle: 'Planos desenhados para acompanhar cada estágio da sua evolução.',
    bgImage: 'https://i.ibb.co/tpNWk1b3/Whisk-d222899255279fb84a0494d3fcb069a1dr.jpg'
  },
  benefitsSection: {
    title: 'Por que FXBROS?',
    subtitle: 'Ecossistema completo focado em alta performance.'
  }
};

const defaultWelcomeContent: WelcomeContent = {
  hero: {
    title: 'Bem-vindo à FXBROS.',
    subtitlePrefix: 'Olá,',
    subtitleSuffix: 'Sua jornada para a consistência começa agora.',
    bgImage: 'https://i.ibb.co/0y04kDk1/Whisk-b3242647bfe5403b0614d6233e6f09d5dr.jpg'
  },
  section1: { 
    title: 'O Caminho do Trader', 
    items: [
      'Domínio completo da estrutura de mercado institucional.', 
      'Gestão de risco profissional para proteção de capital.', 
      'Psicologia avançada para execução fria e calculada.'
    ] 
  },
  section2: { 
    title: 'O Que Esperamos de Você', 
    items: [
      'Disciplina inegociável. Siga o plano, não suas emoções.', 
      'Resiliência. O mercado pune a arrogância e premia a paciência.', 
      'Comprometimento. Estude cada aula como se sua liberdade dependesse disso.'
    ] 
  },
  terms: { 
    text: 'Todo conteúdo disponibilizado na plataforma é de propriedade intelectual da FXBROS. O compartilhamento de login, gravação de aulas ou distribuição de material resultará no bloqueio imediato e permanente da conta sem reembolso. Ao prosseguir, você concorda com nossa política de tolerância zero para pirataria.' 
  },
  whatsappLink: 'https://chat.whatsapp.com/ExemploDeGrupo'
};

const defaultThemeSettings: ThemeSettings = {
  fontFamily: 'Inter',
  baseFontSize: '16px'
};

// --- DATA MOCKS (Fallbacks) ---

const defaultVideos: VideoLesson[] = [
  {
    id: 'vid-1',
    title: 'Introdução ao Mercado Forex',
    description: 'Entenda os fundamentos do maior mercado financeiro do mundo.',
    thumbnail: 'https://images.unsplash.com/photo-1611974765215-0dd5963263c4?auto=format&fit=crop&q=80&w=600',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '15:00',
    module: 'Fundamentos',
    dateAdded: new Date().toISOString()
  },
  {
    id: 'vid-2',
    title: 'Velas Japonesas e Padrões',
    description: 'Como ler o comportamento do preço através dos candles.',
    thumbnail: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=600',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '22:30',
    module: 'Análise Técnica',
    dateAdded: new Date().toISOString()
  },
  {
    id: 'vid-3',
    title: 'Psicologia do Trader Vencedor',
    description: 'Blindando sua mente contra o medo e a ganância.',
    thumbnail: 'https://images.unsplash.com/photo-1555431189-0fabf2667795?auto=format&fit=crop&q=80&w=600',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '18:45',
    module: 'Psicologia',
    dateAdded: new Date().toISOString()
  }
];

const defaultPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '2.500 MZN',
    features: ['Acesso ao Módulo Fundamentos', 'Suporte Básico via E-mail', 'Acesso à Comunidade Discord'],
    isPopular: false,
    isElite: false,
    allowedModules: ['Fundamentos'],
    paymentLink: ''
  },
  {
    id: 'pro',
    name: 'Pro Trader',
    price: '5.000 MZN',
    features: ['Acesso a Todos os Módulos', 'Suporte Prioritário', 'Calls Semanais ao Vivo', 'Análises de Mercado Diárias'],
    isPopular: true,
    isElite: false,
    allowedModules: ['Fundamentos', 'Análise Técnica', 'Psicologia', 'Gestão de Risco'],
    paymentLink: ''
  },
  {
    id: 'professional',
    name: 'PROFISSIONAL',
    price: '7.000 MZN',
    features: [
        'Suíte Avançada de Estratégias',
        'Chamada de Estratégia 1-a-1',
        'Sessões de Trading Ao Vivo',
        'Preparação para Mesa Proprietária',
        'Suporte Prioritário'
    ],
    isPopular: false,
    isElite: false,
    allowedModules: ['Fundamentos', 'Análise Técnica', 'Psicologia', 'Gestão de Risco', 'Smart Money Concepts'],
    paymentLink: ''
  },
  {
    id: 'elite',
    name: 'Elite Mentorship',
    price: '15.000 MZN',
    features: ['Acesso Vitalício', 'Mentoria 1-on-1 Mensal', 'Grupo VIP Exclusivo', 'Acesso ao Algo Trading'],
    isPopular: false,
    isElite: true,
    allowedModules: ['Fundamentos', 'Análise Técnica', 'Psicologia', 'Gestão de Risco', 'Smart Money Concepts', 'Algo Trading'],
    paymentLink: ''
  }
];

const defaultModulesMetadata: ModuleMetadata[] = [
    { id: 'Fundamentos', name: 'Fundamentos', description: 'O básico essencial para iniciar sua jornada no trading.', thumbnail: 'https://images.unsplash.com/photo-1611974765215-0dd5963263c4?auto=format&fit=crop&q=80&w=600' },
    { id: 'Análise Técnica', name: 'Análise Técnica', description: 'Domine a leitura de gráficos e price action.', thumbnail: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=600' },
    { id: 'Psicologia', name: 'Psicologia', description: 'Desenvolva a mentalidade de um trader profissional.', thumbnail: 'https://images.unsplash.com/photo-1555431189-0fabf2667795?auto=format&fit=crop&q=80&w=600' },
    { id: 'Smart Money Concepts', name: 'Smart Money Concepts', description: 'Decodifique o rastro do dinheiro institucional. Domine Order Blocks, Liquidez e Estrutura Avançada.', thumbnail: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&q=80&w=600' }
];

const ADMIN_CODE = "FXADMIN";
const SUPER_ADMIN_CODE = "FXROOT";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  // Initialize with Defaults so the app isn't empty on first load
  const [videos, setVideos] = useState<VideoLesson[]>(defaultVideos);
  const [resources, setResources] = useState<ModuleResource[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>(defaultPlans);
  const [modulesMetadata, setModulesMetadata] = useState<ModuleMetadata[]>(defaultModulesMetadata);
  
  // CMS & Settings State
  const [homeContent, setHomeContent] = useState<HomeContent>(defaultHomeContent);
  const [plansPageContent, setPlansPageContent] = useState<PlansPageContent>(defaultPlansPageContent);
  const [welcomeContent, setWelcomeContent] = useState<WelcomeContent>(defaultWelcomeContent);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // User Preferences
  const [completedVideoIds, setCompletedVideoIds] = useState<string[]>(() => {
      const saved = localStorage.getItem('fxbros_completedVideos');
      return saved ? JSON.parse(saved) : [];
  });
  const [favoriteVideoIds, setFavoriteVideoIds] = useState<string[]>(() => {
      const saved = localStorage.getItem('fxbros_favoriteVideos');
      return saved ? JSON.parse(saved) : [];
  });

  // --- SUPABASE DATA FETCHING ---
  const fetchInitialData = async () => {
    try {
      // 1. Videos
      const { data: vids } = await supabase.from('videos').select('*');
      if (vids && vids.length > 0) {
          setVideos(vids.map(v => ({ ...v, videoUrl: v.video_url, dateAdded: v.date_added })));
      }

      // 2. Resources
      const { data: res } = await supabase.from('resources').select('*');
      if (res && res.length > 0) {
          setResources(res.map(r => ({ ...r, dateAdded: r.date_added })));
      }

      // 3. Plans
      const { data: pl } = await supabase.from('plans').select('*');
      if (pl && pl.length > 0) {
          setPlans(pl.map(p => ({ 
            ...p, 
            isPopular: p.is_popular, 
            isElite: p.is_elite, 
            allowedModules: p.allowed_modules, 
            paymentLink: p.payment_link 
          })));
      }

      // 4. CMS & Settings (Key-Value Store in 'site_settings' table)
      const { data: settings } = await supabase.from('site_settings').select('*');
      if (settings && settings.length > 0) {
        settings.forEach(item => {
           if (item.key === 'homeContent') setHomeContent(item.value);
           if (item.key === 'plansPageContent') setPlansPageContent(item.value);
           if (item.key === 'welcomeContent') setWelcomeContent(item.value);
           if (item.key === 'modulesMetadata') setModulesMetadata(item.value);
           if (item.key === 'themeSettings') setThemeSettings(item.value);
           if (item.key === 'testimonials') setTestimonials(item.value);
        });
      }

      // 5. Users (Only if admin)
      const { data: profiles } = await supabase.from('profiles').select('*');
      if (profiles && profiles.length > 0) {
          const mappedUsers: User[] = profiles.map(p => ({
              id: p.id,
              name: p.name,
              email: p.email,
              role: p.role,
              status: p.status,
              planId: p.plan_id,
              joinDate: p.join_date,
              avatar: p.avatar,
              allowedModules: p.allowed_modules,
              notifications: p.notifications
          }));
          setAllUsers(mappedUsers);
      }

    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
      // Fallback to defaults is already handled by initial state
    }
  };

  // Check Auth Session on Mount
  useEffect(() => {
    const checkSession = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (session && session.user) {
           // Fetch profile details
           const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
           if (profile) {
               setUser({
                   id: profile.id,
                   name: profile.name,
                   email: profile.email,
                   role: profile.role,
                   status: profile.status,
                   planId: profile.plan_id,
                   joinDate: profile.join_date,
                   avatar: profile.avatar,
                   allowedModules: profile.allowed_modules,
                   notifications: profile.notifications
               });
           }
       }
       await fetchInitialData();
    };
    checkSession();
  }, []);

  // Sync Local Preferences
  useEffect(() => { localStorage.setItem('fxbros_completedVideos', JSON.stringify(completedVideoIds)); }, [completedVideoIds]);
  useEffect(() => { localStorage.setItem('fxbros_favoriteVideos', JSON.stringify(favoriteVideoIds)); }, [favoriteVideoIds]);


  // --- AUTH ACTIONS ---

  const login = async (identifier: string, role: 'admin' | 'member' | 'super_admin', password?: string): Promise<'active' | 'pending' | 'blocked' | 'invalid_code' | 'not_found' | 'error'> => {
    
    // Legacy Admin Codes (Backdoor for demo/setup if auth fails or no internet)
    if (role === 'admin' && identifier === ADMIN_CODE) {
        const adminUser: User = { id: 'admin-local', name: 'Gestor FXBROS', email: 'admin@fxbros.com', role: 'admin', status: 'active', joinDate: new Date().toISOString(), avatar: `https://ui-avatars.com/api/?name=Admin` };
        setUser(adminUser); return 'active';
    }
    if (role === 'super_admin' && identifier === SUPER_ADMIN_CODE) {
        const superUser: User = { id: 'root-local', name: 'Sistema Central', email: 'root@fxbros.com', role: 'super_admin', status: 'active', joinDate: new Date().toISOString(), avatar: `https://ui-avatars.com/api/?name=Root` };
        setUser(superUser); return 'active';
    }

    if (!password) return 'invalid_code';

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: identifier,
            password: password
        });

        if (error || !data.user) {
            return 'invalid_code';
        }

        // Fetch extra profile data
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        
        if (profile) {
            setUser({
               id: profile.id,
               name: profile.name,
               email: profile.email,
               role: profile.role,
               status: profile.status,
               planId: profile.plan_id,
               joinDate: profile.join_date,
               avatar: profile.avatar,
               allowedModules: profile.allowed_modules,
               notifications: profile.notifications
            });
            return profile.status;
        }

        return 'not_found';

    } catch (e) {
        console.error(e);
        return 'error';
    }
  };

  const register = async (email: string, name: string, planId: string = 'starter', password?: string): Promise<boolean> => {
    if (!password) return false;
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name } // Metadata
            }
        });

        if (error || !data.user) return false;

        // Create Profile Entry
        const newUserProfile = {
            id: data.user.id,
            email,
            name,
            role: 'member',
            status: 'pending',
            plan_id: planId,
            join_date: new Date().toISOString(),
            avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`,
            notifications: []
        };

        const { error: profileError } = await supabase.from('profiles').insert([newUserProfile]);

        if (profileError) {
             console.error("Error creating profile:", profileError);
             return false;
        }

        // Set local state immediately
        setUser({
            id: newUserProfile.id,
            email: newUserProfile.email,
            name: newUserProfile.name,
            role: 'member',
            status: 'pending',
            planId: newUserProfile.plan_id,
            joinDate: newUserProfile.join_date,
            avatar: newUserProfile.avatar,
            allowedModules: [],
            notifications: []
        });

        return true;

    } catch (e) {
        console.error(e);
        return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // Clear user state
    setUser(null);
    // Clear local storage preferences to ensure clean state for next user
    localStorage.removeItem('fxbros_completedVideos');
    localStorage.removeItem('fxbros_favoriteVideos');
    setCompletedVideoIds([]);
    setFavoriteVideoIds([]);
  };

  // --- DATA ACTIONS (PERSIST TO SUPABASE) ---

  const addVideo = async (video: VideoLesson) => {
    const dbVideo = {
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        video_url: video.videoUrl,
        duration: video.duration,
        module: video.module,
        date_added: video.dateAdded
    };
    await supabase.from('videos').insert(dbVideo);
    setVideos(prev => [video, ...prev]);
    // Notify
    allUsers.forEach(u => {
         if(u.role === 'member') sendNotificationToUser(u.id, "Nova Aula", `Aula "${video.title}" adicionada.`, 'success');
    });
  };

  const deleteVideo = async (id: string) => {
      await supabase.from('videos').delete().eq('id', id);
      setVideos(prev => prev.filter(v => v.id !== id));
  };

  const updateVideo = async (video: VideoLesson) => {
      const dbVideo = {
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        video_url: video.videoUrl,
        module: video.module,
      };
      await supabase.from('videos').update(dbVideo).eq('id', video.id);
      setVideos(prev => prev.map(v => v.id === video.id ? video : v));
  };

  const addResource = async (resource: ModuleResource) => {
      const dbRes = {
          id: resource.id,
          title: resource.title,
          url: resource.url,
          module: resource.module,
          type: resource.type,
          date_added: resource.dateAdded
      };
      await supabase.from('resources').insert(dbRes);
      setResources(prev => [resource, ...prev]);
  };

  const deleteResource = async (id: string) => {
      await supabase.from('resources').delete().eq('id', id);
      setResources(prev => prev.filter(r => r.id !== id));
  };

  // Generic Settings Update Helper
  const updateSiteSetting = async (key: string, value: any) => {
      // Upsert
      const { error } = await supabase.from('site_settings').upsert({ key, value });
      if (error) console.error(`Error updating ${key}:`, error);
  };

  const updateHomeContent = (content: HomeContent) => {
      setHomeContent(content);
      updateSiteSetting('homeContent', content);
  };

  const updatePlansPageContent = (content: PlansPageContent) => {
      setPlansPageContent(content);
      updateSiteSetting('plansPageContent', content);
  };

  const updateWelcomeContent = (content: WelcomeContent) => {
      setWelcomeContent(content);
      updateSiteSetting('welcomeContent', content);
  };

  const updateModuleMetadata = (metadata: ModuleMetadata) => {
      const newMeta = [...modulesMetadata.filter(m => m.id !== metadata.id), metadata];
      setModulesMetadata(newMeta);
      updateSiteSetting('modulesMetadata', newMeta);
  };
  
  const deleteModuleMetadata = (id: string) => {
      const newMeta = modulesMetadata.filter(m => m.id !== id);
      setModulesMetadata(newMeta);
      updateSiteSetting('modulesMetadata', newMeta);
  };

  const updateThemeSettings = (settings: ThemeSettings) => {
      setThemeSettings(settings);
      updateSiteSetting('themeSettings', settings);
  };

  const addTestimonial = (testimonial: Testimonial) => {
      const newT = [testimonial, ...testimonials];
      setTestimonials(newT);
      updateSiteSetting('testimonials', newT);
  };

  const addPlan = async (plan: PricingPlan) => {
      const dbPlan = {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          features: plan.features,
          is_popular: plan.isPopular,
          is_elite: plan.isElite,
          allowed_modules: plan.allowedModules,
          payment_link: plan.paymentLink
      };
      await supabase.from('plans').insert(dbPlan);
      setPlans(prev => [...prev, plan]);
  };

  const deletePlan = async (id: string) => {
      await supabase.from('plans').delete().eq('id', id);
      setPlans(prev => prev.filter(p => p.id !== id));
  };

  const updatePlan = async (plan: PricingPlan) => {
       const dbPlan = {
          name: plan.name,
          price: plan.price,
          features: plan.features,
          is_popular: plan.isPopular,
          is_elite: plan.isElite,
          allowed_modules: plan.allowedModules,
          payment_link: plan.paymentLink
      };
      await supabase.from('plans').update(dbPlan).eq('id', plan.id);
      setPlans(prev => prev.map(p => p.id === plan.id ? plan : p));
  };

  // --- USER MANAGEMENT ---

  const updateUserStatus = async (userId: string, status: 'active' | 'pending' | 'blocked') => {
      await supabase.from('profiles').update({ status }).eq('id', userId);
      
      setAllUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const updatedUser = { ...u, status };
          if (status === 'active' && u.status !== 'active') {
             const welcomeNotification: AppNotification = {
                 id: `notif-welcome-${Date.now()}`,
                 title: 'Acesso Aprovado! 🚀',
                 message: 'Parabéns! Sua conta foi verificada e aprovada.',
                 read: false,
                 date: new Date().toISOString(),
                 type: 'success'
             };
             const newNotifs = [welcomeNotification, ...(u.notifications || [])];
             updatedUser.notifications = newNotifs;
             
             // Update notifications in DB
             supabase.from('profiles').update({ notifications: newNotifs }).eq('id', userId);
          }
          return updatedUser;
        }
        return u;
      }));
  };

  const updateUserProfile = async (name: string, avatar: string) => {
      if (user) {
          await supabase.from('profiles').update({ name, avatar }).eq('id', user.id);
          setUser({ ...user, name, avatar });
      }
  };

  const updateUserModules = async (userId: string, modules: string[]) => {
      await supabase.from('profiles').update({ allowed_modules: modules }).eq('id', userId);
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, allowedModules: modules } : u));
      if (user && user.id === userId) {
          setUser(prev => prev ? { ...prev, allowedModules: modules } : null);
      }
  };

  const updateUserPlan = async (userId: string, planId: string) => {
      await supabase.from('profiles').update({ plan_id: planId }).eq('id', userId);
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, planId } : u));
      if (user && user.id === userId) {
          setUser(prev => prev ? { ...prev, planId } : null);
      }
  };

  const deleteUser = async (userId: string) => {
      // NOTE: Deleting from auth.users requires Service Role key usually, 
      // but here we just delete the profile or call an Edge Function. 
      // For this implementation, we just delete the profile row.
      await supabase.from('profiles').delete().eq('id', userId);
      setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  // --- NOTIFICATIONS ---

  const sendNotificationToUser = async (targetUserId: string, title: string, message: string, type: 'info' | 'success' | 'warning') => {
      const newNotif: AppNotification = {
          id: `notif-${Date.now()}-${Math.random()}`,
          title,
          message,
          read: false,
          date: new Date().toISOString(),
          type
      };

      // Get current notifs
      const userToUpdate = allUsers.find(u => u.id === targetUserId);
      if(userToUpdate) {
          const updatedNotifs = [newNotif, ...(userToUpdate.notifications || [])];
          
          await supabase.from('profiles').update({ notifications: updatedNotifs }).eq('id', targetUserId);
          
          setAllUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, notifications: updatedNotifs } : u));
          if (user && user.id === targetUserId) {
             setUser(curr => curr ? ({ ...curr, notifications: updatedNotifs }) : null);
             triggerBrowserNotification(title, message);
          }
      }
  };

  const markNotificationAsRead = async (userId: string, notificationId: string) => {
      const userToUpdate = allUsers.find(u => u.id === userId);
      if (userToUpdate) {
          const updatedNotifs = userToUpdate.notifications?.map(n => 
             n.id === notificationId ? { ...n, read: true } : n
          ) || [];
          
          await supabase.from('profiles').update({ notifications: updatedNotifs }).eq('id', userId);

          setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, notifications: updatedNotifs } : u));
          if (user && user.id === userId) {
             setUser({ ...user, notifications: updatedNotifs });
          }
      }
  };

  const sendGlobalAnnouncement = (title: string, message: string) => {
      allUsers.forEach(u => sendNotificationToUser(u.id, title, message, 'info'));
  };

  // --- VIDEO PREFERENCES ACTIONS ---

  const toggleVideoCompletion = (id: string) => {
      setCompletedVideoIds(prev => 
          prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
      );
  };

  const toggleVideoFavorite = (id: string) => {
      setFavoriteVideoIds(prev => 
          prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
      );
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  };
  
  // Browser notification helper
  const triggerBrowserNotification = (title: string, body: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
        new Notification(title, { body, icon: 'https://i.ibb.co/G4bmxpLm/5.png' });
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, login, register, logout, 
      videos, addVideo, deleteVideo, updateVideo,
      resources, addResource, deleteResource,
      plans, addPlan, deletePlan, updatePlan,
      plansPageContent, updatePlansPageContent,
      modulesMetadata, updateModuleMetadata, deleteModuleMetadata,
      homeContent, updateHomeContent,
      welcomeContent, updateWelcomeContent,
      themeSettings, updateThemeSettings,
      testimonials, addTestimonial,
      completedVideoIds, toggleVideoCompletion,
      favoriteVideoIds, toggleVideoFavorite,
      allUsers, updateUserStatus, updateUserProfile, updateUserModules, updateUserPlan, deleteUser, markNotificationAsRead,
      sendGlobalAnnouncement, requestNotificationPermission
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};