// ── LOADING SCREEN 
window.addEventListener('load', () => {
  setTimeout(() => {
    const ls = document.getElementById('ls');
    if (!ls) return;
    ls.style.opacity = '0';
    setTimeout(() => ls.remove(), 700);
  }, 1800);
});

// ── DOM READY 
document.addEventListener('DOMContentLoaded', () => {

  // Greeting
  const greetEl = document.getElementById('greeting');
  if (greetEl) {
    const h = new Date().getHours();
    greetEl.textContent =
      h < 12 ? '🌅 Good Morning' :
      h < 17 ? '☀️ Good Afternoon' :
      h < 21 ? '🌆 Good Evening' : '🌙 Good Night';
  }

  // Active nav link
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar ul a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('nav-active');
  });

  // Navbar scroll shadow
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () =>
      navbar.classList.toggle('scrolled', window.scrollY > 40));
  }

  // Scroll to top
  const backTop = document.getElementById('backTop');
  if (backTop) {
    window.addEventListener('scroll', () =>
      backTop.classList.toggle('show', window.scrollY > 400));
    backTop.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Intersection observer — fade-in cards
  const cardObs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting)
        setTimeout(() => e.target.classList.add('visible'), i * 70);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(
    '.feature-card, .dest-card, .package-card, .review-card'
  ).forEach(el => cardObs.observe(el));

  // ── STATS COUNTER 
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    let fired = false;
    const sObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !fired) {
        fired = true;
        animateStats();
        sObs.disconnect();
      }
    }, { threshold: 0.3 });
    sObs.observe(statsSection);
  }

  // ── FAQ 
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => toggleFaq(btn));
  });

  // ── REVIEW MODAL 
  const addBtn  = document.getElementById('addReviewBtn');
  const rModal  = document.getElementById('reviewModal');
  const rClose  = document.getElementById('reviewModalClose');
  const rSubmit = document.getElementById('reviewSubmitBtn');

  if (addBtn)  addBtn.addEventListener('click', openReviewModal);
  if (rClose)  rClose.addEventListener('click', closeReviewModal);
  if (rSubmit) rSubmit.addEventListener('click', submitReview);
  if (rModal)  rModal.addEventListener('click', e => { if (e.target === rModal) closeReviewModal(); });

  document.querySelectorAll('.star-picker span').forEach((s, i) => {
    s.addEventListener('click', () => setRating(i + 1));
    s.addEventListener('mouseenter', () => highlightStars(i + 1));
    s.addEventListener('mouseleave', () => highlightStars(selectedRating));
  });

  // ── CONTACT FORM 
  const sendBtn  = document.getElementById('sendMsgBtn');
  const resetBtn = document.getElementById('resetFormBtn');
  if (sendBtn)  sendBtn.addEventListener('click', sendMessage);
  if (resetBtn) resetBtn.addEventListener('click', resetForm);

  // ── PACKAGES PAGE 
  initPackagesPage();

  // Global escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeReviewModal();
      closeDestModal();
    }
  });
});

// ── STATS COUNTER 
function animateStats() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target  = parseFloat(el.dataset.target);
    const suffix  = el.dataset.suffix || '';
    const decimal = target % 1 !== 0;
    const steps   = 60;
    let count = 0;
    const iv = setInterval(() => {
      count++;
      const val = (target / steps) * count;
      const done = count >= steps;
      if (done) clearInterval(iv);
      const disp = done ? target : val;
      el.textContent = target >= 1000
        ? Math.floor(disp).toLocaleString() + suffix
        : decimal ? disp.toFixed(1) + suffix
        : Math.floor(disp) + suffix;
    }, 2000 / steps);
  });
}

// ── FAQ 
function toggleFaq(btn) {
  const item   = btn.parentElement;
  const answer = item.querySelector('.faq-answer');
  const isOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item.open').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.faq-answer').style.maxHeight = null;
  });

  if (!isOpen) {
    item.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}

// ── REVIEW MODAL
let selectedRating = 0;

