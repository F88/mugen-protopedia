'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function ClientRedirect({ destination }: { destination: string }) {
  const router = useRouter();

  useEffect(() => {
    // router.replace(destination);
    router.push(destination);
  }, [destination, router]);

  // return (
  //   <div className="flex min-h-screen items-center justify-center bg-black text-white">
  //     <p>Redirecting to playlist...</p>
  //   </div>
  // );

  return null;
}
