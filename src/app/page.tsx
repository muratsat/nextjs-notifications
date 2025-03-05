import {
  InstallPrompt,
  PushNotificationManager,
} from "@/app/_components/notifications";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-6">
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>
          </div>

          <PushNotificationManager />
          <InstallPrompt />
        </div>
      </main>
    </HydrateClient>
  );
}
