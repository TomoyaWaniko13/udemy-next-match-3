'use client';

import { FaFemale, FaMale } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { Button, Select, SelectItem, Slider } from '@nextui-org/react';

// 119 (Adding the filters component)
const Filters = () => {
  const pathname = usePathname();

  const orderByList = [
    { label: 'Last active', value: 'updated' },
    { label: 'Newest members', value: 'created' },
  ];

  const genders = [
    { value: 'male', icon: FaMale },
    { value: 'female', icon: FaFemale },
  ];

  if (pathname !== '/members') return null;

  return (
    <div className={'shadow-md py-2'}>
      <div className={'flex flex-row justify-around items-center'}>
        <div className={'text-secondary font-semibold text-xl'}>Results: 10</div>
        <div className={'flex gap-2 items-center'}>
          <div>Gender: </div>
          {genders.map(({ icon: Icon, value }) => (
            <Button key={value} size={'sm'} color={'secondary'}>
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
          />
        </div>
        <div className={'w-1/4'}>
          <Select
            size={'sm'}
            fullWidth={true}
            placeholder={'Order by'}
            variant={'bordered'}
            color={'secondary'}
            aria-label={'Order by selector'}
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
