# cloudflare-pages-shared-password

This repository demonstrates a static site which is hosted on Cloudflare Pages and whose content is "protected" by a shared username/password with [HTTP basic access authentication](https://en.wikipedia.org/wiki/Basic_access_authentication).  The real magic is in [`functions/_middleware.ts`](https://github.com/garrison/cloudflare-pages-shared-password/blob/main/functions/_middleware.ts), which is based on the [Cloudflare Workers example for HTTP basic authentication](https://developers.cloudflare.com/workers/examples/basic-auth/), repurposed as a [middleware](https://developers.cloudflare.com/pages/platform/functions#exporting-middleware) to be used with the [Functions](https://developers.cloudflare.com/pages/platform/functions) feature of Cloudflare Pages.

This demonstration site is hosted at https://cloudflare-pages-shared-password.pages.dev/, with `admin` as both the username and password.

The static site in this repository is built using [Hugo](https://developers.cloudflare.com/pages/framework-guides/deploy-a-hugo-site/), but the middleware can be used with any static site hosted on Cloudflare Pages.

## [Non]-Security

I make no guarantees about the security of this code.  In particular, a shared password, stored in a repository, should not be expected to provide a meaningful degree of security.

## Acknowledgments

Special thanks to [CherryJimbo](https://jross.me/) and [Isaac McFadyen](https://imcf.me/) for responding to my questions on the Cloudflare Discord instance.  Their suggestions were essential in getting the first version of this code to work.
