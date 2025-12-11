import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="max-w-sm w-full rounded border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <form
          className="space-y-3"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded bg-black px-4 py-2 text-white hover:bg-zinc-800"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
