
import { NextRequest, NextResponse } from "next/server";
import { BlingService } from "@/lib/bling";
import { authorize } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
    const { error } = await authorize(['ADMIN', 'GERENTE']);
    if (error) return error;

    try {
        const origin = new URL(req.url).origin;
        const url = BlingService.getAuthUrl(origin);
        return NextResponse.json({ url });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
