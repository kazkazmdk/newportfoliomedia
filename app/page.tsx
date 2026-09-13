import FolioExperience from "@/components/folio-experience";

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
      <FolioExperience />
    </>
  );
}
