# Collaboration form email setup

The collaboration form sends submissions through a Netlify Function and Resend. Submitted details are emailed to the configured inbox; this site does not keep a separate database copy.

1. Create a Resend account and verify a sender domain/address.
2. Deploy the site to Netlify from this folder. The included build script publishes only the website files to `dist`, keeping the function source out of the public site.
3. In the Netlify site settings, add these environment variables for the function runtime:
   - `RESEND_API_KEY`: your Resend API key.
   - `RESEND_FROM_EMAIL`: a sender using your verified domain, such as `EmberWorks <collaborate@your-verified-domain.com>`.
   - `COLLABORATION_RECIPIENT`: `shrinivasgaonkar2@gmail.com`.
4. Redeploy after setting the variables. Never put the API key in the website JavaScript or commit it to source control.

The form cannot deliver messages when opened directly as a local `file:` page; test it on the deployed Netlify URL or with the Netlify CLI.
