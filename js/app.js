const defaultAttractions = [
    { id: 1, name: "Zamek w Łańcucie", city: "Łańcut", type: "Zabytek", cost: 46.00, rating: 4.6, isApproved: true },
    { id: 2, name: "Połonina Wetlińska", city: "Cisna", type: "Natura", cost: 11.00, rating: 4.9, isApproved: true },
    { id: 3, name: "Zapora Solina", city: "Solina", type: "Rozrywka", cost: 0.00, rating: 4.7, isApproved: true },
    { id: 4, name: "Muzeum Budownictwa Ludowego w Sanoku", city: "Sanok", type: "Zabytek", cost: 32.00, rating: 4.7, isApproved: true },
    { id: 5, name: "Bieszczadzki Park Narodowy", city: "Ustrzyki Górne", type: "Natura", cost: 11.00, rating: 4.9, isApproved: true },
    { id: 6, name: "Rzeszowskie Piwnice", city: "Rzeszów", type: "Zabytek", cost: 25.00, rating: 4.7, isApproved: true },
    { id: 7, name: "Zamek Baranów Sandomierski", city: "Baranów Sandomierski", type: "Zabytek", cost: 32.00, rating: 4.5, isApproved: true },
    { id: 8, name: "Rezerwat Prządki", city: "Korczyna", type: "Natura", cost: 0.00, rating: 4.8, isApproved: true },
    { id: 9, name: "Kolej Gondolowa w Solinie", city: "Solina", type: "Rozrywka", cost: 49.00, rating: 4.8, isApproved: true },
    { id: 10, name: "Arboretum Bolestraszyce", city: "Bolestraszyce", type: "Natura", cost: 27.00, rating: 4.7, isApproved: true },
    { id: 11, name: "Bieszczadzka Kolejka Leśna", city: "Majdan", type: "Rozrywka", cost: 47.00, rating: 4.5, isApproved: true },
    { id: 12, name: "Centrum Dziedzictwa Szkła w Krośnie", city: "Krosno", type: "Rozrywka", cost: 33.00, rating: 4.7, isApproved: true },
    { id: 13, name: "Klasztor Zagórz", city: "Zagórz", type: "Zabytek", cost: 20.00, rating: 4.7, isApproved: true },
    { id: 14, name: "Cerkiew pw. Michała Archanioła", city: "Turzańsk", type: "Zabytek", cost: 0.00, rating: 4.6, isApproved: true },
    { id: 15, name: "Wodospad w Iwli", city: "Iwla", type: "Natura", cost: 0.00, rating: 4.6, isApproved: true }
];

let attractions = JSON.parse(localStorage.getItem('podkarpacie_data')) || defaultAttractions;
let users = JSON.parse(localStorage.getItem('podkarpacie_users')) || [{ username: 'admin', password: 'admin123' }];
let reviews = JSON.parse(localStorage.getItem('podkarpacie_reviews')) || [
    { id: 101, attractionId: 1, user: "JanKowalski", text: "Przepiękne miejsce, warte zobaczenia!", rating: 5, isApproved: true }
];
let currentUser = localStorage.getItem('podkarpacie_current_user') || null;
let myPlan = currentUser ? (JSON.parse(localStorage.getItem(`plan_${currentUser}`)) || []) : [];

let chartInstance = null;
let expectedCaptchaResult = 0;
let currentPage = 1;
const rowsPerPage = 5;

