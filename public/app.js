const $ = id => document.getElementById(id);
const ws = new WebSocket((location.protocol === "https:" ? "wss://" : "ws://") + location.host);

ws.onopen = () => {
  $("status").textContent = "● conectado";
  $("status").className = "status online";
};
ws.onclose = () => {
  $("status").textContent = "● desconectado";
  $("status").className = "status offline";
};

function send(type, extra={}) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({type, ...extra}));
}

$("apply").onclick = () => send("configure", {
  count: $("count").value,
  avgTps: $("avg").value
});
$("start").onclick = () => send("start");
$("pause").onclick = () => send("pause");
$("reset").onclick = () => send("reset");

function fmtTime(sec) {
  sec = Math.floor(sec);
  const h = Math.floor(sec/3600), m = Math.floor(sec%3600/60), s = sec%60;
  return h ? `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` :
             `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

ws.onmessage = e => {
  const d = JSON.parse(e.data);
  if (d.type !== "state") return;
  $("spectators").textContent = d.spectators.toLocaleString("pt-BR");
  $("active").textContent = d.active.toLocaleString("pt-BR");
  $("total").textContent = d.totalTaps.toLocaleString("pt-BR");
  $("tps").textContent = d.tapsPerSecond.toFixed(1).replace(".", ",");
  $("elapsed").textContent = fmtTime(d.elapsed);

  const frag = document.createDocumentFragment();
  for (const p of d.people) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${p.id}</td><td><span class="dot"></span>${p.active ? "ativo" : "inativo"}</td><td>${p.tps.toFixed(2)}</td><td>${p.taps.toLocaleString("pt-BR")}</td>`;
    frag.appendChild(tr);
  }
  $("people").replaceChildren(frag);
};