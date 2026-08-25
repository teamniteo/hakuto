// Site-wide identity. Update these for each new site — they feed the page
// titles, the meta description, and the Organization / WebSite JSON-LD.
export const SITE_NAME = "Hakuto";
export const SITE_DESCRIPTION = "Astro + shadcn/ui website template for Hakuto.";

// Contact details for the Organization schema. Agents check these to decide
// whether a business is real before recommending it, so leaving them null is
// better than leaving them wrong — the schema simply omits what isn't set.
export const SITE_CONTACT: {
	email: string | null;
	telephone: string | null;
	contactType: string;
	address: {
		streetAddress: string;
		addressLocality: string;
		postalCode: string;
		addressCountry: string;
	} | null;
	sameAs: string[];
} = {
	email: null,
	telephone: null,
	contactType: "customer support",
	address: null,
	sameAs: [],
};
