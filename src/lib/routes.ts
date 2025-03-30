export const routes = {
  home: '/',
  login: '/login',
  signup: '/signup',
  agent: '/agent',
  history: '/history',
  knowledge: '/knowledge',
  settings: '/settings',
} as const;

export type RouteKey = keyof typeof routes;
export type RoutePath = (typeof routes)[RouteKey];

// Define which routes require authentication
export const protectedRoutes: RoutePath[] = [
  routes.agent,
  routes.history,
  routes.knowledge,
  routes.settings,
];

// Define navigation menu items
export const navigationItems = [
  { path: routes.agent, label: 'Agent', icon: 'Terminal' },
  { path: routes.history, label: 'History', icon: 'History' },
  { path: routes.knowledge, label: 'Knowledge', icon: 'Database' },
  { path: routes.settings, label: 'Settings', icon: 'Settings' },
] as const;
