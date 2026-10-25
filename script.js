const dialog = document.querySelector('dialog');
const image = dialog.querySelector('img');
const label = dialog.querySelector('p');
const names = ['Under the moon', 'Red sequins', 'Red beret'];

let current = 1;
let last;

function show(n) {
  current = (n + 2) % 3 + 1;
  image.src = `photo-${current}.webp`;
  image.alt = names[current - 1];
  label.textContent = `0${current} / ${names[current - 1]}`;
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
bookForm?.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(bookForm);
  const subject = `Shoot request: ${f.get('type')} — ${f.get('name')}`;
  const body = `Name: ${f.get('name')}\nEmail: ${f.get('email')}\nType: ${f.get('type')}\n\n${f.get('message') || ''}`;
  location.href = `mailto:briannaraephotography@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
