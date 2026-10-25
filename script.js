const dialog = document.querySelector('dialog');
const image = dialog.querySelector('img');
const label = dialog.querySelector('p');
const names = ['Second serving', '', 'Day job'];

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
