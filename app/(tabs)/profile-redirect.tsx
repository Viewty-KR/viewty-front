import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth/profile");
  }, [router]);

  return null;
}
