import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ArrowIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M5 12h14M14 7l5 5-5 5" /></svg>;
}

export function CalendarIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>;
}

export function HomeIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></svg>;
}

export function BookIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z"/><path d="M8 8h8M8 12h7"/></svg>;
}

export function UsersIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

export function MapPinIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>;
}

export function HeartIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>;
}

export function MenuIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
}

export function CloseIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m6 6 12 12M18 6 6 18"/></svg>;
}

export function CheckIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m5 12 4 4L19 6"/></svg>;
}

export function LockIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>;
}