function saveToStorage() {
    localStorage.setItem('podkarpacie_data', JSON.stringify(attractions));
    localStorage.setItem('podkarpacie_users', JSON.stringify(users));
    localStorage.setItem('podkarpacie_reviews', JSON.stringify(reviews));
    if (currentUser) {
        localStorage.setItem(`plan_${currentUser}`, JSON.stringify(myPlan));
        localStorage.setItem('podkarpacie_current_user', currentUser);
    } else {
        localStorage.removeItem('podkarpacie_current_user');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupThemeToggle();
    setupImageModal();
    checkAuthSession();
    renderTable();
    renderPlan();
    updateDashboard();
    initChart();
    generateCaptcha();

    document.querySelector('#search-input').addEventListener('input', () => { currentPage = 1; renderTable(); });
    document.querySelector('#filter-type').addEventListener('change', () => { currentPage = 1; renderTable(); });
    document.querySelector('#sort-select').addEventListener('change', () => { currentPage = 1; renderTable(); });
    document.querySelector('#add-form').addEventListener('submit', handleAddForm);
    
    document.querySelector('#btn-login').addEventListener('click', handleLogin);
    document.querySelector('#btn-register').addEventListener('click', handleRegister);
    document.querySelector('#btn-logout').addEventListener('click', handleLogout);
    document.querySelector('#admin-show-pending').addEventListener('click', toggleAdminView);

    document.querySelector('#prev-page').addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; renderTable(); }
    });
    document.querySelector('#next-page').addEventListener('click', () => {
        currentPage++; renderTable();
    });
});

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-btn');
    const scrollBtns = document.querySelectorAll('.scroll-btn');
    const pageBtns = document.querySelectorAll('.page-btn');

    function switchView(targetId) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

        const targetTab = document.querySelector(`#${targetId}`);
        if (targetTab) targetTab.classList.add('active');

        const activeNavBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
        if (activeNavBtn) activeNavBtn.classList.add('active');

        if (targetId === 'start') setTimeout(initChart, 100);
    }

    function scrollToSection(sectionId) {
        switchView('start');
        setTimeout(() => {
            const section = document.querySelector(`#${sectionId}`);
            if (section) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight || 70;
                const elementPosition = section.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: elementPosition - navbarHeight - 20, behavior: 'smooth' });
            }
        }, 50);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = link.getAttribute('data-target');
            const scrollTarget = link.getAttribute('data-scroll');
            switchView(targetView);
            if (scrollTarget) scrollToSection(scrollTarget);
            else window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    scrollBtns.forEach(btn => {
        btn.addEventListener('click', () => scrollToSection(btn.getAttribute('data-scroll')));
    });

    pageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchView(btn.getAttribute('data-target'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

function setupThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) document.body.classList.add('dark-mode');
    
    btn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
}

function setupImageModal() {
    const modal = document.getElementById('photoModal');
    const modalImg = document.getElementById('modalImg');
    const modalCaption = document.getElementById('modalCaption');
    const figures = document.querySelectorAll('.hero-gallery figure');

    figures.forEach(figure => {
        const img = figure.querySelector('img');
        const caption = figure.querySelector('figcaption');
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            modal.style.display = 'flex';
            modalImg.src = img.src;
            modalCaption.textContent = caption ? caption.textContent : '';
        });
    });

    modal.addEventListener('click', () => { modal.style.display = 'none'; });
}

function renderTable() {
    const tbody = document.querySelector('#attractions-tbody');
    if (!tbody) return;

    const query = document.querySelector('#search-input').value.toLowerCase().trim();
    const type = document.querySelector('#filter-type').value;
    const sort = document.querySelector('#sort-select').value;

    let list = attractions.filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(query) || item.city.toLowerCase().includes(query);
        const matchesType = type === 'all' || item.type === type;
        const matchesApproval = item.isApproved === true;
        return matchesQuery && matchesType && matchesApproval;
    });

    if (sort === 'price-asc') list.sort((a, b) => a.cost - b.cost);
    if (sort === 'price-desc') list.sort((a, b) => b.cost - a.cost);
    if (sort === 'rating-desc') list.sort((a, b) => b.rating - a.rating);

    const totalPages = Math.ceil(list.length / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * rowsPerPage;
    const paginatedList = list.slice(start, start + rowsPerPage);

    tbody.innerHTML = '';

    paginatedList.forEach(item => {
        const tr = document.createElement('tr');
        const inPlan = myPlan.some(p => p.id === item.id);
        const isAdmin = currentUser === 'admin';

        const itemReviews = reviews.filter(r => r.attractionId === item.id && r.isApproved);
        let reviewsHtml = itemReviews.length > 0 ? '<div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">' : '';
        itemReviews.forEach(r => {
            reviewsHtml += `💬 <strong>${r.user}</strong>: "${r.text}" (⭐${r.rating})<br>`;
        });
        if (itemReviews.length > 0) reviewsHtml += '</div>';

        tr.innerHTML = `
            <td>
                <strong>${item.name}</strong>
                ${reviewsHtml}
            </td>
            <td>${item.city}</td>
            <td>${item.type}</td>
            <td>${item.cost === 0 ? 'Darmowe' : item.cost.toFixed(2) + ' PLN'}</td>
            <td>⭐ ${item.rating.toFixed(1)}</td>
            <td>
                <button type="button" class="btn btn-secondary btn-sm" ${!currentUser ? 'disabled style="opacity:0.5" title="Zaloguj się"' : (inPlan ? 'disabled style="opacity:0.5"' : '')}>
                    ${inPlan ? 'Dodano ✓' : 'Dodaj do planu'}
                </button>
                ${currentUser ? `<button type="button" class="btn btn-secondary btn-sm" onclick="openReviewModal(${item.id})" style="margin-left: 5px;">Oceń</button>` : ''}
                ${isAdmin ? `<button type="button" class="btn btn-btn-delete btn-sm" onclick="deleteAttractionFromBase(${item.id})" style="margin-left: 5px;">Usuń</button>` : ''}
            </td>
        `;

        if (currentUser && !inPlan) {
            tr.querySelector('.btn-secondary').addEventListener('click', () => addToPlan(item.id));
        }
        tbody.appendChild(tr);
    });

    document.querySelector('#page-info').textContent = `Strona ${currentPage} z ${totalPages}`;
    document.querySelector('#prev-page').disabled = currentPage === 1;
    document.querySelector('#next-page').disabled = currentPage === totalPages || totalPages === 0;
}

