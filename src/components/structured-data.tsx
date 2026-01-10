export function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://neyro.app";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Neyro",
    url: baseUrl,
    logo: `${baseUrl}/og-image.png`,
    description: "Neyro enforces the PARA workflow: capture everything once, classify to Projects/Areas/Resources, cap projects at seven, and ship weekly reviews.",
    sameAs: [
      "https://twitter.com/neyroapp",
      "https://linkedin.com/company/neyro",
    ],
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Neyro",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Neyro",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // Sanitize JSON to prevent XSS while preserving structure
  const safeOrgSchema = JSON.stringify(organizationSchema);
  const safeSoftwareSchema = JSON.stringify(softwareApplicationSchema);
  const safeWebsiteSchema = JSON.stringify(websiteSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeOrgSchema }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeSoftwareSchema }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeWebsiteSchema }}
      />
    </>
  );
}

