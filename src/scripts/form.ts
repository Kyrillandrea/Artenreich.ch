import {
  buildMailto,
  inquirySubject,
  inquiryToText,
  normalizeInquiry,
  validateInquiry,
  type InquiryErrors,
  type InquiryField,
} from '../lib/inquiry';

const ORDER: InquiryField[] = ['name', 'email', 'projekt', 'telefon', 'zeitrahmen'];
const LABELS: Record<string, string> = {
  name: 'Name',
  email: 'E-Mail',
  projekt: 'Projektart',
  telefon: 'Telefon',
  zeitrahmen: 'Zeitrahmen',
};

export function initInquiryForms(): void {
  const forms = document.querySelectorAll<HTMLFormElement>('[data-inquiry-form]');
  forms.forEach(setup);
  if (forms.length) initPreselect(forms[0]);
}

/** Naturpool-CTAs (und andere) wählen die passende Projektart vor. */
function initPreselect(form: HTMLFormElement): void {
  const choose = (value: string | null) => {
    if (!value) return;
    const radio = form.querySelector<HTMLInputElement>(`input[name="projekt"][value="${CSS.escape(value)}"]`);
    if (radio) radio.checked = true;
  };
  choose(new URLSearchParams(window.location.search).get('projekt'));

  document.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-projekt]');
    if (!link) return;
    const url = new URL(link.href, window.location.href);
    if (url.pathname === window.location.pathname && url.hash === '#anfrage') {
      choose(link.dataset.projekt ?? null);
    }
  });
}

