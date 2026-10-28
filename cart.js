// Dazzle bag: a small cart shared by the shop and the wall page.
// Lines: {k:'print', title, size, price, img, qty}  or  {k:'bundle', titles:[3], imgs:[3], price:15, qty}
(() => {
  const KEY = 'dz_bag_v1';
  const SIZE = { '4x6': '4×6 print', '5x7': '5×7 print', framed: 'Framed original · pick up' };
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  let bag = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) {} render(); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const total = () => bag.reduce((t, l) => t + l.price * l.qty, 0);
  const count = () => bag.reduce((t, l) => t + l.qty, 0);

  const css = `
  .dz-fab{position:fixed;right:18px;bottom:18px;z-index:50;display:flex;align-items:center;gap:8px;background:#161729;color:#efe2c8;border:0;padding:13px 18px;font:700 11px var(--sans,sans-serif);letter-spacing:2px;text-transform:uppercase;box-shadow:4px 4px 0 #525b8b;cursor:pointer;transition:transform .2s}
  .dz-fab:hover{transform:translate(-1px,-1px)}.dz-fab b{background:#efe2c8;color:#161729;min-width:20px;height:20px;display:grid;place-items:center;border-radius:10px;font-size:11px;letter-spacing:0}
  .dz-fab.bump{animation:dzb .45s}@keyframes dzb{40%{transform:scale(1.12)}}
  .dz-veil{position:fixed;inset:0;background:rgba(10,10,20,.5);z-index:60;opacity:0;pointer-events:none;transition:opacity .3s}
  .dz-veil.on{opacity:1;pointer-events:auto}
  .dz-drawer{position:fixed;top:0;right:0;height:100%;width:min(400px,100vw);z-index:61;background:#f8efdc url(paper-cream.jpg) center/cover;color:#161729;display:flex;flex-direction:column;transform:translateX(105%);transition:transform .35s cubic-bezier(.2,.8,.2,1);box-shadow:-10px 0 40px rgba(0,0,0,.25)}
  .dz-drawer.on{transform:none}
  .dz-head{display:flex;justify-content:space-between;align-items:center;padding:20px 22px;border-bottom:1px solid #16172922}
  .dz-head h3{margin:0;font:800 22px var(--display,serif);letter-spacing:1px;text-transform:uppercase}
  .dz-x{background:none;border:0;font:600 11px var(--sans,sans-serif);letter-spacing:2px;text-transform:uppercase;cursor:pointer;color:#161729;padding:8px}
  .dz-list{flex:1;overflow:auto;padding:8px 22px}
  .dz-line{display:grid;grid-template-columns:64px 1fr auto;gap:12px;align-items:center;padding:14px 0;border-bottom:1px dashed #16172933}
  .dz-th{width:64px;height:80px;object-fit:cover;background:#1a1b2e;display:block}
  .dz-trio{display:grid;grid-template-columns:1fr 1fr;gap:2px;width:64px;height:80px}.dz-trio img{width:100%;height:100%;object-fit:cover}.dz-trio img:first-child{grid-row:span 2}
  .dz-name{font:700 14px var(--display,serif);letter-spacing:1px;text-transform:uppercase;margin:0 0 3px}
  .dz-meta{font:500 12px var(--sans,sans-serif);color:#5f5546;margin:0}
  .dz-qty{display:flex;align-items:center;gap:8px;margin-top:8px;font:600 12px var(--sans,sans-serif)}
  .dz-qty button{width:24px;height:24px;border:1px solid #16172966;background:transparent;cursor:pointer;font:600 14px var(--sans,sans-serif);color:#161729;line-height:1}
  .dz-rm{background:none;border:0;font:600 10px var(--sans,sans-serif);letter-spacing:1.5px;text-transform:uppercase;color:#6b1a2b;cursor:pointer;padding:0;margin-left:6px}
  .dz-qty .dz-rm{width:auto;height:auto;border:0;background:none;font:600 10px var(--sans,sans-serif);letter-spacing:1.5px;color:#6b1a2b}
  .dz-price{font:700 14px var(--sans,sans-serif)}
  .dz-empty{text-align:center;padding:50px 10px;font:500 14px var(--sans,sans-serif);color:#5f5546}
  .dz-foot{padding:18px 22px 22px;border-top:1px solid #16172922}
  .dz-tot{display:flex;justify-content:space-between;font:800 18px var(--display,serif);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px}
  .dz-note{font:500 11px var(--sans,sans-serif);color:#5f5546;margin:0 0 14px;line-height:1.5}
  .dz-go{width:100%;background:#161729;color:#efe2c8;border:0;padding:15px;font:700 12px var(--sans,sans-serif);letter-spacing:2px;text-transform:uppercase;cursor:pointer;box-shadow:4px 4px 0 #525b8b}
  .dz-go[disabled]{opacity:.6;cursor:default}
  .dz-err{color:#6b1a2b;font:600 12px var(--sans,sans-serif);margin:10px 0 0;text-align:center}
  .dz-toast{position:fixed;left:50%;bottom:84px;transform:translate(-50%,20px);opacity:0;z-index:70;background:#161729;color:#efe2c8;padding:11px 16px;font:600 12px var(--sans,sans-serif);letter-spacing:1px;transition:.3s;pointer-events:none;white-space:nowrap}
  .dz-toast.on{opacity:1;transform:translate(-50%,0)}
  .dz-bbar{position:fixed;left:0;right:0;bottom:0;z-index:55;background:#161729;color:#efe2c8;padding:12px 16px;display:flex;align-items:center;gap:12px;transform:translateY(110%);transition:transform .3s}
  .dz-bbar.on{transform:none}
  .dz-bbar .slots{display:flex;gap:6px}.dz-bbar .slot{width:40px;height:50px;border:1px dashed #efe2c888;background:#ffffff10 center/cover}
  .dz-bbar .lbl{flex:1;font:600 12px var(--sans,sans-serif);letter-spacing:1px}
  .dz-bbar .lbl b{display:block;font:800 15px var(--display,serif);letter-spacing:1px;text-transform:uppercase}
  .dz-bbar button{background:none;border:1px solid #efe2c866;color:#efe2c8;font:600 10px var(--sans,sans-serif);letter-spacing:1.5px;text-transform:uppercase;padding:9px 12px;cursor:pointer}
  .dz-pick{position:absolute;inset:auto 8px 8px 8px;z-index:3;background:#efe2c8;color:#161729;border:0;padding:10px;font:700 10px var(--sans,sans-serif);letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;box-shadow:3px 3px 0 #161729;display:none}
  body.dz-bmode .dz-pick{display:block}
  body.dz-bmode .item.picked .ph{outline:4px solid #525b8b;outline-offset:-4px}
  body.dz-bmode .item.picked .dz-pick{background:#525b8b;color:#efe2c8}
  body.dz-bmode .dz-fab{bottom:92px}`;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
  document.body.insertAdjacentHTML('beforeend', `
    <button class="dz-fab" type="button" aria-label="Open bag">Bag <b>0</b></button>
    <div class="dz-veil"></div>
    <aside class="dz-drawer" aria-label="Your bag" aria-hidden="true">
      <div class="dz-head"><h3>Your bag</h3><button class="dz-x" type="button">Close ×</button></div>
      <div class="dz-list"></div>
      <div class="dz-foot"><div class="dz-tot"><span>Total</span><span class="dz-sum">$0</span></div>
      <p class="dz-note"></p>
      <button class="dz-go" type="button">Checkout</button><p class="dz-err" hidden></p></div>
    </aside>
    <div class="dz-bbar" role="region" aria-label="Bundle builder"><div class="slots"><span class="slot"></span><span class="slot"></span><span class="slot"></span></div>
      <div class="lbl"><b>Bundle · $15</b><span class="cnt">Pick 3 prints (4×6)</span></div><button type="button" class="cancel">Cancel</button></div>
    <div class="dz-toast" role="status"></div>`);

  const $ = s => document.querySelector(s);
  const fab = $('.dz-fab'), veil = $('.dz-veil'), drawer = $('.dz-drawer'), list = $('.dz-list');
  const open = () => { drawer.classList.add('on'); veil.classList.add('on'); drawer.setAttribute('aria-hidden', 'false'); };
  const close = () => { drawer.classList.remove('on'); veil.classList.remove('on'); drawer.setAttribute('aria-hidden', 'true'); };
  fab.onclick = open; veil.onclick = close; $('.dz-x').onclick = close;
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  let tt; const toast = m => { const t = $('.dz-toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 1800); };

  function render() {
    fab.querySelector('b').textContent = count();
    $('.dz-sum').textContent = '$' + total();
    $('.dz-go').disabled = !bag.length;
    const framed = bag.some(l => l.size === 'framed'), shipped = bag.some(l => l.k === 'bundle' || l.size !== 'framed');
    $('.dz-note').textContent = [shipped ? 'Unframed prints ship to you — address at checkout.' : '', framed ? 'Framed originals are picked up at Wild Tulips.' : ''].filter(Boolean).join(' ');
    if (!bag.length) { list.innerHTML = '<p class="dz-empty">Your bag is empty.</p>'; return; }
    list.innerHTML = bag.map((l, i) => l.k === 'bundle' ? `
      <div class="dz-line"><div class="dz-trio">${l.imgs.map(s => `<img src="${esc(s)}" alt="">`).join('')}</div>
        <div><p class="dz-name">Bundle of 3</p><p class="dz-meta">${l.titles.map(esc).join(' · ')}<br>4×6 prints</p>
        <div class="dz-qty"><button class="dz-rm" data-rm="${i}">Remove</button></div></div>
        <div class="dz-price">$${l.price}</div></div>` : `
      <div class="dz-line"><img class="dz-th" src="${esc(l.img)}" alt="">
        <div><p class="dz-name">${esc(l.title)}</p><p class="dz-meta">${esc(SIZE[l.size] || l.size)}${l.size === 'framed' && l.card ? ' · ' + esc(l.card) : ''}</p>
        <div class="dz-qty">${l.size === 'framed' ? '' : `<button data-dec="${i}" aria-label="Fewer">−</button><span>${l.qty}</span><button data-inc="${i}" aria-label="More">+</button>`}<button class="dz-rm" data-rm="${i}">Remove</button></div></div>
        <div class="dz-price">$${l.price * l.qty}</div></div>`).join('');
  }
  list.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.rm != null) bag.splice(+b.dataset.rm, 1);
    if (b.dataset.inc != null) bag[+b.dataset.inc].qty = Math.min(10, bag[+b.dataset.inc].qty + 1);
    if (b.dataset.dec != null) { const l = bag[+b.dataset.dec]; l.qty--; if (l.qty < 1) bag.splice(+b.dataset.dec, 1); }
    save();
  });

  // Add to bag
  document.addEventListener('click', e => {
    const b = e.target.closest('.buy'); if (!b) return;
    e.preventDefault();
    if (!b.dataset.size) return;
    if (b.dataset.direct) { payNow(b, [{ k: 'print', title: b.dataset.title, size: b.dataset.size, qty: 1 }]); return; }
    const { title, size, img } = b.dataset, price = +b.dataset.price;
    if (size === 'framed' && bag.some(l => l.title === title && l.size === 'framed')) { toast('That original is already in your bag'); open(); return; }
    const hit = bag.find(l => l.k === 'print' && l.title === title && l.size === size);
    if (hit) hit.qty = Math.min(10, hit.qty + 1);
    else bag.push({ k: 'print', title, size, price, img, qty: 1, card: size === 'framed' && typeof CARD !== 'undefined' && CARD[title] ? CARD[title][0] : '' });
    save();
    fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump');
    toast(`Added: ${title} · ${SIZE[size].split(' ·')[0]}`);
  });

  // Bundle builder
  let picks = [];
  const bbar = $('.dz-bbar');
  const items = () => [...document.querySelectorAll('#grid .item')];
  const titleOf = it => it.querySelector('h2').textContent.trim();
  const imgOf = it => (it.querySelector('.ph img') || {}).getAttribute?.('src') || '';
  function setup() {
    items().forEach(it => {
      if (it.querySelector('.dz-pick')) return;
      const ph = it.querySelector('.ph');
      ph.insertAdjacentHTML('beforeend', '<button type="button" class="dz-pick">Add to bundle</button>');
      ph.querySelector('.dz-pick').onclick = ev => {
        ev.stopPropagation();
        const t = titleOf(it), at = picks.findIndex(p => p.title === t);
        if (at > -1) picks.splice(at, 1); else if (picks.length < 3) picks.push({ title: t, img: imgOf(it), el: it });
        drawB();
        if (picks.length === 3) {
          bag.push({ k: 'bundle', titles: picks.map(p => p.title), imgs: picks.map(p => p.img), price: 15, qty: 1 });
          save(); endB(); toast('Bundle added to your bag'); open();
        }
      };
    });
  }
  function drawB() {
    items().forEach(it => it.classList.toggle('picked', picks.some(p => p.el === it)));
    items().forEach(it => { const b = it.querySelector('.dz-pick'); if (b) b.textContent = it.classList.contains('picked') ? '✓ In bundle' : 'Add to bundle'; });
    bbar.querySelectorAll('.slot').forEach((s, i) => s.style.backgroundImage = picks[i] ? `url("${picks[i].img}")` : '');
    bbar.querySelector('.cnt').textContent = picks.length ? `${picks.length} of 3 picked` : 'Pick 3 prints (4×6)';
  }
  function startB() { setup(); picks = []; drawB(); document.body.classList.add('dz-bmode'); bbar.classList.add('on'); close(); document.getElementById('grid').scrollIntoView({ behavior: 'smooth' }); }
  function endB() { picks = []; drawB(); document.body.classList.remove('dz-bmode'); bbar.classList.remove('on'); }
  bbar.querySelector('.cancel').onclick = endB;
  const bb = document.getElementById('bundleBtn'); if (bb) bb.onclick = e => { e.preventDefault(); startB(); };

  // Checkout: the server re-prices everything from its own catalog.
  $('.dz-go').onclick = async () => {
    const go = $('.dz-go'), err = $('.dz-err');
    go.disabled = true; go.textContent = 'Opening checkout…'; err.hidden = true;
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines: bag.map(l => l.k === 'bundle' ? { k: 'bundle', titles: l.titles } : { k: 'print', title: l.title, size: l.size, qty: l.qty }), from: location.pathname.includes('wall') ? 'wall' : 'shop' }) });
      const d = await r.json();
      if (d.url) { location.href = d.url; return; }
      throw new Error(d.error === 'not_configured' ? 'Online checkout opens very soon. In the gallery? Ask an employee.' : (d.message || 'Checkout could not start. Please try again.'));
    } catch (e) { err.textContent = e.message; err.hidden = false; go.disabled = false; go.textContent = 'Checkout'; }
  };

  async function payNow(btn, lines) {
    const old = btn.textContent; btn.textContent = 'Opening secure checkout…'; btn.setAttribute('aria-busy', 'true');
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lines, from: 'wall' }) });
      const d = await r.json();
      if (d.url) { location.href = d.url; return; }
      toast(d.message || 'Checkout could not start. Please try again.');
    } catch (e) { toast('Checkout could not start. Please try again.'); }
    btn.textContent = old; btn.removeAttribute('aria-busy');
  }

  // Came back from a cancelled checkout: reopen the bag. Paid: clear it.
  const q = new URLSearchParams(location.search);
  if (q.get('bag') === 'open') setTimeout(open, 300);
  if (/paid\.html/.test(location.pathname)) { bag = []; save(); }
  render();
})();
