'use client';

import { NextUIProvider } from '@nextui-org/react';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import { usePresenceChannel } from '@/hooks/usePresenceChannel';
import { useNotificationChannel } from '@/hooks/useNotificationChannel';

// 103 (Using the presence channel hook)
// 108 (Setting up a private channel)
const Providers = ({ children, userId }: { children: ReactNode; userId: string | null }) => {
  usePresenceChannel();
  useNotificationChannel(userId);

  return (
    <NextUIProvider>
      <ToastContainer position={'bottom-right'} hideProgressBar={true} className={'z-50'} />
      {children}
    </NextUIProvider>
  );
};

export default Providers;
