import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FaFemale, FaMale } from 'react-icons/fa';
import { Selection } from '@nextui-org/react';
import useFilterStore from '@/hooks/useFilterStore';
import { ChangeEvent, useEffect, useTransition } from 'react';
import usePaginationStore from '@/hooks/usePaginationStore';

// 125 (Adding a filter store and hook)
// 127 (Adding loading indicators for the filters)
// 129 (Adding the pagination functionality)
// 130 (Adding the pagination functionality Part 2)
// 135 (Challenge solution)

// Filters.tsx で使うロジックをここに記述しています。
export const useFilters = () => {
  const genderList = [
    // value を key として扱います。
    { value: 'male', icon: FaMale },
    { value: 'female', icon: FaFemale },
  ];

  const orderByList = [
    // value を key として扱います。
    { value: 'updated', label: 'Last active' },
    { value: 'created', label: 'Newest members' },
  ];

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  // FilterStore は <Filters/> で変更できる query parameter の状態を管理するための store です。
  // これにより、別のページに移動しても query parameter の状態を保持できます。
  const { filters, setFilters } = useFilterStore();

  // pagination に基づいて query parameter を変更するために、usePaginationStore() を使います。
  const { pageNumber, pageSize, setPage } = usePaginationStore((state) => ({
    pageNumber: state.pagination.pageNumber,
    pageSize: state.pagination.pageSize,
    setPage: state.setPageNumber,
  }));

  // これらの変数は、<Filters/> で変更できる query parameter の状態を管理するための store で管理されています。
  // これにより、別のページに移動しても query parameter の状態を保持できます。
  const { gender, ageRange, orderBy, withPhoto } = filters;

  // 130 (Adding the pagination functionality)
  useEffect(() => {
    // FilterStore で管理されているフィルターの値が変更されたら,
    if (gender || ageRange || orderBy || withPhoto) {
      // 現在のページを1ページ目にします。
      setPage(1);
    }
  }, [gender, ageRange, orderBy, setPage, withPhoto]);

  useEffect(() => {
    // URLの更新のような非緊急の状態更新を低優先度のタスクとしてマークします。
    // これにより、より重要なUIの更新（例：ユーザー入力への即時反応）が遅延しないようにします。
    // フィルターが変更されるたびにURLが更新されますが、useTransition()を使用することで、
    // この更新処理中もUIは反応的で操作可能な状態を保ちます。
    // さらに、isPendingフラグを提供し、更新プロセスの進行中であることをUIに示すことができます。
    // これにより、ユーザーに視覚的なフィードバックを与えることが可能になります。
    startTransition(() => {
      const searchParams = new URLSearchParams();

      // query parameter を更新します。
      // %2C is the URL encoded version of a comma.
      if (gender) searchParams.set('gender', gender.join(','));
      // ageRangeは、[37, 65] というふうに取得されます。toString() を適用すると、'37,65' となります。
      if (ageRange) searchParams.set('ageRange', ageRange.toString());
      if (orderBy) searchParams.set('orderBy', orderBy);

      // pageSize と pageNumber は number type なので、toString() を使う必要があります。
      if (pageSize) searchParams.set('pageSize', pageSize.toString());
      if (pageNumber) searchParams.set('pageNumber', pageNumber.toString());

      searchParams.set('withPhoto', withPhoto.toString());

      // 更新されたURLパラメータを使用してページをリロードせずにURLを更新します。
      router.replace(`${pathname}?${searchParams}`);
    });
    // FilterStore で管理されているフィルターの値が変更されたら,URL を更新します。
  }, [ageRange, orderBy, gender, router, pathname, pageNumber, pageSize, withPhoto]);

  // <Button/> で選ばれた値をもとにして、FilterStore で管理されている値 を更新します。
  const handleGenderSelect = (clickedGender: string) => {
    if (gender.includes(clickedGender)) {
      setFilters(
        'gender',
        gender.filter((g) => g !== clickedGender),
      );
    } else {
      setFilters('gender', [...gender, clickedGender]);
    }
  };

  // <Slider/> で選ばれた値をもとにして、FilterStore で管理されている値を更新します。
  const handleAgeSelect = (ageRangeValue: number[]) => {
    setFilters('ageRange', ageRangeValue);
  };

  // <Select/>　で選ばれた値をもとにして、FilterStore で管理されている値  を更新します。
  // NextUI の Selection を引数にとります。
  const handleOrderSelect = (orderByValue: Selection) => {
    // Selection = 'all' | Set<Key>　ですが、今回は 'all' は使われません。
    // なので、Set<Key> である場合に処理を開始します。
    if (orderByValue instanceof Set) {
      const params = new URLSearchParams(searchParams);
      // 選択されている値をvalue.values().next().valueで取得します。
      setFilters('orderBy', orderByValue.values().next().value);
    }
  };

  // <Switch/>　で選ばれた値をもとにして、FilterStore で管理されている値  を更新します。
  // https://nextui.org/docs/components/switch#switch-events
  // によると、ChangeEvent<HTMLInputElement> が <Switch/> の引数だとわかります。
  const handleWithPhotoToggle = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters('withPhoto', e.target.checked);
  };

  return {
    orderByList,
    genderList,
    selectAge: handleAgeSelect,
    selectGender: handleGenderSelect,
    selectOrder: handleOrderSelect,
    selectWithPhoto: handleWithPhotoToggle,
    filters,
    isPending,
  };
};
