import type { Organization, WebSite, WithContext } from "schema-dts";
import { SITE_CONTACT, SITE_DESCRIPTION, SITE_NAME } from "./site";

/**
 * Identity schema for the homepage.
 *
 * Agents use this to answer "what is this site and who runs it" without parsing
 * marketing copy. `contactPoint` and `address` are what let them verify the
 * business is real, so fill `SITE_CONTACT` in `site.ts` as soon as the details
 * exist. Anything still unset is omitted rather than emitted empty — a schema
 * asserting a blank address is worse than one that stays quiet about it.
 */
export function identitySchema(site: URL | undefined): WithContext<Organization | WebSite>[] {
	const url = site?.href ?? "/";
	const orgId = `${url}#organization`;

	const organization: WithContext<Organization> = {
		"@context": "https://schema.org",
		"@type": "Organization",
		"@id": orgId,
		name: SITE_NAME,
		description: SITE_DESCRIPTION,
		url,
		...(SITE_CONTACT.sameAs.length > 0 && { sameAs: SITE_CONTACT.sameAs }),
		...((SITE_CONTACT.email || SITE_CONTACT.telephone) && {
			contactPoint: {
				"@type": "ContactPoint" as const,
				contactType: SITE_CONTACT.contactType,
				...(SITE_CONTACT.email && { email: SITE_CONTACT.email }),
				...(SITE_CONTACT.telephone && { telephone: SITE_CONTACT.telephone }),
			},
		}),
		...(SITE_CONTACT.address && {
			address: { "@type": "PostalAddress" as const, ...SITE_CONTACT.address },
		}),
	};

	const website: WithContext<WebSite> = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": `${url}#website`,
		name: SITE_NAME,
		description: SITE_DESCRIPTION,
		url,
		publisher: { "@id": orgId },
	};

	return [organization, website];
}
