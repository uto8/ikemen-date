import Link from 'next/link'

type Props = {
  backHref?: string
}

export default function AuthHeader({ backHref }: Props) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div
        className={`mx-auto flex h-14 max-w-md items-center px-4 ${backHref ? 'gap-3' : 'justify-center'}`}
      >
        {backHref && (
          <Link href={backHref} className="text-gray-500 transition-colors hover:text-gray-900">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </Link>
        )}
        <span className="text-lg font-bold text-primary-500">イケメンデート</span>
      </div>
    </header>
  )
}
