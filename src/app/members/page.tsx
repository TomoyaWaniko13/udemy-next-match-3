import { getMembers } from '@/app/actions/memberActions';
import MemberCard from '@/app/members/MemberCard';
import { fetchCurrentUserLikeIds } from '@/app/actions/likeActions';
import PaginationComponent from '@/components/PaginationComponent';
import { GetMemberParams } from '@/types';
import EmptyState from '@/components/EmptyState';

// 42 (Fetching data from the Database using server actions)
// 120 (Adding the UI for pagination)
// 121 (Adding the age slider functionality)
// 126 (Adding empty state)
// 130 (Adding the pagination functionality)

// query string を使うことで、サーバー側でも状態の変化を検知して、それに基づいて getMembers() で members を取得できます。
// UserFilters は、Filters.tsx で設定できる条件を表しています。
// これにより memberActions.ts の getMembers() で条件に合う Member のみを取得できます。
const MembersPage = async ({ searchParams }: { searchParams: GetMemberParams }) => {
  const { items: members, totalCount } = await getMembers(searchParams);

  // 56 (Fetching the likes)
  // 現在の user がいいねをした相手の ID の配列です。
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
          <PaginationComponent totalCount={totalCount} />
        </>
      )}
    </>
  );
};

export default MembersPage;
