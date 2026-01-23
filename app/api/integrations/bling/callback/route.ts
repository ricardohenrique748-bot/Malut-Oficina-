
import { NextRequest, NextResponse } from "next/server";
import { BlingService } from "@/lib/bling";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const origin = req.nextUrl.origin;

    if (error) {
        console.error("Bling OAuth Error:", error);
        return NextResponse.redirect(`${origin}/dashboard/settings/integrations?error=${error}`);
    }

    if (!code) {
        return NextResponse.redirect(`${origin}/dashboard/settings/integrations?error=missing_code`);
    }

    try {
        await BlingService.exchangeCode(code, origin);
        revalidatePath("/dashboard/settings/integrations");
        return NextResponse.redirect(`${origin}/dashboard/settings/integrations?success=bling_connected`);
    } catch (e: any) {
        console.error("Bling exchange error:", e);
        return NextResponse.redirect(`${origin}/dashboard/settings/integrations?error=${encodeURIComponent(e.message)}`);
    }
}
