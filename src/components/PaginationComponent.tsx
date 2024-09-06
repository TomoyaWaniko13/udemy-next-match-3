'use client';

import { Pagination } from '@nextui-org/react';
import { useEffect } from 'react';
import clsx from 'clsx';
import usePaginationStore from '@/hooks/usePaginationStore';

// 120 (Adding the UI for pagination)
// 129 (Adding the pagination functionality)
// 130 (Adding the pagination functionality)
const PaginationComponent = ({ totalCount }: { totalCount: number }) => {
  const { setPageSize, setPageNumber, setTotalCount, pagination } = usePaginationStore((state) => ({
    //　新しいページサイズを受け取り、1ページあたりのアイテム数を更新します
    setPageSize: state.setPageSize,
    // 新しいページ番号（pageNumber）を受け取り、現在のページを更新します。
    setPageNumber: state.setPageNumber,
    // 全アイテム数（count）を受け取り、ページネーション状態を更新します。
    setTotalCount: state.setTotalCount,
    // 現在のページネーション状態を表すオブジェクトです。
    pagination: state.pagination,
  }));

  const { pageNumber, pageSize, totalPages } = pagination;

  // この <PaginationComponent/> がロードされた時に実行されます。
  useEffect(() => {
    setTotalCount(totalCount);
  }, [setTotalCount, totalCount]);

  // 画面に表示する最初のアイテムの index は、(前のページの最後のアイテムの index) + 1 としています。
  const start = (pageNumber - 1) * pageSize + 1;
  // 画面に表示する最後のアイテムの index は, (現在のページの最後のアイテムの index) と
  // (最後のアイテムの index) のうち、小さいほうとしています。
  const end = Math.min(pageNumber * pageSize, totalCount);
  const resultText = `Showing ${start}-${end} of ${totalCount} results`;

  return (
    // 上に border を配置します。
    <div className={'border-t-2 w-full mt-5'}>
      {/* 横並びにして justify-between で間隔を最大限開けます。 */}
      <div className={'flex flex-row justify-between items-center py-5'}>
        <div>{resultText}</div>
        {/* NextUI の <Pagination/> componentです。 */}
        {/* https://nextui.org/docs/components/pagination */}
        <Pagination
          total={totalPages}
          color={'secondary'}
          page={pageNumber}
          onChange={setPageNumber}
          variant={'bordered'}
        />
        {/* Page size を指定するための UI です。 */}
        <div className={'flex flex-row gap-1 items-center'}>
          Page size:
          {/* page size は 3,6,12 の3つのオプションがあります。 */}
          {[3, 6, 12].map((size) => (
            //　横並びにして、globals.cssで設定したboxのUI 'page-size-box' を適用します。
            // activeなpage size buttonに対しては、classNameの二行目の条件を適用します。
            <div
              key={size}
              onClick={() => setPageSize(size)}
              className={clsx('page-size-box', {
                'bg-secondary text-white hover:bg-secondary hover:text-white': pageSize === size,
              })}
            >
              {size}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaginationComponent;
