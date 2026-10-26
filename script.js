const dialog = document.querySelector('dialog');
const image = dialog.querySelector('img');
const label = dialog.querySelector('p');
const names = ['Second serving', 'Fringe benefits', 'Day job'];

let current = 1;
let last;

function show(n) {
  current = (n + 2) % 3 + 1;
  image.src = `photo-${current}.webp`;
  image.alt = names[current - 1] || `Photograph 0${current}`;
  label.textContent = names[current - 1] ? `0${current} / ${names[current - 1]}` : `0${current}`;
}

document.querySelectorAll('[data-photo]').forEach(button => {
  button.addEventListener('click', () => {
    last = button;
    show(Number(button.dataset.photo));
    dialog.showModal();
  });
});

dialog.querySelector('.close').onclick = () => dialog.close();
dialog.querySelector('.prev').onclick = () => show(current - 1);
dialog.querySelector('.next').onclick = () => show(current + 1);

dialog.addEventListener('close', () => last?.focus());

dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) {
      dialog.close();
    }
  }
});

dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') show(current + 1);
  if (event.key === 'ArrowLeft') show(current - 1);
});

const bookForm = document.getElementById('bookForm');
const bookStatus = document.getElementById('bookStatus');
bookForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = bookForm.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = 'SENDING…';
  try {
    const f = new FormData(bookForm);
    f.append('_subject', `Shoot request: ${f.get('type')} — ${f.get('name')}`);
    const r = await fetch(bookForm.action, { method: 'POST', body: f, headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error();
    bookForm.reset();
    bookStatus.textContent = 'Sent! Brianna will get back to you soon.';
    btn.textContent = 'SENT';
  } catch {
    bookStatus.innerHTML = 'That didn\'t go through. Try again, or email <a href="mailto:briannaraephotography@gmail.com">briannaraephotography@gmail.com</a>.';
    btn.disabled = false; btn.textContent = 'SEND REQUEST';
  }
});

// letters fall apart on hover
if (matchMedia('(hover:hover)').matches) {
  document.querySelectorAll('#title, .playing-card h3, .manifesto h2 > span').forEach(el => {
    el.classList.add('split');
    el.innerHTML = [...el.textContent].map(c => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    const kids = [...el.children];
    el.addEventListener('mouseenter', () => kids.forEach(s => {
      const r = () => Math.random() * 2 - 1;
      s.style.transform = `translate(${r()*8}px,${r()*12}px) rotate(${r()*14}deg)`;
    }));
    el.addEventListener('mouseleave', () => kids.forEach(s => s.style.transform = ''));
  });
}

// envelope intro
const gate = document.getElementById('gate');
const envBtn = document.getElementById('envBtn');
const openEnv = e => { if (e.target.closest('.env-cal')) return;
  gate.classList.add('open');
  setTimeout(() => { document.body.classList.remove('gated'); gate.remove(); }, 3100);
};
envBtn?.addEventListener('click', openEnv);
envBtn?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnv(e); } });

// reveal on scroll
const rv = document.querySelectorAll('main > section:not(.hero), .reveal');
rv.forEach(el => el.classList.add('reveal'));
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
rv.forEach(el => io.observe(el));
