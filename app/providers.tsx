'use client';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

type Props = {
    children: React.ReactNode;
    session: Session | null;
}
export const Providers = ({ children,session }: Props) => {
  return (
    <SessionProvider>
       <QueryClientProvider client={queryClient}>
      {children}
      </QueryClientProvider>
    </SessionProvider>
  );
};