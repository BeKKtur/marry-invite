const weddingData = {
  // ЗДЕСЬ МЕНЯТЬ ИМЕНА
  groom: "Алихан",
  bride: "Алина",
  // ЗДЕСЬ МЕНЯТЬ ДАТУ (формат ГГГГ-ММ-ДД)
  date: "2027-07-18",
  city: "Бишкек",
  venue: "Ресторан Bellagio Hall",
  // ЗДЕСЬ МЕНЯТЬ АДРЕС
  address: "г. Бишкек, ул. Логвиненко, 124",
  // ЗДЕСЬ ВСТАВИТЬ ССЫЛКУ 2ГИС
  // Пока стоит заглушка, кнопка открывает поиск этого адреса в 2ГИС.
  mapUrl: "ССЫЛКА_2GIS"
};

// ЗДЕСЬ МЕНЯТЬ ПРОГРАММУ
// Доступные иконки: guests, rings, dinner, music, glasses.
const weddingProgram = [
  { time: "16:00", title: "Сбор гостей", icon: "guests" },
  { time: "17:00", title: "Церемония", icon: "rings" },
  { time: "18:00", title: "Банкет", icon: "dinner" },
  { time: "20:00", title: "Развлекательная программа", icon: "music" },
  { time: "23:00", title: "Завершение вечера", icon: "glasses" }
];

// Все имена, инициалы, дата, город и адрес подставляются из weddingData.
const fill = (attribute, value) => {
  document.querySelectorAll(`[data-${attribute}]`).forEach(el => { el.textContent = value; });
};
const initials = `${weddingData.groom.trim()[0]}&${weddingData.bride.trim()[0]}`;
const [year, month, day] = weddingData.date.split("-");
const formattedDate = `${day} · ${month} · ${year}`;
Object.entries(weddingData).forEach(([key, value]) => fill(key, value));
fill("date", formattedDate);
fill("initials", initials);
document.title = `${weddingData.groom} и ${weddingData.bride} — приглашение на свадьбу`;
document.querySelector('meta[name="description"]').content = `Свадьба ${weddingData.groom} и ${weddingData.bride}. ${formattedDate}, ${weddingData.city}. ${weddingData.venue}.`;

// Встроенную карту не показываем. Используем прямую ссылку либо поиск 2ГИС.
let mapUrl;
try {
  const url = new URL(weddingData.mapUrl);
  if (url.protocol === "https:" && /(^|\.)2gis\.(ru|kg|com|kz|uz|ae)$/.test(url.hostname)) mapUrl = url.href;
} catch { /* Заглушка заменяется рабочим поиском по адресу. */ }
document.querySelector(".map-button").href = mapUrl || `https://2gis.kg/bishkek/search/${encodeURIComponent(weddingData.address)}`;

// Небольшие SVG-иконки не требуют сторонней библиотеки.
const icons = {
  guests: '<circle cx="12" cy="7" r="3"/><circle cx="4" cy="9" r="2"/><circle cx="20" cy="9" r="2"/><path d="M7 21v-6a5 5 0 0 1 10 0v6ZM7 14a4 4 0 0 0-6 3v4h6m10-7a4 4 0 0 1 6 3v4h-6"/>',
  rings: '<circle cx="8" cy="14" r="6"/><circle cx="16" cy="14" r="6"/><path d="m12 6-3-3 3-2 3 2ZM12 6v3"/>',
  dinner: '<path d="M2 18h20v3H2Zm2 0a8 8 0 0 1 16 0M12 10V6m-2 0h4"/>',
  music: '<path d="M9 18V5l12-3v13M9 9l12-3"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="18" cy="16" rx="3" ry="2.5"/>',
  glasses: '<path d="m4 3-2 7a4 4 0 0 0 8 2l1-7ZM6 15l-2 6m-3-1 6 2m6-17 1 7a4 4 0 0 0 8-2l-2-7ZM18 15l2 6m-3 1 6-2M3 8l7 2m4 0 7-2"/>'
};
const timeline = document.querySelector(".timeline");
weddingProgram.forEach((event, index) => {
  const item = document.createElement("li");
  item.className = "reveal";
  item.style.setProperty("--reveal-delay", `${index * 130}ms`);
  item.innerHTML = `<span class="event-icon-wrapper"><svg class="event-icon line-icon" width="36" height="36" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" aria-hidden="true">${icons[event.icon] || icons.rings}</svg></span><div class="event-copy"><p class="event-time"></p><p class="event-title"></p></div>`;
  item.querySelector(".event-time").textContent = event.time;
  item.querySelector(".event-title").textContent = event.title;
  timeline.append(item);
});

