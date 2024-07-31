import { Navbar, NavbarBrand, NavbarContent } from '@nextui-org/navbar';
import Link from 'next/link';
import { Button, NavbarItem } from '@nextui-org/react';

const TopNav = () => {
  return (
    <Navbar
      maxWidth={'xl'}
      className={'bg-transparent'}
      classNames={{ item: ['text-xl', 'uppercase'] }}
    >
      <NavbarBrand>
        <span className={'font-bold font-mono text-3xl'}>NM</span>
      </NavbarBrand>
      <NavbarContent justify={'center'}>
        <NavbarItem as={Link} href={'/members'}>
          Matches
        </NavbarItem>
        <NavbarItem as={Link} href={'/lists'}>
          Lists
        </NavbarItem>
        <NavbarItem as={Link} href={'/messages'}>
          Messages
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify={'end'}>
        <Button variant={'bordered'}>Login</Button>
        <Button variant={'bordered'}>Register</Button>
      </NavbarContent>
    </Navbar>
  );
};

export default TopNav;
