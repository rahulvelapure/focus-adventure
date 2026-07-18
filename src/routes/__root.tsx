import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Home, BookOpen, Settings as SettingsIcon, Gamepad2, Flame } from "lucide-react";
import { useSettings } from "@/lib/settings";
import { registerPwa } from "@/lib/pwa";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "FoxFocus — ADHD games & calm tools for kids" },
      { name: "description", content: "A friendly focus app for kids ages 6–13 with ADHD. Play short brain games, calm down, and build focus skills." },
      { name: "theme-color", content: "#F0784A" },
      { property: "og:title", content: "FoxFocus — ADHD games & calm tools for kids" },
      { property: "og:description", content: "Short brain games and calm-down tools that help kids with ADHD practice focus, memory, and self-control." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@500;700;800&display=swap" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-512.png" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // Applies data-theme + .dark on <html>
  useSettings();

  useEffect(() => {
    registerPwa();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-dvh flex flex-col pb-24">
        <main className="flex-1">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </QueryClientProvider>
  );
}

function BottomNav() {
  const items = [
    { to: "/", label: "Home", Icon: Home },
    { to: "/games", label: "Games", Icon: Gamepad2 },
    { to: "/quests", label: "Quests", Icon: Flame },
    { to: "/learn", label: "Learn", Icon: BookOpen },
    { to: "/settings", label: "Settings", Icon: SettingsIcon },
  ] as const;
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-between px-1 py-1">
        {items.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-semibold text-muted-foreground min-h-11"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="size-5" aria-hidden />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
