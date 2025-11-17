const API_BASE = "/activities";

async function fetchActivities() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to load activities");
  return res.json();
}

function initialsFromEmail(email) {
  const name = email.split("@")[0];
  const parts = name.split(/[\.\-_]/).filter(Boolean);
  const letters = parts.length ? parts.map(p => p[0]) : [name[0]];
  return (letters.slice(0,2).join("") || name.slice(0,2)).toUpperCase();
}

function createParticipantList(participants) {
  if (!participants || participants.length === 0) {
    const p = document.createElement("p");
    p.className = "info";
    p.textContent = "No participants yet";
    return p;
  }

  const ul = document.createElement("ul");
  ul.className = "participants-list";
  participants.forEach(email => {
    const li = document.createElement("li");
    li.className = "participant-item";

    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.textContent = initialsFromEmail(email);

    const text = document.createElement("span");
    text.className = "participant-email";
    text.textContent = email;

    li.appendChild(avatar);
    li.appendChild(text);
    ul.appendChild(li);
  });
  return ul;
}

function renderActivities(activities) {
  const list = document.getElementById("activities-list");
  const select = document.getElementById("activity");
  list.innerHTML = "";
  select.querySelectorAll("option:not([value=''])").forEach(o => o.remove());

  Object.entries(activities).forEach(([name, info]) => {
    // Card wrapper
    const card = document.createElement("div");
    card.className = "activity-card";

    const h4 = document.createElement("h4");
    h4.textContent = name;

    const desc = document.createElement("p");
    desc.textContent = info.description;

    const schedule = document.createElement("p");
    schedule.innerHTML = `<strong>Schedule:</strong> ${info.schedule}`;

    const capacity = document.createElement("p");
    capacity.innerHTML = `<strong>Capacity:</strong> ${info.participants.length} / ${info.max_participants}`;

    // Participants section
    const participantsSection = document.createElement("div");
    participantsSection.className = "participants-section";
    const participantsTitle = document.createElement("p");
    participantsTitle.className = "participants-title";
    participantsTitle.textContent = "Participants:";
    participantsSection.appendChild(participantsTitle);
    participantsSection.appendChild(createParticipantList(info.participants));

    card.appendChild(h4);
    card.appendChild(desc);
    card.appendChild(schedule);
    card.appendChild(capacity);
    card.appendChild(participantsSection);

    list.appendChild(card);

    // Add to select
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

function showMessage(text, type = "info") {
  const msg = document.getElementById("message");
  msg.className = `message ${type}`;
  msg.textContent = text;
  msg.classList.remove("hidden");
  // auto-hide after a while
  clearTimeout(showMessage._t);
  showMessage._t = setTimeout(() => msg.classList.add("hidden"), 5000);
}

async function handleSignup(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const activity = document.getElementById("activity").value;
  if (!email || !activity) {
    showMessage("Please provide an email and select an activity.", "error");
    return;
  }

  try {
    const url = `${API_BASE}/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { method: "POST" });
    if (!res.ok) {
      const err = await res.json().catch(()=>({detail:res.statusText}));
      throw new Error(err.detail || "Signup failed");
    }
    const data = await res.json();
    showMessage(data.message || "Signed up successfully!", "success");
    // Refresh activities to show updated participants
    const activities = await fetchActivities();
    renderActivities(activities);
    // clear email input
    document.getElementById("email").value = "";
  } catch (err) {
    showMessage(err.message || "An error occurred", "error");
  }
}

async function init() {
  try {
    const activities = await fetchActivities();
    renderActivities(activities);
  } catch (err) {
    const list = document.getElementById("activities-list");
    list.innerHTML = `<p class="error">Unable to load activities.</p>`;
  }

  document.getElementById("signup-form").addEventListener("submit", handleSignup);
}

document.addEventListener("DOMContentLoaded", init);
