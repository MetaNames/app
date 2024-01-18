import { config } from '$lib';

export async function GET() {
	return new Response(
		`User-agent: Googlebot
     User-agent: *
     Allow: /

     Sitemap: ${config.websiteUrl}sitemap.xml
		`
			.split('\n')
			.map((line) => line.trim())
			.join('\n'),
		{
			headers: {
				'Content-Type': 'text/plain'
			}
		}
	);
}
