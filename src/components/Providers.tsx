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
// 138 (Adding a Register wizard part 1)
// 151. Social Login part 2

type Props = {
  children: ReactNode;
  userId: string | null;
  profileComplete: boolean;
};

const Providers = ({ children, userId, profileComplete }: Props) => {
  // useEffect()が2回実行されるのを防ぐためのlogicです。
  const isUnreadCountSet = useRef(false);

  // updateUnreadCount()を取得します。
  // updateUnreadCount()は下のsetUnreadCount()で使われています。
  const { updateUnreadCount } = useMessageStore((state) => ({
    updateUnreadCount: state.updateUnreadCount,
  }));

  // 下のuseEffect()の中で使われています。
  const setUnreadCount = useCallback(
    (amount: number) => {
      updateUnreadCount(amount);
    },
    [updateUnreadCount],
  );

  useEffect(() => {
    // ログインしている必要があるので、userIdも存在する必要があります。
    if (!isUnreadCountSet.current && userId) {
      // 未読のメッセージの件数を取得します。
      getUnreadMessageCount().then((count) => {
        setUnreadCount(count);
      });
      isUnreadCountSet.current = true;
    }
  }, [setUnreadCount, userId]);

  // 誰がオンラインか表示するために必要なcustom hooksです。
  usePresenceChannel(userId, profileComplete);
  // メッセージを通知するために必要なcustom hooksです。
  useNotificationChannel(userId, profileComplete);

  return (
    <NextUIProvider>
      <ToastContainer position={'bottom-right'} hideProgressBar={true} className={'z-50'} />
      {children}
    </NextUIProvider>
  );
};
export default Providers;
