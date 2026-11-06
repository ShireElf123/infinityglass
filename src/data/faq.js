/** Answers mirror the visible FAQ page; availability is confirmed per enquiry. */
export const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Which areas do you cover?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Mobile fitting enquiries are welcome across Gauteng and surrounding areas. Share your town or suburb so the team can confirm availability for your vehicle and location."
      }
    },
    {
      "@type": "Question",
      "name": "Can a chip be repaired instead of replacing the windscreen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "That depends on the damage, its size and position, and the vehicle. Share a clear photo and vehicle details for an assessment."
      }
    },
    {
      "@type": "Question",
      "name": "What details help identify the correct glass?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Provide the make, model, year if known, the glass panel involved, your location and any relevant sensors, camera brackets, antenna or trim details."
      }
    },
    {
      "@type": "Question",
      "name": "Do you work with fleets and businesses?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Fleet and corporate enquiries are welcome. Include the business name, fleet size, vehicle types, site locations and any quote or invoicing requirements you want the team to review."
      }
    },
    {
      "@type": "Question",
      "name": "Does my enquiry confirm stock or a booking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. The form prepares a WhatsApp message for you to review and send. Compatibility, availability, final price and booking details must be confirmed directly."
      }
    }
  ]
};
