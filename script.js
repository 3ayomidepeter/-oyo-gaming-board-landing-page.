// Announcement motion can be paused independently of hover or keyboard focus.
const announcementToggle = document.querySelector('.announcement-toggle');
announcementToggle?.addEventListener('click', () => {
  const paused = announcementToggle.closest('.event-strip').classList.toggle('is-paused');
  announcementToggle.setAttribute('aria-pressed', String(paused));
  announcementToggle.setAttribute('aria-label', paused ? 'Resume announcements' : 'Pause announcements');
  announcementToggle.firstElementChild.textContent = paused ? '▶' : 'Ⅱ';
});

// EDIT: Day 1 welcoming event date/time — countdown target
const eventDateStr = "2026-10-28T17:00:00+01:00";
const eventDate = new Date(eventDateStr).getTime();
const timerEl = document.getElementById("timer");
const countdownElements = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds")
};
function updateCountdown() {
  const now = new Date().getTime();
  const distance = eventDate - now;
  if (distance < 0) {
    clearInterval(countdownInterval);
    if (timerEl) timerEl.innerHTML = "<span>The event has commenced</span>";
    const label = document.querySelector('.countdown-label');
    if (label) label.textContent = '28–29 October 2026';
    return;
  }
  const d = Math.floor(distance / (1000 * 60 * 60 * 24));
  const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((distance % (1000 * 60)) / 1000);
  if (countdownElements.days) countdownElements.days.innerText = d < 10 ? '0' + d : d;
  if (countdownElements.hours) countdownElements.hours.innerText = h < 10 ? '0' + h : h;
  if (countdownElements.minutes) countdownElements.minutes.innerText = m < 10 ? '0' + m : m;
  if (countdownElements.seconds) countdownElements.seconds.innerText = s < 10 ? '0' + s : s;
}
const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();

// Mobile nav
const mobileBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');
if (mobileBtn && navLinks) {
  const setMenu = (open) => {
    navLinks.classList.toggle('active', open);
    mobileBtn.setAttribute('aria-expanded', String(open));
  };
  mobileBtn.addEventListener('click', () => setMenu(!navLinks.classList.contains('active')));
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks.classList.contains('active')) {
      setMenu(false);
      mobileBtn.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.navbar')) setMenu(false);
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', () => setMenu(false));
}

// Programme day tabs
const dayTabs = document.querySelectorAll('.day-tab');
dayTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    dayTabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
      t.tabIndex = -1;
    });
    document.querySelectorAll('.programme-panel').forEach(p => {
      p.classList.remove('active');
      p.hidden = true;
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    tab.tabIndex = 0;
    document.getElementById(tab.dataset.day).classList.add('active');
    document.getElementById(tab.dataset.day).hidden = false;
  });
  tab.addEventListener('keydown', (event) => {
    const tabs = Array.from(dayTabs);
    let next;
    if (event.key === 'ArrowRight') next = (tabs.indexOf(tab) + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (tabs.indexOf(tab) + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      tabs[next].click();
      tabs[next].focus();
    }
  });
});

// Sponsor modal
const sponsorModal = document.getElementById('sponsor-modal');
const sponsorTrigger = document.querySelector('.sponsor-cta');
const sponsorCloseButton = document.querySelector('.modal-close');
let previousFocus;
const modalBackground = Array.from(document.body.children).filter(el => el !== document.querySelector('main') && el.tagName !== 'SCRIPT');
const mainBackground = Array.from(document.querySelector('main').children).filter(el => el !== sponsorModal);
function setBackgroundInert(value) {
  [...modalBackground, ...mainBackground].forEach(el => { el.inert = value; });
}

function openSponsorModal() {
  if (sponsorModal) {
    previousFocus = document.activeElement;
    sponsorModal.classList.add('open');
    sponsorModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setBackgroundInert(true);
    sponsorCloseButton.focus();
  }
}

