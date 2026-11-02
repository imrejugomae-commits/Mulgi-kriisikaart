/*
 * Mulgi kriisikaardi andmestik.
 * TÄHTIS: Ära lisa siia kinnitamata kriisi-, varjumis- ega evakuatsioonikohti.
 * Avalda ainult kooskõlastatud avalikku teavet. Evakuatsioonikohti ei tohi
 * käsitleda püsivalt avatuna: asukohad avaldatakse vajaduse tekkimisel.
 */
window.MULGI_KRIISI_DATA = {
  lastVerifiedAt: null, // nt "2026-11-02T12:00:00+02:00" — kui kogu avaldatud andmestik on kinnitatud
  areas: [
    { id: "abja", name: "Abja-Paluoja", lat: 58.12528, lng: 25.34972, type: "asula" },
    { id: "karksi", name: "Karksi-Nuia", lat: 58.10333, lng: 25.56278, type: "asula" },
    { id: "moisakyla", name: "Mõisaküla", lat: 58.09222, lng: 25.18639, type: "asula" },
    { id: "halliste", name: "Halliste", lat: 58.16444, lng: 25.43972, type: "asula" }
  ],
  categories: [
    { id: "kerksus", name: "Kriisiinfokeskused", icon: "✳", color: "#197d85" },
    { id: "varjumine", name: "Avalikud varjumiskohad", icon: "⌂", color: "#6654a5" },
    { id: "poed", name: "Kriisipoed", icon: "▣", color: "#aa6a28" },
    { id: "tanklad", name: "Kriisitanklad", icon: "◈", color: "#b44f42" },
    { id: "apteegid", name: "Apteegid ja abi", icon: "+", color: "#3565a8" },
    { id: "vesi", name: "Joogiveepunktid", icon: "≋", color: "#2b789f" }
  ],
  // Lisada ainult valla või vastutava asutuse avaldamiseks kinnitatud punktid.
  // Objekt: {id, name, category, lat, lng, address, description, status,
  //   sourceUrl, verifiedAt, approvedForPublication: true}
  // NB! Planeeritud koht ei võrdu avatud kohaga.
  places: []
};
