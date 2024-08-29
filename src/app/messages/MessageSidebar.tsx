'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { GoInbox } from 'react-icons/go';
import { MdOutlineOutbox } from 'react-icons/md';
import clsx from 'clsx';
import { Chip } from '@nextui-org/chip';
import { useState } from 'react';
import useMessageStore from '@/hooks/useMessageStore';

// 88 (Adding the message sidebar)
// 107 (Displaying presence in other components)
// 113 (Getting the unread message count)

const MessageSidebar = () => {
  const { unreadCount } = useMessageStore((state) => ({
    unreadCount: state.unreadCount,
  }));

  // Next.js の useSearchParams フックを使用しています。
  // 現在のURLのクエリパラメータ（URLの?以降の部分）を取得します。
  // URLが/messages?container=inboxの場合、searchParams.get('container')で'inbox'を取得できます。
  const searchParams = useSearchParams();

  // 現在のページのパス（URLのドメイン以降の部分）を取得します。
  // 使用例: URLがhttps://example.com/messagesの場合、pathnameは/messagesとなります。
  const pathname = usePathname();

  // プログラムによるナビゲーション（ページ遷移やURL変更）を可能にするルーターオブジェクトを取得します。
  // 使用例: router.replace()メソッドを使用して、URLを更新することができます。
  const router = useRouter();

  // useState() フック を使用して、現在選択されているアイテム（inbox または outbox）を管理しています。
  // 初期値はURLのクエリパラメータから取得し、デフォルトは 'inbox' です。
  const [selected, setSelected] = useState<string>(searchParams.get('container') || 'inbox');

  // items配列で、サイドバーに表示するアイテム（Inbox と Outbox）を定義しています。
  const items = [
    { key: 'inbox', label: 'Inbox', icon: GoInbox, chip: true },
    { key: 'outbox', label: 'Outbox', icon: MdOutlineOutbox, chip: false },
  ];

  // key は inbox か outbox です。
  const handleSelect = (key: string) => {
    // useState() フック を使用して、現在選択されているアイテム（inbox または outbox）を管理しています。
    setSelected(key);

    //　これは JavaScript の標準 API である URLSearchParams のインスタンスを新しく作成しています。
    //　このオブジェクトに新しいパラメータを追加したり、既存のパラメータを変更したりできます。
    const params = new URLSearchParams();
    params.set('container', key);

    //　${pathname}:
    // 現在のページのパス（URLのドメイン以降の部分）を表します。
    // 例えば、現在のURLが https://example.com/messages なら、pathname は /messages となります。

    // ?${params}:
    // URLにクエリパラメータを追加します。
    // ? はクエリパラメータの開始を示します。
    // params は URLSearchParams オブジェクトで、これが文字列に変換されてURLに追加されます。

    // 例えば、ユーザーが「Outbox」を選択した場合、以下のような処理が行われます：
    // params.set('container', 'outbox') が実行され、params に container=outbox が設定されます。
    // router.replace() が呼び出され、URLが更新されます。
    // 結果として、URLは https://example.com/messages?container=outbox のようになります。

    // この処理により、以下のような利点があります：
    // ユーザーの選択がURLに反映されるので、ページをリロードしても選択状態が保持されます。
    // URLを共有すれば、特定の選択状態（この場合はInboxかOutbox）を他の人と共有できます。
    router.replace(`${pathname}?${params}`);
  };

  return (
    // 縦並びにする。
    <div className={'flex flex-col show-md rounded-lg cursor-pointer'}>
      {/* items 配列は、サイドバーに表示するアイテム（Inbox と Outbox）を定義しています。*/}
      {/* key は inbox か outbox です。*/}
      {items.map(({ key, icon: Icon, label, chip }) => (
        // 横並びにする。
        <div
          key={key}
          className={clsx('flex flex-row items-center rounded-t-lg gap-2 p-3', {
            // 選択されている方の色を変えます。
            'text-secondary fond-semibold': selected === key,
            'text-black hover:text-secondary/70': selected !== key,
          })}
          onClick={() => handleSelect(key)}
        >
          <Icon size={24} />
          <div className={'flex justify-between flex-grow'}>
            <span>{label}</span>
            {chip && <Chip>{unreadCount}</Chip>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSidebar;
