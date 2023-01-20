import { useScrollRestoration } from "./use-scroll-restoration";

type AppShellProps = {
  content: React.ReactNode;
  topBar?: React.ReactNode;
  bottomBar?: React.ReactNode;
};

export const AppShell = ({ content, topBar, bottomBar }: AppShellProps) => {
  useScrollRestoration();

  return (
    <>
      <style jsx global>{`
    html, body, #__next {
      width: 100%; height: 100%;
    }`}
      </style>
      <div className={`AppShell w-full h-full grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto]`}>
        <header className="AppShell__topBar">{topBar}</header>
        <main className="AppShell__content h-full overflow-auto">{content}</main>
        <div className="AppShell__bottomBar">{bottomBar}</div>
      </div>
    </>
  );
};
