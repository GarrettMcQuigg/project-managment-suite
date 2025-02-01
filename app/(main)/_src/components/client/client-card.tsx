import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/packages/lib/components/button';
import { Card, CardContent } from '@/packages/lib/components/card';
import { Avatar, AvatarFallback } from '@packages/lib/components/avatar';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/packages/lib/components/form';
import { Input } from '@/packages/lib/components/input';
import { Mail, Pencil, Phone } from 'lucide-react';
import { cn } from '@/packages/lib/utils';
import type { ClientCardProps } from './types';

export const ClientCard = ({ client, form, onEdit, isEditing }: ClientCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card
        className={cn('bg-gradient-to-b from-purple-50 to-purple-100', 'dark:bg-gradient-to-br dark:from-purple-900/30 dark:via-purle-900/30 dark:to-transparent ')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-16 h-16 border-2 border-purple-200 dark:border-purple-700">
              <AvatarFallback className="text-xl font-semibold bg-purple-200 text-purple-700 dark:bg-purple-700 dark:text-purple-200">
                {client.name
                  .split(' ')
                  .map((chunk) => chunk[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-4 w-full">
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onEdit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} className="text-lg font-semibold border-purple-300 dark:border-purple-600" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} type="email" className="border-purple-300 dark:border-purple-600" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} type="tel" className="border-purple-300 dark:border-purple-600" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-purple-300 dark:border-purple-600"
                        onClick={() => {
                          form.reset(client);
                          onEdit();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                        Save
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-2xl text-purple-800 dark:text-purple-200">{client.name}</h3>
                    <Button type="button" variant="ghost" size="icon" className="hover:bg-purple-200/50 dark:hover:bg-purple-700/50" onClick={() => onEdit()}>
                      <Pencil className={cn('w-4 h-4', isHovered ? 'text-purple-600 dark:text-purple-300' : 'text-purple-400 dark:text-purple-500')} />
                    </Button>
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-300 space-y-2">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {client.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
