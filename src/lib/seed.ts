import { DataSource } from 'typeorm';
import { User } from '@/entities/User';
import { Order } from '@/entities/Order';

const firstNames = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve',
  'Frank', 'Grace', 'Henry', 'Iris', 'Jack',
  'Karen', 'Liam', 'Mia', 'Noah', 'Olivia',
  'Peter', 'Quinn', 'Rachel', 'Sam', 'Tara',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Jones', 'Brown',
  'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
  'Anderson', 'Thomas', 'Jackson', 'White', 'Harris',
  'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson',
];

const roles: ('admin' | 'user')[] = ['admin', 'user', 'user', 'user', 'user'];
const statuses: ('active' | 'inactive')[] = ['active', 'active', 'active', 'inactive'];
const orderStatuses: ('pending' | 'completed' | 'cancelled')[] = ['pending', 'completed', 'cancelled'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export async function seedDatabase(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const orderRepo = dataSource.getRepository(Order);

  const existingUsers = await userRepo.count();
  if (existingUsers > 0) {
    return;
  }

  const startDate = new Date('2023-01-01');
  const endDate = new Date();

  const users: User[] = [];
  for (let i = 0; i < 20; i++) {
    const firstName = firstNames[i];
    const lastName = randomFrom(lastNames);
    const user = new User();
    user.name = `${firstName} ${lastName}`;
    user.email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    user.role = i === 0 ? 'admin' : randomFrom(roles);
    user.status = randomFrom(statuses);
    user.createdAt = randomDate(startDate, endDate);
    users.push(user);
  }

  await userRepo.save(users);

  const allUsers = await userRepo.find();
  const orders: Order[] = [];

  for (let i = 0; i < 30; i++) {
    const user = randomFrom(allUsers);
    const order = new Order();
    order.customerName = user.name;
    order.amount = parseFloat((Math.random() * 2000 + 50).toFixed(2));
    order.status = randomFrom(orderStatuses);
    order.createdAt = randomDate(startDate, endDate);
    orders.push(order);
  }

  await orderRepo.save(orders);
}
