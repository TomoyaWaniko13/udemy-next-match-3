'use client';

import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from '@nextui-org/react';
import Link from 'next/link';
import { signOutUser } from '@/app/actions/authActions';
import { transformImageUrl } from '@/lib/util';

type Props = {
  // この型は userInfo にカーソルを合わせると表示されるので、copy & paste します。
  userInfo: { name: string | null; image: string | null } | null | undefined;
};

// 34 (Adding a dropdown menu to the Nav bar)
// 75 (Challenge solution)
// 77 (Tidying up the images)

const UserMenu = ({ userInfo }: Props) => {
  return (
    <Dropdown placement={'bottom-end'}>
      {/* 現在のユーザーの丸い写真をクリックすると、メニューが開きます。 */}
      <DropdownTrigger>
        <Avatar
          isBordered={true}
          as={'button'}
          className={'transition-transform'}
          color={'secondary'}
          name={userInfo?.name || 'user avatar'}
          size={'sm'}
          src={transformImageUrl(userInfo?.image) || '/images/user.png'}
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
