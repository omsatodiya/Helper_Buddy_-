import emailjs from '@emailjs/browser';

interface NotificationParams {
  providerEmail: string;
  providerName: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

export const sendProviderNotifications = async (params: NotificationParams) => {
  const totalAmount = params.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const itemsList = params.items
    .map(item => `${item.name} (Quantity: ${item.quantity}) - ₹${item.price * item.quantity}`)
    .join('\n');

  try {
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_REQUEST_NOTIFICATION_ID!,
      {
        to_email: params.providerEmail,
        provider_name: params.providerName,
        customer_name: params.customerName,
        customer_email: params.customerEmail,
        customer_location: `${params.customerAddress}, ${params.customerCity}`,
        service_details: itemsList,
        estimated_value: `₹${totalAmount}`,
        from_name: "Dudh-Kela",
        reply_to: params.customerEmail,
        message: `A customer in your area needs these services:\n\n${itemsList}\n\nTotal Value: ₹${totalAmount}\n\nIf you're interested, please contact the customer directly.`,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    );
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}; 