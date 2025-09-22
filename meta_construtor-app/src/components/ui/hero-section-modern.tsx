import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSectionModern() {
    return (
        <main className="overflow-hidden min-h-screen">
        {/* Background elements */}
        <div
            aria-hidden
            className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
            <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
            <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
            <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>
        
        <section className="relative">
            <div className="relative pt-32 pb-16 md:pt-40 md:pb-24">{/* Increased top padding to accommodate fixed navigation */}
                    {/* Background image for dark mode */}
                    <AnimatedGroup
                        variants={{
                            container: {
                                visible: {
                                    transition: {
                                        delayChildren: 1,
                                    },
                                },
                            },
                            item: {
                                hidden: {
                                    opacity: 0,
                                    y: 20,
                                },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        type: 'spring' as const,
                                        bounce: 0.3,
                                        duration: 2,
                                    },
                                },
                            },
                        }}
                        className="absolute inset-0 -z-20">
                        <img
                            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=3276&h=4095&fit=crop&crop=center"
                            alt="background"
                            className="absolute inset-x-0 top-32 sm:top-40 md:top-48 lg:top-56 -z-20 hidden dark:block"
                            width="3276"
                            height="4095"
                        />
                    </AnimatedGroup>
                    
                    {/* Background gradient overlay */}
                    <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                    
                {/* Main content container */}
                <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge and main content */}
                        <AnimatedGroup variants={transitionVariants}>
                            <Link
                                to="/login"
                                className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-2 sm:gap-3 md:gap-4 rounded-full border p-1 pl-2 sm:pl-3 md:pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950 text-xs sm:text-sm touch-manipulation">
                                <span className="text-foreground px-1">Gestão Inteligente de Obras</span>
                                <span className="dark:border-background block h-3 sm:h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>
                                <div className="bg-background group-hover:bg-muted size-4 sm:size-5 md:size-6 overflow-hidden rounded-full duration-500">
                                    <div className="flex w-8 sm:w-10 md:w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                        <span className="flex size-4 sm:size-5 md:size-6">
                                            <ArrowRight className="m-auto size-2 sm:size-2.5 md:size-3" />
                                        </span>
                                        <span className="flex size-4 sm:size-5 md:size-6">
                                            <ArrowRight className="m-auto size-2 sm:size-2.5 md:size-3" />
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            <h1 className="mt-4 sm:mt-6 md:mt-8 text-balance text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-[5.25rem] font-bold leading-tight px-2 sm:px-0">
                                Controle Total de Suas Obras
                            </h1>
                            
            <p className="mx-auto mt-3 sm:mt-4 md:mt-6 lg:mt-8 max-w-2xl text-balance text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground px-4 sm:px-2 lg:px-0">
                A plataforma completa para gestores e engenheiros que precisam controlar obras, RDOs, equipes e custos em um só lugar.
            </p>
                            </AnimatedGroup>

                        {/* Action buttons */}
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}
                            className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
                            <div className="bg-foreground/10 rounded-[14px] border p-0.5 w-full sm:w-auto max-w-xs sm:max-w-none">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-xl px-4 sm:px-6 md:px-8 text-sm sm:text-base w-full sm:w-auto h-12 sm:h-11 md:h-12 touch-manipulation">
                                    <Link to="/checkout?plan=free">
                                        <span className="text-nowrap">Começar Gratuitamente</span>
                                    </Link>
                                </Button>
                            </div>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="rounded-xl px-4 sm:px-6 md:px-8 w-full sm:w-auto max-w-xs sm:max-w-none h-12 sm:h-11 md:h-12 border-2 border-border hover:bg-muted text-sm sm:text-base touch-manipulation">
                                <Link to="/contato">
                                    <span className="text-nowrap">Falar com Especialista</span>
                                </Link>
                            </Button>
                        </AnimatedGroup>
                        </div>
                    </div>

                 {/* Dashboard preview section */}
                 <div className="relative mt-8 sm:mt-12 md:mt-16 lg:mt-20 xl:mt-24 px-3 sm:px-4 md:px-6 lg:px-8">
                     {/* Gradient overlay */}
                     <div
                         aria-hidden
                         className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                     />
                     
                     {/* Dashboard container */}
                     <div className="relative mx-auto max-w-6xl overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl border p-1 sm:p-2 md:p-4 shadow-lg shadow-zinc-950/15 ring-1 ring-background bg-background">
                         {/* Dashboard preview image */}
                         <div className="relative overflow-hidden rounded-md sm:rounded-lg md:rounded-2xl">
                             <img
                                 className="w-full h-auto aspect-[16/11] sm:aspect-[16/10] md:aspect-[15/8] object-cover object-top hover:scale-105 transition-transform duration-700"
                                 src="/lovable-uploads/d26b1c16-cf45-4b95-907f-6a9dc3d91c1b.png"
                                 alt="Meta Construtor Dashboard - Interface completa de gestão de obras com RDO, equipes e relatórios"
                                 width="2700"
                                 height="1440"
                                 loading="eager"
                                 sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                             />
                             {/* Gradient overlay effect */}
                             <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                         </div>
                     </div>
                 </div>
                </div>
            </section>
        </main>
    )
}