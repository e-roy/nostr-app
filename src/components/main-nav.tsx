"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Hash,
  Bell,
  Mail,
  Bookmark,
  User,
  Settings,
  Zap,
} from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  //   { name: "Explore", href: "/explore", icon: Hash },
  //   { name: "Notifications", href: "/notifications", icon: Bell },
  //   { name: "Messages", href: "/messages", icon: Mail },
  //   { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  //   { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      <Link href="/" className="flex items-center gap-2 px-4 py-2">
        <Zap className="w-8 h-8 text-primary" />
        <span className="text-xl font-bold">Nostr</span>
      </Link>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-4 px-4",
                pathname === item.href && "bg-muted"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden md:inline">{item.name}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
