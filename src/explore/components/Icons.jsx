import React from "react";
import * as Lucide from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

// HOC/Wrapper to dynamically switch between Lucide icons and custom pixel SVGs for the Frodo theme
function createThemedIcon(LucideIcon, PixelSvgFunc) {
  const ThemedIcon = React.forwardRef(({ size = 24, color = "currentColor", ...props }, ref) => {
    let themeName = "standard";
    try {
      const themeContext = useTheme();
      if (themeContext && themeContext.theme) {
        themeName = themeContext.theme;
      }
    } catch (e) {
      // Fail-safe if rendered outside ThemeProvider (e.g. in tests)
    }

    if (themeName === "frodo") {
      return (
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="square"
          strokeLinejoin="miter"
          style={{
            shapeRendering: "crispEdges",
            imageRendering: "pixelated",
            display: "inline-block",
            verticalAlign: "middle",
            ...props.style
          }}
          {...props}
        >
          {PixelSvgFunc(color)}
        </svg>
      );
    }

    return <LucideIcon ref={ref} size={size} color={color} {...props} />;
  });

  ThemedIcon.displayName = LucideIcon.displayName || LucideIcon.name;
  return ThemedIcon;
}

export const MessageSquareText = createThemedIcon(
  Lucide.MessageSquareText,
  () => <path d="M 1,2 H 14 V 11 H 5 L 2,14 V 11 H 1 Z M 4,5 H 11 M 4,8 H 8" />
);

export const BarChart2 = createThemedIcon(
  Lucide.BarChart2,
  () => <path d="M 1,14 H 14 M 3,14 V 8 H 5 V 14 M 7,14 V 3 H 9 V 14 M 11,14 V 6 H 13 V 14" />
);

export const CheckCircle2 = createThemedIcon(
  Lucide.CheckCircle2,
  () => <path d="M 5,2 H 11 M 12,3 V 5 H 14 V 11 H 12 V 13 M 11,14 H 5 M 4,13 V 11 H 2 V 5 H 4 V 3 Z M 5,8 L 7,10 L 11,5" />
);

export const ListChecks = createThemedIcon(
  Lucide.ListChecks,
  () => <path d="M 1,4 L 3,6 L 6,2 M 8,3 H 14 M 1,10 L 3,12 L 6,8 M 8,10 H 14" />
);

export const Activity = createThemedIcon(
  Lucide.Activity,
  () => <path d="M 1,8 H 3 L 5,2 L 7,14 L 9,7 L 11,10 H 15" />
);

export const Users = createThemedIcon(
  Lucide.Users,
  () => <path d="M 3,2 H 7 V 6 H 3 Z M 1,13 V 9 H 9 V 13 M 9,4 H 12 V 7 H 9 Z M 7,13 V 10 H 14 V 13" />
);

export const FileText = createThemedIcon(
  Lucide.FileText,
  () => <path d="M 2,1 H 10 L 14,5 V 15 H 2 Z M 10,1 V 5 H 14 M 5,8 H 11 M 5,11 H 11" />
);

export const Compass = createThemedIcon(
  Lucide.Compass,
  () => <path d="M 5,2 H 11 M 12,3 V 5 H 14 V 11 H 12 V 13 M 11,14 H 5 M 4,13 V 11 H 2 V 5 H 4 V 3 Z M 5,11 L 11,5" />
);

export const AlertCircle = createThemedIcon(
  Lucide.AlertCircle,
  () => <path d="M 5,2 H 11 M 12,3 V 5 H 14 V 11 H 12 V 13 M 11,14 H 5 M 4,13 V 11 H 2 V 5 H 4 V 3 Z M 8,5 V 9 M 8,12 H 8.01" />
);

export const ArrowRight = createThemedIcon(
  Lucide.ArrowRight,
  () => <path d="M 1,8 H 14 M 9,3 L 14,8 L 9,13" />
);

export const Sparkles = createThemedIcon(
  Lucide.Sparkles,
  () => <path d="M 5,1 V 7 M 2,4 H 8 M 12,8 V 14 M 9,11 H 15" />
);

