import { signIn } from '~/auth';
import { Button } from 'flowbite-react';

export default function LoginButton() {
  return (
    <form
      action={async () => {
        'use server';
        await signIn();
      }}
    >
      <Button gradientDuoTone="cyanToBlue" type="submit">
        Login
      </Button>
    </form>
  );
}
