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

  const genders = [
    // valueをkeyとして扱います。
    { value: 'male', icon: FaMale },
    { value: 'female', icon: FaFemale },
  ];

  const orderByList = [
    // valueをkeyとして扱います。
    { value: 'updated', label: 'Last active' },
    { value: 'created', label: 'Newest members' },
  ];

  // URLに 'gender' パラメータがある場合：その値をカンマで分割した配列を使用します。
  // URLに 'gender' パラメータがない場合：デフォルト値 ['male', 'female'] を使用します。
  const selectedGenders = searchParams.get('gender')?.split(',') || ['male', 'female'];

  const handleGenderSelect = (clickedGender: string) => {
    // 現在のURLパラメータを取得します。
    const params = new URLSearchParams(searchParams);

    // clickedGender が既に selectedGender 配列に含まれているかチェックします。
    // includes() は true もしくは false を return します。
    if (selectedGenders.includes(clickedGender)) {
      // clickedGender が既に selectedGender 配列に含まれている場合、
      // clickedGenderを除外した新しい配列を作成し、URLパラメータを更新します。
      params.set('gender', selectedGenders.filter((selectedGender) => selectedGender !== clickedGender).toString());
    } else {
      // clickedGender が selectedGender 配列に含まれていない場合、
      // clickedGenderを加えた新しい配列を作成し、URLパラメータを更新します。
      params.set('gender', [...selectedGenders, clickedGender].toString());
    }
    // 更新されたURLパラメータを使用してページをリロードせずにURLを更新します。
    router.replace(`${pathname}?${params}`);
  };

  // <Slider/>で選ばれた値をもとにして、query parameterを更新します。
  const handleAgeSelect = (ageRangeValue: number[]) => {
    const params = new URLSearchParams(searchParams);
    // %2C is the URL encoded version of a comma.
    params.set('ageRange', ageRangeValue.join(','));
    // 更新されたURLパラメータを使用してページをリロードせずにURLを更新します。
    router.replace(`${pathname}?${params}`);
  };

  // NextUIのSelectionを引数にとります。 query parameterを更新します。
  const handleOrderSelect = (orderByValue: Selection) => {
    // Selection = 'all' | Set<Key>　ですが、今回は 'all' は関係ないです。
    // なので、Set<Key>である場合に処理を開始します。
    if (orderByValue instanceof Set) {
      const params = new URLSearchParams(searchParams);
      // 選択されている値をvalue.values().next().valueで取得します。
      // その値をquery parameterに設定します。
      params.set('orderBy', orderByValue.values().next().value);
      // 更新されたURLパラメータを使用してページをリロードせずにURLを更新します。
      router.replace(`${pathname}?${params}`);
    }
  };

  // members pageでしか<Filters/>は表示しません。
  if (pathname !== '/members') return null;

  return (
    <div className={'shadow-md py-2'}>
      {/* 横並びにします。 */}
      <div className={'flex flex-row justify-around items-center'}>
        <div className={'text-secondary font-semibold text-xl'}>Results: 10</div>
        {/* 横並びにします。 */}
        <div className={'flex gap-2 items-center'}>
          <div>Gender: </div>
          {genders.map(({ value, icon: Icon }) => (
            <Button
              key={value}
              size={'sm'}
              color={selectedGenders.includes(value) ? 'secondary' : 'default'}
              onClick={() => handleGenderSelect(value)}
            >
              <Icon size={24} />
            </Button>
          ))}
        </div>
        {/* <Slider/>がwidthの1/2を占めるようにします。 */}
        <div className={'flex flex-row items-center gap-2 w-1/2'}>
          {/* NextUIの<Slider/>について: */}
          {/* https://nextui.org/docs/components/slider */}
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
        {/*　<Select/>がwidthの1/4を占めるようにします。　*/}
        <div className={'w-1/4'}>
          {/* NextUIの<Select/>について: */}
          {/* https://nextui.org/docs/components/select */}
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
