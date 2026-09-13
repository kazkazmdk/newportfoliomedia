import dynamic from "next/dynamic";

const FolioCanvas = dynamic(() => import("@/components/folio-canvas"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

function LoadingSpinner() {
  return (
    <div className="flex h-96 w-full flex-col items-center justify-center">
      <svg
        className="-ml-1 mr-3 h-5 w-5 animate-spin text-black"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <div className="pointer-events-none fixed top-0 left-0 z-50 flex h-screen w-full flex-col items-center">
        <h1 className="mt-8 font-bold uppercase">Under Construction</h1>
        <p>
          Check my{" "}
          <a
            href="https://github.com/Lissandre"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto underline underline-offset-4"
          >
            Github
          </a>{" "}
          or{" "}
          <a
            href="https://www.linkedin.com/in/lissandrepasdeloup/"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto underline underline-offset-4"
          >
            LinkedIn
          </a>{" "}
          instead.
        </p>
      </div>
      <FolioCanvas />
    </>
  );
}
