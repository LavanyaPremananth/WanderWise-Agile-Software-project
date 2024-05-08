import { useNavigation } from "@remix-run/react";
import { useEffect } from "react";
import { trpc } from "~/lib/trpc";

export function useUsername() {
  const trUsername = trpc.session.username.useSWR(undefined, {
    revalidateOnMount: true,
  });

  const navigation = useNavigation();
  const isIdling = navigation.state === "idle";

  useEffect(() => {
    if (isIdling) {
      trUsername.mutate();
    }
  }, [isIdling]);

  return { username: trUsername.data, isLoading: trUsername.isLoading };
}