function setup(form: HTMLFormElement): void {
  form.noValidate = true;
  const loadedAt = performance.now();
  const summary = form.querySelector<HTMLElement>('[data-error-summary]')!;
  const summaryList = form.querySelector<HTMLUListElement>('[data-error-list]')!;
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]')!;
  const elapsed = form.querySelector<HTMLInputElement>('[data-elapsed]')!;
  const mailto = form.querySelector<HTMLAnchorElement>('[data-mailto]')!;
  const mailTo = form.dataset.mailTo ?? 'info@artenreich.ch';
  summary.setAttribute('aria-labelledby', summary.querySelector('h3')?.id ?? '');

  const read = () => normalizeInquiry(Object.fromEntries(new FormData(form).entries()));
  const touched = new Set<InquiryField>();

  const fieldControl = (name: InquiryField) =>
    form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`);

  const showFieldErrors = (errors: InquiryErrors, only?: Set<InquiryField>) => {
    for (const name of ORDER) {
      if (only && !only.has(name)) continue;
      const message = errors[name];
      const holder = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
      const controls = form.querySelectorAll<HTMLInputElement>(`[name="${name}"]`);
      if (holder) {
        holder.textContent = message ?? '';
        holder.hidden = !message;
      }
      controls.forEach((c) => {
        if (message) c.setAttribute('aria-invalid', 'true');
        else c.removeAttribute('aria-invalid');
      });
    }
  };

  const showSummary = (errors: InquiryErrors) => {
    summaryList.replaceChildren();
    const names = ORDER.filter((n) => errors[n]);
    for (const name of names) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      const control = fieldControl(name);
      a.href = `#${control?.id ?? ''}`;
      a.textContent = `${LABELS[name]}: ${errors[name]}`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        control?.focus();
      });
      li.append(a);
      summaryList.append(li);
    }
    summary.hidden = names.length === 0;
    return names;
  };

  // Inline-Validierung: erst nach dem Verlassen eines Feldes, danach bei jeder Eingabe
  form.addEventListener('focusout', (event) => {
    const target = event.target as HTMLInputElement;
    const name = target.name as InquiryField;
    if (!ORDER.includes(name) || target.type === 'radio') return;
    if (!target.value && !touched.has(name)) return;
    touched.add(name);
    showFieldErrors(validateInquiry(read()), new Set([name]));
  });
  form.addEventListener('input', (event) => {
    const name = (event.target as HTMLInputElement).name as InquiryField;
    if (!touched.has(name)) return;
    const errors = validateInquiry(read());
    showFieldErrors(errors, new Set([name]));
    if (!summary.hidden) showSummary(errors);
  });

  const setStatus = (html: string, tone: 'info' | 'error' = 'info') => {
    status.dataset.tone = tone;
    status.innerHTML = html;
  };

  const mailtoHref = () => {
    const input = read();
    return buildMailto(mailTo, input.name ? inquirySubject(input) : 'Anfrage über die Website', inquiryToText(input));
  };

  mailto.addEventListener('click', () => {
    mailto.href = mailtoHref();
    setStatus(
      '<p>Ihr E-Mail-Programm sollte sich mit einer vorbereiteten Nachricht geöffnet haben. ' +
        'Die Anfrage ist erst versendet, wenn Sie die E-Mail dort absenden.</p>',
    );
  });

  const fallbackMessage = (lead: string) =>
    `<p><strong>${lead}</strong> Ihre Angaben bleiben im Formular erhalten.</p>` +
    `<p>Sie können die Anfrage <a href="${escapeAttr(mailtoHref())}" data-mailto-inline>per E-Mail senden</a> ` +
    'oder uns unter <a href="tel:+41432442000">+41 43 244 20 00</a> anrufen.</p>';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submit.getAttribute('aria-busy') === 'true') return;

    const input = read();
    const errors = validateInquiry(input);
    ORDER.forEach((n) => touched.add(n));
    showFieldErrors(errors);
    if (showSummary(errors).length) {
      setStatus('');
      summary.focus();
      return;
    }

    // Vorschau ohne Server (z. B. GitHub Pages): ehrlich melden, nichts vortäuschen
    if (form.dataset.demo === 'true') {
      setStatus(
        '<p><strong>Dies ist eine Vorschau der neuen Website – hier wird keine Anfrage versendet.</strong> ' +
          'Ihre Angaben bleiben im Formular erhalten.</p>' +
          `<p>Sie können die Anfrage <a href="${escapeAttr(mailtoHref())}">per E-Mail senden</a> ` +
          'oder uns unter <a href="tel:+41432442000">+41 43 244 20 00</a> anrufen.</p>',
      );
      return;
    }

    elapsed.value = String(Math.round(performance.now() - loadedAt));
    submit.setAttribute('aria-busy', 'true');
    submitLabel.textContent = 'Wird übermittelt …';
    setStatus('<p>Ihre Anfrage wird übermittelt …</p>');

    let response: Response | null = null;
    let body: { ok?: boolean; code?: string; message?: string; errors?: InquiryErrors } = {};
    try {
      response = await fetch(form.action, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      body = await response.json().catch(() => ({}));
    } catch {
      response = null;
    }

    submit.removeAttribute('aria-busy');
    submitLabel.textContent = 'Anfrage senden';

    if (response?.ok && body.ok === true) {
      const template = document.querySelector<HTMLTemplateElement>('[data-success-template]');
      const success = template?.content.firstElementChild?.cloneNode(true) as HTMLElement | undefined;
      if (success) {
        form.replaceWith(success);
        success.focus();
      } else {
        setStatus('<p>Vielen Dank. Ihre Anfrage ist bei uns eingegangen.</p>');
      }
      return;
    }

    if (response?.status === 422 && body.errors) {
      showFieldErrors(body.errors);
      showSummary(body.errors);
      setStatus('');
      summary.focus();
      return;
    }
    if (response?.status === 422 || response?.status === 429) {
      setStatus(`<p>${escapeHtml(body.message ?? 'Bitte versuchen Sie es erneut.')}</p>`, 'error');
      return;
    }
    const lead =
      response?.status === 503 || response?.status === 404 || response?.status === 405
        ? 'Der Versand über das Formular ist derzeit nicht verfügbar.'
        : 'Ihre Anfrage konnte gerade nicht übermittelt werden.';
    setStatus(fallbackMessage(lead), 'error');
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
const escapeAttr = escapeHtml;
