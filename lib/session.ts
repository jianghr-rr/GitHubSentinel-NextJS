import 'server-only'; // 标记只在服务端使用（客户端组件引入会报错）
import { cache } from 'react';
import { auth } from '~/auth';

async function getUserInfoFn() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return session.user; // 格式如 { id, name, email, image }
}

export const getUserInfo = cache(getUserInfoFn);
 