export const Filter = createThemedIcon(
  Lucide.Filter,
  () => <path d="M 1,2 H 15 L 9,8 V 13 L 7,15 V 8 Z" />
);

export const ChevronRight = createThemedIcon(
  Lucide.ChevronRight,
  () => <path d="M 6,3 L 11,8 L 6,13" />
);

export const Menu = createThemedIcon(
  Lucide.Menu,
  () => <path d="M 2,4 H 14 M 2,8 H 14 M 2,12 H 14" />
);

export const Settings = createThemedIcon(
  Lucide.Settings,
  () => <path d="M 5,5 H 11 V 11 H 5 Z M 8,1 V 3 M 8,13 V 15 M 1,8 H 3 M 13,8 H 15 M 3,3 L 5,5 M 11,5 L 13,3 M 3,13 L 5,11 M 11,11 L 13,13" />
);

// New icons added for exhibits to replace emojis
export const Scale = createThemedIcon(
  Lucide.Scale,
  () => <path d="M 8,2 V 14 M 4,14 H 12 M 4,4 H 12 M 2,6 H 6 M 4,6 V 9 M 2,9 H 6 M 10,6 H 14 M 12,6 V 9 M 10,9 H 14" />
);

export const RefreshCw = createThemedIcon(
  Lucide.RefreshCw,
  () => <path d="M 1,4 A 6,6 0 1,1 8,14 A 6,6 0 0,1 2,10 M 1,1 V 4 H 4" />
);

export const Heart = createThemedIcon(
  Lucide.Heart,
  () => <path d="M 3,2 H 5 M 10,2 H 12 M 2,3 H 2 M 6,3 H 10 M 13,3 H 13 M 1,4 V 7 L 8,14 L 15,7 V 4" />
);

export const Grid = createThemedIcon(
  Lucide.Grid,
  () => <path d="M 2,2 H 14 V 14 H 2 Z M 8,2 V 14 M 2,8 H 14" />
);

export const Clock = createThemedIcon(
  Lucide.Clock,
  () => <path d="M 5,2 H 11 M 12,3 V 5 H 14 V 11 H 12 V 13 M 11,14 H 5 M 4,13 V 11 H 2 V 5 H 4 V 3 Z M 8,4 V 8 H 11" />
);

export const Eye = createThemedIcon(
  Lucide.Eye,
  () => <path d="M 1,8 L 4,4 H 11 L 14,8 L 11,11 H 4 Z M 6,8 H 9 M 7,7 H 8 M 7,9 H 8" />
);

export const BookOpen = createThemedIcon(
  Lucide.BookOpen,
  () => <path d="M 8,2 V 14 M 2,3 H 7 V 12 H 2 Z M 9,3 H 14 V 12 H 9 Z M 2,13 H 14" />
);

export const AlertTriangle = createThemedIcon(
  Lucide.AlertTriangle,
  () => <path d="M 8,2 L 14,13 H 2 Z M 8,5 V 9 M 8,11 H 8.01" />
);

export const Shield = createThemedIcon(
  Lucide.Shield,
  () => <path d="M 2,3 L 8,1 L 14,3 V 8 C 14,12 8,15 8,15 C 8,15 2,12 2,8 Z" />
);

export const Smile = createThemedIcon(
  Lucide.Smile,
  () => <path d="M 5,2 H 11 M 12,3 V 5 H 14 V 11 H 12 V 13 M 11,14 H 5 M 4,13 V 11 H 2 V 5 H 4 V 3 Z M 5,6 H 5.01 M 11,6 H 11.01 M 5,10 C 6,11 10,11 11,10" />
);

export const Droplets = createThemedIcon(
  Lucide.Droplets,
  () => <path d="M 8,2 C 8,2 3,7 3,11 C 3,13 5,15 8,15 C 11,15 13,13 13,11 C 13,7 8,2 8,2 Z" />
);

export const Globe = createThemedIcon(
  Lucide.Globe,
  () => <path d="M 5,2 H 11 M 12,3 V 5 H 14 V 11 H 12 V 13 M 11,14 H 5 M 4,13 V 11 H 2 V 5 H 4 V 3 Z M 2,8 H 14 M 8,2 V 14" />
);

