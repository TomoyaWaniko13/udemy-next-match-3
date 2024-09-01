import usePresenceStore from '@/hooks/usePresenceStore';
import { Channel, Members } from 'pusher-js';
import { useCallback, useEffect, useRef } from 'react';
import { pusherClient } from '@/lib/pusher';
import { updateLastActive } from '@/app/actions/memberActions';

// 104 (Creating a presence channel hook)
// 123 (Updating the last active property)
// Pusher を使用してリアルタイムのユーザープレゼンス（オンライン状態）を管理するためのカスタムフック usePresenceChannel を定義しています。
// user の状態管理：
// 誰がオンラインなのか
// 新しくオンラインになった人
// オフラインになった人
// これらの情報をリアルタイムで把握し、アプリケーションの状態（ストア）に反映します。

// このカスタムフック（usePresenceChannel）を使用することで、アプリケーションの他の部分で簡単に：
// 現在オンラインのユーザーリストを取得
// ユーザーがオンライン/オフラインになったときの通知
// これらの情報に基づいたUI更新
// などが可能になります。
export const usePresenceChannel = () => {
  // usePresenceStore() から必要な関数を取得
  // これらの関数は、ストア内のメンバーリストを操作するために使用されます。
  // state は、Zustandというステート管理ライブラリのコンテキストにおいて、ストア（store）の現在の状態を表します。
  // state はオブジェクトで、ストアに保存されているすべてのデータと関数を含んでいます。
  const { set, add, remove } = usePresenceStore((state) => ({
    set: state.set,
    add: state.add,
    remove: state.remove,
  }));

  // これにより、コンポーネントの再レンダリング間でチャンネルの参照を保持できます。
  const channelRef = useRef<Channel | null>(null);

  // この関数は、メンバーIDの配列を受け取り、それをストアにセットします。
  // 主に、初期のメンバーリストを設定するために使われます。
  // useCallback を使用することで、set 関数が変更されない限り、この関数は再作成されません。
  const handleSetMembers = useCallback(
    (memberIds: string[]) => {
      set(memberIds);
    },
    [set],
  );

  // この関数は、単一のメンバーIDを受け取り、それをストアに追加します。
  // 新しいメンバーが接続したときに使用されます。
  // useCallback により、add 関数が変更されない限り再作成されません。
  const handleAddMember = useCallback(
    (memberId: string) => {
      add(memberId);
    },
    [add],
  );

  //　この関数は、単一のメンバーIDを受け取り、それをストアから削除します。
  // メンバーが切断したときに使用されます。
  // useCallback により、remove 関数が変更されない限り再作成されません。
  const handleRemoveMember = useCallback(
    (memberId: string) => {
      remove(memberId);
    },
    [remove],
  );

  // コンポーネントのライフサイクルに合わせてPusherのチャンネルを適切に管理し、メンバーの状態をリアルタイムで追跡することを可能にします。
  // また、メモリリークを防ぐためのクリーンアップも適切に行っています。
  useEffect(() => {
    if (!channelRef.current) {
      // チャンネルがまだ購読されていない場合、'presence-nm' という名前のプレゼンスチャンネルを購読します。
      channelRef.current = pusherClient.subscribe('presence-nm');

      // 購読が成功したときに呼ばれ、現在のメンバーリストをセットします。
      // Members は Pusher.js ライブラリで提供されるオブジェクトで、プレゼンスチャンネルに接続されているメンバー（ユーザー）
      // の情報を管理するために使用されます。
      channelRef.current.bind('pusher:subscription_succeeded', async (members: Members) => {
        handleSetMembers(Object.keys(members.members));
        await updateLastActive();
      });

      // 新しいメンバーが追加されたときに呼ばれ、そのメンバーを追加します。
      channelRef.current.bind('pusher:member_added', (member: Record<string, any>) => {
        handleAddMember(member.id);
      });

      // メンバーが削除されたときに呼ばれ、そのメンバーを削除します。
      channelRef.current?.bind('pusher:member_removed', (member: Record<string, any>) => {
        handleRemoveMember(member.id);
      });
    }

    // コンポーネントがアンマウントされるとき、またはエフェクトが再実行される前に呼ばれます。
    // チャンネルの購読を解除し、バインドしたイベントを解除します。
    return () => {
      if (channelRef.current && channelRef.current?.subscribed) {
        channelRef.current.unsubscribe();
        channelRef.current.unbind('pusher:subscription_succeeded', handleSetMembers);
        channelRef.current.unbind('pusher:member_added', handleAddMember);
        channelRef.current.unbind('pusher:member_removed', handleRemoveMember);
      }
    };
  }, [handleAddMember, handleRemoveMember, handleSetMembers]);
};
