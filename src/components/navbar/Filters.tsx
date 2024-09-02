'use client';

import { FaFemale, FaMale } from 'react-icons/fa';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button, Select, SelectItem, Slider, Selection } from '@nextui-org/react';

// 119 (Adding the filters component)
// 121 (Adding the age slider functionality)
// 124 (Adding the gender filter)
const Filters = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderByList = [
    { label: 'Last active', value: 'updated' },
    { label: 'Newest members', value: 'created' },
  ];

  const genders = [
    { value: 'male', icon: FaMale },
    { value: 'female', icon: FaFemale },
  ];

  // URLに 'gender' パラメータがある場合：その値をカンマで分割した配列を使用
  // URLに 'gender' パラメータがない場合：デフォルト値 ['male', 'female'] を使用
  const selectedGender = searchParams.get('gender')?.split(',') || ['male', 'female'];

  // query parameterを更新します。
  const handleAgeSelect = (value: number[]) => {
    const params = new URLSearchParams(searchParams);
    params.set('ageRange', value.join(','));
    router.replace(`${pathname}?${params}`);
  };

  // query parameterを更新します。
  // NextUIのSelectionを引数にとります。
  const handleOrderSelect = (value: Selection) => {
    // Selection = 'all' | Set<Key>　ですが、今回は 'all' は関係ないです。
    // なので、Set<Key>である場合に処理を開始します。
    if (value instanceof Set) {
      const params = new URLSearchParams(searchParams);
      // 選択されている値をvalue.values().next().valueで取得します。
      // その値をquery parameterに設定します。
      params.set('orderBy', value.values().next().value);
      router.replace(`${pathname}?${params}`);
    }
  };

  // ['man', 'woman'].filter((g) => g !== clickedValue));

  const handleGenderSelect = (clickedGender: string) => {
    // 現在のURLパラメータを取得します。
    const params = new URLSearchParams(searchParams);

    // 選択されたジェンダーが既に selectedGender 配列に含まれているかチェックします。
    if (selectedGender.includes(clickedGender)) {
      // そのジェンダーを除外した新しい配列を作成し、URLパラメータを更新します。
      // filter()内の条件が true の場合（つまり、現在のジェンダー, g が、クリックされたジェンダー, value と異なる場合）、
      // その要素は新しい配列に含まれます。
      params.set('gender', selectedGender.filter((g) => g !== clickedGender).toString());
    } else {
      // そのジェンダーを既存の選択に追加し、URLパラメータを更新します。
      params.set('gender', [...selectedGender, clickedGender].toString());
    }
    // 更新されたURLパラメータを使用してページをリロードせずにURLを更新します。
    router.replace(`${pathname}?${params}`);
  };

  if (pathname !== '/members') return null;

  return (
    <div className={'shadow-md py-2'}>
      <div className={'flex flex-row justify-around items-center'}>
        <div className={'text-secondary font-semibold text-xl'}>Results: 10</div>
        <div className={'flex gap-2 items-center'}>
          <div>Gender: </div>
          {genders.map(({ icon: Icon, value }) => (
            <Button
              key={value}
              size={'sm'}
              color={selectedGender.includes(value) ? 'secondary' : 'default'}
              onClick={() => handleGenderSelect(value)}
            >
              <Icon size={24} />
            </Button>
          ))}
        </div>
        <div className={'flex flex-row items-center gap-2 w-1/2'}>
          <Slider
            label={'Age range'}
            color={'secondary'}
            size={'sm'}
            minValue={18}
            maxValue={100}
            defaultValue={[18, 100]}
            onChangeEnd={(value) => handleAgeSelect(value as number[])}
          />
        </div>
        <div className={'w-1/4'}>
          <Select
            size={'sm'}
            fullWidth={true}
            label={'Order by'}
            variant={'bordered'}
            color={'secondary'}
            aria-label={'Order by selector'}
            selectedKeys={new Set([searchParams.get('orderBy') || 'updated'])}
            onSelectionChange={handleOrderSelect}
          >
            {orderByList.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
};

export default Filters;
