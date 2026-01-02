import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] mt-auto">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            Copyright {currentYear} implement-from-scratch
          </div>
          <div>
            <Link
              href="https://github.com/implement-from-scratch"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
