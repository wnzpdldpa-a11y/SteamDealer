const $ = (s, r = document) => r.querySelector(s);
// index.html은 루트, 나머지는 pages/ 안에 있으므로 경로 기준을 페이지별로 계산
const IS_HOME = document.body.dataset.page === 'home';
const ROOT = IS_HOME ? './' : '../';          // 프로젝트 루트(assets, index.html)
const PAGES = IS_HOME ? './pages/' : './';    // pages 폴더
const fmt = n => '₩' + n, disc = g => Math.round((1 - g.price / g.orig) * 100);
const G = (id, name, genre, cat, price, orig, low, max, app) => ({ id, name, genre, cat, price, orig, low, max, app });
// 샘플 데이터: 실제 데이터로 교체하세요. app = Steam 앱 ID
const GAMES = [
    G('witcher3', 'The Witcher 3: Wild Hunt', 'RPG', 'RPG', 8900, 44000, 8900, 80, 292030),
    G('bg3', "Baldur's Gate 3", 'RPG', 'RPG', 52800, 66000, 39600, 25, 1086940),
    G('mhw', 'MONSTER HUNTER WORLD', 'RPG', 'RPG', 12140, 36800, 9568, 74, 582010),
    G('civ6', "Sid Meier's Civilization VI", '전략', '전략', 6500, 65000, 6500, 90, 289070),
    G('hades', 'Hades', '액션 로그라이크', '액션', 8100, 27000, 6750, 75, 1145360),
    G('rdr', 'Red Dead Redemption', '액션 어드벤처', '액션', 19800, 66000, 16500, 75, 1174180),
    G('cyberpunk', 'Cyberpunk 2077', 'RPG', 'RPG', 29500, 59000, 14975, 65, 1091500),
    G('ittakestwo', 'It Takes Two', '협동 어드벤처', '어드벤처', 17600, 44000, 10000, 65, 1426210),
    G('hollowknight', 'Hollow Knight', '메트로베니아', '인디', 8250, 16500, 8250, 50, 367520)];
const CATS = ['전체', 'RPG', '액션', '인디', '전략', '시뮬레이션', '어드벤처'];
const SORT = { disc: (a, b) => disc(b) - disc(a), price: (a, b) => a.price - b.price, max: (a, b) => b.max - a.max };
const SORT_OPTS = '<option value="disc">할인률 높은순</option><option value="price">가격 낮은순</option><option value="max">역대 최고 할인률순</option>';
const store = { get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d } catch { return d } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch { } } };
const saved = { get: () => store.get('sd-saved', ['witcher3']), toggle(id) { const a = this.get(); store.set('sd-saved', a.includes(id) ? a.filter(x => x !== id) : [...a, id]) } };
const chips = (el, cur) => el.innerHTML = CATS.map(c => `<button class="chip${c === cur ? ' on' : ''}" data-c="${c}">${c}</button>`).join('');
const steamdb = g => `href="#" data-appid="${g.app}"`; /* TODO: SteamDB 기록 페이지 URL 연결 */

const card = (g, wl) => { const on = saved.get().includes(g.id); return `<article class="card"><div class="thumb"><img src="${ROOT}assets/games/${g.id}.jpg" alt="" onerror="this.remove()"><b>${g.name}</b>${wl ? '' : `<button class="heart${on ? ' on' : ''}" data-save="${g.id}" aria-label="관심 게임 ${on ? '해제' : '저장'}">♥</button>`}</div><div class="body"><small>${g.cat}</small><h3>${g.name}</h3><p class="pr"><strong>${fmt(g.price)}</strong><s>${fmt(g.orig)}</s><span>${disc(g)}% 세일</span></p><div class="row"><span>역대 최고 할인률</span><em>${g.max}%</em></div>${wl ? `<div class="acts"><button class="lnk" data-save="${g.id}">관심 저장됨 ♡</button><a class="lnk" ${steamdb(g)}>가격 기록 ↗</a></div>` : ''}</div></article>` };

/* 공통 헤더/푸터 */
const NAV = [['할인 탐색', ROOT + 'index.html', 'home'], ['가격 히스토리', PAGES + 'history.html', 'history'], ['세일 캘린더', PAGES + 'calendar.html', 'calendar'], ['관심 게임', PAGES + 'watchlist.html', 'watchlist']];
const page = document.body.dataset.page;
const mark = `<span class="mark"><img src="${ROOT}assets/steam-logo.png" alt="" onerror="this.remove()"></span>`;
$('#site-header').innerHTML = `<div class="wrap"><a class="brand" href="${ROOT}index.html">${mark}Steam Dealer</a><nav aria-label="주 메뉴">${NAV.map(([t, h, k]) => `<a href="${h}"${k === page ? ' class="on" aria-current="page"' : ''}>${t}</a>`).join('')}</nav></div>`;
$('#site-footer').innerHTML = `<div class="wrap foot"><div><a class="brand" href="${ROOT}index.html">${mark}Steam Dealer</a><p>할인율만이 아니라 가격의 맥락을 읽는<br>스마트 Steam 세일 트래커</p></div><div><h4>바로가기</h4><ul>${NAV.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul></div><div><h4>안내</h4><p>화면의 가격과 할인 기록은 기능 시연용 예시 데이터이며 실시간 Steam 가격이 아닙니다. 세일 예측은 참고용이며 실제 할인 여부를 보장하지 않습니다.</p></div></div><div class="wrap copy">© 2026 Steam Dealer. Valve 및 Steam과 무관한 비공식 프로젝트입니다.</div>`;