function closeSponsorModal() {
  if (sponsorModal) {
    sponsorModal.classList.remove('open');
    sponsorModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setBackgroundInert(false);
    previousFocus?.focus();
  }
}

if (sponsorTrigger) {
  sponsorTrigger.addEventListener('click', function (e) {
    e.preventDefault();
    openSponsorModal();
  });
}

if (sponsorCloseButton) {
  sponsorCloseButton.addEventListener('click', closeSponsorModal);
}

if (sponsorModal) {
  sponsorModal.addEventListener('click', function (e) {
    if (e.target === sponsorModal) closeSponsorModal();
  });
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Tab' && sponsorModal?.classList.contains('open')) {
    const controls = sponsorModal.querySelectorAll('button, input, select, textarea, a[href]');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  if (e.key === 'Escape' && sponsorModal && sponsorModal.classList.contains('open')) {
    closeSponsorModal();
  }
});

const sponsorForm = document.getElementById('sponsor-form');
if (sponsorForm) {
  sponsorForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('sponsor-fullname').value.trim();
    const company = document.getElementById('sponsor-company').value.trim();
    const phone = document.getElementById('sponsor-phone').value.trim();
    const email = document.getElementById('sponsor-email').value.trim();
    const packageType = document.getElementById('sponsor-package').value;
    const message = document.getElementById('sponsor-message').value.trim();

    if (!name || !company || !phone) {
      document.getElementById('sponsor-status').textContent = 'Please fill in your full name, company and phone number.';
      return;
    }

    let msg = 'Sponsorship Enquiry - Governing for Growth 2026 (Oyo State Gaming Board)\n';
    msg += 'Contact Name: ' + name + '\n';
    msg += 'Company / Brand: ' + company + '\n';
    msg += 'Phone: ' + phone + '\n';
    if (email) msg += 'Email: ' + email + '\n';
    msg += 'Interest: ' + packageType + '\n';
    if (message) msg += 'Message: ' + message;

    const url = 'https://wa.me/' + RSVP_WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
    openWhatsApp(url, document.getElementById('sponsor-status'));
  });
}

// RSVP -> WhatsApp
// Same Secretariat contact as the site's floating WhatsApp link.
const RSVP_WHATSAPP_NUMBER = "2348032054231";
function openWhatsApp(url, status) {
  window.open(url, '_blank', 'noopener,noreferrer');
  status.replaceChildren(document.createTextNode('Complete your message in WhatsApp. If it did not open, '));
  const fallback = document.createElement('a');
  fallback.href = url;
  fallback.target = '_blank';
  fallback.rel = 'noopener noreferrer';
  fallback.textContent = 'continue here';
  status.append(fallback);
}
const rsvpForm = document.getElementById('rsvp-form');
if (rsvpForm) {
  rsvpForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('fullname').value.trim();
    const org = document.getElementById('org').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const guests = document.getElementById('guests').value;
    const days = [];
    if (document.getElementById('day1chk').checked) days.push(document.getElementById('day1chk').value);
    if (document.getElementById('day2chk').checked) days.push(document.getElementById('day2chk').value);

    if (!name || !org || !phone) {
      document.getElementById('rsvp-status').textContent = 'Please fill in your name, organisation and phone number.';
      return;
    }
    if (days.length === 0) {
      document.getElementById('rsvp-status').textContent = 'Please select at least one day you will attend.';
      document.getElementById('day1chk').focus();
      return;
    }

    let msg = "RSVP - Governing for Growth 2026 (Oyo State Gaming Board)\n";
    msg += "Name: " + name + "\n";
    msg += "Organisation: " + org + "\n";
    msg += "Phone: " + phone + "\n";
    if (email) msg += "Email: " + email + "\n";
    msg += "Attending: " + days.join(" & ") + "\n";
    msg += "Number attending: " + guests;

    const url = "https://wa.me/" + RSVP_WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
    openWhatsApp(url, document.getElementById('rsvp-status'));
  });
}
