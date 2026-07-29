const PATHS: Record<string, string> = {
  home: "M4 11.5 12 4l8 7.5M6 9.5V20h12V9.5",
  chat: "M4 5h16v10H8l-4 4V5Z",
  users: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20c0-3 2.5-5 6-5s6 2 6 5M14 20c0-2.5 2-4.5 5-4.5s5 2 5 4.5",
  mail: "M4 6h16v12H4V6Zm0 0 8 7 8-7",
  folder: "M4 7h5l2 2h9v10H4V7Z",
  check: "m5 12 4 4 10-10",
  chart: "M5 20V10m7 10V4m7 16v-7",
  book: "M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z",
  code: "m9 6-6 6 6 6m6-12 6 6-6 6",
  bolt: "M13 3 5 14h6l-1 7 8-11h-6l1-7Z",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6m-6 4h6m-6 4h4",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2",
  arrowUp: "M12 19V5m0 0-6 6m6-6 6 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6 6 18",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm9 2-5.5-5.5",
};

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const d = PATHS[name] ?? PATHS.home;
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
