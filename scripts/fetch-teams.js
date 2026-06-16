#!/usr/bin/env node
// Descarga plantillas de Wikipedia para cada equipo listado en teams_source.json
// Requisitos: Node 18+ (fetch integrado) y opcionalmente 'node-html-parser'

const fs = require('fs');
const path = require('path');

const { parse } = (() => {
  try {
    return require('node-html-parser');
  } catch (e) {
    return { parse: null };
  }
})();

async function wikiSearch(team) {
  // Mapeo manual de nombres de equipos a títulos canónicos de Wikipedia
  const manualTitleMap = {
    'England': "England national football team",
    'Japan': "Japan national football team",
    'South Korea': "South Korea national football team",
    'Korea Republic': "South Korea national football team",
    'United States': "United States men's national soccer team",
    'USA': "United States men's national soccer team",
    'Mexico': "Mexico national football team",
    'Brazil': "Brazil national football team",
    'Germany': "Germany national football team",
    'France': "France national football team",
    'Spain': "Spain national football team",
    'Italy': "Italy national football team",
    'Netherlands': "Netherlands national football team",
    'Holland': "Netherlands national football team",
    'Portugal': "Portugal national football team",
    'Belgium': "Belgium national football team",
    'Argentina': "Argentina national football team",
    'Chile': "Chile national football team",
    'Colombia': "Colombia national football team",
    'Australia': "Australia national soccer team",
    'Uruguay': "Uruguay national football team",
    'Ecuador': "Ecuador national football team",
    'Peru': "Peru men's national football team",
    'Bolivia': "Bolivia national football team",
    'Paraguay': "Paraguay national football team",
    'Venezuela': "Venezuela national football team",
    'Iran': "Iran national football team",
    'Saudi Arabia': "Saudi Arabia national football team",
    'United Arab Emirates': "United Arab Emirates national football team",
    'Iraq': "Iraq national football team",
    'Morocco': "Morocco national football team",
    'Tunisia': "Tunisia national football team",
    'Nigeria': "Nigeria national football team",
    'Senegal': "Senegal national football team",
    'Cameroon': "Cameroon national football team",
    'Ghana': "Ghana national football team",
    'Egypt': "Egypt men's national football team",
    'Switzerland': "Switzerland men's national football team",
    'Austria': "Austria national football team",
    'Poland': "Poland national football team",
    'Croatia': "Croatia national football team",
    'Denmark': "Denmark national football team",
    'Sweden': "Sweden national football team",
    'Norway': "Norway national football team",
    'Turkey': "Turkey national football team",
    'Czech Republic': "Czech Republic national football team",
    'Scotland': "Scotland national football team",
  };
  if (manualTitleMap[team]) return manualTitleMap[team];
  // Intentar primero títulos comunes de selecciones nacionales
  const candidates = [
    `${team} men's national soccer team`,
    `${team} men's national football team`,
    `${team} national soccer team`,
    `${team} national football team`,
    `${team} national football team (men's)`,
    `${team} national team`,
  ];

  for (const c of candidates) {
    try {
      const html = await fetchPageHtml(c);
      if (html && /squad|Current squad|Players|No\.|Pos|Appearances/i.test(html)) return c;
    } catch (e) {
      // ignorar
    }
  }

  // Alternativa: usar la API de búsqueda
  const queries = [`${team} 2026 FIFA World Cup squad`, `${team} squad`, `${team} national football team squad`];
  for (const qRaw of queries) {
    const q = encodeURIComponent(qRaw);
    const url = `https://en.wikipedia.org/w/rest.php/v1/search/title?q=${q}&limit=1`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'mi-primer-next-script/1.0' } });
      const data = await res.json();
      const page = data && (data.pages && data.pages[0]) || (data.results && data.results[0]) || (data.items && data.items[0]);
      if (page && page.title) return page.title;
    } catch (err) {
      // continue to next query
    }
  }
  return null;
}