// Обратный отсчёт до полуночи в Бишкеке (UTC+6), независимо от часового пояса гостя.
const weddingTimestamp = new Date(`${weddingData.date}T00:00:00+06:00`).getTime();
const updateCountdown = () => {
  const remaining = Math.max(0, weddingTimestamp - Date.now());
  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor(remaining / 3600000) % 24,
    minutes: Math.floor(remaining / 60000) % 60,
    seconds: Math.floor(remaining / 1000) % 60
  };
  Object.entries(values).forEach(([id, number]) => {
    const el = document.getElementById(id);
    const next = String(number).padStart(2, "0");
    if (el.textContent !== next) {
      el.textContent = next;
      el.classList.remove("tick");
      void el.offsetWidth;
      el.classList.add("tick");
    }
  });
  document.querySelector(".wedding-today").hidden = remaining > 0;
};
updateCountdown();
setInterval(updateCountdown, 1000);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const opening = document.querySelector(".opening");
const main = document.querySelector("main");
const openButton = document.querySelector(".open-button");
let opened = false;
let observer;
function startReveal() {
  document.querySelectorAll(".section-content, .hero-copy, .final-copy").forEach(group => {
    group.querySelectorAll(".reveal").forEach(el => {
      if (el.matches(".timeline li, .floral-accent")) return;
      const delay = el.matches("h1, h2") ? 0 : el.matches(".ornament") ? 180 : el.matches(".body-copy, .greeting, .address, .venue-name") ? 140 : 80;
      el.style.setProperty("--reveal-delay", `${delay}ms`);
    });
  });
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
    return;
  }
  // Следующая секция проявляется мягко; непрерывный фон не анимируем целиком.
  if (!reducedMotion.matches) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("section-visible");
          sectionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -35px 0px" });
    document.querySelectorAll(".section, .final").forEach(section => {
      section.classList.add("section-enter");
      sectionObserver.observe(section);
    });
  }
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -15px 0px" });
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
// Ждём фактического конца движения, а не запускаем следующий этап раньше.
function waitForMovement(element, changeState, fallbackMs) {
  return new Promise(resolve => {
    let timeout;
    const finish = event => {
      if (event && (event.target !== element || event.propertyName !== "transform")) return;
      clearTimeout(timeout);
      element.removeEventListener("transitionend", finish);
      resolve();
    };
    element.addEventListener("transitionend", finish);
    changeState();
    timeout = setTimeout(() => finish(), fallbackMs);
  });
}
openButton.addEventListener("click", async () => {
  if (opened) return;
  opened = true;
  openButton.disabled = true;
  opening.classList.add("is-opening");
  // Печать исчезает, затем открывается клапан. Письмо всегда перед задней
  // стенкой и позади передней стенки: оно может выйти только вверх.
  if (!reducedMotion.matches) {
    await pause(1000); // Сургучная печать завершает движение.
    await waitForMovement(document.querySelector(".envelope-flap"), () => {
      opening.classList.add("flap-open");
    }, 1900);
    opening.classList.add("flap-settled"); // Полностью открытый клапан уходит за письмо.
    await pause(160);
    await waitForMovement(document.querySelector(".letter"), () => {
      opening.classList.add("letter-out");
    }, 3000);
    await pause(2200); // Пауза после подъёма для чтения приглашения.
  }
  main.inert = false;
  document.body.classList.remove("invitation-closed");
  startReveal();
  opening.classList.add("finished");
  window.scrollTo({ top: 0, behavior: "instant" });
  const firstLink = document.querySelector(".navigation a");
  firstLink.focus({ preventScroll: true });
  await pause(reducedMotion.matches ? 20 : 1500);
  opening.hidden = true;
});

// Удерживаем клавиатурный фокус внутри конверта до открытия.
opening.addEventListener("keydown", event => {
  if (event.key === "Tab") { event.preventDefault(); openButton.focus(); }
});
openButton.focus({ preventScroll: true });

// Лепестки редкие, небольшие и не мешают кнопкам или чтению.
if (!reducedMotion.matches) {
  const petals = document.querySelector(".petals");
  for (let i = 0; i < 3; i++) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.cssText = `--left:${8 + Math.random() * 84}%;--size:${10 + Math.random() * 6}px;--duration:${38 + Math.random() * 12}s;--delay:${i * 12}s;--drift:${Math.random() * 60 - 30}px;--blur:${i % 3 === 0 ? 1 : 0}px`;
    petals.append(petal);
  }
  // Небольшой параллакс рассчитывается только для видимых секций.
  let scheduled = false;
  const sections = [...document.querySelectorAll(".landscape")];
  const flowers = [...document.querySelectorAll(".floral-accent")];
  window.addEventListener("scroll", () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      sections.forEach(section => {
        const bounds = section.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < innerHeight) {
          const offset = Math.max(-16, Math.min(16, bounds.top * .025));
          section.querySelector(".landscape-image").style.top = `calc(-2% + ${offset}px)`;
          section.querySelector(".landscape-image").style.bottom = `calc(-2% - ${offset}px)`;
        }
      });
      flowers.forEach(flower => {
        const bounds = flower.closest("section").getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < innerHeight) {
          const offset = Math.max(-7, Math.min(7, (bounds.top - innerHeight * .4) * .012));
          flower.style.setProperty("--flower-offset", `${offset}px`);
        }
      });
      scheduled = false;
    });
  }, { passive: true });
}
