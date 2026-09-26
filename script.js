const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll("[data-scroll-to]").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.scrollTo)?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });
});

const progressBar = document.querySelector(".reading-progress span");
const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0;
  if (progressBar) progressBar.style.width = `${percent}%`;
};
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const revealItems = document.querySelectorAll(".reveal:not(.is-visible)");
if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -6%" },
  );
  revealItems.forEach((item) => observer.observe(item));
}

const audio = document.getElementById("bgm");
const musicControl = document.querySelector(".music-control");
const musicText = document.querySelector(".music-control__text");

const setMusicUI = (playing) => {
  musicControl?.classList.toggle("is-paused", !playing);
  musicControl?.setAttribute("aria-pressed", String(playing));
  musicControl?.setAttribute("aria-label", playing ? "暂停背景音乐" : "播放背景音乐");
  if (musicText) musicText.textContent = playing ? "遇见 · 播放中" : "遇见 · 点击播放";
};

const tryPlayMusic = async () => {
  if (!audio || !audio.paused) return;
  try {
    audio.volume = 0.58;
    await audio.play();
    setMusicUI(true);
  } catch {
    setMusicUI(false);
  }
};

musicControl?.addEventListener("click", async (event) => {
  event.stopPropagation();
  if (!audio) return;
  if (audio.paused) await tryPlayMusic();
  else {
    audio.pause();
    setMusicUI(false);
  }
});

window.addEventListener("load", () => {
  tryPlayMusic();
  if (window.location.hash) {
    window.setTimeout(() => {
      document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "auto" });
    }, 1400);
  }
}, { once: true });
document.addEventListener("pointerdown", tryPlayMusic, { once: true, passive: true });
document.addEventListener("keydown", tryPlayMusic, { once: true });
audio?.addEventListener("play", () => setMusicUI(true));
audio?.addEventListener("pause", () => setMusicUI(false));

const responseGroup = document.querySelector(".response");
const reply = document.querySelector(".reply");
const replyMessage = document.querySelector(".reply__message");
const resetButton = document.querySelector(".reply__reset");
const replies = {
  yes: "谢谢你愿意让我探班你的人生。我会认真珍惜这份答案，也认真珍惜你。",
};

const inertChoice = document.querySelector("[data-inert-choice]");
inertChoice?.addEventListener("pointerdown", () => {
  navigator.vibrate?.(24);
});
inertChoice?.addEventListener("click", () => {
  inertChoice.blur();
});

document.querySelectorAll("[data-response]").forEach((button) => {
  button.addEventListener("click", () => {
    if (replyMessage) replyMessage.textContent = replies[button.dataset.response] ?? "谢谢你看完这份日志。";
    if (responseGroup) responseGroup.hidden = true;
    if (reply) reply.hidden = false;
    resetButton?.focus();
  });
});

resetButton?.addEventListener("click", () => {
  if (reply) reply.hidden = true;
  if (responseGroup) responseGroup.hidden = false;
  responseGroup?.querySelector("button")?.focus();
});
