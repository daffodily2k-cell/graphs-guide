/* Saved plots, kept on this device (localStorage). */
(function (g) {
  const KEY = 'gg_history', MAX = 60;
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const save = a => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} };
  let pick = () => {};
  const $ = id => document.getElementById(id);
  function render() {
    const ul = $('historyList'), items = load();
    ul.innerHTML = ''; $('histEmpty').hidden = items.length > 0; $('histClear').hidden = !items.length;
    items.forEach(it => {
      const li = document.createElement('li'), b = document.createElement('button'), x = document.createElement('button'), when = document.createElement('small');
      b.type = x.type = 'button'; b.className = 'hist-pick'; b.textContent = it.e;
      when.textContent = new Date(it.t).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); b.appendChild(when);
      x.className = 'hist-del'; x.textContent = '×'; x.setAttribute('aria-label', 'Remove ' + it.e);
      b.addEventListener('click', () => pick(it.e));
      x.addEventListener('click', () => { save(load().filter(i => i.e !== it.e)); render(); });
      li.append(b, x); ul.appendChild(li);
    });
  }
  function add(expr) {
    expr = (expr || '').trim(); if (!expr) return;
    save([{ e: expr, t: Date.now() }].concat(load().filter(i => i.e !== expr)).slice(0, MAX)); render();
  }
  function init(cb) {
    pick = cb; render();
    $('histClear').addEventListener('click', () => { if (confirm('Clear all saved plots?')) { save([]); render(); } });
  }
  g.History = { init, add };
})(window);
