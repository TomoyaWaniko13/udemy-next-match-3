import { verifyEmail } from '@/app/actions/authActions';
import CardWrapper from '@/components/CardWrapper';
import { MdOutlineMailOutline, MdOutlineViewModule } from 'react-icons/md';
import { Spinner } from '@nextui-org/react';
import ResultMessage from '@/components/ResultMessage';

// 145. Adding the verify email function
// メールのリンクをクリックすると、このページに移動します。
// mail.ts において、リンクの URL で query string として token の文字列を設定するようになっています。
// その query string を引数として受け取り、verifyEmail() に渡します。
const VerifyEmailPage = async ({ searchParams }: { searchParams: { token: string } }) => {
  const result = await verifyEmail(searchParams.token);

  return (
    <CardWrapper
      headerText={'Verifying your email address'}
      headerIcon={MdOutlineMailOutline}
      body={
        <div className={'flex flex-col space-y-4 items-center'}>
          <div className={'flex flex-row items-center'}>
            <p>Verifying your email address. Please wait...</p>
            {!result && <Spinner color={'secondary'} />}
          </div>
        </div>
      }
      footer={<ResultMessage result={result} />}
    />
  );
};

export default VerifyEmailPage;
