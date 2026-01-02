import { getRepositoriesWithDocs } from '@/lib/github';
import HomePageClient from './page-client';

export const revalidate = 3600;

export default async function HomePage() {
  const repos = await getRepositoriesWithDocs();
  return <HomePageClient repos={repos} />;
}
