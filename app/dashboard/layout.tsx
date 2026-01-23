import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth-utils";
import { Sidebar } from "./_components/Sidebar";
import HelpAssistant from "@/components/ai/HelpAssistant";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const dbUser = await getAuthUser();

    if (!dbUser) {
        redirect("/auth/login");
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <Sidebar dbUser={dbUser} />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-10 transition-all duration-300">
                {/* Spacer for mobile menu button area */}
                <div className="h-10 lg:hidden"></div>
                {children}
            </main>

            <HelpAssistant />
        </div>
    );
}
