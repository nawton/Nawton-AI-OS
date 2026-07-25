export type NavItem = {
  href: string;
  label: string;
  icon: string; // keyword resolved to an inline SVG in NavIcon
  comingSoon?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Översikt", icon: "home" },
  { href: "/chat", label: "AI Chat", icon: "chat" },
  { href: "/crm", label: "CRM", icon: "users" },
  { href: "/email", label: "E-post", icon: "mail" },
  { href: "/projects", label: "Projekt", icon: "folder" },
  { href: "/tasks", label: "Uppgifter", icon: "check" },
];

export const NAV_ITEMS_SECONDARY: NavItem[] = [
  { href: "/finance", label: "Ekonomi", icon: "chart", comingSoon: true },
  { href: "/knowledge", label: "Kunskapsbank", icon: "book", comingSoon: true },
  { href: "/dev", label: "Utveckling", icon: "code", comingSoon: true },
  { href: "/workflows", label: "Automation", icon: "bolt", comingSoon: true },
];
