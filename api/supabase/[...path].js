export default async function handler(req, res) {
    const supabaseDomain = 'grmcwebsgfrclyafrcio.supabase.co';

    // Construct the destination URL using the catch-all
    let urlPath = req.url.replace('/api/supabase', '');
    const url = new URL(`https://${supabaseDomain}${urlPath}`);

    // Create a strict headers object, explicitly enforcing the Site URL as the origin
    const headers = new Headers();
    Object.keys(req.headers).forEach((key) => {
        if (!['host', 'origin', 'referer', 'x-forwarded-host'].includes(key.toLowerCase())) {
            headers.set(key, req.headers[key]);
        }
    });

    // explicitly tell Supabase this is coming from Vercel
    headers.set('host', supabaseDomain);
    headers.set('origin', 'https://no-zero-app.vercel.app');
    headers.set('referer', 'https://no-zero-app.vercel.app/');
    headers.set('x-forwarded-host', 'no-zero-app.vercel.app');

    try {
        const fetchOptions = {
            method: req.method,
            headers: headers,
            body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
            redirect: 'manual'
        };

        const response = await fetch(url.toString(), fetchOptions);

        // Copy Response Headers back to client
        const responseHeaders = {};
        for (const [key, value] of response.headers.entries()) {
            responseHeaders[key] = value;
        }

        res.status(response.status);
        for (const key in responseHeaders) {
            res.setHeader(key, responseHeaders[key]);
        }
        res.send(await response.text());

    } catch (error) {
        console.error("Vercel Proxy Error:", error);
        res.status(500).json({ error: 'Internal API Proxy Error', details: error.message });
    }
}
