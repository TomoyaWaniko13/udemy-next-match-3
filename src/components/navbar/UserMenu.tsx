'use client';

import { Session } from 'next-auth';
import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from '@nextui-org/react';
import Link from 'next/link';
import { signOut } from '@/auth';
import { signOutUser } from '@/app/actions/authActions';

type Props = {
  // userは name, email, idなどを含んでいる。（prismaのUser modelではない。）
  // Session['user']　はAuth.jsから
  // user: Session['user'];

  // 75 (Challenge solution)
  userInfo: { name: string | null; image: string | null } | null | undefined;
};

// 34 (Adding a dropdown menu to the Nav bar)
// 75 (Challenge solution)
const UserMenu = ({ userInfo }: Props) => {
  return (
    <Dropdown placement={'bottom-end'}>
      <DropdownTrigger>
        <Avatar
          isBordered={true}
          as={'button'}
          className={'transition-transform'}
          color={'secondary'}
          name={userInfo?.name || 'user avatar'}
          size={'sm'}
          src={userInfo?.image || '/images/user.png'}
        />
      </DropdownTrigger>
      <DropdownMenu variant={'flat'} aria-label={'user actions menu'}>
        <DropdownSection showDivider>
          <DropdownItem isReadOnly={true} as={'span'} className={'h-14 flex flex-row'} aria-label={'username'}>
            Signed in as {userInfo?.name}
          </DropdownItem>
        </DropdownSection>
        <DropdownItem as={Link} href={'/members/edit'}>
          Edit profile
        </DropdownItem>
        <DropdownItem color={'danger'} onClick={async () => signOutUser()}>
          Log out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default UserMenu;
