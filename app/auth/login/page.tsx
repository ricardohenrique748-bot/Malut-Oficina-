"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        console.log("Iniciando login para:", email);

        try {
            const { error: authError, data } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log("Resultado Supabase Auth:", { error: authError, session: data?.session });

            if (authError) {
                setError(authError.message === "Invalid login credentials"
                    ? "Email ou senha inválidos."
                    : authError.message);
                setLoading(false);
            } else {
                console.log("Login no Auth feito com sucesso. Aguardando redirecionamento...");
                // Force a full page reload to the dashboard to ensure middleware and server components
                // can access the new session cookies correctly.
                window.location.href = "/dashboard";
            }
        } catch (err) {
            console.error("Erro capturado no login:", err);
            setError("Ocorreu um erro no login. Verifique sua conexão.");
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center relative">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: "url('/background.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "brightness(0.5)"
                }}
            />

            <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-200/50 bg-white/90 p-8 shadow-2xl backdrop-blur-sm z-10 dark:border-gray-700/50 dark:bg-black/70">
                <div className="text-center flex flex-col items-center">
                    <img src="/logo.png" alt="Logo" className="h-16 w-auto mb-4" />
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Malut Oficina
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Entre com suas credenciais
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div className="relative mb-4">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                readOnly={loading} // Prevent edits while loading
                                required
                                className="block w-full rounded-md border border-gray-300 px-3 py-3 pl-10 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm transition-all"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                readOnly={loading}
                                required
                                className="block w-full rounded-md border border-gray-300 px-3 py-3 pl-10 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm transition-all"
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm font-medium text-red-500 text-center bg-red-50 p-2 rounded border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all shadow-lg hover:shadow-indigo-500/30"
                        >
                            {loading ? "Entrando..." : "Entrar no Sistema"}
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} Malut Oficina. Todos os direitos reservados.
                    {/* Credentials hint for dev only - keeping hidden or minimal */}
                </div>
            </div>
        </div>
    );
}
