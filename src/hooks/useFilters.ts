import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FaFemale, FaMale } from 'react-icons/fa';
import { Selection } from '@nextui-org/react';
import useFilterStore from '@/hooks/useFilterStore';
import { useEffect } from 'react';

// 125 (Adding a filter store and hook)
// Filters.tsx で使うロジックをここに記述しています。
export const useFilters = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { filters, setFilters } = useFilterStore();

  const { gender, ageRange, orderBy } = filters;

  useEffect(() => {
    const searchParams = new URLSearchParams();

    // query parameterを更新します。
    // %2C is the URL encoded version of a comma.
    if (gender) searchParams.set('gender', gender.join(','));
    // ageRangeは、[37, 65] というふうに取得されます。
    // toString()を適用すると、'37,65' となります。
    if (ageRange) searchParams.set('ageRange', ageRange.toString());
    if (orderBy) searchParams.set('orderBy', orderBy);

    // 更新されたURLパラメータを使用してページをリロードせずにURLを更新します。
    router.replace(`${pathname}?${searchParams}`);
  }, [ageRange, orderBy, gender, router, pathname]);

  const genderList = [
    // valueをkeyとして扱います。
    { value: 'male', icon: FaMale },
    { value: 'female', icon: FaFemale },
  ];

  const orderByList = [
    // valueをkeyとして扱います。
    { value: 'updated', label: 'Last active' },
    { value: 'created', label: 'Newest members' },
  ];

  // <Button/>で選ばれた値をもとにして、storeの値とquery parameterを更新します。
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

  // <Slider/>で選ばれた値をもとにして、storeの値とquery parameterを更新します。
  const handleAgeSelect = (ageRangeValue: number[]) => {
    setFilters('ageRange', ageRangeValue);
  };

  // <Select/>で選ばれた値をもとにして、storeの値とquery parameterを更新します。
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

  return {
    orderByList,
    genderList,
    selectAge: handleAgeSelect,
    selectGender: handleGenderSelect,
    selectOrder: handleOrderSelect,
    filters,
  };
};
