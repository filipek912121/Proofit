# Płatności (Stripe) — jak włączyć

PROOFIT ma dwie opcje Premium:

| Opcja | Cena | Metody płatności | Odnawianie |
|---|---|---|---|
| **Subskrypcja** | 19,99 zł / mies. | karta, Apple Pay, Google Pay | co miesiąc, anulowanie w portalu klienta |
| **Karnet 30 dni** | 19,99 zł jednorazowo | BLIK, Przelewy24, karta | brak — dni się sumują przy kolejnym zakupie |

BLIK i Przelewy24 nie obsługują subskrypcji w Stripe, dlatego są w karnecie.
Jeśli ktoś ma aktywny karnet i przejdzie na subskrypcję, pozostałe dni stają
się darmowym okresem próbnym (bez podwójnej płatności).

Premium włącza się **wyłącznie** po podpisanym webhooku od Stripe (nie po
powrocie z płatności), a każde zdarzenie jest liczone tylko raz.

## Co jest potrzebne

1. **Baza danych Supabase** — bez niej płatności są wyłączone (w trybie demo
   Premium nie zapisałby się trwale, a nie wolno pobrać pieniędzy bez usługi).
   Uruchom wszystkie migracje z `supabase/migrations` (w tym
   `20261127000008_stripe_events.sql`).
2. **Konto Stripe** z włączonymi płatnościami w PLN.

## Krok po kroku

1. Załóż konto na stripe.com i zostań w **trybie testowym** (przełącznik „Test mode”).
2. Stripe → **Settings → Payment methods**: włącz **BLIK** i **Przelewy24**
   (karty, Apple Pay i Google Pay są włączone domyślnie).
3. Stripe → **Developers → API keys**: skopiuj **Secret key** (`sk_test_…`).
4. Na swoim komputerze, w folderze projektu:

   ```bash
   npm install
   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs https://TWOJA-APKA.vercel.app
   ```

   Skrypt utworzy produkt „PROOFIT Premium” (19,99 zł/mies.) i webhook,
   a potem wypisze wartości do wklejenia.
5. Vercel → projekt → **Settings → Environment Variables**: dodaj
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PREMIUM`
   oraz zmienne Supabase (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) i
   `NEXT_PUBLIC_SITE_URL`. Następnie **Redeploy**.
6. Test: wejdź w aplikacji w **Premium → Kup 30 dni** i zapłać testowo — kartą
   `4242 4242 4242 4242` (dowolna przyszła data i CVC) albo BLIK-iem z kodem
   testowym, który Stripe pokazuje na stronie płatności w trybie testowym.
   Premium powinien włączyć się w kilka sekund.
7. Gdy wszystko działa: przełącz Stripe na **tryb live**, powtórz kroki 3–5
   z kluczem `sk_live_…` (osobny webhook i sekret).

## Ręczna konfiguracja webhooka (zamiast skryptu)

Stripe → Developers → Webhooks → Add endpoint:
- URL: `https://TWOJA-APKA.vercel.app/api/stripe/webhook`
- Zdarzenia: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
  `customer.subscription.created`, `customer.subscription.updated`,
  `customer.subscription.deleted`
- Skopiuj **Signing secret** (`whsec_…`) do `STRIPE_WEBHOOK_SECRET`.

`STRIPE_PRICE_ID_PREMIUM` jest opcjonalne — bez niego cena 19,99 zł tworzy się
automatycznie przy każdej płatności.

## Testy lokalne

```bash
STRIPE_SECRET_KEY=sk_test_... STRIPE_WEBHOOK_SECRET=whsec_... STRIPE_ALLOW_DEMO=1 npm run dev
stripe listen --forward-to localhost:3000/api/stripe/webhook   # Stripe CLI
```

`STRIPE_ALLOW_DEMO=1` służy tylko do testów na własnym komputerze — nigdy na produkcji.
