import { getAuthUserId } from '@/app/actions/authActions';
import { getMemberByUserId } from '@/app/actions/memberActions';
import { notFound } from 'next/navigation';
import { CardBody, CardHeader, Divider } from '@nextui-org/react';
import EditForm from '@/app/members/edit/EditForm';

// 62 (Adding the edit member route)
// 63 (Adding the edit member form)
const MemberEditPage = async () => {
  const userId = await getAuthUserId();
  const member = await getMemberByUserId(userId);
  if (!member) return notFound();

  return (
    <>
      <CardHeader className={'text-2xl font-semibold text-secondary'}>Edit Profile</CardHeader>
      <Divider />
      <CardBody>
        <EditForm member={member} />
      </CardBody>
    </>
  );
};

export default MemberEditPage;
