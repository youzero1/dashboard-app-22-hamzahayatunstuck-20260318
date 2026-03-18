import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { seedDatabase } from '@/lib/seed';
import { User } from '@/entities/User';

async function getInitializedDataSource() {
  const ds = await getDataSource();
  await seedDatabase(ds);
  return ds;
}

export async function GET(request: NextRequest) {
  try {
    const ds = await getInitializedDataSource();
    const userRepo = ds.getRepository(User);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'DESC') as 'ASC' | 'DESC';

    const skip = (page - 1) * limit;

    const queryBuilder = userRepo.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        'user.name LIKE :search OR user.email LIKE :search',
        { search: `%${search}%` }
      );
    }

    const validSortFields = ['id', 'name', 'email', 'role', 'status', 'createdAt'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    queryBuilder
      .orderBy(`user.${safeSortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return NextResponse.json({
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ds = await getInitializedDataSource();
    const userRepo = ds.getRepository(User);

    const body = await request.json();
    const { name, email, role, status } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const user = new User();
    user.name = name;
    user.email = email;
    user.role = role || 'user';
    user.status = status || 'active';

    const saved = await userRepo.save(user);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
