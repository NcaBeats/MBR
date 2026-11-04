import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, LogOut, UserRound } from "lucide-react";
import {
  NavBarLinks,
  SearchBar,
  BurgerMenu,
  WalletBalance,
  type BurgerMenuItem,
} from "@/components/layout";
import { logoutAction } from "@/actions/logout";
import { getCurrentUserAction } from "@/actions/admin/auth";
import { getMyProfileAction } from "@/actions/profile";
import { getMyWalletAction } from "@/actions/wallet";
import { Erica_One } from "next/font/google";

const ericaOne = Erica_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-erica-one",
});

export const Nav = async () => {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("token")?.value;

  const [user, wallet, profile] = await Promise.all([
    isLoggedIn ? getCurrentUserAction() : Promise.resolve(null),
    isLoggedIn ? getMyWalletAction().catch(() => null) : Promise.resolve(null),
    isLoggedIn ? getMyProfileAction().catch(() => null) : Promise.resolve(null),
  ]);
  const isStaff = user?.role === "ADMIN" || user?.role === "VENDEDOR";
  const staffHref = user?.role === "ADMIN" ? "/admin" : "/studio/games";

  const menuItems: BurgerMenuItem[] = [
    { href: "/", label: "Home", icon: "house" },
    { href: "/catalog", label: "Catalog", icon: "layoutGrid" },
    { href: "/about", label: "About", icon: "info" },
    { href: "/contact", label: "Contact", icon: "mail" },
    { href: "/blog", label: "Blog", icon: "newspaper" },
    ...(isLoggedIn
      ? [{ href: "/library", label: "Library", icon: "gamepad2" }]
      : []),
    ...(isStaff
      ? [{ href: staffHref, label: "Panel", icon: "layoutDashboard" }]
      : []),
    { href: "/cart", label: "Cart", icon: "shoppingCart" },
    ...(isLoggedIn
      ? [
          {
            href: "/",
            label: "Log out",
            icon: "logOut",
            action: logoutAction,
          },
        ]
      : [
          { href: "/sign-up", label: "Sign up", icon: "clipboardPenLine" },
          { href: "/log-in", label: "Log in", icon: "logIn" },
        ]),
  ];

  return (
    <nav className="text-sm flex items-center h-full px-4 gap-3 sm:gap-6 ">
      <div className="">
        <Link href="/" className="block items-center min-h-full">
          <h1
            className={`text-3xl hover:text-[#a5a5a5] transition-colors ease-in-out duration-200 ${ericaOne.className}`}
          >
            MBR
          </h1>
        </Link>
      </div>
      <NavBarLinks
        isLoggedIn={isLoggedIn}
        isStaff={isStaff}
        staffHref={staffHref}
      />
      <SearchBar />
      <div className="hidden nav:flex justify-end items-center gap-4 ml-auto">
        {wallet && <WalletBalance initialBalance={wallet.balance} />}
        <Link
          href="/cart"
          className="hover:text-[#1ea4ff] active:text-[#1ea4ff] rounded-full p-2.5 transition-colors ease-in-out duration-200"
          aria-label="Cart"
        >
          <ShoppingCart size={20} />
        </Link>
        {isLoggedIn && (
          <span className="flex items-center" title={user?.email}>
            {profile?.avatarImage ? (
              <Image
                src={profile.avatarImage}
                alt=""
                width={32}
                height={32}
                className="size-8 rounded-full object-cover ring-1 ring-white/10"
              />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full bg-[#28282C] text-[#EDEDED]">
                <UserRound size={18} />
              </span>
            )}
          </span>
        )}
        {isLoggedIn ? (
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Log out"
              title="Log out"
              className="hover:bg-[#28282C] active:bg-[#28282C] rounded-full p-2.5 transition-colors ease-in-out duration-200 cursor-pointer text-[#EDEDED]"
            >
              <LogOut size={20} />
            </button>
          </form>
        ) : (
          <>
            <Link
              href={"/sign-up"}
              className="bg-[#007AFF] hover:bg-[#1ea4ff] text-[#EDEDED] px-4 py-1.5 font-medium text-sm text-center rounded-full cursor-pointer transition-colors duration-200 ease-out"
            >
              Sign Up
            </Link>
            <Link
              href={"/log-in"}
              className="bg-[#EDEDED] text-[#0A0A0A] hover:bg-[#b0b0b0] px-4 py-1.5 font-medium text-sm text-center rounded-full cursor-pointer transition-colors duration-200 ease-out"
            >
              Log In
            </Link>
          </>
        )}
      </div>
      <BurgerMenu items={menuItems} />
    </nav>
  );
};
