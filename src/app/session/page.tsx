import { auth } from '@/auth';
import ClientSession from '@/components/ClientSession';

// 160. Getting the session info in the client
// 170. Updating the home page
export default async function SessionPage() {
  // 32 (Getting the session data)
  const session = await auth();

  return (
    <div className={'flex flex-row justify-around mt-20 gap-6'}>
      <div className={'bg-green-50 p-10 rounded-xl shadow-md w-1/2 overflow-auto'}>
        <h3 className={'text-2xl font-semibold'}>Server session data</h3>
        {session ? (
          <div>
            {/* session data を取得して表示します。 */}
            <pre>{JSON.stringify(session, null, 2)}</pre>
          </div>
        ) : (
          <>Not signed in </>
        )}
      </div>
      <ClientSession />
    </div>
  );
}
