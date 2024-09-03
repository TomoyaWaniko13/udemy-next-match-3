import { Navbar, NavbarBrand, NavbarContent } from '@nextui-org/navbar';
import Link from 'next/link';
import { Button } from '@nextui-org/react';
import NavLink from '@/components/navbar/NavLink';
import { auth } from '@/auth';
import UserMenu from '@/components/navbar/UserMenu';
import { getUserInfoForNav } from '@/app/actions/userActions';
import FiltersWrapper from '@/components/navbar/FiltersWrapper';

const TopNav = async () => {
  const session = await auth();
  // 75 (Challenge Solution)
  const userInfo = session?.user && (await getUserInfoForNav());

  return (
    <>
      <Navbar
        maxWidth={'xl'}
        className={'bg-transparent'}
        classNames={{
          item: ['text-xl', 'uppercase', 'data-[active=true]:text-blue-600'],
        }}
      >
        <NavbarBrand as={Link} href={'/'}>
          <span className={'font-bold font-mono text-3xl'}>NM</span>
        </NavbarBrand>
        <NavbarContent justify={'center'}>
          <NavLink href={'/members'} label={'Matches'} />
          <NavLink href={'/lists'} label={'Lists'} />
          <NavLink href={'/messages'} label={'Messages'} />
        </NavbarContent>
        <NavbarContent justify={'end'}>
          {/* 34 (Adding a dropdown menu to the Nav bar) */}
          {/* 75 (Challenge Solution) */}
          {userInfo ? (
            <UserMenu userInfo={userInfo} />
          ) : (
            <>
              <Button as={Link} href={'/login'} variant={'bordered'}>
                Login
              </Button>
              <Button as={Link} href={'/register'} variant={'bordered'}>
                Register
              </Button>
            </>
          )}
        </NavbarContent>
      </Navbar>
      <FiltersWrapper />
    </>
  );
};

export default TopNav;
