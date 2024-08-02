import Link from 'next/link';
import { getMembers } from '@/app/actions/memberActions';

const MembersPage = async () => {
  // 42(Fetching data from the Database using server actions)
  // getMembers()はserver側で実行されるserver action
  const members = await getMembers();

  return (
    <>
      <ul>{members && members.map((member) => <li key={member.id}>{member.name}</li>)}</ul>
    </>
  );
};

export default MembersPage;
