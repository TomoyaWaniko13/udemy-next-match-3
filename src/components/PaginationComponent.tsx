'use client';

import { Pagination } from '@nextui-org/react';
import { useState } from 'react';
import clsx from 'clsx';

// 120 (Adding the UI for pagination)
const PaginationComponent = () => {
  const [active, setActive] = useState(3);

  return (
    // 上にborderを配置します。
    <div className={'border-t-2 w-full mt-5'}>
      {/* 横並びにしてjustify-betweenで間隔を最大限開けます。 */}
      <div className={'flex flex-row justify-between items-center py-5'}>
        <div>showing 1-10 of 23 results</div>
        {/* NextUIの<Pagination/> componentです。 */}
        <Pagination total={20} color={'secondary'} initialPage={1} variant={'bordered'} />
        {/* Page sizeを指定するためのUIです。 */}
        <div className={'flex flex-row gap-1 items-center'}>
          Page size:
          {[3, 6, 12].map((size) => (
            //　横並びにして、global.cssのboxのUIを適用します。
            // activeなpage size buttonに対しては、classNameの二行目の条件を適用します。
            <div
              key={size}
              className={clsx('page-size-box', {
                'bg-secondary text-white hover:bg-secondary hover:text-white': active === size,
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
