import { getMembers } from '@/app/actions/memberActions';
import MemberCard from '@/app/members/MemberCard';
import { fetchCurrentUserLikeIds } from '@/app/actions/likeActions';
import PaginationComponent from '@/components/PaginationComponent';
import { UserFilters } from '@/types';

// 120 (Adding the UI for pagination)
// 121 (Adding the age slider functionality)
// query stringを使うことで、server側でも状態の変化を検知して、それに基づいてgetMembers()でmembersを取得できます。
const MembersPage = async ({ searchParams }: { searchParams: UserFilters }) => {
  // 42(Fetching data from the Database using server actions)
  // getMembers()はserver sideで実行されるserver action
  const members = await getMembers(searchParams);

  // 56 (Fetching the likes)
  // ログインしているuserがいいねをした相手のIDのarray
  const likeIds = await fetchCurrentUserLikeIds();

  return (
    <>
      <div className={'mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8'}>
        {members && members.map((member) => <MemberCard key={member.id} member={member} likeIds={likeIds} />)}
      </div>
      {/* 120 (Adding the UI for pagination) */}
      <PaginationComponent />
    </>
  );
};

export default MembersPage;
