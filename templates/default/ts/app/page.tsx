import { ArrowRight, Box, ChevronRight, Code, Layers } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center px-8 sm:px-24 selection:bg-indigo-500/30 relative">
      {/* <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px] z-10"></div> */}

      <div className="max-w-7xl w-full flex flex-col items-center text-center gap-8 relative z-10 py-10 sm:py-24">
        {/* Animated Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-indigo-500/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-75 bg-blue-500/20 blur-[100px] rounded-full -z-10 pointer-events-none" />

        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px] -z-10"></div>

        {/* Hero Section */}
        <h2 className="text-sm text-gray-400 group font-geist mx-auto px-5 py-2 bg-linear-to-tr to-transparent from-zinc-300/5 via-gray-400/5 border-2  border-white/5 rounded-3xl w-fit">
          Electron + Next.js Template
          <ChevronRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
        </h2>

        <h1 className="text-4xl tracking-tighter font-geist bg-clip-text text-transparent mx-auto md:text-6xl bg-[linear-gradient(180deg,#FFF_0%,rgba(255,255,255,0.00)_202.08%)]">
          Build Desktop Apps <br className="hidden sm:block" /> with{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-300 to-orange-200">
            Web Tech
          </span>
          .
        </h1>

        <p className="max-w-2xl mx-auto text-gray-300">
          Welcome to your new cross-platform desktop application. You have the
          full power of
          <span className="text-blue-300 font-semibold mx-1">
            Next.js App Router
          </span>
          running seamlessly inside an
          <span className="text-blue-300 font-semibold mx-1">Electron</span>
          container.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link
            href="https://nextjs.org/docs"
            target="_blank"
            className="group flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-slate-950 font-semibold hover:bg-slate-200 transition-colors"
          >
            Next.js Docs
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="https://www.electronjs.org/docs/latest"
            target="_blank"
            className="group flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 text-white font-semibold border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            Electron Docs
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-16 text-left">
          {/* Feature 1 */}
          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">
              Full App Router
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Use everything Next.js has to offer. Server Components, Client
              Components, Layouts, and Loading UI all work perfectly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Code className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">
              Server Actions & APIs
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Interact with local file systems or databases securely using
              Server Actions or traditional API Routes directly from your UI.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Box className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">
              Native Capabilities
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Leverage Electron&apos;s IPC bridge to access OS-level APIs,
              hardware, native menus, and notifications.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
