import type { Route } from "./+types/account";

import { Suspense } from "react";
import { Await } from "react-router";

import makeServerClient from "~/core/lib/supa-client.server";

import ChangeEmailForm from "../components/forms/change-email-form";
import DeleteAccountForm from "../components/forms/delete-account-form";
import EditProfileForm from "../components/forms/edit-profile-form";
import { getUserProfile } from "../queries";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Account | ${import.meta.env.VITE_APP_NAME}` }];
};

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();
  const identities = client.auth.getUserIdentities();
  const profile = getUserProfile(client, { userId: user!.id });
  return {
    user,
    identities,
    profile,
  };
}

export default function Account({ loaderData }: Route.ComponentProps) {
  const { user, profile } = loaderData;
  return (
    <div className="flex w-full flex-col items-center gap-10 pt-0 pb-8">
      <Suspense
        fallback={
          <div className="bg-card animate-fast-pulse h-60 w-full max-w-screen-md rounded-xl border shadow-sm" />
        }
      >
        <Await
          resolve={profile}
          errorElement={
            <div className="text-red-500">Could not load profile</div>
          }
        >
          {(profile) => {
            if (!profile) {
              return null;
            }
            return (
              <EditProfileForm
                name={profile.name}
                marketingConsent={profile.marketing_consent}
                avatarUrl={profile.avatar_url}
              />
            );
          }}
        </Await>
      </Suspense>
      <ChangeEmailForm email={user?.email ?? ""} />
      <DeleteAccountForm />
    </div>
  );
}
