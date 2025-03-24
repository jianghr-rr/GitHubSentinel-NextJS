import LoginButton from '~/components/login-button';
import LogoutButton from '~/components/logout-button';
import { getUserInfo } from '~/lib/session';
import Link from 'next/link';
import { Button } from 'flowbite-react';

export default async function Home() {
  const user = await getUserInfo();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8 sm:p-20">
      <h1 className="text-4xl font-bold mb-8">
        欢迎 {user ? user.name : '登录github体验'}
      </h1>
      <Link href="/subscriptions">
          <Button gradientDuoTone="purpleToPink">
            前往订阅仓库
          </Button>
      </Link>
      <div className="absolute top-4 right-4">
        {user?.name ? <LogoutButton /> : <LoginButton />}
      </div>
    </div>
  );
}
