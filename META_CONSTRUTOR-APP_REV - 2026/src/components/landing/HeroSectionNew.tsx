import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DashboardPreviewMockup } from './DashboardPreviewMockup';
import { Construction, CheckCircle2, Shield, Award } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function HeroSectionNew() {
    const navigate = useNavigate();
    const [obraCode, setObraCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (obraCode) {
            navigate(`/login?code=${obraCode}`);
        } else {
            navigate('/login');
        }
    };

    return (
        <main className="min-h-screen bg-[#0B1623] text-gray-100 font-sans selection:bg-primary selection:text-white overflow-hidden">
            {/* Navbar Placeholder for visual alignment - In real app, Navigation is outside usually, but provided HTML had it inside body. 
          Assuming LandingNavigation handles the top bar, we just focus on the Hero content padding. */}

            <div className="relative flex items-center justify-center px-4 sm:px-6 lg:px-12 py-20 lg:py-32 mt-20 md:mt-24">
                {/* Background Blobs */}
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

                <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">

                    {/* Left Column */}
                    <div className="lg:col-span-2 flex flex-col text-left z-10">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-white mb-8 [text-shadow:0_0_20px_rgba(255,255,255,0.1)]">
                            Gere seu <span className="text-primary">RDO Automático</span> agora
                        </h1>

                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl shadow-blue-900/20 w-full">
                            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                                <div className="relative">
                                    <input
                                        className="w-full text-gray-900 placeholder:text-gray-400 bg-gray-50 border-2 border-gray-200 rounded-xl px-5 py-4 text-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                        placeholder="Digite o código da obra ou nome"
                                        type="text"
                                        value={obraCode}
                                        onChange={(e) => setObraCode(e.target.value)}
                                    />
                                    <Construction className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                                </div>
                                <button
                                    className="w-full bg-primary hover:bg-[#FF4500] text-white text-lg font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 uppercase tracking-wide"
                                    type="submit"
                                >
                                    Gerar RDO Agora
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4 justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-3">
                                        <img alt="User" className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&auto=format&fit=crop" />
                                        <img alt="User" className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&auto=format&fit=crop" />
                                        <img alt="User" className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&auto=format&fit=crop" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-500">
                                        <strong className="text-gray-800">+ de 500</strong> construtoras já utilizam
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-700/50 bg-[#152336]/50 backdrop-blur-sm">
                                <CheckCircle2 className="text-green-400 w-5 h-5" />
                                <span className="text-xs font-medium text-gray-300">Empresa Verificada</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-700/50 bg-[#152336]/50 backdrop-blur-sm">
                                <Award className="text-yellow-400 w-5 h-5" />
                                <span className="text-xs font-medium text-gray-300">Selo de Qualidade</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-700/50 bg-[#152336]/50 backdrop-blur-sm">
                                <Shield className="text-blue-400 w-5 h-5" />
                                <span className="text-xs font-medium text-gray-300">Dados Seguros</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Dashboard Preview */}
                    <div className="lg:col-span-3 relative h-full flex items-center justify-center lg:justify-end mt-12 lg:mt-0">
                        <DashboardPreviewMockup />
                    </div>

                </div>
            </div>
        </main>
    );
}
