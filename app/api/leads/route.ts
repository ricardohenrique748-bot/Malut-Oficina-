import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            name,
            phone,
            email,
            vehicleBrand,
            vehicleModel,
            vehiclePlate,
            service,
            preferredDate,
            notes
        } = body;

        // 1. Find a responsible user (Admin) to attribute this creation to
        // This is required because WorkOrder needs a createdById
        const systemUser = await prisma.user.findFirst({
            where: { role: { name: 'ADMIN' } }
        });

        // Fallback: If no ADMIN, try any user (e.g. during dev)
        const responsibleUser = systemUser || await prisma.user.findFirst();

        if (!responsibleUser) {
            console.error("No valid user found to assign Work Order creation");
            return new NextResponse("System Configuration Error: No users found", { status: 500 });
        }

        // 2. Create or find customer (email is not unique in schema, so use findFirst)
        let customer = email ? await prisma.customer.findFirst({ where: { email } }) : null;

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    name,
                    phone: phone || "",
                    email: email || `lead_${Date.now()}@malut.com`,
                    document: "",
                    address: ""
                }
            });
        }

        // 3. Create OR FIND vehicle if provided
        let vehicle = null;
        if (vehicleBrand && vehicleModel) {
            // Check if plate exists (if provided)
            if (vehiclePlate) {
                vehicle = await prisma.vehicle.findUnique({
                    where: { plate: vehiclePlate }
                });
            }

            if (!vehicle) {
                vehicle = await prisma.vehicle.create({
                    data: {
                        plate: vehiclePlate || `TEMP-${Date.now()}`,
                        brand: vehicleBrand,
                        model: vehicleModel,
                        year: new Date().getFullYear(),
                        color: "",
                        customerId: customer.id
                    }
                });
            }
        }

        // 4. Create CRM Lead (Fix for "CRM not capturing")
        // We set it to 'warm' because they are actively scheduling
        const lead = await prisma.lead.create({
            data: {
                nome: name,
                email: email || customer.email || "",
                telefone: phone,
                ramo: "Oficina", // Generic for now
                objetivo: service,
                urgencia: "alta",
                statusKanban: "warm", // Initial status
                scorePotencial: 75, // High initial score for direct scheduling
                tagsAi: JSON.stringify(["Agendamento Site", service]),
                resumoAi: `Agendamento solicitado pelo site.\nVeículo: ${vehicleBrand || '?'} ${vehicleModel || ''}\nData: ${preferredDate}\nObs: ${notes || '-'}`
            }
        });

        // 5. Create Work Order in ABERTA status
        const leadNotes = `
🌐 LEAD DA LANDING PAGE
Serviço: ${service}
${preferredDate ? `Data Preferencial: ${new Date(preferredDate).toLocaleDateString('pt-BR')}` : ''}
${vehicleBrand ? `Veículo: ${vehicleBrand} ${vehicleModel}` : ''}
${vehiclePlate ? `Placa: ${vehiclePlate}` : ''}
${notes ? `\nObservações: ${notes}` : ''}
crm_lead_id: ${lead.id}
        `.trim();

        const workOrder = await prisma.workOrder.create({
            data: {
                customerId: customer.id,
                vehicleId: vehicle?.id || null,
                notes: leadNotes,
                scheduledFor: preferredDate ? new Date(preferredDate) : null,
                status: 'ABERTA',
                createdById: responsibleUser.id, // Fixed: Using actual user ID
                totalParts: 0,
                totalLabor: 0,
                totalValue: 0,
                discount: 0
            }
        });

        return NextResponse.json({
            success: true,
            customerId: customer.id,
            workOrderId: workOrder.id,
            leadId: lead.id
        });
    } catch (error: any) {
        console.error("Lead capture error:", error);
        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}
