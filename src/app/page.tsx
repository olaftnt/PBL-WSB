export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-sm flex-col items-center gap-6 rounded-xl bg-white p-10 shadow-lg dark:bg-neutral-900">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Login Panel
        </h1>

        <form className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-black dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-black dark:border-zinc-700 dark:bg-neutral-800 dark:text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-black dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-black dark:border-zinc-700 dark:bg-neutral-800 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-full bg-black py-2 text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No account?{" "}
          <a href="#" className="text-black underline dark:text-white">
            Create one
          </a>
        </p>
      </main>
    </div>
  );
}
