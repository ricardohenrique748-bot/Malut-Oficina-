import StaffFormPage from "@/app/dashboard/staff/new/page";

export default function StaffEditPage({ params }: { params: { id: string } }) {
    return <StaffFormPage params={params} />;
}
