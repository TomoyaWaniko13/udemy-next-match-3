'use client';

import { useSession } from 'next-auth/react';

// 160. Getting the session info in the client
const ClientSession = () => {
  const session = useSession();

  return (
    <div className={'bg-blue-50 p-10 rounded-xl shadow-md w-1/2 overflow-auto'}>
      <h3 className={'text-2xl font-semibold'}>User session data</h3>
      {session ? (
        <div>
          {/* session data を取得して表示します。 */}
          <pre>{JSON.stringify(session, null, 2)}</pre>
        </div>
      ) : (
        <>Not signed in </>
      )}
    </div>
  );
};

export default ClientSession;
