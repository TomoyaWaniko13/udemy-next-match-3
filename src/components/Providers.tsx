import { NextUIProvider } from '@nextui-org/react';
import { ReactNode } from 'react';

const Providers = ({ children }: { children: ReactNode }) => {
  return <NextUIProvider>{children}</NextUIProvider>;
};

export default Providers;
