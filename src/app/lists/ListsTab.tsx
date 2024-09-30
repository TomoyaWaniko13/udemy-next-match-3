'use client';

import { Member } from '@prisma/client';
import { Tab, Tabs } from '@nextui-org/react';
import { Key, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MemberCard from '@/app/members/MemberCard';
import LoadingComponent from '@/components/LoadingComponent';

type Props = {
  members: Member[];
  likeIds: string[];
};

// 58 (Adding the list tabs)
// 59 (Using the useTransition hook for subtle loading)

const ListsTab = ({ members, likeIds }: Props) => {
  const searchParams = new URLSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // useTransition is a React Hook that lets you update the state without blocking the UI.
  const [isPending, startTransition] = useTransition();

  const tabs = [
    { id: 'source', label: 'Members I have liked' },
    { id: 'target', label: 'Members that like me' },
    { id: 'mutual', label: 'Mutual likes' },
  ];

  // この関数の主な目的は、選択された Tab に応じて, tabKey を取得して、
  // URL のクエリパラメータを更新することです。
  function handleTabChange(tabKey: Key) {
    //
    // 重い処理を低優先度の更新としてスケジュール
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      // 'type' パラメータを選択されたタブの ID に設定します。
      params.set('type', tabKey.toString());
      router.replace(`${pathname}?${params.toString()}`);
    });
    //
  }

  // NextUI の <Tabs/> の書き方に従って書きます。
  // https://nextui.org/docs/components/tabs
  return (
    <div className={'flex w-full flex-col mt-10 gap-5'}>
      <Tabs aria-label={'Like tabs'} items={tabs} color={'secondary'} onSelectionChange={(tabKey: Key) => handleTabChange(tabKey)}>
        {(item: { id: string; label: string }) => (
          <Tab key={item.id} title={item.label}>
            {!isPending ? (
              <>
                {members.length > 0 ? (
                  <div className={'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-8'}>
                    {members.map((member) => (
                      <MemberCard key={member.id} member={member} likeIds={likeIds} />
                    ))}
                  </div>
                ) : (
                  <div>No members for this filter</div>
                )}
              </>
            ) : (
              <LoadingComponent />
            )}
          </Tab>
        )}
      </Tabs>
    </div>
  );
};

export default ListsTab;
