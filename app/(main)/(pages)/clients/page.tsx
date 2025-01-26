import ClientsTable from './_src/clients-table';

export default function ClientsPage() {
  return (
    <div className="space-y-4 p-8">
      <h1 className="text-2xl font-bold">Clients</h1>
      <ClientsTable />
    </div>
  );
}
