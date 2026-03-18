import { NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { seedDatabase } from '@/lib/seed';
import { User } from '@/entities/User';
import { Order } from '@/entities/Order';

export async function GET() {
  try {
    const ds = await getDataSource();
    await seedDatabase(ds);

    const userRepo = ds.getRepository(User);
    const orderRepo = ds.getRepository(Order);

    const totalUsers = await userRepo.count();
    const activeUsers = await userRepo.count({ where: { status: 'active' } });

    // New signups in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allUsers = await userRepo.find();
    const newSignups = allUsers.filter(
      (u) => new Date(u.createdAt) >= thirtyDaysAgo
    ).length;

    const allOrders = await orderRepo.find();
    const totalRevenue = allOrders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + Number(o.amount), 0);

    const activeSessions = Math.floor(activeUsers * 0.3) + Math.floor(Math.random() * 20);

    // Monthly revenue for last 12 months
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthNum = date.getMonth();

      const revenue = allOrders
        .filter((o) => {
          const orderDate = new Date(o.createdAt);
          return (
            orderDate.getMonth() === monthNum &&
            orderDate.getFullYear() === year &&
            o.status === 'completed'
          );
        })
        .reduce((sum, o) => sum + Number(o.amount), 0);

      monthlyRevenue.push({ month: monthName, revenue: parseFloat(revenue.toFixed(2)) });
    }

    // User growth for last 12 months
    const userGrowth: { month: string; users: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthNum = date.getMonth();

      const count = allUsers.filter((u) => {
        const userDate = new Date(u.createdAt);
        return userDate.getMonth() === monthNum && userDate.getFullYear() === year;
      }).length;

      userGrowth.push({ month: monthName, users: count });
    }

    // Traffic sources (simulated)
    const trafficSources = [
      { name: 'Organic Search', value: 35 },
      { name: 'Direct', value: 25 },
      { name: 'Social Media', value: 20 },
      { name: 'Referral', value: 15 },
      { name: 'Email', value: 5 },
    ];

    return NextResponse.json({
      totalUsers,
      activeUsers,
      newSignups,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      activeSessions,
      monthlyRevenue,
      userGrowth,
      trafficSources,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
