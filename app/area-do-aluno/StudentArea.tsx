"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

type SupabaseConfig = {
  supabaseUrl: string;
  supabasePublishableKey: string;
};

function getDisplayName(user: User) {
  const metadata = user.user_metadata ?? {};
  const fullName = typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
  const givenName = typeof metadata.name === "string" ? metadata.name.trim() : "";
  return fullName || givenName || user.email || "aluno";
}

function LoadingState() {
  return (
    <section className="bg-black py-16 text-white sm:py-24">
      <div className="container-shell">
        <p className="eyebrow text-zinc-500">Área do Aluno</p>
        <h1 className="section-title mt-4">Verificando seu acesso…</h1>
      </div>
    </section>
  );
}

export function StudentArea() {
  const [config, setConfig] = useState<SupabaseConfig | null>(null);
  const [configReady, setConfigReady] = useState(false);
  const supabase = useMemo<SupabaseClient | null>(() => {
    if (!config?.supabaseUrl || !config.supabasePublishableKey) return null;

    return createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
  }, [config]);

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void fetch("/api/auth/config", { headers: { Accept: "application/json" } })
      .then(async (response) => {
        const data = (await response.json()) as Partial<SupabaseConfig> & { error?: string };
        if (!response.ok || !data.supabaseUrl || !data.supabasePublishableKey) {
          throw new Error(data.error || "Configuração indisponível");
        }
        if (active) setConfig({ supabaseUrl: data.supabaseUrl, supabasePublishableKey: data.supabasePublishableKey });
      })
      .catch(() => {
        if (active) setError("O acesso com Google ainda não está configurado.");
      })
      .finally(() => {
        if (active) setConfigReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!configReady) return;
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let active = true;

    void supabase.auth.getUser().then(({ data, error: userError }) => {
      if (!active) return;
      setUser(data.user);
      if (userError && userError.message !== "Auth session missing!") {
        setError("Não foi possível verificar seu acesso. Tente novamente.");
      }
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [configReady, supabase]);

  async function signInWithGoogle() {
    if (!supabase) {
      setError("O acesso com Google ainda não está configurado.");
      return;
    }

    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/area-do-aluno`,
      },
    });

    if (signInError) {
      setError("Não foi possível iniciar o acesso com Google. Tente novamente.");
      setBusy(false);
    }
  }

  async function signOut() {
    if (!supabase) return;

    setBusy(true);
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError("Não foi possível sair agora. Tente novamente.");
    }
    setBusy(false);
  }

  if (!configReady || !authReady) return <LoadingState />;

  if (!user) {
    return (
      <section className="bg-black py-16 text-white sm:py-24">
        <div className="container-shell grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="eyebrow text-zinc-500">Área do Aluno</p>
            <h1 className="section-title mt-4">Seu caminho de aprendizado em um só lugar.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
              Entre com sua conta Google para acompanhar cursos, eventos,
              certificados e informações da sua célula.
            </p>
          </div>

          <div className="rounded-sm border border-white/15 bg-white p-7 text-black shadow-2xl sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-zinc-500">
              Acesso seguro
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Entre com Google</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Use sua conta Google para acessar a Área do Aluno. Seu e-mail
              será usado apenas para identificar seu acesso.
            </p>
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              disabled={busy || !supabase}
              className="btn-primary mt-7 w-full disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? "Redirecionando…" : "Continuar com Google"}
            </button>
            {error && (
              <p className="mt-4 text-center text-xs leading-5 text-red-700" role="alert">
                {error}
              </p>
            )}
            <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
              Apenas contas Google podem entrar.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const cards = [
    { title: "Meus cursos", text: "Nenhum curso inscrito.", href: "/cursos" },
    { title: "Continuar estudando", text: "Sua próxima aula aparecerá aqui.", href: "/cursos" },
    { title: "Meus eventos", text: "Nenhuma inscrição encontrada.", href: "/eventos" },
    { title: "Meus certificados", text: "Nenhum certificado disponível.", href: "#" },
    { title: "Minha célula", text: "Vínculo ainda não cadastrado.", href: "/celulas" },
  ];

  return (
    <>
      <section className="bg-black py-16 text-white">
        <div className="container-shell flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-zinc-500">Área protegida</p>
            <h1 className="section-title mt-4">Olá, {getDisplayName(user)}.</h1>
            <p className="mt-4 text-sm text-zinc-400">
              Acompanhe cursos, eventos, certificados e sua célula.
            </p>
            <div className="mt-5 inline-flex items-center gap-3 rounded-sm border border-white/15 bg-white/5 px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              <span className="text-xs text-zinc-300">Conta conectada: {user.email}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            disabled={busy}
            className="rounded-sm border border-white/30 px-5 py-3 text-xs font-semibold transition hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-60"
          >
            Sair
          </button>
        </div>
      </section>
      <section className="content-section">
        <div className="container-shell">
          {error && (
            <p className="mb-5 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.map(({ title, text, href }, index) => (
              <Link
                key={title}
                href={href}
                className="panel min-h-60 p-7 transition hover:-translate-y-1"
              >
                <span className="text-xs text-zinc-400">0{index + 1}</span>
                <h2 className="mt-20 text-2xl font-semibold">{title}</h2>
                <p className="mt-3 text-sm text-zinc-500">{text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
