import { PrismaClient } from '@prisma/client';
import { auth } from '~/auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// 处理 GET 请求 - 获取当前用户的所有订阅
export async function GET() {
  const session = await auth();
  if (session && session.user) {
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: { userId: session.user.id },
      });
      return NextResponse.json(subscriptions);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// 处理 POST 请求 - 创建新的订阅
export async function POST(req: Request) {
  const session = await auth();
  if (session && session.user && session.user.id) {
    try {
      const { repo, plan } = await req.json();
      const newSubscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          repo,
          plan: plan || 'basic', // 默认计划
          status: 'active',
          startDate: new Date(),
        },
      });
      return NextResponse.json(newSubscription);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// 处理 PUT 请求 - 更新订阅
export async function PUT(req: Request) {
  const session = await auth();
  if (session) {
    try {
      const { id, ...updateData } = await req.json();
      const updatedSubscription = await prisma.subscription.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json(updatedSubscription);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// 处理 DELETE 请求 - 删除订阅
export async function DELETE(req: Request) {
  const session = await auth();
  if (session) {
    try {
      const { id } = await req.json();
      await prisma.subscription.delete({
        where: { id },
      });
      return NextResponse.json({ message: 'Subscription deleted' });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
