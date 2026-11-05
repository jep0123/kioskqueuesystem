
const K = 'mcdolibee-v1',
    MENU = [
        ['c', '🍗', 'Fried Chicken (1 pc.) w/ Rice', 'Crispy, juicy and served with steamed rice', 95, 'Best seller'],
        ['c', '🍗', 'Fried Chicken (2 pcs.) w/ Rice', 'Double the crunch for big appetites', 165],
        ['c', '🌶️', 'Spicy Chicken w/ Rice', 'Fiery kick with our secret chili glaze', 105, 'Hot'],
        ['b', '🍔', 'Yum Burger', 'Beef patty, cheese, lettuce, special sauce', 65],
        ['b', '🥪', 'Chicken Sandwich', 'Crispy fillet with creamy mayo', 89],
        ['b', '🍔', 'Double Cheeseburger', 'Two patties, two slices of melty cheese', 129, 'New'],
        ['k', '🪣', '6-pc. Chicken Bucket', 'Six pieces of golden fried chicken', 299],
        ['k', '🪣', '8-pc. Chicken Bucket', 'Eight pieces, perfect for sharing', 389, 'Best seller'],
        ['k', '🪣', '12-pc. Chicken Bucket', 'Twelve pieces for the whole barkada', 569],
        ['g', '🍱', 'Barkada Meal (4)', '4 chicken, 4 rice, 4 drinks', 420, 'Value'],
        ['g', '🍱', 'Family Feast (6)', '6 chicken, 6 rice, fries, 6 drinks', 640],
        ['g', '🥡', 'Party Box (10)', 'Chicken, spaghetti, fries and drinks', 980],
        ['s', '🍟', 'Crispy Fries', 'Salty, golden and hot', 55],
        ['s', '🍝', 'Sweet Spaghetti', 'Filipino-style with hotdog slices', 60],
        ['s', '🥔', 'Mashed Potato', 'Creamy with gravy', 40],
        ['d', '🍦', 'Sundae', 'Soft serve with chocolate or strawberry', 39],
        ['d', '🥧', 'Hot Peach Pie', 'Crunchy shell, warm filling', 35],
        ['d', '🍨', 'Halo-Halo', 'Shaved ice, sweet beans, ube and leche flan', 79, 'Fan fave'],
        ['v', '🥤', 'Iced Tea', 'Refreshing and cold', 35],
        ['v', '🥤', 'Cola Float', 'Cola topped with vanilla ice cream', 59],
        ['v', '☕', 'Hot Coffee', 'Freshly brewed', 45]
    ].map((m, i) => ({
        id: i,
        cat: m[0],
        e: m[1],
        n: m[2],
        d: m[3],
        p: m[4],
        tag: m[5]
    }));

const CATS = [
    ['c', '🍗', 'Chicken Meals'],
    ['b', '🍔', 'Burger Sandwich'],
    ['k', '🪣', 'Chicken Buckets'],
    ['g', '🍱', 'Group Meals'],
    ['s', '🍟', 'Side Snacks'],
    ['d', '🍦', 'Desserts'],
    ['v', '🥤', 'Beverages']
];

const $ = s => document.getElementById(s),
    peso = n => '₱' + n.toFixed(2),
    by = id => MENU[id];

let S = load(),
    cart = [],
    cat = 'c',
    step = 'welcome',
    type = 'Dine In',
    pay = 'Cash',
    modal = false,
    last = null,
    timer = null,
    seen = -1;


// Storage

function load() {
    try {
        const s = JSON.parse(localStorage.getItem(K));

        if (s && s.orders) return s;
    } catch (e) {}

    return {
        next: 1001,
        orders: []
    };
}

function save() {
    try {
        localStorage.setItem(K, JSON.stringify(S));
    } catch (e) {}
}

window.addEventListener('storage', e => {
    if (e.key === K) {
        S = load();

        if (route() != 'kiosk') render();
    }
});

const route = () => window.PAGE || 'home';

const topbar = (t) => `
    <div class="top">
        <div class="logo">Mc<span>Dolibee</span></div>
        <div>${t}</div>
        <div class="sp"></div>
        <a href="index.html">⌂ Home</a>
    </div>
`;

const mins = ms => {
    const s = Math.max(0, Math.floor(ms / 1000));

    return String(Math.floor(s / 60)).padStart(2, '0') +
        ':' +
        String(s % 60).padStart(2, '0');
};

const total = () => cart.reduce((a, c) => a + by(c.id).p * c.q, 0),
    count = () => cart.reduce((a, c) => a + c.q, 0);


