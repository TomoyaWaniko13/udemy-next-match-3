'use client';

import { Button, Select, SelectItem, Slider, Spinner, Switch } from '@nextui-org/react';
import { useFilters } from '@/hooks/useFilters';

// 119 (Adding the filters component)
// 121 (Adding the age slider functionality)
// 124 (Adding the gender filter)
// 125 (Adding a filter store and hook)
// 127 (Adding loading indicators for the filters)
// 135 (Challenge solution)

const Filters = () => {
  // この component で使うロジックの部分を、useFilters() custom hook から取得します。
  // filters は FilterStore から取得しています。
  const { genderList, orderByList, filters, selectAge, selectGender, selectOrder, selectWithPhoto, isPending } = useFilters();

  return (
    <div className={'shadow-md py-2'}>
      {/* 横並びにします。 */}
      <div className={'flex flex-row justify-around items-center'}>
        <div className={'flex gap-2 items-center'}>
          <div className={'text-secondary font-semibold text-xl'}>Results: 10</div>
          {isPending && <Spinner size={'sm'} color={'secondary'} />}
        </div>
        {/* 横並びにします。 */}
        <div className={'flex gap-2 items-center'}>
          <div>Gender:</div>
          {genderList.map(({ value, icon: Icon }) => (
            <Button key={value} size={'sm'} color={filters.gender.includes(value) ? 'secondary' : 'default'} onClick={() => selectGender(value)}>
              <Icon size={24} />
            </Button>
          ))}
        </div>
        {/* <Slider/> が width の1/2を占めるようにします。 */}
        <div className={'flex flex-row items-center gap-2 w-1/2'}>
          {/* NextUIの<Slider/>について: */}
          {/* https://nextui.org/docs/components/slider */}
          <Slider
            aria-label={'Age range slider'}
            label={'Age range'}
            color={'secondary'}
            size={'sm'}
            minValue={18}
            maxValue={100}
            defaultValue={filters.ageRange}
            onChangeEnd={(value) => selectAge(value as number[])}
          />
        </div>

        <div className={'flex flex-col items-center'}>
          <p className={'text-sm'}>With photo</p>
          <Switch color={'secondary'} defaultSelected={true} size={'sm'} onChange={selectWithPhoto} />
        </div>

        {/* <Select/> が width の 1/4を占めるようにします。　*/}
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
            selectedKeys={new Set([filters.orderBy])}
            onSelectionChange={selectOrder}
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
