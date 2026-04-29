function toast(message, type="primary") {
  const area = document.getElementById("toastArea");
  if (!area) return;
  const id = "t" + Math.random().toString(16).slice(2);
  const html = `
    <div id="${id}" class="toast align-items-center text-bg-${type} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`;
  area.insertAdjacentHTML("beforeend", html);
  const el = document.getElementById(id);
  const t = new bootstrap.Toast(el, { delay: 2400 });
  t.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());
}

async function postJson(url) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" } });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// Client-side filters on the sessions page
(function initFilters(){
  const searchBox = document.getElementById("searchBox");
  const tagSelect = document.getElementById("tagSelect");
  const dayBox = document.getElementById("dayBox");
  const cards = document.querySelectorAll(".session-card");
  const chips = document.getElementById("tagChips");

  if (!cards.length) return;

  function apply(){
    const q = (searchBox?.value || "").toLowerCase().trim();
    const tag = (tagSelect?.value || "").toLowerCase().trim();
    const day = (dayBox?.value || "").trim();

    let shown = 0;
    cards.forEach(c => {
      const text = c.getAttribute("data-title") || "";
      const tags = c.getAttribute("data-tags") || "";
      const cday = c.getAttribute("data-day") || "";

      const okQ = !q || text.includes(q) || tags.includes(q);
      const okTag = !tag || tags.split(/\s+/).includes(tag);
      const okDay = !day || cday === day;

      const ok = okQ && okTag && okDay;
      c.style.display = ok ? "" : "none";
      if (ok) shown++;
    });

    const empty = document.getElementById("emptyState");
    if (empty) empty.style.display = shown ? "none" : "";
  }

  searchBox?.addEventListener("input", apply);
  dayBox?.addEventListener("change", apply);
  tagSelect?.addEventListener("change", () => {
    chips?.querySelectorAll("button[data-tag]").forEach(b => b.classList.toggle("active", b.dataset.tag === tagSelect.value));
    apply();
  });

  chips?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-tag]");
    if (!btn) return;
    const t = btn.dataset.tag;
    tagSelect.value = (tagSelect.value === t) ? "" : t;
    tagSelect.dispatchEvent(new Event("change"));
  });

  apply();
})();

// Join/Leave buttons (index cards)
document.addEventListener("click", async (e) => {
  const joinBtn = e.target.closest(".btn-join");
  const leaveBtn = e.target.closest(".btn-leave");
  if (!joinBtn && !leaveBtn) return;

  const id = (joinBtn || leaveBtn).dataset.id;
  try {
    if (joinBtn) {
      joinBtn.disabled = true;
      await postJson(`/api/sessions/${id}/join`);
      toast("Joined session!", "success");
      location.reload();
    } else {
      await postJson(`/api/sessions/${id}/leave`);
      toast("Left session.", "secondary");
      location.reload();
    }
  } catch (err) {
    toast(err.message, "danger");
    if (joinBtn) joinBtn.disabled = false;
  }
});

// Join/Leave buttons (detail page)
(function initDetailJoinLeave(){
  const join = document.getElementById("joinBtn");
  const leave = document.getElementById("leaveBtn");
  const countEl = document.getElementById("count");
  if (!join && !leave) return;

  const id = (join || leave).dataset.id;

  join?.addEventListener("click", async () => {
    try {
      join.disabled = true;
      const data = await postJson(`/api/sessions/${id}/join`);
      if (countEl) countEl.textContent = data.attendeeCount;
      toast("Joined session!", "success");
      leave.style.display = "";
      join.textContent = "Joined";
    } catch (err) {
      toast(err.message, "danger");
      join.disabled = false;
    }
  });

  leave?.addEventListener("click", async () => {
    try {
      const data = await postJson(`/api/sessions/${id}/leave`);
      if (countEl) countEl.textContent = data.attendeeCount;
      toast("Left session.", "secondary");
      leave.style.display = "none";
      join.disabled = false;
      join.textContent = "Join";
    } catch (err) {
      toast(err.message, "danger");
    }
  });
})();