// Cart Functions

function add(id) {
    const c = cart.find(x => x.id == id);

    c ? c.q++ : cart.push({ id, q: 1 });

    render();
}

function chg(id, d) {
    const c = cart.find(x => x.id == id);

    c.q += d;

    if (c.q < 1) cart = cart.filter(x => x != c);
    if (!cart.length) modal = false;

    render();
}


// Order Functions

function place() {
    S = load();

    const o = {
        id: S.next++,
        items: cart.map(c => ({ ...c })),
        type,
        pay,
        total: total(),
        status: 'new',
        t: Date.now()
    };

    S.orders.push(o);
    save();

    last = o;
    cart = [];
    modal = false;
    step = 'done';

    let n = 20;

    render();
    clearInterval(timer);

    timer = setInterval(() => {
        n--;

        const e = $('cd');

        if (e) e.textContent = n;

        if (n <= 0 || step != 'done') {
            clearInterval(timer);

            if (step == 'done') {
                step = 'welcome';
                render();
            }
        }
    }, 1000);
}

function setS(id, st) {
    S = load();

    const o = S.orders.find(x => x.id == id);

    o.status = st;

    if (st == 'done') o.td = Date.now();
    if (st == 'prep') o.tp = Date.now();

    save();
    render();
}

function reset() {
    if (confirm('Clear all orders and restart ticket numbers?')) {
        S = {
            next: 1001,
            orders: []
        };

        save();
        render();
    }
}


// Sound

function beep() {
    try {
        const a = new (window.AudioContext || window.webkitAudioContext)(),
            o = a.createOscillator(),
            g = a.createGain();

        o.connect(g);
        g.connect(a.destination);

        o.frequency.value = 880;
        g.gain.setValueAtTime(.2, a.currentTime);
        g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .5);

        o.start();
        o.stop(a.currentTime + .5);
    } catch (e) {}
}


// Cart HTML

function cartHTML() {
    return `
        <h3>🛒 Your Order</h3>

        <div class="lines">
            ${cart.length ? cart.map(c => {
                const m = by(c.id);

                return `
                    <div class="ln">
                        <span style="font-size:26px">${m.e}</span>

                        <div class="n">
                            ${m.n}
                            <small>${peso(m.p)} each</small>
                        </div>

                        <div class="q">
                            <button onclick="chg(${c.id},-1)">−</button>
                            <b>${c.q}</b>
                            <button onclick="chg(${c.id},1)">+</button>
                            <button class="rm" onclick="chg(${c.id},-99)" title="Remove">✕</button>
                        </div>
                    </div>
                `;
            }).join('') : `
                <div class="empty">
                    <b>🍽️</b>
                    Your cart is empty.<br>
                    Tap a food item to add it!
                </div>
            `}
        </div>

        <div class="tot b">
            <span>Total</span>
            <span>${peso(total())}</span>
        </div>

        <button class="btn" style="width:100%;margin-top:10px" ${cart.length ? '' : 'disabled'} onclick="modal=true;render()">
            Check Out →
        </button>

        <button class="btn o" style="width:100%;margin-top:8px;padding:9px" ${cart.length ? '' : 'disabled'} onclick="cart=[];render()">
            Clear cart
        </button>
    `;
}


// Customer Kiosk

