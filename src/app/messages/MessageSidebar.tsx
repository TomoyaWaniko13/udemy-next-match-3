'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { GoInbox } from 'react-icons/go';
import { MdOutlineOutbox } from 'react-icons/md';
import clsx from 'clsx';
import { Chip } from '@nextui-org/chip';
import { useState } from 'react';

// 88 (Adding the message sidebar)
const MessageSidebar = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  // useStateフックを使用して、現在選択されているアイテム（inbox または outbox）を管理しています。
  // 初期値はURLのクエリパラメータから取得し、デフォルトは'inbox'です。
  const [selected, setSelected] = useState<string>(searchParams.get('container') || 'inbox');

  // items配列で、サイドバーに表示するアイテム（Inbox と Outbox）を定義しています。
  const items = [
    { key: 'inbox', label: 'Inbox', icon: GoInbox, chip: true },
    { key: 'outbox', label: 'Outbox', icon: MdOutlineOutbox, chip: true },
  ];

  const handleSelect = (key: string) => {
    setSelected(key);
    const params = new URLSearchParams();
    params.set('container', key);
    //router.replace()は router.push()とは異なり、ブラウザの履歴に新しいエントリーを追加しません。
    // つまり、ユーザーがブラウザの「戻る」ボタンをクリックしても、この変更前のURLには戻りません。

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
    // SEOの観点からも、異なる状態のページに異なるURLを持たせることができます
    router.replace(`${pathname}?${params}`);
  };

  return (
    // 縦並びにする。
    <div className={'flex flex-col show-md rounded-lg cursor-pointer'}>
      {items.map(({ key, icon: Icon, label, chip }) => (
        // 横並びにする。
        <div
          key={key}
          className={clsx('flex flex-row items-center rounded-t-lg gap-2 p-3', {
            'text-secondary fond-semibold': selected === key,
            'text-black hover:text-secondary/70': selected !== key,
          })}
          onClick={() => handleSelect(key)}
        >
          <Icon size={24} />
          <div className={'flex justify-between flex-grow'}>
            <span>{label}</span>
            {chip && <Chip>5</Chip>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSidebar;
