import { UserIcon } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { CurrentUserDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";

export async function UserMenuContainer() {
  try {
    const { me: user } = await executeGraphQL(CurrentUserDocument, {
      cache: "no-cache",
    });

    if (user) {
      return <UserMenu user={user} />;
    }
  } catch (error) {
    console.error("UserMenuContainer error:", error);
    // Optional: Log error to Sentry or other monitoring here
  }

  // Fallback UI when unauthenticated or on error
  return (
    <LinkWithChannel
      href="/login"
      className="flex items-center justify-center rounded-md p-2"
    >
      <UserIcon className="h-6 w-6" aria-hidden="true" />
      <span className="sr-only">Log in</span>
    </LinkWithChannel>
  );
}