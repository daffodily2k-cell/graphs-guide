(function () {
  const $ = id => document.getElementById(id);
  const input = $('expr'), err = $('error'), graph = new Graph($('graph')), list = $('explainText'), deriv = $('deriv');
  let timer, saveT;

  function explain(f, src) {
    const r = Analyze.run(f, src);
    list.innerHTML = '';
    (r.lines.length ? r.lines : ['Plotted. Nothing special stands out between x = -20 and 20.']).forEach(t => { const li = document.createElement('li'); li.textContent = t; list.appendChild(li); });
    deriv.hidden = !r.derivative;
    if (r.derivative) deriv.textContent = 'Slope formula (the derivative): ' + r.derivative;
  }
  function plot(silent) {
    try {
      const f = ExprParser.parse(input.value);
      f(1); err.hidden = true; graph.setFn(f); explain(f, input.value);
      if (!silent) History.add(input.value);
      if (!silent) Guide.hint('plotted', 'See where the curve crosses the axes? Those points are listed in the card.');
    } catch (e) {
      if (!silent) { err.textContent = e.message; err.hidden = false; Guide.hint('error', 'Check the message under the box. Use x for the variable and ^ for powers.'); }
    }
  }
  $('plot').addEventListener('click', () => plot(false));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') plot(false); });
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => plot(true), 350); clearTimeout(saveT); saveT = setTimeout(() => { try { ExprParser.parse(input.value)(1); History.add(input.value); } catch (e) {} }, 1500); });
  $('resetView').addEventListener('click', () => graph.reset());
  ['pointermove', 'wheel'].forEach(ev => $('graph').addEventListener(ev, e => { if (ev === 'wheel' || e.buttons) Guide.hint('moved', 'Moving or zooming only changes your view, not the expression. Tap Reset view to come back.'); }, { passive: true }));

  // keypad
  const keys = ['x', '^', '(', ')', '⌫', '7', '8', '9', '÷', 'C', '4', '5', '6', '×', '√(', '1', '2', '3', '−', 'π', '0', '.', '+', 'sin(', 'cos('], pad = $('keypad');
  keys.forEach(k => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = k.replace('(', ''); b.setAttribute('aria-label', k);
    b.addEventListener('click', () => { if (k === 'C') input.value = ''; else if (k === '⌫') input.value = input.value.slice(0, -1); else input.value += k; input.focus(); input.dispatchEvent(new Event('input')); });
    pad.appendChild(b);
  });
  $('kpToggle').addEventListener('click', e => { const open = pad.hidden; pad.hidden = !open; e.currentTarget.textContent = open ? 'Hide keypad' : 'Show keypad'; e.currentTarget.setAttribute('aria-expanded', open); });

  // help menu
  const top = $('topActions'), btn = document.createElement('button'), menu = document.createElement('div');
  btn.className = 'icon-btn'; btn.type = 'button'; btn.textContent = '?'; btn.setAttribute('aria-label', 'Help and tips');
  menu.className = 'menu'; menu.hidden = true;
  const replay = document.createElement('button'), tog = document.createElement('button');
  replay.type = tog.type = 'button'; replay.textContent = 'Replay tips';
  const label = () => (tog.textContent = Guide.isEnabled() ? 'Tips: on (tap to turn off)' : 'Tips: off (tap to turn on)'); label();
  replay.addEventListener('click', () => { menu.hidden = true; Guide.setEnabled(true); label(); Guide.start(); });
  tog.addEventListener('click', () => { Guide.setEnabled(!Guide.isEnabled()); label(); menu.hidden = true; });
  menu.append(replay, tog); top.append(btn, menu);
  btn.addEventListener('click', () => { menu.hidden = !menu.hidden; });
  document.addEventListener('click', e => { if (!top.contains(e.target)) menu.hidden = true; });

  History.init(e => { input.value = e; plot(false); });
  plot(true); Guide.init();
})();
