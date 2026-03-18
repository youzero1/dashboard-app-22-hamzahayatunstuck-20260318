import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { seedDatabase } from '@/lib/seed';
import { Order } from '@/entities/Order';

async function getInitializedDataSource() {
  const ds = await getDataSource();
  await seedDatabase(ds);
  return ds;
}

export async function GET(request: NextRequest) {
  try {
    const ds = await getInitializedDataSource();
    const orderRepo = ds.getRepository(Order);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'DESC') as 'ASC' | 'DESC';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    const queryBuilder = orderRepo.createQueryBuilder('order');

    if (search) {
      queryBuilder.where('order.customerName LIKE :search', { search: `%${search}%` });
    }

    if (status) {
      const condition = search ? 'AND' : 'WHERE';
      if (search) {
        queryBuilder.andWhere('order.status = :status', { status });
      } else {
        queryBuilder.where('order.status = :status', { status });
      }
    }

    const validSortFields = ['id', 'customerName', 'amount', 'status', 'createdAt'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    queryBuilder
      .orderBy(`order.${safeSortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return NextResponse.json({
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ds = await getInitializedDataSource();
    const orderRepo = ds.getRepository(Order);

    const body = await request.json();
    const { customerName, amount, status } = body;

    if (!customerName || amount === undefined) {
      return NextResponse.json({ error: 'Customer name and amount are required' }, { status: 400 });
    }

    const order = new Order();
    order.customerName = customerName;
    order.amount = amount;
    order.status = status || 'pending';

    const saved = await orderRepo.save(order);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