export const Zap = createThemedIcon(
  Lucide.Zap,
  () => <path d="M 9,1 L 4,8 H 8 L 7,15 L 12,8 H 8 Z" />
);

export const Info = createThemedIcon(
  Lucide.Info,
  () => <path d="M 5,2 H 11 M 12,3 V 5 H 14 V 11 H 12 V 13 M 11,14 H 5 M 4,13 V 11 H 2 V 5 H 4 V 3 Z M 8,5 H 8.01 M 8,8 V 12" />
);

export const Cross = createThemedIcon(
  Lucide.Cross,
  () => <path d="M 8,2 V 14 M 4,5 H 12" />
);

export const Star = createThemedIcon(
  Lucide.Star,
  () => <path d="M 8,2 L 10,6 H 14 L 11,9 L 12,14 L 8,11 L 4,14 L 5,9 L 2,6 H 6 Z" />
);

export const Moon = createThemedIcon(
  Lucide.Moon,
  () => <path d="M 10,2 A 6,6 0 1,0 14,10 A 4,4 0 1,1 10,2 Z" />
);

export const Atom = createThemedIcon(
  Lucide.Atom,
  () => <path d="M 8,8 M 2,6 L 14,10 M 2,10 L 14,6 M 8,2 V 14" />
);

export const Flame = createThemedIcon(
  Lucide.Flame,
  () => <path d="M 8,2 C 12,6 12,14 8,14 C 4,14 4,6 8,2 Z M 8,8 V 12" />
);

export const Circle = createThemedIcon(
  (props) => <Lucide.Circle {...props} fill={props.color || "currentColor"} stroke="none" />,
  (color) => <circle cx="8" cy="8" r="5" fill={color || "currentColor"} stroke="none" />
);

export const Pin = createThemedIcon(
  Lucide.Pin,
  () => <path d="M 8,2 L 8,8 M 5,2 H 11 M 7,8 L 4,12 H 12 L 9,8 M 8,12 V 15" />
);

export const PieChart = createThemedIcon(
  Lucide.PieChart,
  () => <path d="M 8,2 A 6,6 0 1,0 14,8 M 8,2 L 8,8 L 14,8" />
);

export const Feather = createThemedIcon(
  Lucide.Feather,
  () => <path d="M 14,2 L 2,14 M 14,2 L 10,2 M 14,2 L 14,6 M 10,6 L 6,10" />
);

export const X = createThemedIcon(
  Lucide.X,
  () => <path d="M 3,3 L 13,13 M 13,3 L 3,13" />
);

export const Check = createThemedIcon(
  Lucide.Check,
  () => <path d="M 3,8 L 7,12 L 13,4" />
);

export const Link = createThemedIcon(
  Lucide.Link,
  () => <path d="M 5,8 H 11 M 4,5 H 6 M 10,5 H 12 M 4,11 H 6 M 10,11 H 12" />
);

export const Share2 = createThemedIcon(
  Lucide.Share2,
  () => <path d="M 11,1 H 14 V 4 H 11 Z M 1,6 H 4 V 9 H 1 Z M 11,11 H 14 V 14 H 11 Z M 4,7 L 11,3 M 4,8 L 11,12" />
);

export const ArrowLeft = createThemedIcon(
  Lucide.ArrowLeft,
  () => <path d="M 15,8 H 2 M 7,3 L 2,8 L 7,13" />
);

export const Award = createThemedIcon(
  Lucide.Award,
  () => <path d="M 8,14 V 9 L 6,11 L 4,9 L 4,14 M 8,2 A 4,4 0 1,0 8,10 A 4,4 0 1,0 8,2" />
);

export const GitBranch = createThemedIcon(
  Lucide.GitBranch,
  () => <path d="M 4,4 V 12 M 4,12 A 2,2 0 1,0 4,16 A 2,2 0 1,0 4,12 M 12,4 A 2,2 0 1,0 12,8 A 2,2 0 1,0 12,4 M 4,8 Q 12,8 12,4" />
);

export const Mail = createThemedIcon(
  Lucide.Mail,
  () => <path d="M 2,4 H 14 V 12 H 2 Z M 2,4 L 8,9 L 14,4" />
);
