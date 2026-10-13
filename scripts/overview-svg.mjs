const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export function overviewFigure(key, copy, attributes) {
  const story = key === 'overview-story', marker = `${key}-arrow`;
  const edge = (d, kind='') => `<path d="${d}" class="overview-edge ${kind}" marker-end="url(#${marker})"/>`;
  const label = (x,y,text,kind='') => `<text x="${x}" y="${y}" text-anchor="middle" class="overview-link-label ${kind}">${esc(text)}</text>`;
  const node = (x,y,index,href,kind='') => `<a href="${href}" class="overview-node ${kind}"><rect x="${x-72}" y="${y-30}" width="144" height="60" rx="8"/><text x="${x}" y="${y-4}" text-anchor="middle" class="overview-node-title">${esc(copy.nodes[index][0])}</text><text x="${x}" y="${y+15}" text-anchor="middle" class="overview-node-detail">${esc(copy.nodes[index][1])}</text></a>`;
  const drawing = story ? [
    edge('M182 50 H258'),edge('M402 50 H478'),edge('M550 80 V210'),edge('M478 240 H402'),edge('M258 240 H182'),edge('M38 240 H15 V50 H38'),
    edge('M110 80 V116 H300 V210','overview-tools'),edge('M550 80 V148 H360 V210','overview-hours'),
    label(217,106,copy.links[0],'overview-tools'),label(465,138,copy.links[1],'overview-hours'),
    node(110,50,0,'/growth/','overview-ai'),node(330,50,1,'/story/'),node(550,50,2,'/work/'),node(550,240,3,'/careers/','overview-people'),node(330,240,4,'/research/'),node(110,240,5,'/growth/','overview-ai')
  ].join('') : [
    edge('M110 110 V38 H550 V110','overview-tools'),label(330,27,copy.links[0],'overview-tools'),
    edge('M182 131 H258'),label(220,98,copy.links[1]),edge('M258 163 H182'),label(220,187,copy.links[2]),
    edge('M478 147 H402','overview-hours'),label(440,131,copy.links[3],'overview-hours'),
    edge('M330 250 V170'),edge('M550 250 V170'),label(330,272,copy.links[4]),label(550,272,copy.links[5]),
    node(110,140,0,'/model/'),node(330,140,1,'/dynamics/','overview-ai'),node(550,140,2,'/dynamics/#value-kernel','overview-people')
  ].join('');
  return `<figure class="overview-figure" data-overview="${key}" ${attributes}><h3>${esc(copy.title)}</h3><div class="overview-figure-scroll"><svg viewBox="0 0 660 298" role="img" aria-label="${esc(copy.caption)}"><title>${esc(copy.title)}</title><defs><marker id="${marker}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1 L7 4 L1 7" fill="none" stroke="context-stroke" stroke-width="1.25"/></marker></defs>${drawing}</svg></div><figcaption class="figure-caption">${esc(copy.caption)}</figcaption></figure>`;
}
