'use client';

import { NextUIProvider } from '@nextui-org/react';
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import { usePresenceChannel } from '@/hooks/usePresenceChannel';
import { useNotificationChannel } from '@/hooks/useNotificationChannel';
import useMessageStore from '@/hooks/useMessageStore';
import { getUnreadMessageCount } from '@/app/actions/messageActions';

// 103 (Using the presence channel hook)
// 108 (Setting up a private channel)
// 113 (Getting the unread message count)
const Providers = ({ children, userId }: { children: ReactNode; userId: string | null }) => {
  const isUnreadCountSet = useRef(false);

  const { updateUnreadCount } = useMessageStore((state) => ({
    updateUnreadCount: state.updateUnreadCount,
  }));

  const setUnreadCount = useCallback(
    (amount: number) => {
      // 未読のメッセージの件数についてのstateを更新する。
      updateUnreadCount(amount);
    },
    [updateUnreadCount],
  );

  useEffect(() => {
    // これは、React Strictモードによる二重実行の問題を解決しています。
    if (!isUnreadCountSet.current && userId) {
      // 未読のメッセージの件数を取得する。
      getUnreadMessageCount().then((count) => {
        setUnreadCount(count);
      });
      // useEffect()が2回実行されるのを防ぐためのlogicです。
      isUnreadCountSet.current = true;
    }
  }, [setUnreadCount, userId]);

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