document.addEventListener('click', e => { const b = e.target.closest('[data-save]'); if (b) { saved.toggle(b.dataset.save); window.redraw && redraw() } });

/* 페이지별 */
if (page === 'home') {
    const s = { c: '전체', q: '', o: 'disc', n: 3 };
    $('#sort').innerHTML = SORT_OPTS;
    window.redraw = () => {
        chips($('#chips'), s.c);
        const L = GAMES.filter(g => (s.c === '전체' || g.cat === s.c) && (g.name + g.genre).toLowerCase().includes(s.q)).sort(SORT[s.o]);
        $('#grid').innerHTML = L.slice(0, s.n).map(g => card(g)).join('') || '<p class="empty">조건에 맞는 게임이 없습니다. 다른 장르나 검색어를 선택해 보세요.</p>';
        $('#more').hidden = L.length <= s.n
    };
    $('#chips').onclick = e => { const c = e.target.dataset.c; if (c) { s.c = c; s.n = 3; redraw() } };
    $('#q').oninput = e => { s.q = e.target.value.trim().toLowerCase(); s.n = 3; redraw() };
    $('#sort').onchange = e => { s.o = e.target.value; redraw() };
    $('#more').onclick = () => { s.n += 3; redraw() };
    redraw();
}
if (page === 'history') {
    const s = { q: '', o: 'disc' }; $('#sort').innerHTML = SORT_OPTS;
    window.redraw = () => {
        const L = GAMES.filter(g => g.name.toLowerCase().includes(s.q) || g.genre.includes(s.q)).sort(SORT[s.o]);
        $('#rows').innerHTML = L.map(g => `<tr><td>${g.name}</td><td>${g.genre}</td><td>-${disc(g)}%</td><td>${g.price}</td><td>${g.low}</td><td>-${g.max}%</td></tr>`).join('') || '<tr><td colspan="6">검색 결과가 없습니다.</td></tr>'
    };
    $('#q').oninput = e => { s.q = e.target.value.trim().toLowerCase(); redraw() };
    $('#sort').onchange = e => { s.o = e.target.value; redraw() }; redraw();
}
if (page === 'calendar') {
    const S = [['OCTOBER HOLLOWEEN', '할로윈 시즌', '공포 생존 다크판타지<br>분위기에 맞춘 공포 테마 세일이 열릴 수 있습니다.', '높음'],
    ['NOVEMBER AUTUMN', '가을 / 블랙프라이데이', '인디, 액션, RPG, 대형 퍼블리셔 게임<br>연말 전 대규모 할인 행사를 살펴볼 기회입니다.', '높음'],
    ['DECEMBER WINTER', '겨울 세일', 'RPG, 어드벤처, 인기구작, 번들<br>연중 큰 규모의 할인 시즌 중 하나로 자주 활용됩니다.', '높음'],
    ['MARCH / JUN SEASONAL', '봄 여름 세일', '다양한 장르 인디, 멀티플레이 게임<br>특정 장르에 한정되지 않은 폭넓은 할인 기회를 확인하세요.', '중상'],
    ['PUBLISHER EVENT', '퍼블리셔 기념 행사', '개별 퍼블리셔 이벤트가 열리면<br>관련 작품이 함께 할인될 수 있습니다.', '행사별 상이'],
    ['FRANCHISE ANNIVERSARY', '시리즈 출시 기념', '같은 시리즈의 이전 작품, DLC, 번들<br>기념 프로모션이 열리는 경우 관련 작품을 살펴볼 만합니다.', '행사별 상이']];
    $('#seasons').innerHTML = S.map(([a, t, d, r]) => `<article class="panel"><small>${a}</small><h3>${t}</h3><p>${d}</p><em>상대적 기대: ${r}</em></article>`).join('');
    window.redraw = () => { const c = store.get('sd-genre', 'RPG'); chips($('#chips'), c); $('#picked').textContent = '선택한 장르: ' + c };
    $('#chips').onclick = e => { const c = e.target.dataset.c; if (c) { store.set('sd-genre', c); redraw() } }; redraw();
}
if (page === 'watchlist') {
    window.redraw = () => {
        const L = GAMES.filter(g => saved.get().includes(g.id));
        const sum = k => L.reduce((t, g) => t + g[k], 0);
        $('#stats').innerHTML = [['저장한 게임', String(L.length).padStart(2, '0')], ['관심게임 현재가 합계', fmt(sum('price'))], ['역대 최저가 합계', fmt(sum('low'))], ['차액', sum('price') - sum('low')]].map(([a, b]) => `<div><small>${a}</small><p>${b}</p></div>`).join('');
        $('#grid').innerHTML = L.map(g => card(g, 1)).join('') || '<p class="empty">저장한 게임이 없습니다. 할인 탐색에서 하트를 눌러 추가해 보세요.</p>';
        $('#rows').innerHTML = L.map(g => `<tr><td>${g.name}</td><td>${fmt(g.price)}</td><td>${fmt(g.low)}</td><td>${g.price - g.low}</td><td>${disc(g)}%</td><td><a class="small-btn" ${steamdb(g)}>기록 보기</a></td></tr>`).join('') || '<tr><td colspan="6">비교할 게임이 없습니다.</td></tr>'
    };
    redraw();
}
