import { getMembers } from '@/app/actions/memberActions';
import MemberCard from '@/app/members/MemberCard';
import { fetchCurrentUserLikeIds } from '@/app/actions/likeActions';
import PaginationComponent from '@/components/PaginationComponent';
import { UserFilters } from '@/types';
import EmptyState from '@/components/EmptyState';

// 42 (Fetching data from the Database using server actions)
// 120 (Adding the UI for pagination)
// 121 (Adding the age slider functionality)
// 126 (Adding empty state)

// query stringを使うことで、server側でも状態の変化を検知して、それに基づいてgetMembers()でmembersを取得できます。
// UserFiltersは、Filters.tsxで設定できる条件を表しています。
// これにより memberActions.tsのgetMembers()で条件に合うMemberのみを取得できます。
const MembersPage = async ({ searchParams }: { searchParams: UserFilters }) => {
  // searchParamsは、 { ageRange: '25,81', gender: ',male,female', orderBy: 'created' }　などです。
  const members = await getMembers(searchParams);

  // 56 (Fetching the likes)
  // 現在のuserがいいねをした相手のIDの配列です。
  const likeIds = await fetchCurrentUserLikeIds();

  return (
    <>
      {!members || members.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className={'mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8'}>
            {members && members.map((member) => <MemberCard key={member.id} member={member} likeIds={likeIds} />)}
          </div>
          {/* 120 (Adding the UI for pagination) */}
          <PaginationComponent />
        </>
      )}
    </>
  );
};

export default MembersPage;
