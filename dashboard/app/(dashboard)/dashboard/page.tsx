import DashboardClient from './DashboardClient';
import { getDummyStats } from '../../../lib/dummy/data';

export default async function DashboardPage() {
  const stats = getDummyStats();

  return <DashboardClient initialStats={stats as import('../../../lib/api/stats.api').DashboardStats} />;
}
