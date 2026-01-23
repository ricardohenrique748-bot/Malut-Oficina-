
import { prisma } from "./prisma";

const BLING_API_URL = "https://api.bling.com.br/v3";
const CLIENT_ID = process.env.BLING_CLIENT_ID;
const CLIENT_SECRET = process.env.BLING_CLIENT_SECRET;

// Helper to get base URL
const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    return "http://localhost:3000"; // Fallback
};

export interface BlingProduct {
    id: string;
    nome: string;
    codigo: string;
    preco: number;
    estoque: {
        quantidade: number;
    };
}

export class BlingService {
    private static getRedirectUri(origin?: string) {
        const base = origin || getBaseUrl();
        return `${base}/api/integrations/bling/callback`;
    }

    private static async getTokens() {
        const token = await prisma.integrationToken.findUnique({
            where: { provider: "bling" }
        });

        if (!token) throw new Error("Bling não configurado. Por favor, autorize a integração nas configurações.");

        // Check if expired (or expires soon in 5 mins)
        if (new Date(token.expiresAt).getTime() < Date.now() + 5 * 60 * 1000) {
            return this.refreshToken(token.refreshToken);
        }

        return token.accessToken;
    }

    private static async refreshToken(refreshToken: string) {
        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

        const response = await fetch("https://www.bling.com.br/a/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${auth}`
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken
            })
        });

        if (!response.ok) {
            throw new Error("Erro ao atualizar token do Bling. Por favor, re-autorize nas configurações.");
        }

        const data = await response.json();

        const updated = await prisma.integrationToken.update({
            where: { provider: "bling" },
            data: {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresAt: new Date(Date.now() + (data.expires_in ? data.expires_in * 1000 : 3600 * 1000))
            }
        });

        return updated.accessToken;
    }

    static async exchangeCode(code: string, origin?: string) {
        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
        const redirect_uri = this.getRedirectUri(origin);

        const response = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${auth}`
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.description || "Erro ao trocar código por token");
        }

        const data = await response.json();

        await prisma.integrationToken.upsert({
            where: { provider: "bling" },
            update: {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresAt: new Date(Date.now() + data.expires_in * 1000)
            },
            create: {
                provider: "bling",
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresAt: new Date(Date.now() + data.expires_in * 1000)
            }
        });

        return true;
    }

    static getAuthUrl(origin?: string) {
        const state = Math.random().toString(36).substring(7);
        const redirect_uri = this.getRedirectUri(origin);

        const params = new URLSearchParams({
            response_type: "code",
            client_id: CLIENT_ID!,
            redirect_uri,
            state: state
        });

        return `https://www.bling.com.br/Api/v3/oauth/authorize?${params.toString()}`;
    }

    private static async request(endpoint: string, options: RequestInit = {}) {
        const accessToken = await this.getTokens();
        const url = `${BLING_API_URL}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                ...options.headers,
            }
        });

        if (response.status === 401) {
            throw new Error("Sua sessão com o Bling expirou. Por favor, re-autorize nas configurações.");
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error(`Bling API Error [${endpoint}]:`, error);
            throw new Error(error.error?.description || "Erro na comunicação com o Bling");
        }

        return response.json();
    }

    static async getProducts(page = 1, limit = 100) {
        const data = await this.request(`/produtos?pagina=${page}&limite=${limit}`);
        return data; // Return full response object including metadata
    }

    static async createOrder(orderData: any) {
        return this.request("/pedidos/vendas", {
            method: "POST",
            body: JSON.stringify(orderData)
        });
    }

    static async emitInvoice(orderId: string) {
        return this.request(`/pedidos/vendas/${orderId}/gerar-nota-fiscal`, {
            method: "POST"
        });
    }

    static async createAccountReceivable(data: any) {
        return this.request("/contas-receber", {
            method: "POST",
            body: JSON.stringify(data)
        });
    }

    static async generateBoleto(contasReceberIds: number[]) {
        return this.request("/boletos", {
            method: "POST",
            body: JSON.stringify({
                contasReceber: contasReceberIds.map(id => ({ id }))
            })
        });
    }
}
