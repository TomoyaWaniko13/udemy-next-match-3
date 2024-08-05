import ListsTab from '@/app/lists/ListsTab';
import { fetchCurrentUserLikeIds, fetchLikedMembers } from '@/app/actions/likeActions';

// 58 (Adding the list tabs)
const ListsPage = async ({ searchParams }: { searchParams: { type: string } }) => {
  // likeIdsとmembersは<MemberCard />で使われる。
  // searchParams.type(query string)の値によりfetchするMembersの種類が変わる。
  const likeIds = await fetchCurrentUserLikeIds();
  const members = await fetchLikedMembers(searchParams.type);

  return (
    <>
      <ListsTab members={members} likeIds={likeIds} />
    </>
  );
};

export default ListsPage;
