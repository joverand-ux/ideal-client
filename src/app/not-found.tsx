import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20">
      <h1 className="text-5xl font-bold text-white mb-2">404</h1>
      <p className="text-gray-400 mb-6">Page not found.</p>
      <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
        Back to Dashboard
      </Link>
    </div>
  );
}