function addToPlan(id) {
    if (!currentUser) { alert("Musisz być zalogowany, aby dodawać obiekty do planu!"); return; }
    const item = attractions.find(a => a.id === id);
    if (item) { myPlan.push(item); saveToStorage(); renderPlan(); renderTable(); }
}

function removeFromPlan(id) {
    myPlan = myPlan.filter(p => p.id !== id);
    saveToStorage(); renderPlan(); renderTable();
}

function renderPlan() {
    const planTbody = document.querySelector('#plan-tbody');
    if (!planTbody) return;
    planTbody.innerHTML = '';
    let sum = 0;

    if (!currentUser) {
        planTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:2rem;">Zaloguj się w zakładce "Konto", aby zobaczyć swój plan wycieczki.</td></tr>';
    } else if (myPlan.length === 0) {
        planTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:2rem;">Brak wybranych atrakcji w Twoim planie. Przejdź do zakładki "Dane", aby je dodać.</td></tr>';
    } else {
        myPlan.forEach(item => {
            sum += item.cost;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.name}</strong></td>
                <td>${item.city}</td>
                <td>${item.cost === 0 ? 'Darmowe' : item.cost.toFixed(2) + ' PLN'}</td>
                <td><button type="button" class="btn-btn-delete">Usuń</button></td>
            `;
            tr.querySelector('button').addEventListener('click', () => removeFromPlan(item.id));
            planTbody.appendChild(tr);
        });
    }
    document.querySelector('#plan-total').textContent = `${sum.toFixed(2)} PLN`;
}

function updateDashboard() {
    const approved = attractions.filter(a => a.isApproved);
    const total = approved.length;
    const free = approved.filter(a => a.cost === 0).length;
    const avg = total > 0 ? (approved.reduce((s, a) => s + a.cost, 0) / total).toFixed(2) : '0.00';

    document.querySelector('#kpi-total').textContent = total;
    document.querySelector('#kpi-avg').textContent = `${avg} PLN`;
    document.querySelector('#kpi-free').textContent = free;
}

function initChart() {
    const chartCanvas = document.querySelector('#attractionsChart');
    if (!chartCanvas) return;
    if (chartInstance) chartInstance.destroy();

    const approved = attractions.filter(a => a.isApproved);
    const zabytek = approved.filter(a => a.type === 'Zabytek').length;
    const natura = approved.filter(a => a.type === 'Natura').length;
    const rozrywka = approved.filter(a => a.type === 'Rozrywka').length;

    const ctx = chartCanvas.getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Zabytki', 'Natura', 'Rozrywka'],
            datasets: [{
                data: [zabytek, natura, rozrywka],
                backgroundColor: ['#be3c33', '#18b62a', '#dbdb15'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    expectedCaptchaResult = num1 + num2;
    const questionEl = document.querySelector('#captcha-question');
    if (questionEl) questionEl.textContent = `${num1} + ${num2}`;
}

function handleAddForm(e) {
    e.preventDefault();
    const msgEl = document.querySelector('#form-message');
    
    const captcha = parseInt(document.querySelector('#form-captcha').value);
    if (captcha !== expectedCaptchaResult) { 
        msgEl.textContent = "Błąd weryfikacji. Zły wynik obliczeń.";
        msgEl.className = "message";
        msgEl.style = "background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;";
        msgEl.classList.remove('hidden');
        generateCaptcha(); 
        document.querySelector('#form-captcha').value = ''; 
        return;
    }

    const name = document.querySelector('#form-name').value.trim();
    const city = document.querySelector('#form-city').value.trim();
    const type = document.querySelector('#form-type').value;
    const cost = parseFloat(document.querySelector('#form-cost').value);
    const rating = parseFloat(document.querySelector('#form-rating').value);

    attractions.push({ id: Date.now(), name, city, type, cost, rating, isApproved: false });
    saveToStorage();

    msgEl.textContent = "Atrakcja zgłoszona! Oczekuje na weryfikację przez administratora.";
    msgEl.className = "message success";
    msgEl.style = "";
    msgEl.classList.remove('hidden');
    document.querySelector('#add-form').reset();
    generateCaptcha(); 
}

function checkAuthSession() {
    const authContainer = document.querySelector('#auth-container');
    const userDashboard = document.querySelector('#user-dashboard');
    const adminSubpanel = document.querySelector('#admin-subpanel');
    const usernameSpan = document.querySelector('#current-username');

    if (currentUser) {
        authContainer.classList.add('hidden');
        userDashboard.classList.remove('hidden');
        usernameSpan.textContent = currentUser;

        if (currentUser === 'admin') {
            adminSubpanel.classList.remove('hidden');
        } else {
            adminSubpanel.classList.add('hidden');
        }
    } else {
        authContainer.classList.remove('hidden');
        userDashboard.classList.add('hidden');
    }
}

function handleRegister() {
    const user = document.querySelector('#reg-user').value.trim();
    const pass = document.querySelector('#reg-pass').value.trim();
    const msg = document.querySelector('#reg-message');

    if (!user || !pass) {
        msg.textContent = "Wypełnij login i hasło!";
        msg.style = "background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;";
        msg.classList.remove('hidden');
        return;
    }

    if (users.some(u => u.username === user)) {
        msg.textContent = "Taki użytkownik już istnieje!";
        msg.style = "background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;";
        msg.classList.remove('hidden');
        return;
    }

    users.push({ username: user, password: pass });
    saveToStorage();

    msg.textContent = "Konto utworzone! Możesz się teraz zalogować.";
    msg.style = "background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;";
    msg.classList.remove('hidden');
    document.querySelector('#reg-user').value = '';
    document.querySelector('#reg-pass').value = '';
}

function handleLogin() {
    const user = document.querySelector('#login-user').value.trim();
    const pass = document.querySelector('#login-pass').value.trim();
    const errorEl = document.querySelector('#login-error');

    const found = users.find(u => u.username === user && u.password === pass);

    if (found) {
        currentUser = user;
        myPlan = JSON.parse(localStorage.getItem(`plan_${currentUser}`)) || [];
        saveToStorage();
        checkAuthSession();
        renderTable();
        renderPlan();
        errorEl.classList.add('hidden');
        document.querySelector('#login-user').value = '';
        document.querySelector('#login-pass').value = '';
    } else {
        errorEl.textContent = 'Błędny login lub hasło!';
        errorEl.classList.remove('hidden');
    }
}

function handleLogout() {
    currentUser = null;
    myPlan = [];
    localStorage.removeItem('podkarpacie_current_user');
    checkAuthSession();
    renderTable();
    renderPlan();
}

function toggleAdminView() {
    const pending = attractions.filter(a => !a.isApproved);
    const pendingReviews = reviews.filter(r => !r.isApproved);
    const listContainer = document.querySelector('#admin-pending-list');
    listContainer.style.display = 'block';

    if (pending.length === 0 && pendingReviews.length === 0) {
        listContainer.innerHTML = '<p style="color: var(--text-muted); font-weight: bold;">Brak obiektów i opinii oczekujących na weryfikację.</p>';
        return;
    }
    
    let html = '';
    
    if (pending.length > 0) {
        html += '<h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">Oczekujące atrakcje:</h4>';
        html += '<ul style="list-style: none; padding: 0; margin-bottom: 1rem;">';
        pending.forEach(p => {
            const costText = p.cost === 0 ? 'Darmowe' : `${p.cost.toFixed(2)} PLN`;
            html += `
                <li style="padding: 0.85rem; border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; background: var(--bg-color);">
                    <span><strong>${p.name}</strong> (${p.city}) — <span style="color: var(--text-muted);">${p.type}</span> | <strong>Koszt:</strong> ${costText} | ⭐ <strong>${p.rating}</strong></span>
                    <div>
                        <button onclick="approveAttraction(${p.id})" class="btn btn-primary btn-sm">Akceptuj</button>
                        <button onclick="rejectAttraction(${p.id})" class="btn btn-btn-delete btn-sm" style="margin-left: 0.5rem;">Odrzuć</button>
                    </div>
                </li>
            `;
        });
        html += '</ul>';
    }

    if (pendingReviews.length > 0) {
        html += '<h4 style="color: var(--primary-color); margin: 1rem 0 0.5rem 0;">Oczekujące opinie:</h4>';
        html += '<ul style="list-style: none; padding: 0; margin-bottom: 1rem;">';
        pendingReviews.forEach(r => {
            const attr = attractions.find(a => a.id === r.attractionId);
            const attrName = attr ? attr.name : 'Atrakcja';
            html += `
                <li style="padding: 0.85rem; border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; background: var(--bg-color);">
                    <span><strong>${r.user}</strong> o <em>${attrName}</em>: "${r.text}" (⭐${r.rating})</span>
                    <div>
                        <button onclick="approveReview(${r.id})" class="btn btn-primary btn-sm">Akceptuj</button>
                        <button onclick="rejectReview(${r.id})" class="btn btn-btn-delete btn-sm" style="margin-left: 0.5rem;">Odrzuć</button>
                    </div>
                </li>
            `;
        });
        html += '</ul>';
    }
    
    html += '<button id="admin-approve-all" class="btn btn-secondary">Akceptuj wszystko</button>';
    listContainer.innerHTML = html;

    document.getElementById('admin-approve-all').addEventListener('click', () => {
        attractions.forEach(a => a.isApproved = true);
        reviews.forEach(r => r.isApproved = true);
        updateAllData();
    });
}

window.approveAttraction = function(id) {
    const item = attractions.find(a => a.id === id);
    if (item) item.isApproved = true;
    updateAllData();
};

window.rejectAttraction = function(id) {
    attractions = attractions.filter(a => a.id !== id);
    updateAllData();
};

window.approveReview = function(id) {
    const rev = reviews.find(r => r.id === id);
    if (rev) rev.isApproved = true;
    updateAllData();
};

window.rejectReview = function(id) {
    reviews = reviews.filter(r => r.id !== id);
    updateAllData();
};

window.openReviewModal = function(attractionId) {
    const text = prompt("Napisz swoją opinię o tej atrakcji:");
    if (!text) return;
    const ratingStr = prompt("Oceń atrakcję w skali od 1 do 5:");
    const rating = parseFloat(ratingStr);

    if (isNaN(rating) || rating < 1 || rating > 5) {
        alert("Ocena musi być liczbą od 1 do 5!");
        return;
    }

    reviews.push({
        id: Date.now(),
        attractionId: attractionId,
        user: currentUser,
        text: text.trim(),
        rating: rating,
        isApproved: false
    });

    saveToStorage();
    alert("Twoja opinia została dodana i oczekuje na zatwierdzenie przez administratora.");
};

window.deleteAttractionFromBase = function(id) {
    if (confirm("Czy na pewno chcesz trwale usunąć tę atrakcję z bazy?")) {
        attractions = attractions.filter(a => a.id !== id);
        updateAllData();
    }
};

function updateAllData() {
    saveToStorage();
    renderTable();
    updateDashboard();
    initChart();
    if (currentUser === 'admin') toggleAdminView();
}
