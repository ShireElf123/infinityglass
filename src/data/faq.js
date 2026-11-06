/** Existing published FAQ answers; no reviews, ratings or new business claims. */
export const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can you fit glass at my home or workplace?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Infinity accepts mobile auto-glass enquiries in Fountain and surrounding areas. Share your town or suburb so the team can confirm service availability for your location and vehicle.",
      },
    },
    {
      "@type": "Question",
      name: "Can a windscreen chip be repaired instead of replaced?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on the damage, its position and the vehicle. Describe the damage and share a clear photo in WhatsApp so the team can advise on the next assessment step.",
      },
    },
    {
      "@type": "Question",
      name: "What information helps you quote the correct glass?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Provide the vehicle make, model, year if known, the glass panel involved and the town or suburb. Photos can be attached directly in WhatsApp after you review the enquiry.",
      },
    },
    {
      "@type": "Question",
      name: "Do you handle fleet or corporate enquiries?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, fleet and corporate enquiries are welcome. Include the business name, vehicle types, fleet size, site locations and any quotation or invoicing requirements so the team can review the request.",
      },
    },
    {
      "@type": "Question",
      name: "Does sending the website form confirm a booking or final price?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The form prepares a WhatsApp message for you to review and send. Vehicle compatibility, availability, price and booking details must be confirmed directly by the business.",
      },
    },
  ],
};