function kiosk() {
    if (step == 'welcome') {
        return topbar('Self-Order Kiosk') + `
            <div class="welcome">
                <div>
                    <div class="em">🍔</div>
                    <h1>Hungry? Order here!</h1>

                    <p style="color:var(--mut)">
                        Tap how you’d like to eat to start your order.
                    </p>

                    <div class="mode">
                        <button onclick="type='Dine In';step='menu';render()">
                            <b>🍽️</b>
                            Dine In
                        </button>

                        <button onclick="type='Take Out';step='menu';render()">
                            <b>🛍️</b>
                            Take Out
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    if (step == 'done') {
        return topbar('Order placed') + `
            <div class="done">
                <div class="ticket pop">
                    <h2>Thank you! 🎉</h2>
                    <p>Your ticket number is</p>

                    <div class="num">#${last.id}</div>

                    <p>
                        ${last.type} · ${last.pay} ·
                        <b>${peso(last.total)}</b>
                    </p>

                    <div style="text-align:left;background:var(--bg);border-radius:14px;padding:10px 14px;font-size:14px">
                        ${last.items.map(c => `${c.q}× ${by(c.id).n}`).join('<br>')}
                    </div>

                    <p style="color:var(--mut);font-size:13px">
                        Watch the screen for your number. Please wait for it to be called under “Now Serving”.
                        ${last.pay == 'Cash' ? ' Please pay at the counter.' : ''}
                    </p>
                </div>

                <button class="btn" style="margin-top:18px" onclick="step='welcome';render()">
                    New order (<span id="cd">20</span>)
                </button>
            </div>
        `;
    }

    const items = MENU.filter(m => m.cat == cat),
        cn = CATS.find(c => c[0] == cat);

    let h = topbar(`${type === 'Dine In' ? '🍽️' : '🛍️'} ${type}`) + `
        <div class="shop">
            <div class="cats">
                ${CATS.map(c => `
                    <button class="cat ${c[0] == cat ? 'on' : ''}" onclick="cat='${c[0]}';render()">
                        <b>${c[1]}</b>
                        ${c[2]}
                    </button>
                `).join('')}
            </div>

            <div class="menu">
                <h2>${cn[1]} ${cn[2]}</h2>

                <div class="grid">
                    ${items.map(m => {
                        const q = (cart.find(c => c.id == m.id) || {}).q;

                        return `
                            <div class="item">
                                ${m.tag ? `<span class="tag">${m.tag}</span>` : ''}

                                <div class="pic">${m.e}</div>
                                <h4>${m.n}</h4>
                                <p>${m.d}</p>

                                <div class="pr">
                                    <b>${peso(m.p)}</b>

                                    <button class="add" onclick="add(${m.id})">
                                        ${q ? `Add more (${q})` : '+ Add'}
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="cart">
                ${cartHTML()}
            </div>
        </div>

        <button class="btn fab" onclick="modal=true;render()" ${cart.length ? '' : 'disabled'}>
            <span>🛒 ${count()} item${count() == 1 ? '' : 's'}</span>
            <span>View cart · ${peso(total())}</span>
        </button>
    `;

    if (modal) {
        h += `
            <div class="modal" onclick="if(event.target==this){modal=false;render()}">
                <div class="mbox">
                    <h2>Review your order</h2>

                    <div class="lines" style="max-height:34vh">
                        ${cart.map(c => {
                            const m = by(c.id);

                            return `
                                <div class="ln">
                                    <span style="font-size:26px">${m.e}</span>

                                    <div class="n">
                                        ${m.n}
                                        <small>${peso(m.p)}</small>
                                    </div>

                                    <div class="q">
                                        <button onclick="chg(${c.id},-1)">−</button>
                                        <b>${c.q}</b>
                                        <button onclick="chg(${c.id},1)">+</button>
                                    </div>

                                    <b>${peso(m.p * c.q)}</b>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div class="tot b">
                        <span>Total</span>
                        <span>${peso(total())}</span>
                    </div>

                    <h4 style="margin:14px 0 0">Payment method</h4>

                    <div class="pay">
                        ${[['Cash', '💵'], ['GCash', '📱'], ['Card', '💳']].map(p => `
                            <button class="${pay == p[0] ? 'on' : ''}" onclick="pay='${p[0]}';render()">
                                <b>${p[1]}</b>
                                ${p[0]}
                            </button>
                        `).join('')}
                    </div>

                    <div style="display:flex;gap:10px">
                        <button class="btn o" onclick="modal=false;render()">
                            ← Back
                        </button>

                        <button class="btn g" style="flex:1" onclick="place()">
                            Place Order ✓
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    return h;
}


// Kitchen Queue

function kitchen() {
    const now = Date.now(),
        O = S.orders,
        nw = O.filter(o => o.status == 'new'),
        pr = O.filter(o => o.status == 'prep'),
        dn = O.filter(o => o.status == 'done').sort((a, b) => b.td - a.td);

    if (seen >= 0 && nw.length > seen) beep();

    seen = nw.length;

    const tk = o => {
        const ms = now - o.t,
            late = ms > 300000 && o.status != 'done';

        return `
            <div class="tk ${o.status == 'prep' ? 'prep' : ''} ${late ? 'late' : ''}">
                <header>
                    <b>#${o.id}</b>

                    <span class="meta">
                        ${o.type == 'Dine In' ? '🍽️' : '🛍️'} ${o.type} · ${o.pay}
                        <br>
                        ⏱ ${mins(ms)} waiting
                    </span>
                </header>

                <ul>
                    ${o.items.map(c => `
                        <li>
                            <b>${c.q}×</b>
                            ${by(c.id).n}
                        </li>
                    `).join('')}
                </ul>

                <div class="acts">
                    ${o.status == 'new' ? `
                        <button class="btn y" onclick="setS(${o.id},'prep')">
                            👨‍🍳 Start Preparing
                        </button>
                    ` : `
                        <button class="btn g" onclick="setS(${o.id},'done')">
                            ✓ Complete Order
                        </button>
                    `}
                </div>
            </div>
        `;
    };

    const avg = dn.length
        ? dn.reduce((a, o) => a + (o.td - o.t), 0) / dn.length
        : 0;

    return topbar('Kitchen Queue') + `
        <div class="kit">
            <div class="col">
                <h2>
                    📥 In Queue
                    <span class="badge">${nw.length}</span>
                </h2>

                ${nw.map(tk).join('') || '<div class="none">No orders waiting 🎉</div>'}
            </div>

            <div class="col">
                <h2>
                    🔥 Preparing
                    <span class="badge">${pr.length}</span>
                </h2>

                ${pr.map(tk).join('') || '<div class="none">Nothing on the stove</div>'}
            </div>

            <div>
                <div class="stat">
                    <div class="meta">Orders today</div>
                    <div class="big">${O.length}</div>
                </div>

                <div class="stat">
                    <div class="meta">Completed · Avg. time</div>
                    <div class="big">${dn.length} · ${mins(avg)}</div>
                </div>

                <div class="stat hist">
                    <b>Recently completed</b>

                    ${dn.slice(0, 8).map(o => `
                        <div>
                            <span>#${o.id}</span>
                            <span>${peso(o.total)}</span>
                        </div>
                    `).join('') || '<p class="meta">None yet</p>'}
                </div>

                <button class="btn o" style="width:100%" onclick="reset()">
                    Reset day
                </button>
            </div>
        </div>
    `;
}


// Display Board

function display() {
    const O = S.orders,
        pr = O.filter(o => o.status != 'done'),
        dn = O.filter(o => o.status == 'done')
            .sort((a, b) => b.td - a.td)
            .slice(0, 6);

    return topbar('Order Status Board') + `
        <div class="board">
            <div class="bp p">
                <h2>👨‍🍳 Now Preparing</h2>

                <div class="nums">
                    ${pr.map(o => `
                        <div class="nm">${o.id}</div>
                    `).join('') || '<p style="color:var(--mut)">No pending orders</p>'}
                </div>
            </div>

            <div class="bp s">
                <h2>✅ Now Serving</h2>

                <div class="nums">
                    ${dn.map((o, i) => `
                        <div class="nm ${i ? '' : 'first'}">${o.id}</div>
                    `).join('') || '<p>Waiting for the first order…</p>'}
                </div>

                ${dn.length ? '<p style="margin-top:20px;font-size:20px">Please claim your order at the counter 🛎️</p>' : ''}
            </div>
        </div>
    `;
}


// Home Page

function home() {
    return `
        <div class="home">
            <div style="font-size:64px">🍗🍔🍟</div>

            <h1>Mc<span>Dolibee</span></h1>

            <p style="color:var(--mut)">
                Fast food ordering system
            </p>

            <div class="cards">
                <a class="hc" href="kiosk.html">
                    <i>🖥️</i>
                    <h3>Customer Kiosk</h3>
                    <p>Browse the menu, build a cart, check out</p>
                </a>

                <a class="hc" href="kitchen.html">
                    <i>👨‍🍳</i>
                    <h3>Kitchen Queue</h3>
                    <p>Start and complete orders</p>
                </a>

                <a class="hc" href="display.html">
                    <i>📺</i>
                    <h3>Status Board</h3>
                    <p>Now Preparing &amp; Now Serving screen</p>
                </a>
            </div>

            <p class="note">
                WARNING : open each screen in its own tab or window.
                Orders sync live between tabs in the same browser.
            </p>
        </div>
    `;
}


// Render and Initialization

function render() {
    const r = route();

    if (r != 'kitchen') seen = -1;

    $('app').innerHTML =
        r == 'kiosk' ? kiosk() :
        r == 'kitchen' ? kitchen() :
        r == 'display' ? display() :
        home();
}

window.addEventListener('hashchange', () => {
    S = load();
    render();
});

setInterval(() => {
    const r = route();

    if (r == 'kitchen') {
        S = load();

        const y = scrollY;

        render();
        scrollTo(0, y);
    } else if (r == 'display') {
        S = load();
        render();
    }
}, 1000);

render();
