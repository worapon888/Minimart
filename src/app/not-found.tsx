import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-6">
        {/* 404 */}
        <h1 className="text-7xl sm:text-8xl font-semibold text-black/20 tracking-widest">
          404
        </h1>

        {/* Text */}
        <div className="space-y-2">
          <p className="text-lg sm:text-xl font-medium text-black/80">
            Page not found
          </p>
          <p className="text-sm text-black/50">
            The page you’re looking for doesn’t exist.
          </p>
        </div>

        {/* Button */}
        <Link
          href="/"
          className="
            inline-block rounded-full
            border border-black/15
            px-6 py-2 text-sm
            text-black/70
            hover:bg-black/5 hover:border-black/30
            transition
          "
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
