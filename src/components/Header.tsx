import { useEffect, useState } from "react";
import { ListIcon, XIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "#products", label: "项目" },
  { href: "https://github.com/OurTaiko", label: "GitHub" },
  { href: "https://sso.ourtaiko.org", label: "OurTaiko 账号" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  const navigation = links.map(({ href, label }) => (
    <a
      key={href}
      href={href}
      className={href === "https://sso.ourtaiko.org" ? "nav-account" : ""}
      {...(href.startsWith("https:")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      onClick={() => setOpen(false)}
    >
      {label}
      {href.startsWith("https:") ? (
        <>
          <ArrowUpRightIcon size={14} aria-hidden="true" />
          <span className="sr-only">（在新标签页打开）</span>
        </>
      ) : null}
    </a>
  ));

  return (
    <header className="site-header">
      <nav
        className="container flex min-h-18 items-center justify-between gap-6"
        aria-label="主导航"
      >
        <a className="wordmark" href="#home" aria-label="OurTaiko 首页">
          <img
            src="/icons/icon-192.png"
            className="size-10 rounded-xl"
            width="40"
            height="40"
            alt=""
          />
          <span>
            OurTaiko<span className="wordmark-dot">.</span>
          </span>
        </a>
        <div className="nav-links hidden md:flex">{navigation}</div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon-lg"
                className="md:hidden"
                aria-label="打开导航菜单"
              />
            }
          >
            <ListIcon size={24} />
          </SheetTrigger>
          <SheetContent
            side="right"
            showCloseButton={false}
            className="w-[min(88vw,360px)]! border-0 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          >
            <SheetHeader className="px-3 pt-5">
              <SheetTitle className="text-2xl font-semibold">
                OurTaiko.
              </SheetTitle>
              <SheetDescription className="sr-only">网站导航</SheetDescription>
            </SheetHeader>
            <SheetClose
              render={
                <Button
                  size="icon-lg"
                  variant="ghost"
                  aria-label="关闭导航菜单"
                  className="absolute top-5 right-4"
                />
              }
            >
              <XIcon size={22} />
            </SheetClose>
            <nav className="mobile-links" aria-label="移动导航">
              {navigation}
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
