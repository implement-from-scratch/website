import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="inline-block px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-black rounded hover:opacity-80 transition-opacity"
      >
        Go back home
      </Link>
    </div>
  );
}
