import { signOut } from '~/auth';
import { Button } from 'flowbite-react';

export default function LogoutButton() {
  return (
    <form
      action={async () => {
        'use server';
        await signOut();
      }}
    >
      <Button gradientDuoTone="cyanToBlue" type="submit">
        Sign Out
      </Button>
    </form>
  );
}
