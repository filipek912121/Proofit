/** Re-mounts on every navigation, so each page fades in smoothly. */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
