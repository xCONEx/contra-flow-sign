
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Filter, Phone, Mail, MapPin, Edit, Trash2, Eye } from "lucide-react";
import { AppSidebarProvider } from "@/components/AppSidebar";
import { NewClientDialog } from "@/components/NewClientDialog";
import { EditClientDialog } from "@/components/EditClientDialog";
import { DeleteClientDialog } from "@/components/DeleteClientDialog";
import { ClientViewDialog } from "@/components/ClientViewDialog";
import { useClients, Client } from "@/hooks/useClients";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const { clients, loading, refetch } = useClients();

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientUpdated = () => {
    refetch();
    setEditingClient(null);
  };

  const handleClientDeleted = () => {
    refetch();
    setDeletingClient(null);
  };

  return (
    <AppSidebarProvider>
      <div className="flex-1 p-4 md:p-6 overflow-x-hidden">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Clientes</h1>
              <p className="text-gray-600">
                {clients.length} {clients.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
              </p>
            </div>
            <NewClientDialog />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Carregando clientes...</p>
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{client.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{client.email}</span>
                      </CardDescription>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <div className="flex flex-col gap-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewingClient(client)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingClient(client)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingClient(client)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </div>
                  )}
                  {client.cpf_cnpj && (
                    <div className="text-sm text-gray-600">
                      CPF/CNPJ: {client.cpf_cnpj}
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-3">
                    Adicionado em {new Date(client.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? "Tente ajustar sua busca ou adicione um novo cliente."
                : "Adicione clientes para começar a gerenciar seus contatos e contratos."
              }
            </p>
            <NewClientDialog />
          </div>
        )}

        {/* Dialogs */}
        {editingClient && (
          <EditClientDialog
            open={!!editingClient}
            onOpenChange={(open) => !open && setEditingClient(null)}
            client={editingClient}
            onClientUpdated={handleClientUpdated}
          />
        )}

        {deletingClient && (
          <DeleteClientDialog
            open={!!deletingClient}
            onOpenChange={(open) => !open && setDeletingClient(null)}
            client={deletingClient}
            onClientDeleted={handleClientDeleted}
          />
        )}

        {viewingClient && (
          <ClientViewDialog
            open={!!viewingClient}
            onOpenChange={(open) => !open && setViewingClient(null)}
            client={viewingClient}
          />
        )}
      </div>
    </AppSidebarProvider>
  );
};

export default Clients;
