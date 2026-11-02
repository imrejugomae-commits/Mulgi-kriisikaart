# Mulgi valla kriisikaart — esimene prototüüp

**TÄHTIS: see on kujundus- ja toimivusnäidis, mitte ametlik kriisikaart ega reaalajas ohuteavitus.**

## Mis töötab?

- Mobiilisõbralik avaleht, peamised abinumbrid 112 ja 1247, kriisijuhised.
- Interaktiivne OpenStreetMapi kaart, kuhu on märgitud **asulate ligikaudsed keskpunktid**: Abja-Paluoja, Karksi-Nuia, Mõisaküla, Halliste. **Need EI OLE kriisiabipunktid.**
- Asulate otsing, kaardikihtide sisse-välja lülitamine, kohale suumimine, brauseri asukohapäring.
- Kriisiinfokeskuste, avalike varjumiskohtade, kriisipoodide, tanklate, apteekide ja joogiveepunktide kihid. Kriisipunktide nimekiri on meelega tühi, kuni vastutav asutus on andmed kinnitanud.

## Kuidas proovida?

Ava `index.html` veebibrauseris. Kaardi taust ja Leafleti kaarditarkvara vajavad esialgu internetti. Teised tekstid ja kontaktid töötavad ka kaardita.

## Kuidas GitHub Pagesiga avaldada?

1. Registreeru aadressil https://github.com või logi sisse.
2. Vali **New repository**. Pane nimeks `mulgi-kriisikaart` ja vali **Public** (kui soovid tasuta GitHub Pagesi).
3. Laadi kõik selle kausta 4 veebifaili (`index.html`, `styles.css`, `data.js`, `app.js`) repositooriumi juurkausta ja kinnita muudatus (`Commit changes`).
4. Vali oma repositooriumi **Settings → Pages**.
5. **Build and deployment → Source → Deploy from a branch**; vali branch `main` ja folder `/(root)`, vajuta **Save**.
6. Lehe aadress on tavaliselt `https://SINU-KASUTAJANIMI.github.io/mulgi-kriisikaart/`.

**Ära avalda linki ametliku ohuteavituse kanalina enne Mulgi Vallavalitsuse kinnitust, andmete kontrolli ja turvanõuete täitmist.**

## Andmete lisamine

Ava `data.js`. Massiiv `places` on alguses tühi. Lisa ainult ametlikult kinnitatud ja avalikustamiseks lubatud kohad. Näiteks järgmine on **skeem**, mitte päris kriisipunkt:

```js
{
  id: "ametlik-ainulaadne-id",
  name: "Kinnitatud koha nimi",
  category: "kerksus", // kerksus / varjumine / poed / tanklad / apteegid / vesi
  lat: 58.0000,
  lng: 25.0000,
  address: "Kinnitatud aadress",
  description: "Millist abi pakub ja millal võib avatud olla",
  status: "teadmata", // avatud / planeeritud / suletud / teadmata
  sourceUrl: "https://ametlik-allikas.ee/kinnitatud-teade",
  verifiedAt: "2026-11-02 14:00",
  approvedForPublication: true
}
```

**Turvalisus ja ajakohasus:** kriisiolukorras ei tohi varjumis- ega evakuatsioonikohtade saadavust eeldada ainult staatilise nimekirja põhjal. Avalikult ei tohi avaldada piiratud levikuga evakuatsioonikohtade nimekirju. Ava/suletud teave peab tulema ametlikust töövoost, sisaldama ajatempliga kinnitust ning vananedes selgelt aeguma. Praeguses prototüübis puudub sisuhaldus, muutmiste kinnitamine, automaatne teabevoog ja töökindel võrguühenduseta kaart.

## Tehnoloogia

Tavaline HTML, CSS, JavaScript, Leaflet 1.9.4 ja OpenStreetMapi kaardiplaadid; serverit ega ehitussammu pole vaja. OpenStreetMapi avalikul plaadiserveril on kasutuspoliitika; suure koormuse ja kriisikindluse jaoks on vaja eraldi, lepingulise toe ja varuplaaniga kaarditeenust ning vajadusel lokaalset vahemälu.

## Kontrollimise allikad

- https://kriisikaart.tartu.ee/ (eeskuju, mitte koopia)
- https://www.tartu.ee/et/uudised/tartu-saadab-otsepostiga-koigile-elanikele-kriisikaardi
- https://www.riigiteataja.ee/akt/407022026047 (Mulgi valla teenuskeskuste nimed ja aadressid)
- https://www.kriis.ee/ (riiklik kriisiinfo)
- https://www.olevalmis.ee/ (valmisoleku juhised)
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Järgmised sammud enne päriskasutust
Mulgi kriisikaardi veebilehe arendus.
1. Leppida vallaga kokku vastutav sisuhaldur, kriisiteadete kinnitaja ja uuendamise sagedus.
2. Kinnitada iga avaliku punkti asukoht, teenus, avamistingimused, allikas ja infovärskus.
3. Ehitada lihtne kasutajaõigustega haldusvaade või ametlike andmete automaatliidestus, teavitused ja jälgitav muudatuste ajalugu.
4. Testida ligipääsetavust (WCAG), mobiiltelefoni kasutust, jõudlust, kaardi riket ja sidekatkestust.
5. Arutada vallaga ametlikku domeeni, omandit ja avaldamise luba.

## Aluskaart (Maa- ja Ruumiamet)

Aluskaardi vaikimisi valik on Maa- ja Ruumiameti **Eesti kaart**. Kasutaja saab valida ka MaRu ortofoto ja OpenStreetMapi. Kasutatakse MaRu TMS kaarte projektsioonis EPSG:3857 (GMC), Leafleti `tms:true` valikut ja teenusepõhist tunnust `ASUTUS=MULGI-KRIISIKAART&KESKKOND=TEST&IS=KRIISIKAART` ametliku MapCache juhendi 4.2 järgi. Kasutusel on teenusepakkuja nõutud allikaviide. Kui esimesed MaRu kaardiplaadid ei laadi, aktiveeritakse varukaart OpenStreetMap. Kuna kriisikaardi praegune versioon töötab GitHub Pagesis, ei kasuta see eraldi kaardiplaatide proksiserverit. Enne ametliku teenusena kasutuselevõttu tuleb lepingu ja koormusnõuded Maa- ja Ruumiametiga üle täpsustada.

Ametlikud juhendid:
- https://geoportaal.maaamet.ee/est/teenused/wms-wfs-wcs-teenused/tms-wms-c-ja-wmts-teenused-p481.html
- https://geoportaal.maaamet.ee/docs/WMS/MapCache_teenused_juhend_v2.pdf