async function fetchFromFifa(team) {
  // Try FIFA search page and pick a team page if present
  const searchUrls = [
    `https://www.fifa.com/fifaplus/es/search?q=${encodeURIComponent(team)}`,
    `https://www.fifa.com/search/?q=${encodeURIComponent(team)}`,
  ];
  for (const url of searchUrls) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'mi-primer-next-script/1.0' } });
      if (!res.ok) continue;
      const html = await res.text();
      if (!parse) continue;
      const root = parse(html);
      const anchors = root.querySelectorAll('a');
      for (const a of anchors) {
        const href = a.getAttribute('href') || '';
        if (/fifaplus\/es\/teams\/.+\/squad|fifaplus\/es\/teams\//i.test(href) || /fifaplus\/en\/teams\/.+\/squad|fifaplus\/en\/teams\//i.test(href) || /\/teams\//i.test(href)) {
          // Construir URL absoluto
          const abs = href.startsWith('http') ? href : `https://www.fifa.com${href}`;
          return abs;
        }
      }
    } catch (e) {
      // ignorar y continuar
    }
  }
  return null;
}

async function fetchFifaPlayers(teamUrl) {
  try {
    const res = await fetch(teamUrl, { headers: { 'User-Agent': 'mi-primer-next-script/1.0' } });
    if (!res.ok) return [];
    const html = await res.text();
    if (!parse) return [];
    const root = parse(html);
    // Try common selectors for player lists
    const possible = [];
    // Look for lists
    const lis = root.querySelectorAll('li');
    for (const li of lis) {
      const txt = li.text.trim();
      if (txt && txt.length > 3 && txt.split(' ').length <= 4) possible.push(txt.replace(/\[[^\]]+\]/g, '').trim());
    }
    if (possible.length >= 11) return Array.from(new Set(possible)).slice(0, 30);
    // Try tables
    const tables = root.querySelectorAll('table');
    for (const t of tables) {
      const rows = t.querySelectorAll('tr');
      const found = [];
      for (const r of rows) {
        const cells = r.querySelectorAll('td');
        if (cells.length) {
          const text = cells.map(c => c.text.trim()).join(' ');
          if (text && text.length > 3 && /[A-Za-z]/.test(text)) found.push(text.replace(/\[[^\]]+\]/g, '').trim());
        }
      }
      if (found.length) return Array.from(new Set(found)).slice(0, 30);
    }
    return [];
  } catch (err) {
    return [];
  }
}

