'use client';

import { NextUIProvider } from '@nextui-org/react';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import { usePresenceChannel } from '@/hooks/usePresenceChannel';

// 103 (Using the presence channel hook)
const Providers = ({ children }: { children: ReactNode }) => {
  usePresenceChannel();
  return (
    <NextUIProvider>
      <ToastContainer position={'bottom-right'} hideProgressBar={true} className={'z-50'} />
      {children}
    </NextUIProvider>
  );
};

export default Providers;
