import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Lock, Mail, ArrowRight, ShieldAlert, AlertTriangle, Key, UserPlus, CheckCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // For registration
  const [accessCode, setAccessCode] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'super_admin'>('member');
  
  // Views: login, register, forgot_password
  const [view, setView] = useState<'login' | 'register' | 'forgot_password'>('login');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('starter'); // Default to starter if direct register
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for Payment Redirect
  useEffect(() => {
    if (location.state && location.state.paymentSuccess) {
      setView('register'); // Force registration mode
      setSuccessMsg(`Pagamento confirmado para o plano ${location.state.planName}! Crie sua conta para finalizar.`);
      if (location.state.planId) {
          setSelectedPlanId(location.state.planId);
      }
      // Clear state history to prevent loop if refreshed
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
        if (view === 'forgot_password') {
            // Simulate Password Reset
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSuccessMsg(`Um link de redefinição de senha foi enviado para ${email}.`);
            setIsLoading(false);
            return;
        }

        if (view === 'register' && role === 'member') {
            // Handle Registration with the selected plan
            const success = await register(email, name, selectedPlanId, password);
            
            if (success) {
                // Ao registrar, o usuário é automaticamente logado como 'pending'
                // Redirecionamos para o dashboard que mostrará a tela de espera
                navigate('/dashboard');
            } else {
                setErrorMsg('Falha ao criar conta. O e-mail já está em uso?');
            }
            setIsLoading(false);
            return;
        }
        
        // Determine identifier based on role
        const identifier = role === 'member' ? email : accessCode;

        // Attempt login
        const status = await login(identifier, role, password);

        if (status === 'active') {
            if (role === 'admin' || role === 'super_admin') {
              navigate('/admin');
            } else {
              // Redirect members to Welcome page first
              navigate('/welcome');
            }
        } else if (status === 'pending') {
            // Conta criada mas aguardando aprovação. 
            // Redireciona para o dashboard que tem a "Waiting Screen"
            navigate('/dashboard');
        } else if (status === 'blocked') {
            setErrorMsg('O acesso desta conta foi suspenso. Contate o suporte.');
        } else if (status === 'invalid_code') {
            setErrorMsg('Credenciais inválidas.');
        } else if (status === 'not_found') {
            setErrorMsg('Conta não encontrada. Verifique o e-mail ou faça o cadastro.');
        } else if (status === 'error') {
            setErrorMsg('Ocorreu um erro ao conectar. Tente novamente.');
        }
    } catch (error) {
        setErrorMsg('Erro inesperado. Tente novamente.');
    } finally {
        setIsLoading(false);
    }
  };

  const isMember = role === 'member';

  // Dynamic Content based on View
  const getHeaderContent = () => {
      switch(view) {
          case 'register': return { title: 'Fazer Cadastro', subtitle: 'Preencha seus dados para solicitar acesso' };
          case 'forgot_password': return { title: 'Recuperar Senha', subtitle: 'Enviaremos instruções para seu e-mail' };
          default: return { title: 'Bem-vindo de Volta', subtitle: 'Acesse seu portal exclusivo' };
      }
  };

  const header = getHeaderContent();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-800/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <img 
            src="https://i.ibb.co/G4bmxpLm/5.png" 
            alt="FXBROS Logo" 
            className="mx-auto w-20 h-20 object-contain mb-4 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
          />
          <h2 className="text-2xl font-bold text-white">
            {header.title}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {header.subtitle}
          </p>
        </div>

        {errorMsg && (
            <div className="bg-amber-900/20 border border-amber-600/50 p-4 rounded-xl flex items-start gap-3 mb-6 animate-pulse">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-amber-200 text-sm">{errorMsg}</p>
            </div>
        )}

        {successMsg && (
            <div className="bg-green-900/20 border border-green-600/50 p-4 rounded-xl flex items-start gap-3 mb-6">
                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
                <p className="text-green-200 text-sm">{successMsg}</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {view === 'login' && (
             <div>
               <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Selecione o Acesso</label>
               <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-lg">
                 <button
                   type="button"
                   onClick={() => { setRole('member'); setErrorMsg(''); }}
                   className={`py-2 text-xs font-medium rounded-md transition-all ${role === 'member' ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   Membro
                 </button>
                 <button
                   type="button"
                   onClick={() => { setRole('admin'); setErrorMsg(''); }}
                   className={`py-2 text-xs font-medium rounded-md transition-all ${role === 'admin' ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   Admin
                 </button>
                 <button
                   type="button"
                   onClick={() => { setRole('super_admin'); setErrorMsg(''); }}
                   className={`py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${role === 'super_admin' ? 'bg-red-900/30 text-red-500 border border-red-900/50' : 'text-slate-500 hover:text-red-500'}`}
                   title="Super Admin - Controle Total"
                 >
                   <ShieldAlert size={12} /> Super
                 </button>
               </div>
             </div>
          )}

          <div className="space-y-4">
            {isMember ? (
              <>
                {view === 'register' && (
                    <div className="relative group animation-fade-in">
                        <UserPlus className="absolute left-3 top-3 text-slate-500 group-focus-within:text-red-500 transition-colors" size={20} />
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nome Completo"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                        />
                    </div>
                )}
                
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 text-slate-500 group-focus-within:text-red-500 transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Endereço de Email"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                </div>
                
                {view !== 'forgot_password' && (
                    <div className="relative group">
                    <Lock className="absolute left-3 top-3 text-slate-500 group-focus-within:text-red-500 transition-colors" size={20} />
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={view === 'register' ? "Crie uma senha" : "Senha"}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    />
                    </div>
                )}
              </>
            ) : (
                <div className="relative group animation-fade-in">
                  <Key className="absolute left-3 top-3 text-slate-500 group-focus-within:text-red-500 transition-colors" size={20} />
                  <input
                    type="password"
                    required
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder={role === 'super_admin' ? "Código Master (Root)" : "Código de Administrador"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                  <p className="text-[10px] text-slate-500 mt-2 text-right">
                      {role === 'super_admin' ? 'Acesso restrito ao nível mais alto.' : 'Use o código fornecido pela organização.'}
                  </p>
                </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group
              ${role === 'super_admin' 
                ? 'bg-gradient-to-r from-red-800 to-black border border-red-600/50 text-red-500 hover:from-red-900 hover:to-black shadow-red-900/30' 
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-600/20'
              }`}
          >
            {isLoading ? (
                <>
                    <Loader2 className="animate-spin" size={20} /> Processando...
                </>
            ) : (
                <>
                    {view === 'register' ? 'Fazer Cadastro' : view === 'forgot_password' ? 'Enviar Link' : (role === 'super_admin' ? 'Acesso Root' : 'Acessar Portal')}
                    {view !== 'forgot_password' && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    {view === 'forgot_password' && <RefreshCw className="w-5 h-5" />}
                </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center justify-between text-sm gap-3">
          {isMember && view !== 'forgot_password' && (
              <button 
                type="button"
                onClick={() => { setView(view === 'login' ? 'register' : 'login'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-white font-medium hover:text-red-400 transition-colors"
              >
                {view === 'register' ? 'Já tem uma conta? Fazer Login' : 'Não tem conta? Fazer Cadastro'}
              </button>
          )}
          
          {isMember && view === 'login' && (
            <button 
                onClick={() => { setView('forgot_password'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-slate-500 hover:text-red-400 transition-colors text-xs"
            >
                Esqueceu a senha?
            </button>
          )}

          {view === 'forgot_password' && (
              <button 
                onClick={() => { setView('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1"
              >
                <ArrowLeft size={12} /> Voltar para Login
              </button>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-6 text-slate-600 text-xs">
        &copy; 2026 FXBROS. Criptografia Segura.
      </div>
    </div>
  );
};

export default Login;