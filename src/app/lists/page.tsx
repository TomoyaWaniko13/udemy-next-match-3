import ListsTab from '@/app/lists/ListsTab';
import { fetchCurrentUserLikeIds, fetchLikedMembers } from '@/app/actions/likeActions';

// 58 (Adding the list tabs)

export const dynamic = 'force-dynamic';

const ListsPage = async ({ searchParams }: { searchParams: { type: string } }) => {
  const likeIds = await fetchCurrentUserLikeIds();
  // 引数のquery parameter の値により、return する users の IDs の配列を変更します。
  const members = await fetchLikedMembers(searchParams.type);

  return <ListsTab members={members} likeIds={likeIds} />;
};

export default ListsPage;
