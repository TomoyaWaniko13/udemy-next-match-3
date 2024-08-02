import { getMembers } from '@/app/actions/memberActions';
import MemberCard from '@/app/members/MemberCard';

const MembersPage = async () => {
  // 42(Fetching data from the Database using server actions)
  // getMembers()はserver sideで実行されるserver action
  const members = await getMembers();

  return (
    <div className={'mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8'}>
      {members && members.map((member) => <MemberCard member={member} key={member.id} />)}
    </div>
  );
};

export default MembersPage;
