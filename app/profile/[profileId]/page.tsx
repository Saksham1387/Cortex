import { Favorites } from "@/Components/profile/Favrouties";
import { SimpleProfileHeader } from "@/components/profile/SimpleProfileHeader";

import { Input } from "@/components/ui/input";
import { getUser } from "@/lib/db";

export default async function ProfileId({
  params,
}: {
  params: { profileId: string };
}) {
  const user = await getUser(params.profileId);

  return (
    <div className="container mx-auto max-w-6xl px-4 pt-28">
      <SimpleProfileHeader initialUser={user} />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 px-5">
          <Input
            type="text"
            placeholder="Search favorites..."
            className="w-full rounded-full"
          />
        </div>
      </div>
      <Favorites userEmail={user.email} />
    </div>
  );
}
