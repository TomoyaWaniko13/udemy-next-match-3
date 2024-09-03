'use client';

import { usePathname } from 'next/navigation';
import Filters from '@/components/navbar/Filters';

// 126 (Adding empty state)
// <Filters/> を使用すると URLに query parameter を設定します。
// そうすると、<Filters/> を使用すると本来 query parameter が必要ない時でも、それが設定されてしまいます。
// なので、members page 以外では <Filters/> を使用せずに null をリターンすることで、
// query parameter を設定しないようにします。
const FiltersWrapper = () => {
  const pathname = usePathname();

  if (pathname === '/members') return <Filters />;
  else return null;
};

export default FiltersWrapper;
