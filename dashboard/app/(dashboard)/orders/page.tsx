import OrdersClient from './OrdersClient';
import { getDummyOrders } from '../../../lib/dummy/data';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const status = searchParams.status;
  const ordersData = getDummyOrders({ page, limit: 20, status });

  return (
    <OrdersClient
      initialOrders={ordersData.orders as import('../../../lib/api/orders.api').Order[]}
      initialPagination={ordersData.pagination}
      initialStatus={status || ''}
    />
  );
}
