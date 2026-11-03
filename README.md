# Surigoud

Nederlandstalige, responsive conceptwebshop voor Surinaamse gouden sieraden. Geen dependencies; Node.js 22 of hoger.

## Status

Werkend: categorieën, zoeken, beschikbaarheidsfilter, sorteren, productdetails, toegankelijke modale vensters, lokale winkelwagen met aantallen en verwijderen, mobiel ontwerp. Alle producten zijn expliciete ontwerpvoorbeelden. Er staan geen verkoopprijzen, voorraadclaims of gehalteclaims in de catalogus. Alle SVG-illustraties zijn voor dit project gemaakt; er is geen beeld of tekst overgenomen van andere juweliers.

Geen actieve verkoop. Afrekenen is uitgeschakeld. De API weigert voorbeeldproducten ook bij directe verzoeken. Er worden geen bestellingen, betalingen of klantgegevens opgeslagen. Geen externe fonts, trackers of cookies. De winkelwagen gebruikt alleen localStorage.

## Lokaal starten

```sh
npm start
```

Open http://localhost:3000. Controleer met `npm test` en bouw statisch met `npm run build`.

## Deployen

### Statische hosting (bijvoorbeeld je eigen webhosting)

1. Voer `npm run build` uit.
2. Upload de inhoud van `dist/` naar de hoofdmap van een HTTPS-domein.
3. De shop werkt zonder server. De checkout-API is bij deze optie niet beschikbaar; afrekenen blijft uitgeschakeld.
4. De site verwacht installatie op de root van het domein; voor een submap moeten de absolute assetpaden in index.html worden aangepast.

### Node-hosting

1. Gebruik Node 22+, build is niet nodig; start met `npm start`.
2. Stel `PORT` in (standaard 3000). De server bindt aan 127.0.0.1; plaats er een HTTPS reverse proxy voor op dezelfde host. Voor een containerplatform: pas de bind-host aan naar 0.0.0.0 en beperk toegang via het platform.
3. Proxy verkeer naar die poort. `/api/checkout` is aanwezig, maar verwerkt nog geen betaling.
4. Behoud de securityheaders in server.mjs; stel ze bij statische hosting equivalent in.

## Echte catalogus koppelen

`public/catalog.js` is het huidige voorbeeldcontract: id, name, category, description, art, demo, priceCents, stock, material. Voeg voor echte producten variant-ID's, maat, gehalte, gewicht, productfoto's met aantoonbare gebruiksrechten, EUR-prijzen inclusief toepasselijke belastingen en voorraad uit een serverbron toe. Publiceer geen geheimen in public/. Huidige productweergaven zijn bewust op voorbeelden ingericht: pas detailweergave, prijzen, beschikbaarheid, filters en knoppen gezamenlijk aan wanneer echte data beschikbaar is. Alleen demo=false zetten activeert de winkel niet.

## Checkout-koppelpunt

POST `/api/checkout`, Content-Type application/json:

```json
{"items":[{"id":"ala","quantity":1}]}
```

Verwacht nu 409 (voorbeeldproduct); 400 bij ongeldige invoer; 503 als een toekomstig geldig product nog geen provider heeft. De browser roept dit nog niet aan, omdat bestellen niet beschikbaar is.

Voor Mollie/Stripe of een andere provider:

- Haal product, prijs, belasting en voorraad aan de serverkant uit een betrouwbare catalogus. Vertrouw nooit browserprijzen. Gebruik varianten/SKU's.
- Bereken verzendkosten en totaal op de server. Reserveer voorraad transactioneel en verval reserveringen bij verlopen sessies.
- Maak een gehoste betaalsessie aan met een geheime server-API-key; geef alleen een gevalideerde checkout-URL terug. Koppel daarna pas de checkoutknop aan de API.
- Maak orders duurzaam en idempotent. Verwerk geverifieerde providerwebhooks; een terugkeerpagina is geen bewijs van betaling.
- Test geslaagde, afgebroken, verlopen en dubbele betalingen, voorraadconflicten en foutmeldingen in de sandbox vóór activering.
- Voeg rate limiting en bescherming tegen misbruik toe aan de productie-API.

## Voor opening invullen

Bedrijfsidentiteit en contact, geverifieerde producten en rechten op foto's, prijzen, voorraad, verzending, retour- en garantie-informatie, privacyverklaring en toepasselijke voorwaarden. De huidige serviceteksten benoemen de ontbrekende informatie; ze zijn geen definitieve winkelvoorwaarden. Verwijder de conceptmeldingen pas wanneer verkoop werkelijk mogelijk is.

## Ontwerpbron

https://fajalobiejuwelier.nl is bekeken als referentie voor goudhandel en persoonlijke service. Surigoud heeft een eigen visuele uitwerking; geen affiliatie of overgenomen bedrijfsclaims. De SVG's zijn illustratief en tonen geen leverbare producten.

## Mollie-koppeling voor de Nederlandse vestiging

Er is een afzonderlijke sandboxintegratie toegevoegd via `/betaling-test`. De winkelwagen en `/api/checkout` blijven voorbeeldproducten weigeren. Deze integratie accepteert uitsluitend `test_`-sleutels en verwerkt geen echte betalingen. Het fictieve bedrag van € 1,00 is alleen zichtbaar op de afzonderlijke testpagina, nooit als verkoopprijs.

1. Maak zelf een account aan bij https://my.mollie.com en doorloop de vereiste bedrijfsverificatie voor je Nederlandse vestiging.
2. Haal de **test API key** op in het Mollie-dashboard. Zet deze uitsluitend in de serveromgeving, niet in GitHub, de browser of een chat.
3. Stel `MOLLIE_API_KEY`, `PUBLIC_BASE_URL` (het publieke HTTPS-hoofddomein, zonder subpad) en `ENABLE_MOLLIE_TEST=true` in op de Node-hosting. Zie `.env.example` voor de namen; een .env-bestand wordt niet automatisch ingelezen door npm start. Gebruik hosting secrets of Node met `--env-file=.env`.
4. Open `https://jouw-domein/betaling-test` en klik op Start Mollie-test. De Mollie-sandbox simuleert de uitkomst; er vindt geen geldtransactie of levering plaats. Bij statische hosting werkt de test-API niet.
5. Zet `ENABLE_MOLLIE_TEST=false` na het testen. De server beperkt de test tot één nieuw verzoek per minuut en accepteert alleen de ingestelde browser-origin.

De terugkeerpagina is bewust geen betalingsbevestiging. Er is voor deze losse sandbox geen orderopslag of webhook: er wordt niets geleverd op basis van de testuitkomst. Voor echte verkoop blijven duurzame orders, voorraadreservering, geverifieerde statusophaling via webhooks, verzendgegevens en een aparte live-implementatie nodig. De API weigert live-sleutels ook als iemand de configuratie wijzigt. Automatiseer live activering dus niet door alleen een sleutel te wisselen.

De API-adapter is met gesimuleerde Mollie-antwoorden getest. Een echte sandboxtest vereist jouw account, testkey en HTTPS-hosting en is nog niet uitgevoerd. De latere vestiging in Suriname vraagt een nieuwe beoordeling van providerbeschikbaarheid, bedrijfsentiteit en uitbetalingsrekening.

Officiële API-documentatie: https://docs.mollie.com/reference/create-payment
