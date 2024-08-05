'use client';

import { Member } from '@prisma/client';
import { Tab, Tabs } from '@nextui-org/react';
import { Key } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MemberCard from '@/app/members/MemberCard';

type Props = {
  members: Member[];
  likeIds: string[];
};

// 58 (Adding the list tabs)
const ListsTab = ({ members, likeIds }: Props) => {
  const searchParams = new URLSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: 'source', label: 'Members I have liked' },
    { id: 'target', label: 'Members that like me' },
    { id: 'mutual', label: 'Mutual likes' },
  ];

  // この関数の主な目的は、選択されたタブに応じて URL のクエリパラメータを更新することです。
  // URL の変更はlists/page.tsxのfetchLikedMembersで検出され、適切なデータをfetchするのに使用されます。

  // key パラメータを受け取ります。これは選択されたタブの ID を表します。
  function handleTabChange(key: Key) {
    // 新しい URLSearchParams オブジェクトを作成します。これは現在の URL のクエリパラメータを操作するために使用されます。
    const params = new URLSearchParams(searchParams);
    // 'type' パラメータを選択されたタブの ID に設定します。
    params.set('type', key.toString());
    // URL を更新します。新しい URL は現在のパス名（pathname）に、更新されたクエリパラメータ（params.toString()）を追加したものになります。
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className={'flex w-full flex-col mt-10 gap-5'}>
      <Tabs aria-label={'Like tabs'} items={tabs} color={'secondary'} onSelectionChange={(key) => handleTabChange(key)}>
        {/*item は 上で定めたtabs 配列の各要素を表します*/}
        {(item) => (
          <Tab key={item.id} title={item.label}>
            {members.length > 0 ? (
              <div className={'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-8'}>
                {members.map((member) => (
                  <MemberCard key={member.id} member={member} likeIds={likeIds} />
                ))}
              </div>
            ) : (
              <div>No members for this filter</div>
            )}
          </Tab>
        )}
      </Tabs>
    </div>
  );
};

export default ListsTab;
