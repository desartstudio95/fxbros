import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, MessageCircle, AlertTriangle, Target, BookOpen, ShieldCheck, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { user, welcomeContent } = useApp();

  // If user is somehow here but pending (accessed via URL directly), block access to features
  const isPending = user?.status === 'pending';
  const content = welcomeContent;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Cover */}
      <div className="absolute inset-0 z-0">
         <img 
            src={content.hero.bgImage} 
            alt="Welcome Cover" 
            className="w-full h-full object-cover opacity-30" 
         />
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
               {content.hero.title.split('FXBROS').length > 1 ? (
                 <>
                   {content.hero.title.split('FXBROS')[0]} 
                   <span className="text-red-600">FXBROS{content.hero.title.split('FXBROS')[1]}</span>
                 </>
               ) : (
                 content.hero.title
               )}
            </h1>
            <p className="text-xl text-slate-300">
                {content.hero.subtitlePrefix} <span className="text-white font-bold">{user?.name}</span>. {content.hero.subtitleSuffix}
            </p>
        </div>

        {isPending ? (
            <div className="bg-slate-900/90 border border-red-900/50 p-8 rounded-3xl backdrop-blur-md text-center max-w-lg mx-auto shadow-2xl">
                <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="text-red-500" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Aguardando Aprovação</h2>
                <p className="text-slate-400 mb-6">
                    Seu cadastro foi recebido, mas o acesso à área de membros e aos grupos exclusivos requer aprovação manual do administrador.
                </p>
                <div className="text-sm text-slate-500 border-t border-slate-800 pt-4">
                    Você receberá uma notificação assim que sua conta for ativada.
                </div>
                <button 
                    onClick={() => navigate('/')} 
                    className="mt-6 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors w-full"
                >
                    Voltar ao Início
                </button>
            </div>
        ) : (
            <>
                <div className="grid md:grid-cols-2 gap-10">
                    {/* Seção 1 */}
                    <div className="bg-slate-950/80 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <BookOpen className="text-red-500" size={28} />
                            <h2 className="text-2xl font-bold">{content.section1.title}</h2>
                        </div>
                        <ul className="space-y-4 text-slate-300">
                            {content.section1.items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle2 className="text-red-500 shrink-0 mt-1" size={18} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Seção 2 */}
                    <div className="bg-slate-950/80 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Target className="text-amber-500" size={28} />
                            <h2 className="text-2xl font-bold">{content.section2.title}</h2>
                        </div>
                        <ul className="space-y-4 text-slate-300">
                            {content.section2.items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <ShieldCheck className="text-amber-500 shrink-0 mt-1" size={18} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Termos e Condições Resumidos */}
                <div className="mt-10 p-6 rounded-2xl bg-red-900/10 border border-red-900/30 text-xs md:text-sm text-red-200/80 leading-relaxed">
                    <div className="flex items-center gap-2 mb-2 font-bold text-red-400 uppercase tracking-wider">
                        <AlertTriangle size={16} /> Termos de Acesso
                    </div>
                    <p>
                        {content.terms.text}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6">
                    <a 
                        href={content.whatsappLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full md:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <MessageCircle size={20} /> Entrar no Grupo VIP
                    </a>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/40 flex items-center justify-center gap-2"
                    >
                        Acessar Área de Membros <ArrowRight size={20} />
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default Welcome;