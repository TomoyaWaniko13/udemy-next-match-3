'use client';

import { NavbarItem } from '@nextui-org/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useMessageStore from '@/hooks/useMessageStore';

type Props = {
  href: string;
  label: string;
};

// 113 (Getting the unread message count)
const NavLink = ({ href, label }: Props) => {
  const pathname = usePathname();

  // unreadCountはProviders.tsxで更新されています。
  // それを取得して、UIに反映します。
  const { unreadCount } = useMessageStore((state) => ({
    unreadCount: state.unreadCount,
  }));

  return (
    <NavbarItem isActive={pathname === href} as={Link} href={href}>
      <span>{label}</span>
      {/* 'MESSAGES' というリンクの横に、未読のメッセージの件数を表示します。*/}
      {href === '/messages' && unreadCount > 0 && <span className={'ml-1'}>({unreadCount})</span>}
    </NavbarItem>
  );
};

export default NavLink;
