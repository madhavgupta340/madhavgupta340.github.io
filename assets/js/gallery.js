/*
 * Lightbox for project screenshots. Any <button data-zoom="image.jpg" data-caption="..."> opens it.
 * Keyboard: ← / → to move between screenshots, Esc to close.
 */
(() => {
  const triggers = [...document.querySelectorAll("[data-zoom]")];
  if (!triggers.length || typeof HTMLDialogElement === "undefined") return;

  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", "Screenshot viewer");
  dialog.innerHTML = `
    <div class="lightbox__inner">
      <div class="lightbox__top">
        <span class="label" data-count></span>
        <div class="lightbox__nav">
          <button type="button" data-prev aria-label="Previous screenshot">←</button>
          <button type="button" data-next aria-label="Next screenshot">→</button>
          <button type="button" data-close>Close</button>
        </div>
      </div>
      <div class="lightbox__img"><img alt=""></div>
      <p class="lightbox__caption" data-caption></p>
    </div>`;
  document.body.appendChild(dialog);

  const img = dialog.querySelector("img");
  const caption = dialog.querySelector("[data-caption]");
  const count = dialog.querySelector("[data-count]");
  const multiple = triggers.length > 1;
  dialog.querySelector("[data-prev]").hidden = !multiple;
  dialog.querySelector("[data-next]").hidden = !multiple;
  let index = 0;
  let opener = null;

  function show(i) {
    index = (i + triggers.length) % triggers.length;
    const t = triggers[index];
    img.src = t.dataset.zoom;
    img.alt = t.querySelector("img")?.alt || "";
    caption.textContent = t.dataset.caption || "";
    count.textContent = multiple ? `${index + 1} / ${triggers.length}` : "";
  }

  triggers.forEach((t, i) => t.addEventListener("click", () => {
    opener = t;
    show(i);
    dialog.showModal();
  }));
  dialog.querySelector("[data-prev]").addEventListener("click", () => show(index - 1));
  dialog.querySelector("[data-next]").addEventListener("click", () => show(index + 1));
  dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog || e.target.classList.contains("lightbox__img")) dialog.close(); });
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
  dialog.addEventListener("close", () => { img.removeAttribute("src"); opener?.focus(); });
})();
