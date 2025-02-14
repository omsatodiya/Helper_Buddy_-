import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart | Helper Buddy",
  description:
    "View and manage items in your shopping cart. Secure checkout and easy service booking.",
  openGraph: {
    title: "Shopping Cart | Helper Buddy",
    description:
      "View and manage items in your shopping cart. Secure checkout and easy service booking.",
    type: "website",
    url: "https://helperbuddy.com/cart",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopping Cart | Helper Buddy",
    description:
      "View and manage items in your shopping cart. Secure checkout and easy service booking.",
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
