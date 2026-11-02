'use strict';
(function () {
  const dataset = window.MULGI_KRIISI_DATA;
  if (!dataset) return;
  const $ = id => document.getElementById(id);
  const categories = dataset.categories;
  const areas = dataset.areas;
  const places = (dataset.places || []).filter(p =>
    p.approvedForPublication === true && Number.isFinite(p.lat) && Number.isFinite(p.lng) &&
    categories.some(c => c.id === p.category) && p.name && p.sourceUrl && p.verifiedAt
  );
  let query = '';
  let enabledCategories = new Set(categories.map(c => c.id));
  let showAreas = true;
  let map = null;
  let areaLayer = null;
  let placeLayer = null;
  let areaMarkers = new Map();
  let placeMarkers = new Map();
  const countByCategory = id => places.filter(p => p.category === id).length;
  const escaped = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
  const normalized = value => String(value ?? '').toLocaleLowerCase('et');
  const matches = item => normalized([item.name, item.address, item.description].filter(Boolean).join(' ')).includes(normalized(query.trim()));
  const visibleAreas = () => showAreas ? areas.filter(matches) : [];
  const visiblePlaces = () => places.filter(p => enabledCategories.has(p.category) && matches(p));
  const statusText = p => ({avatud:'Avatud (kinnitust kontrollida)', planeeritud:'Planeeritud · ei pruugi avatud olla', suletud:'Suletud', teadmata:'Avatus teadmata'})[p.status] || 'Avatus teadmata';
  const setStatus = message => { $('map-status').textContent = message; };

  function renderFilters() {
    const selectedCount = visiblePlaces().length;
    $('verified-count').textContent = String(places.length);
    const areaButton = `<button type="button" class="filter-option ${showAreas ? 'active' : ''}" data-filter="asulad" aria-pressed="${showAreas}"><span class="filter-icon area-icon">●</span><span class="filter-name">Asulad</span><span class="filter-count">${areas.length}</span><span class="toggle-mark" aria-hidden="true">${showAreas ? '✓' : ''}</span></button>`;
    $('filter-list').innerHTML = areaButton + categories.map(c => `<button type="button" class="filter-option ${enabledCategories.has(c.id) ? 'active' : ''}" data-filter="${escaped(c.id)}" aria-pressed="${enabledCategories.has(c.id)}"><span class="filter-icon" style="--category-color:${escaped(c.color)}">${escaped(c.icon)}</span><span class="filter-name">${escaped(c.name)}</span><span class="filter-count">${countByCategory(c.id)}</span><span class="toggle-mark" aria-hidden="true">${enabledCategories.has(c.id) ? '✓' : ''}</span></button>`).join('');
    $('filter-list').querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.filter;
      if (id === 'asulad') showAreas = !showAreas;
      else if (enabledCategories.has(id)) enabledCategories.delete(id);
      else enabledCategories.add(id);
      render();
    }));
  }
  function renderList() {
    const filteredPlaces = visiblePlaces(), filteredAreas = visibleAreas();
    const all = [...filteredPlaces.map(p => ({...p, isArea:false})), ...filteredAreas.map(a => ({...a, isArea:true}))];
    $('list-heading').textContent = 'Kaardil kuvatavad kohad';
    $('list-count').textContent = String(all.length);
    if (!all.length) {
      $('place-list').innerHTML = `<div class="empty-result"><span aria-hidden="true">⌕</span><strong>Ühtegi vastet ei leitud</strong><p>Proovi teist otsingut või lülita kaardikihid sisse. Ametlikke kriisipunkte pole veel lisatud.</p></div>`;
      return;
    }
    $('place-list').innerHTML = all.map(item => `<button type="button" class="place-item" data-point="${escaped(item.id)}" data-is-area="${item.isArea}"><span class="place-item-icon ${item.isArea ? 'is-area' : ''}">${item.isArea ? '●' : '✳'}</span><span class="place-text"><strong>${escaped(item.name)}</strong><small>${item.isArea ? 'Asula · mitte kriisiabipunkt' : escaped(statusText(item))}</small></span><span class="place-item-arrow" aria-hidden="true">↗</span></button>`).join('');
    $('place-list').querySelectorAll('[data-point]').forEach(button => button.addEventListener('click', () => {
      if (!map) return setStatus('Kaart pole saadaval. Proovi uuesti internetiühendusega.');
      const isArea = button.dataset.isArea === 'true';
      const marker = (isArea ? areaMarkers : placeMarkers).get(button.dataset.point);
      if (marker) { map.setView(marker.getLatLng(), 12); marker.openPopup(); setStatus('Valitud: ' + button.querySelector('strong').textContent); }
    }));
  }
  function refreshMarkers() {
    if (!map) return;
    areaLayer.clearLayers(); placeLayer.clearLayers(); areaMarkers.clear(); placeMarkers.clear();
    visibleAreas().forEach(area => {
      const marker = L.circleMarker([area.lat, area.lng], { radius: 7, color:'#ffffff', weight:3, fillColor:'#235963', fillOpacity:1, bubblingMouseEvents:false });
      marker.bindTooltip(escaped(area.name), {direction:'top', offset:[0,-7]});
      marker.bindPopup(`<div class="popup-label">ASULA</div><strong>${escaped(area.name)}</strong><p>Asula ligikaudne keskpunkt. <b>Ei ole kriisiabipunkt.</b></p>`);
      marker.addTo(areaLayer); areaMarkers.set(area.id, marker);
    });
    visiblePlaces().forEach(p => {
      const category = categories.find(c => c.id === p.category);
      const marker = L.circleMarker([p.lat, p.lng], {radius: 10, color:'#fff', weight:3, fillColor: category.color, fillOpacity:1});
      let safeLink = '';
      try { const url = new URL(p.sourceUrl); if (url.protocol === 'https:') safeLink = `<a href="${escaped(url.href)}" target="_blank" rel="noopener noreferrer">Ava kinnitatud allikas ↗</a>`; } catch (_) { /* skip */ }
      marker.bindPopup(`<div class="popup-label">${escaped(category.name)}</div><strong>${escaped(p.name)}</strong><p>${escaped(p.address || '')}</p><p>${escaped(p.description || '')}</p><p><b>${escaped(statusText(p))}</b></p><small>Kontrollitud: ${escaped(p.verifiedAt)}</small><br>${safeLink}`);
      marker.addTo(placeLayer); placeMarkers.set(p.id, marker);
    });
  }
  function render() { renderFilters(); renderList(); refreshMarkers(); }
  function initMap() {
    if (typeof window.L === 'undefined') {
      $('map-fallback').hidden = false;
      $('map').style.display = 'none';
      setStatus('Kaarditeeki ei õnnestunud laadida. Veebilehe tekstiline info on endiselt kasutatav.');
      return;
    }
    try {
      map = L.map('map', { zoomControl:false, scrollWheelZoom:false, preferCanvas:true });
      const maruAttribution = 'Aluskaart: <a href="https://geoportaal.maaruum.ee/" target="_blank" rel="noopener noreferrer">Maa- ja Ruumiamet</a> (2026)';
      const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMapi kaastöölised</a>';
      // MaRu TMS (EPSG:3857, GMC) uses flipped Y coordinates (tms:true).
      // The documented TMS example uses '&ASUTUS=...' in the tile URL.
      // An app identifier is NOT a substitute for the official proxy/service-use terms.
      // For a public production deployment, agree the proxy/terms with Maa- ja Ruumiamet.
      const maruBase = 'https://tiles.maaamet.ee/tm/tms/1.0.0/';
      const maruId = '&ASUTUS=MULGI-KRIISIKAART&KESKKOND=TEST&IS=KRIISIKAART';
      const providers = {
        maa: { label:'Maa- ja Ruumiameti kaart',
          url:maruBase + 'kaart@GMC/{z}/{x}/{y}.png' + maruId,
          options:{tms:true, maxZoom:18, attribution:maruAttribution}},
        foto: { label:'Maa- ja Ruumiameti ortofoto',
          url:maruBase + 'foto@GMC/{z}/{x}/{y}.png' + maruId,
          options:{tms:true, maxZoom:18, attribution:maruAttribution}},
        osm: { label:'OpenStreetMap',
          url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          options:{maxZoom:18, attribution:osmAttribution, referrerPolicy:'strict-origin-when-cross-origin'}}
      };
      const basemapSelect = $('basemap-select');
      let basemap = null;
      let activeProvider = '';
      let errorCount = 0;
      let loadedAnyTile = false;
      const setBasemap = (id, automatic) => {
        const entry = providers[id];
        if (!entry || !map) return;
        if (basemap) {
          basemap.off();
          map.removeLayer(basemap);
        }
        activeProvider = id;
        errorCount = 0;
        loadedAnyTile = false;
        basemapSelect.value = id;
        basemap = L.tileLayer(entry.url, Object.assign({
          updateWhenIdle:true, keepBuffer:2, crossOrigin:false
        }, entry.options));
        basemap.on('tileload', () => { loadedAnyTile = true; });
        basemap.on('load', () => {
          if (loadedAnyTile && activeProvider === id) {
            setStatus('Aluskaart on laaditud: ' + entry.label + '.');
          }
        });
        basemap.on('tileerror', () => {
          if (activeProvider !== id) return;
          errorCount += 1;
          // Previously fall-back happened only if ZERO tiles loaded.
          // On the screenshot some tiles loaded and others failed, leaving grey squares.
          // One failed MaRu tile is enough to use a COMPLETE OpenStreetMap base layer
          // rather than keep a misleading patchwork of partially loaded map tiles.
          if (id !== 'osm') {
            setBasemap('osm', true);
          } else if (errorCount === 1) {
            setStatus('Kaardi osad ei laadi ka varukaardilt. Kontrolli internetiühendust või proovi hiljem uuesti. Valla kriisiteabe aadressid on eraldi tekstina saadaval.');
          }
        });
        // A stalled tile server may leave the layer blank without emitting tileerror.
        // Only fall back when there has been no successful tile at all.
        if (id !== 'osm') {
          const thisLayer = basemap;
          setTimeout(() => {
            if (basemap === thisLayer && !loadedAnyTile && map) {
              setBasemap('osm', true);
            }
          }, 6500);
        }
        basemap.addTo(map);
        setStatus(automatic
          ? 'Maa- ja Ruumiameti kaarditeenus ei laadinud. Kasutan varuvariandina OpenStreetMapi.'
          : 'Laen aluskaarti: ' + entry.label + '…');
      };
      basemapSelect.addEventListener('change', event => setBasemap(event.target.value, false));
      setBasemap('maa', false);
      L.control.zoom({position:'bottomright'}).addTo(map);
      areaLayer = L.layerGroup().addTo(map); placeLayer = L.layerGroup().addTo(map);
      map.setView([58.12,25.39], 10);
      refreshMarkers();
      // Leaflet does not always notice dimension changes in responsive layouts.
      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => {
          if (map) map.invalidateSize({pan:false, debounceMoveend:true});
        });
        observer.observe($('map'));
      }
      window.addEventListener('resize', () => {
        if (map) map.invalidateSize({pan:false, debounceMoveend:true});
      });
      const refreshMapSize = () => {
        if (map) map.invalidateSize({pan:false, debounceMoveend:true});
      };
      map.whenReady(() => {
        requestAnimationFrame(refreshMapSize);
        setTimeout(refreshMapSize, 300);
        setTimeout(refreshMapSize, 1000);
      });
      window.addEventListener('load', refreshMapSize);
      window.addEventListener('pageshow', refreshMapSize);
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) refreshMapSize();
      });
      $('fit-map').addEventListener('click', () => {
        if (areas.length) map.fitBounds(L.latLngBounds(areas.map(a => [a.lat,a.lng])).pad(0.25), {maxZoom:11});
      });
      $('my-location').addEventListener('click', () => {
        if (!navigator.geolocation) return setStatus('Sinu brauser ei toeta asukoha määramist.');
        setStatus('Asukoha küsimine…');
        navigator.geolocation.getCurrentPosition(position => {
          const {latitude, longitude, accuracy} = position.coords;
          map.setView([latitude,longitude],13);
          L.circle([latitude,longitude], {radius:accuracy, color:'#247c8a', fillOpacity:0.13}).addTo(map);
          setStatus('Sinu asukoht leitud. Asukoha andmeid ei saadeta selle veebilehe serverisse.');
        }, () => setStatus('Asukohta ei saanud määrata. Kontrolli brauseri luba ja internetiühendust.'), {enableHighAccuracy:false,timeout:12000,maximumAge:60000});
      });
      $('fit-map').click();
    } catch (error) {
      $('map-fallback').hidden = false;
      $('map').style.display = 'none';
      setStatus('Kaardi kuvamine ebaõnnestus. Kasuta tekstilist infot.');
    }
  }
  $('search-input').addEventListener('input', e => { query = e.target.value; render(); });
  render();
  initMap();
})();
