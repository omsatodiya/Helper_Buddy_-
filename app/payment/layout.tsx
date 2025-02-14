export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
      {children}
    </>
  );
}
