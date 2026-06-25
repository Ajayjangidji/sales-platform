import React from "react";

export type IconName =
  | "box"
  | "users"
  | "truck"
  | "receipt"
  | "clock"
  | "progress"
  | "checkCircle"
  | "trendingUp"
  | "cash"
  | "online"
  | "qr"
  | "chart"
  | "user"
  | "shield"
  | "store"
  | "eye"
  | "edit"
  | "power"
  | "trash"
  | "refresh"
  | "plus"
  | "search"
  | "phone"
  | "pin"
  | "map"
  | "camera"
  | "bell"
  | "inbox"
  | "x"
  | "check"
  | "key"
  | "clipboard"
  | "calendar"
  | "cart";

export function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
  switch (name) {
    case "box":
      return (
        <svg {...p}>
          <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" />
          <path d="M3 8l9 5 9-5M12 13v8" />
        </svg>
      );
    case "users":
      return (
        <svg {...p}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 19c0-3 2.6-4.6 5.5-4.6s5.5 1.6 5.5 4.6" />
          <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 14.6c2 .5 3.5 1.9 3.5 4.4" />
        </svg>
      );
    case "truck":
      return (
        <svg {...p}>
          <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
          <circle cx="7" cy="18" r="1.6" />
          <circle cx="17.5" cy="18" r="1.6" />
        </svg>
      );
    case "receipt":
      return (
        <svg {...p}>
          <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" />
          <path d="M9 8h6M9 12h6" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...p}>
          <rect x="6" y="4" width="12" height="17" rx="2" />
          <path d="M9 4a3 3 0 0 1 6 0M9 11h6M9 15h4" />
        </svg>
      );
    case "clock":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...p}>
          <rect x="3.5" y="5" width="17" height="16" rx="2" />
          <path d="M3.5 9h17M8 3v4M16 3v4" />
        </svg>
      );
    case "progress":
      return (
        <svg {...p}>
          <path d="M12 3a9 9 0 1 0 9 9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "checkCircle":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12l2.5 2.5L16 9" />
        </svg>
      );
    case "check":
      return (
        <svg {...p}>
          <path d="M5 12l5 5L19 7" />
        </svg>
      );
    case "trendingUp":
      return (
        <svg {...p}>
          <path d="M3 17l6-6 4 4 7-7M14 8h6v6" />
        </svg>
      );
    case "cash":
      return (
        <svg {...p}>
          <rect x="2.5" y="6" width="19" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 9.5v.01M18 14.5v.01" />
        </svg>
      );
    case "online":
      return (
        <svg {...p}>
          <rect x="7" y="3" width="10" height="18" rx="2.5" />
          <path d="M11 18h2" />
        </svg>
      );
    case "qr":
      return (
        <svg {...p}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
          <path d="M14 14h2v2M20 14v.01M14 20h6v-3" />
        </svg>
      );
    case "chart":
      return (
        <svg {...p}>
          <path d="M4 20V4M4 20h16" />
          <path d="M8 16v-4M12 16V8M16 16v-6" />
        </svg>
      );
    case "user":
      return (
        <svg {...p}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      );
    case "shield":
      return (
        <svg {...p}>
          <path d="M12 3l8 3v6c0 4-3.5 7-8 9-4.5-2-8-5-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "store":
      return (
        <svg {...p}>
          <path d="M4 9l1-5h14l1 5M4 9v11h16V9M4 9h16M9 20v-5h6v5" />
        </svg>
      );
    case "eye":
      return (
        <svg {...p}>
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "edit":
      return (
        <svg {...p}>
          <path d="M4 20h4l10-10-4-4L4 16v4z" />
          <path d="M13.5 6.5l4 4" />
        </svg>
      );
    case "power":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M5.6 5.6l12.8 12.8" />
        </svg>
      );
    case "trash":
      return (
        <svg {...p}>
          <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...p}>
          <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4" />
        </svg>
      );
    case "plus":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case "search":
      return (
        <svg {...p}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      );
    case "phone":
      return (
        <svg {...p}>
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </svg>
      );
    case "pin":
      return (
        <svg {...p}>
          <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "map":
      return (
        <svg {...p}>
          <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />
        </svg>
      );
    case "camera":
      return (
        <svg {...p}>
          <path d="M3 8h3l2-2.5h8L18 8h3v12H3V8z" />
          <circle cx="12" cy="13.5" r="3.5" />
        </svg>
      );
    case "bell":
      return (
        <svg {...p}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      );
    case "inbox":
      return (
        <svg {...p}>
          <path d="M3 13l3-8h12l3 8M3 13v6h18v-6M3 13h5l1.5 3h5L16 13h5" />
        </svg>
      );
    case "cart":
      return (
        <svg {...p}>
          <path d="M3 4h2l2.4 12h10l2-8H6" />
          <circle cx="9" cy="19" r="1.6" />
          <circle cx="17" cy="19" r="1.6" />
        </svg>
      );
    case "key":
      return (
        <svg {...p}>
          <circle cx="8" cy="8" r="4" />
          <path d="M11 11l8 8M16 16l2-2M18 18l2-2" />
        </svg>
      );
    case "x":
      return (
        <svg {...p}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
  }
}
