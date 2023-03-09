import { getProviders, signIn } from "next-auth/react";
import type { Provider } from "next-auth/providers";
import { Magic } from "magic-sdk";

interface SingInProps {
  providers: Provider[];
}

const magic =
  typeof window !== "undefined" &&
  new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || "a");

export default function SignIn({ providers }: SingInProps) {
  const handleClick = async (provider: Provider) => {
    if (provider.name === "Credentials") {
      if (!magic) throw new Error(`magic not defined`);
      const didToken = await magic.auth.loginWithMagicLink({
        email: "dumalo44084@gmail.com",
      });
      await signIn(provider.id, {
        didToken,
        callbackUrl: "/",
      });
    } else {
      await signIn(provider.id, {
        callbackUrl: "/",
      });
    }
  };
  return (
    <div>
      {Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <button onClick={() => void handleClick(provider)}>
            Sign in with {provider.name}{" "}
          </button>
        </div>
      ))}
    </div>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
