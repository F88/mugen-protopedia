import { ClientRedirect } from './client-redirect';

type Props = {
  params: Promise<{
    title: string;
    ids: string;
  }>;
};

export default async function PlaylistRedirectPage({ params }: Props) {
  const { title, ids } = await params;

  const searchParams = new URLSearchParams();
  // params are already decoded by Next.js, so we use them as is.
  // URLSearchParams will handle encoding for the query string.
  searchParams.set('title', decodeURIComponent(title));
  searchParams.set('id', decodeURIComponent(ids));

  const destination = `/?${searchParams.toString()}`;

  // return <>{destination}</>;
  return <ClientRedirect destination={destination} />;
}
