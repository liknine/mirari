# Mirari v2: D1 admin upgrade

This update keeps the 17,618-item base catalog on GitHub Pages and moves only new, edited, and hidden products to Cloudflare D1.

## Safe data behavior

- Base catalog JSON is not rewritten.
- Existing `docs/data/catalog-overrides.json` remains as a fallback and is merged with D1.
- Product IDs never change during edits.
- Product images are still uploaded to GitHub and are not physically deleted.
- KV remains responsible only for temporary admin dialog state.

## New admin menu

- Add product
- Product list (recent admin changes)
- Search product
- Edit product
- Delete/hide product
- Persistent `Open catalog` Telegram reply-keyboard button

## Deployment outline

1. Apply the patch over the current repository.
2. Create D1: `npm run d1:create` from `worker/`.
3. Add the returned database ID using `node scripts/configure-d1.mjs DATABASE_ID`.
4. Run `npm run d1:migrate`.
5. Configure the Mini App API from project root:
   `node scripts/configure-api-base.mjs https://YOUR-WORKER.workers.dev`
6. Push frontend changes to GitHub.
7. Run `npm run typecheck && npm run deploy` from `worker/`.
8. Send `/start` and `/admin` to the bot.