function openReviewModal() {
  const m = document.getElementById('reviewModal');
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeReviewModal() {
  const m = document.getElementById('reviewModal');
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
  selectedRating = 0;
  highlightStars(0);
  ['reviewName','reviewText'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const err = document.getElementById('reviewError');
  if (err) err.classList.remove('show');
}

function setRating(n) {
  selectedRating = n;
  highlightStars(n);
}

function highlightStars(n) {
  document.querySelectorAll('.star-picker span').forEach((s, i) => {
    s.classList.toggle('lit', i < n);
    s.textContent = i < n ? '★' : '☆';
  });
}

function submitReview() {
  const name  = document.getElementById('reviewName')?.value.trim();
  const text  = document.getElementById('reviewText')?.value.trim();
  const err   = document.getElementById('reviewError');
  if (!name || !text || selectedRating === 0) {
    err?.classList.add('show');
    return;
  }
  err?.classList.remove('show');
  const stars = '★'.repeat(selectedRating) + '☆'.repeat(5 - selectedRating);
  const card  = document.createElement('div');
  card.className = 'review-card';
  card.innerHTML = `
    <div class="stars">${stars}</div>
    <p>"${text}"</p>
    <h4>— ${name}</h4>
  `;
  document.getElementById('reviewGrid')?.appendChild(card);
  requestAnimationFrame(() => card.classList.add('visible'));
  closeReviewModal();
}

// ── CONTACT FORM
function sendMessage() {
  const name    = document.getElementById('cName')?.value.trim();
  const email   = document.getElementById('cEmail')?.value.trim();
  const msg     = document.getElementById('cMsg')?.value.trim();
  const errEl   = document.getElementById('formError');
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
  if (!name || !emailOk || !msg) {
    if (errEl) errEl.classList.add('show');
    return;
  }
  if (errEl) errEl.classList.remove('show');
  document.getElementById('contactFormBox').style.display  = 'none';
  const sb = document.getElementById('successBox');
  if (sb) sb.classList.add('show');
}

function resetForm() {
  ['cName','cEmail','cMsg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('contactFormBox').style.display = 'flex';
  document.getElementById('successBox')?.classList.remove('show');
}

// ── PACKAGES PAGE
function initPackagesPage() {
  const budgetSlider  = document.getElementById('budgetSlider');
  const currencySelect = document.getElementById('currencySelect');
  if (!budgetSlider && !currencySelect) return;

  // Currency rates & symbols
  const rates   = {INR:1,USD:0.012,EUR:0.011,AED:0.044,GBP:0.0095,SGD:0.016};
  const symbols = {INR:'₹',USD:'$',EUR:'€',AED:'د.إ',GBP:'£',SGD:'S$'};
  let currentCur = 'INR';

  function updatePrices() {
    currentCur = currencySelect?.value || 'INR';
    const rate = rates[currentCur], sym = symbols[currentCur];
    document.querySelectorAll('.pkg-price-val').forEach(el => {
      el.textContent = sym + Math.round(parseInt(el.dataset.base) * rate).toLocaleString();
    });
    updateBudget();
  }

  function updateBudget() {
    const val  = parseInt(budgetSlider?.value || 200000);
    const sym  = symbols[currentCur], rate = rates[currentCur];
    const bv   = document.getElementById('budgetVal');
    if (bv) bv.textContent = sym + Math.round(val * rate).toLocaleString();
    let visible = 0;
    document.querySelectorAll('.package-card').forEach(card => {
      const show = parseInt(card.dataset.price || 0) <= val;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    const nr = document.getElementById('noResults');
    if (nr) nr.style.display = visible === 0 ? 'block' : 'none';
  }

  budgetSlider?.addEventListener('input', updateBudget);
  currencySelect?.addEventListener('change', updatePrices);

  // Category pills
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      let visible = 0;
      document.querySelectorAll('.package-card').forEach(card => {
        const show = cat === 'all' || (card.dataset.cat || '').includes(cat);
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      const nr = document.getElementById('noResults');
      if (nr) nr.style.display = visible === 0 ? 'block' : 'none';
    });
  });

  // Countdown timer
  const cdKey = 'ww_deal_end';
  let cdEnd = localStorage.getItem(cdKey);
  if (!cdEnd) {
    cdEnd = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(cdKey, cdEnd);
  }
  setInterval(() => {
    const diff = cdEnd - Date.now();
    if (diff <= 0) return;
    const d = document.getElementById('cd-d');
    const h = document.getElementById('cd-h');
    const m = document.getElementById('cd-m');
    const s = document.getElementById('cd-s');
    if (d) d.textContent = String(Math.floor(diff / 86400000)).padStart(2,'0');
    if (h) h.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2,'0');
    if (m) m.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2,'0');
    if (s) s.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2,'0');
  }, 1000);
}