async function fetchPageHtml(title) {
  const url = `https://es.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'mi-primer-next-script/1.0' } });
  if (!res.ok) return null;
  return await res.text();
}

function extractPlayersFromHtml(html) {
  if (!html) return [];
  if (!parse) {
    // fallback: regex for list items
    const liRegex = /<li[^>]*>(.*?)<\/li>/g;
    const players = new Set();
    let m;
    while ((m = liRegex.exec(html)) !== null) {
      const text = m[1].replace(/<[^>]+>/g, '').trim();
      if (isLikelyPlayerName(text)) players.add(text);
    }
    return Array.from(players).slice(0, 30);
  }

  const root = parse(html);

  // 1) Buscar secciones con encabezados 'Current squad' / 'Squad' y parsear el siguiente nodo
  const headers = root.querySelectorAll('h2, h3, h4, h5');
  for (const h of headers) {
    const htxt = (h.text || '').trim();
    if (/Current squad|Current team|Squad|Players|Selección actual/i.test(htxt)) {
      let node = h.nextElementSibling;
      while (node) {
        const tag = (node.tagName || '').toLowerCase();
        if (tag === 'ul' || tag === 'ol') {
          const lis = node.querySelectorAll('li');
          const found = [];
          for (const li of lis) {
            const txt = li.text.trim().replace(/\[[^\]]+\]/g, '');
            if (isLikelyPlayerName(txt)) found.push(txt);
          }
          if (found.length) return Array.from(new Set(found)).slice(0, 30);
        }
        if (tag === 'table') {
          const rows = node.querySelectorAll('tr');
          const found = [];
          for (const r of rows) {
            // prefer link text inside row (players often link to wiki)
            const links = r.querySelectorAll('a');
            for (const a of links) {
              const txt = a.text.trim();
              if (isLikelyPlayerName(txt)) found.push(txt);
            }
            // fallback: last cell text
            if (!found.length) {
              const cells = r.querySelectorAll('td');
              if (cells.length) {
                const txt = cells[cells.length - 1].text.trim().replace(/\[[^\]]+\]/g, '');
                if (isLikelyPlayerName(txt)) found.push(txt);
              }
            }
          }
          if (found.length) return Array.from(new Set(found)).slice(0, 30);
        }
        node = node.nextElementSibling;
      }
    }
  }

  // 2) Buscar tablas en general que parezcan contener jugadores
  const tables = root.querySelectorAll('table');
  for (const t of tables) {
    const header = t.querySelector('th');
    if (header && /Player|No\.|Pos|Squad|Position/i.test(header.text)) {
      const rows = t.querySelectorAll('tr');
      const players = [];
      for (const r of rows) {
        const links = r.querySelectorAll('a');
        for (const a of links) {
          const txt = a.text.trim();
          if (isLikelyPlayerName(txt)) players.push(txt);
        }
      }
      if (players.length) return Array.from(new Set(players)).slice(0, 30);
    }
  }

  // 3) Fallback general: listas 'li'
  const lis = root.querySelectorAll('li');
  const found = [];
  for (const li of lis) {
    const txt = li.text.trim().replace(/\[[^\]]+\]/g, '');
    if (isLikelyPlayerName(txt)) found.push(txt);
  }
  return Array.from(new Set(found)).slice(0, 30);
}

function isLikelyPlayerName(txt) {
  if (!txt || txt.length < 4) return false;
  // Excluir líneas que contienen palabras típicas de clubes o formatos no personales
  const clubWords = /\b(FC|SC|Sporting|Deportivo|Club|United|City|CF|CD|Atletico|Real|AFC|BSC|Academy)\b/i;
  if (clubWords.test(txt)) return false;
  // Evitar entradas con demasiadas palabras (probablemente frases o descripciones)
  const words = txt.split(/\s+/).filter(Boolean);
  if (words.length > 5) return false;
  // Aceptar si tiene dos o tres palabras con mayúscula inicial
  const capWords = words.filter(w => /^[A-ZÁÉÍÓÚÑÄÖÜ]/.test(w));
  return capWords.length >= 1 && words.length <= 4;
}

async function main() {
  const srcPath = path.join(__dirname, '..', 'teams_source.json');
  if (!fs.existsSync(srcPath)) {
    console.error('No teams_source.json encontrado en la raíz. Crea el archivo con una lista de equipos.');
    process.exit(1);
  }

  const raw = fs.readFileSync(srcPath, 'utf8');
  const teamsList = JSON.parse(raw);
  const results = [];

  for (const t of teamsList) {
    const name = t.name;
    console.log(`Buscando plantilla para: ${name}`);
    try {
      // Intentar extraer desde FIFA primero
      let players = [];
      let source = null;
      let sourceUrl = null;
      const fifaUrl = await fetchFromFifa(name);
      if (fifaUrl) {
        console.log(`  -> intentando FIFA: ${fifaUrl}`);
        players = await fetchFifaPlayers(fifaUrl);
        console.log(`  -> jugadores FIFA extraídos: ${players.length}`);
        if (players && players.length) {
          source = 'fifa';
          sourceUrl = fifaUrl;
        }
      }

      // Si FIFA no dio resultados, fallback a Wikipedia
      if (!players || players.length === 0) {
        const title = await wikiSearch(name);
        if (!title) {
          console.warn(`No se encontró página de Wikipedia para ${name}`);
          results.push({ name, players: [], source: null, sourceUrl: null });
          // pequeño retardo
          await new Promise((r) => setTimeout(r, 500));
          continue;
        }
        console.log(`  -> Wikipedia página: ${title}`);
        const html = await fetchPageHtml(title);
        players = extractPlayersFromHtml(html);
        console.log(`  -> jugadores Wikipedia extraídos: ${players.length}`);
        if (players && players.length) {
          source = 'wikipedia';
          sourceUrl = title;
        }
      }

      results.push({ name, players, source, sourceUrl });
      // pequeño retardo para no sobrecargar la API
      await new Promise((r) => setTimeout(r, 800));
    } catch (err) {
      console.error('Error al procesar', name, err.message);
      results.push({ name, players: [] });
    }
  }

  const outPath = path.join(__dirname, '..', 'src', 'data', 'teams.ts');
  const content = `// Este archivo fue generado automaticamente por scripts/fetch-teams.js\nexport const teams = ${JSON.stringify(results, null, 2)} as const;\n`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, 'utf8');
  console.log('Archivo generado en', outPath);

  const pagesPath = path.join(__dirname, '..', 'teams_pages.json');
  const pages = results.map((r) => ({ name: r.name, source: r.source || null, sourceUrl: r.sourceUrl || null, playersCount: (r.players && r.players.length) || 0 }));
  fs.writeFileSync(pagesPath, JSON.stringify(pages, null, 2), 'utf8');
  console.log('Archivo de revisión generado en', pagesPath);
}

main();
