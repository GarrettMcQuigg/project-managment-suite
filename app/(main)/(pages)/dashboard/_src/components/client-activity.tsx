"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/lib/components/card";
import { Avatar, AvatarFallback } from "@/packages/lib/components/avatar";
import { Badge } from "@/packages/lib/components/badge";

interface ClientActivityItem {
  name: string;
  company: string;
  avatar: string;
  lastContact: string;
  status: string;
}

interface ClientActivityProps {
  clientActivity: ClientActivityItem[];
}

export function ClientActivity({ clientActivity }: ClientActivityProps) {
  return (
    <Card className="lg:col-span-4 border-border/40 hover:border-border/80 hover:shadow-md transition-all duration-200 group">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Client Activity</CardTitle>
        <CardDescription>Recent client interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clientActivity.map((client, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>{client.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500">{client.company}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{client.lastContact}</p>
                <Badge
                  variant={client.status === "active" ? "default" : "secondary"}
                  className="mt-1"
                >
                  {client.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
