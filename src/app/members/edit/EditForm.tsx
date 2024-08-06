import { Member } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MemberEditSchema, memberEditSchema } from '@/lib/schemas/memberEditSchema';

type Props = {
  member: Member;
};

// 63 (Adding the edit member form)
const EditForm = ({ member }: Props) => {
  // We're going to use the reset function because when we effectively load the members details,
  // we'll need to reset the fields to what we get from this member.
  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, isDirty, isSubmitting },
  } = useForm<MemberEditSchema>({ resolver: zodResolver(memberEditSchema) });

  return <>Edit form</>;
};

export default EditForm;
