import Link from 'next/link';

const MembersPage = () => {
  return (
    <>
      <h3 className={'text-3xl'}>This will be the members page</h3>
      <Link href={'/'}>Go back home</Link>
    </>
  );
};

export default MembersPage;