// ── DESTINATION MODAL (Packages) 
const destData = {
  paris:{img:'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=700&auto=format&fit=crop',region:'Europe 🇫🇷',desc:'The city of love, lights, and fashion. From the Eiffel Tower to world-class cuisine, Paris is every traveller\'s dream destination.',info:['🗓 Best Time: April – June, Sep – Nov','💰 Currency: Euro (€)','🗣 Language: French','🛂 Visa: Schengen Required','🌡 Weather: 10°C – 25°C','✈️ Flight: ~9 hrs from Delhi'],packing:[['🧥','Jacket'],['👟','Comfy Shoes'],['📷','Camera'],['🔌','Adapter'],['💶','Euros'],['☂️','Umbrella'],['🛂','Passport'],['🗺️','Map']]},
  bali:{img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&auto=format&fit=crop',region:'Asia 🇮🇩',desc:'Temples, beaches, rice terraces and vibrant culture. Bali is a spiritual retreat and beach paradise — perfect for every budget.',info:['🗓 Best Time: April – October','💰 Currency: IDR','🗣 Language: Balinese / Indonesian','🛂 Visa: Free 30 Days On Arrival','🌡 Weather: 27°C – 32°C','✈️ Flight: ~7 hrs from Delhi'],packing:[['🧴','Sunscreen'],['🩱','Swimwear'],['👕','Light Clothes'],['👡','Sandals'],['🦟','Insect Repellent'],['🧣','Sarong'],['💵','Cash IDR'],['🛂','Passport']]},
  dubai:{img:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&auto=format&fit=crop',region:'Asia 🇦🇪',desc:'Ultra-modern skyline, luxury malls, desert safaris and world-class dining. Dubai is grand in every sense.',info:['🗓 Best Time: November – March','💰 Currency: AED','🗣 Language: Arabic / English','🛂 Visa: On Arrival for Indians','🌡 Weather: 20°C – 30°C','✈️ Flight: ~3.5 hrs from Delhi'],packing:[['👗','Modest Clothes'],['🕶️','Sunglasses'],['🧴','Sunscreen'],['👔','Formal Wear'],['🔌','Adapter'],['💳','Debit Card'],['🛂','Passport'],['🧤','Scarf']]},
  tokyo:{img:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&auto=format&fit=crop',region:'Asia 🇯🇵',desc:'Ancient temples and futuristic technology — sushi, anime, cherry blossoms and bullet trains. Tokyo is a world apart.',info:['🗓 Best Time: March – May, Sep – Nov','💰 Currency: JPY (¥)','🗣 Language: Japanese','🛂 Visa: Required','🌡 Weather: 10°C – 28°C','✈️ Flight: ~8 hrs from Delhi'],packing:[['👟','Comfy Shoes'],['🚄','Rail Pass'],['💳','IC Card'],['📷','Camera'],['📱','Translator App'],['💵','Cash Yen'],['🧅','Layers'],['🛂','Passport']]},
  switzerland:{img:'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=700&auto=format&fit=crop',region:'Europe 🇨🇭',desc:'Snow-capped Alps, pristine lakes, charming villages and world-famous chocolate. Switzerland is a fairytale destination.',info:['🗓 Best Time: Jun–Sep (summer), Dec–Feb (snow)','💰 Currency: CHF','🗣 Language: German / French','🛂 Visa: Schengen Required','🌡 Weather: -5°C – 25°C','✈️ Flight: ~9 hrs from Delhi'],packing:[['🧥','Heavy Jacket'],['🥾','Hiking Boots'],['🧤','Gloves'],['🎩','Beanie'],['🧴','Sunscreen'],['💵','CHF Cash'],['📷','Camera'],['🥶','Thermals']]},
  newyork:{img:'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=700&auto=format&fit=crop',region:'America 🇺🇸',desc:'The city that never sleeps — Times Square, Central Park, Statue of Liberty, Broadway and amazing pizza.',info:['🗓 Best Time: April – June, Sep – Nov','💰 Currency: USD ($)','🗣 Language: English','🛂 Visa: B1-B2 Required','🌡 Weather: 5°C – 28°C','✈️ Flight: ~15 hrs from Delhi'],packing:[['👟','Sneakers'],['🚇','Metro Card'],['🧅','Layers'],['📷','Camera'],['🔋','Power Bank'],['💳','Debit Card'],['🛂','Passport'],['☂️','Umbrella']]},
  maldives:{img:'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=700&auto=format&fit=crop',region:'Asia 🇲🇻',desc:'Crystal clear lagoons, overwater bungalows, coral reefs and white sandy beaches — Maldives is the ultimate paradise.',info:['🗓 Best Time: November – April','💰 Currency: MVR','🗣 Language: Dhivehi / English','🛂 Visa: Free 30 Days','🌡 Weather: 28°C – 32°C','✈️ Flight: ~4 hrs from Delhi'],packing:[['🩱','Swimwear'],['🤿','Snorkel Gear'],['🧴','Sunscreen'],['🕶️','Sunglasses'],['👗','Light Dress'],['👡','Flip Flops'],['📱','Waterproof Case'],['🛂','Passport']]},
  goa:{img:'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=700&auto=format&fit=crop',region:'India 🇮🇳',desc:'Beaches, seafood, night markets, Portuguese architecture and amazing sunsets. Goa is India\'s favourite getaway.',info:['🗓 Best Time: November – February','💰 Currency: INR (₹)','🗣 Language: Konkani / Hindi','🛂 Visa: Not Required','🌡 Weather: 22°C – 32°C','✈️ Flight: ~2 hrs from Delhi'],packing:[['🩱','Swimwear'],['🧴','Sunscreen'],['👡','Flip Flops'],['👕','Light Clothes'],['🦟','Mosquito Repellent'],['💵','Cash INR'],['📷','Camera'],['🪪','ID Card']]},
  singapore:{img:'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=700&auto=format&fit=crop',region:'Asia 🇸🇬',desc:'Garden City — Marina Bay Sands, hawker food, luxury shopping and spotless streets. The best of modern Asia.',info:['🗓 Best Time: February – April','💰 Currency: SGD (S$)','🗣 Language: English / Mandarin','🛂 Visa: Free 30 Days','🌡 Weather: 25°C – 32°C','✈️ Flight: ~6 hrs from Delhi'],packing:[['👕','Light Clothes'],['👟','Comfy Shoes'],['📷','Camera'],['💳','Debit Card'],['🔌','Adapter'],['☂️','Umbrella'],['🛂','Passport'],['🧴','Sunscreen']]}
};

let currentDestKey = null;
let activeTab = 'overview';

function openDest(name, key) {
  const d = destData[key];
  if (!d) return;
  currentDestKey = key;

  const img = document.getElementById('dImg');
  if (img) { img.src = d.img; img.alt = name; }
  const dn = document.getElementById('dName');
  if (dn) dn.textContent = name;
  const dr = document.getElementById('dRegion');
  if (dr) dr.textContent = d.region;
  const dd = document.getElementById('dDesc');
  if (dd) dd.textContent = d.desc;
  const di = document.getElementById('dInfo');
  if (di) di.innerHTML = d.info.map(i => `<li>${i}</li>`).join('');
  const dp = document.getElementById('dPack');
  if (dp) dp.innerHTML = d.packing.map(([icon, label]) =>
    `<div class="pack-item"><span class="pi">${icon}</span>${label}</div>`).join('');

  switchDestTab('overview');

  const overlay = document.getElementById('destOverlay');
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeDestModal() {
  const overlay = document.getElementById('destOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function switchDestTab(id) {
  activeTab = id;
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.modal-tab').forEach(b => b.classList.remove('active'));
  const tc = document.getElementById('tab-' + id);
  if (tc) tc.classList.add('active');
  const tb = document.querySelector(`.modal-tab[data-tab="${id}"]`);
  if (tb) tb.classList.add('active');
}

function payNow() {
  closeDestModal();
  // Confetti
  for (let i = 0; i < 100; i++) {
    const c = document.createElement('div');
    const colors = ['#c9a84c','#e8c87a','#3d7aed','#6fa3f8','#3ecf8e','#e05c5c'];
    c.style.cssText = `
      position:fixed;top:-10px;
      left:${Math.random()*100}vw;
      width:${5+Math.random()*7}px;height:${5+Math.random()*7}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random()>0.5?'50%':'2px'};
      z-index:9999;pointer-events:none;
      animation:confettiFall ${1.4+Math.random()*2}s linear forwards;
    `;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3500);
  }
  setTimeout(() => {
    alert('🎉 Booking Confirmed!\nHave an amazing trip! ✈️\n\nBooking ID: WW' +
      Math.floor(100000 + Math.random() * 900000));
  }, 300);
}

// ── PACKAGES MODAL EVENT WIRING 
document.addEventListener('DOMContentLoaded', () => {
  // Book Now buttons — open modal with dest data
  document.addEventListener('click', e => {
    const bookBtn = e.target.closest('.book-btn');
    if (bookBtn) {
      const card = bookBtn.closest('.package-card');
      if (card) {
        const key  = card.dataset.destKey;
        const name = card.dataset.destName;
        const priceEl = card.querySelector('.pkg-price-val');
        const price = priceEl ? priceEl.textContent : '';
        openDest(name, key);
        const dp = document.getElementById('dPrice');
        if (dp) dp.textContent = price;
      }
    }
  });

  // Dest modal close btn
  const destClose = document.getElementById('destCloseBtn');
  if (destClose) destClose.addEventListener('click', closeDestModal);

  // Dest modal overlay click
  const destOverlay = document.getElementById('destOverlay');
  if (destOverlay) destOverlay.addEventListener('click', e => {
    if (e.target === destOverlay) closeDestModal();
  });

  // Modal tab buttons
  document.querySelectorAll('.modal-tab').forEach(btn => {
    btn.addEventListener('click', () => switchDestTab(btn.dataset.tab));
  });

  // Pay Now
  const payBtn = document.getElementById('payNowBtn');
  if (payBtn) payBtn.addEventListener('click', payNow);
});

// ── BOOKING FLOW

document.getElementById('openBookingBtn')?.addEventListener('click', () => {
  closeDestModal();
  document.getElementById('bookingOverlay')?.classList.add('open');
});

document.getElementById('bookingCloseBtn')?.addEventListener('click', () => {
  document.getElementById('bookingOverlay')?.classList.remove('open');
});

document.getElementById('confirmBookingBtn')?.addEventListener('click', () => {
  const name = document.getElementById('bName')?.value.trim();
  const dob = document.getElementById('bDob')?.value;
  const email = document.getElementById('bEmail')?.value.trim();
  const phone = document.getElementById('bPhone')?.value.trim();
  const pass = document.getElementById('bPassengers')?.value;
  const date = document.getElementById('bDate')?.value;
  const bookingError = document.getElementById('bookingError');

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
  const phoneOk = /^[0-9]{10}$/.test(phone || '');

  if (!name || !dob || !emailOk || !phoneOk || !pass || !date) {
    bookingError?.classList.add('show');
    return;
  }

  bookingError?.classList.remove('show');
  document.getElementById('bookingOverlay')?.classList.remove('open');
  document.getElementById('paymentOverlay')?.classList.add('open');
});

document.getElementById('paymentCloseBtn')?.addEventListener('click', () => {
  document.getElementById('paymentOverlay')?.classList.remove('open');
});

document.getElementById('payBtn')?.addEventListener('click', () => {
  const name = document.getElementById('cardName')?.value.trim();
  const num = document.getElementById('cardNumber')?.value.trim();
  const exp = document.getElementById('cardExpiry')?.value.trim();
  const cvv = document.getElementById('cardCVV')?.value.trim();
  const paymentError = document.getElementById('paymentError');

  const cardOk = /^[0-9]{16}$/.test(num || '');
  const cvvOk = /^[0-9]{3}$/.test(cvv || '');

  if (!name || !cardOk || !exp || !cvvOk) {
    paymentError?.classList.add('show');
    return;
  }

  paymentError?.classList.remove('show');
  document.getElementById('paymentOverlay')?.classList.remove('open');
  alert("🎉 Booking Confirmed!\n\nYour trip is successfully booked ✈️🌍");
});