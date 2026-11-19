/* Blueprint Archive: lightweight interactions, no framework required. */
document.documentElement.classList.add('js');

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function activateFloor(floor) {
  $$('.floor-rail a[data-floor]').forEach(link => {
    if (link.dataset.floor === floor) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  $$('.shaft-floor').forEach(link => link.classList.toggle('shaft-floor-active', link.dataset.shaft === floor));
}

const observedFloors = $$('.observed');
if ('IntersectionObserver' in window) {
  const floorObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) activateFloor(entry.target.dataset.floor);
    });
  }, { rootMargin: '-32% 0px -52% 0px', threshold: 0 });
  observedFloors.forEach(section => floorObserver.observe(section));
} else {
  activateFloor('00');
}

if ('IntersectionObserver' in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -35px 0px' });
  $$('.reveal').forEach(element => revealObserver.observe(element));
} else {
  $$('.reveal').forEach(element => element.classList.add('is-visible'));
}

const progress = $('#progress');
let progressFrame = 0;
function updateProgress() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const percent = available > 0 ? Math.min(100, Math.max(0, window.scrollY / available * 100)) : 0;
  progress.style.width = percent + '%';
  progressFrame = 0;
}
function scheduleProgress() {
  if (!progressFrame) progressFrame = window.requestAnimationFrame(updateProgress);
}
window.addEventListener('scroll', scheduleProgress, { passive: true });
window.addEventListener('resize', scheduleProgress);
updateProgress();

$$('[data-open-dialog]').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const dialog = document.getElementById(trigger.dataset.openDialog);
    if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
  });
});
$$('[data-close-dialog]').forEach(trigger => {
  trigger.addEventListener('click', () => trigger.closest('dialog')?.close());
});
$$('dialog.project-dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
});

const form = $('#brief-form');
const formStatus = $('#form-status');
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.focus();
  field.select();
  const success = document.execCommand('copy');
  field.remove();
  if (!success) throw new Error('Copy unavailable');
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  formStatus.textContent = '';
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const data = new FormData(form);
  const brief = [
    'BLUEPRINT / PROJECT BRIEF',
    '',
    'Name: ' + String(data.get('name')).trim(),
    'Email: ' + String(data.get('email')).trim(),
    'Type: ' + String(data.get('type')).trim(),
    '',
    'Project details:',
    String(data.get('details')).trim()
  ].join('\n');
  try {
    await copyText(brief);
    formStatus.textContent = 'Brief copied. No information was submitted or stored by this site.';
  } catch (error) {
    formStatus.textContent = 'Automatic copy was blocked. Select and copy the details above manually.';
  }
});
