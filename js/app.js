let attractions = [
    { id: 1, name: "Zamek w Łańcucie", city: "Łańcut", type: "zabytek", cost: 46.00, rating: 4.6 },
    { id: 2, name: "Połonina Wetlińska", city: "Cisna", type: "natura", cost: 11.00, rating: 4.9 },
    { id: 3, name: "Zapora Solina", city: "Solina", type: "rozrywka", cost: 0.00, rating: 4.7 },
    { id: 4, name: "Muzeum Budownictwa Ludowego w Sanoku", city: "Sanok", type: "zabytek", cost: 32.00, rating: 4.7 },
    { id: 5, name: "Bieszczadzki Park Narodowy", city: "Ustrzyki Górne", type: "natura", cost: 11.00, rating: 4.9 },
    { id: 6, name: "Rzeszowskie Piwnice", city: "Rzeszów", type: "zabytek", cost: 25.00, rating: 4.7 },
    { id: 7, name: "Zamek Baranów Sandomierski", city: "Baranów Sandomierski", type: "zabytek", cost: 32.00, rating: 4.5 },
    { id: 8, name: "Rezerwat Prządki", city: "Korczyna", type: "natura", cost: 0.00, rating: 4.8 },
    { id: 9, name: "Kolej Gondolowa w Solinie", city: "Solina", type: "rozrywka", cost: 49.00, rating: 4.8 },
    { id: 10, name: "Arboretum Bolestraszyce", city: "Bolestraszyce", type: "natura", cost: 27.00, rating: 4.7 },
    { id: 11, name: "Bieszczadzka Kolejka Leśna", city: "Majdan", type: "rozrywka", cost: 47.00, rating: 4.5 },
    { id: 12, name: "Centrum Dziedzictwa Szkła w Krośnie", city: "Krosno", type: "rozrywka", cost: 33.00, rating: 4.7 },
    { id: 13, name: "Klasztor Zagórz", city: "Zagórz", type: "zabytek", cost: 20.00, rating: 4.7 },
    { id: 14, name: "Cerkiew pw. Michała Archanioła", city: "Turzańsk", type: "zabytek", cost: 0.00, rating: 4.6 },
    { id: 15, name: "Wodospad w Iwli", city: "Iwla", type: "natura", cost: 0.00, rating: 4.6 }
];

let myPlan = [];
let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    renderTable();
    renderPlan();
    updateDashboard();
    initChart();

    document.querySelector('#search-input').addEventListener('input', renderTable);
    document.querySelector('#filter-type').addEventListener('change', renderTable);
    document.querySelector('#sort-select').addEventListener('change', renderTable);
    document.querySelector('#add-form').addEventListener('submit', handleAddForm);
});

// system nawigacji i scrollowania dla sekcji
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

        if (targetId === 'start') {
            setTimeout(initChart, 100);
        }
    }

    function scrollToSection(sectionId) {
        switchView('start');
        setTimeout(() => {
            const section = document.querySelector(`#${sectionId}`);
            if (section) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight || 70;
                const elementPosition = section.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - navbarHeight - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 50);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = link.getAttribute('data-target');
            const scrollTarget = link.getAttribute('data-scroll');

            switchView(targetView);
            if (scrollTarget) {
                scrollToSection(scrollTarget);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    scrollBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const scrollTarget = btn.getAttribute('data-scroll');
            scrollToSection(scrollTarget);
        });
    });

    pageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const pageTarget = btn.getAttribute('data-target');
            switchView(pageTarget);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
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
        return matchesQuery && matchesType;
    });

    if (sort === 'price-asc') list.sort((a, b) => a.cost - b.cost);
    if (sort === 'price-desc') list.sort((a, b) => b.cost - a.cost);
    if (sort === 'rating-desc') list.sort((a, b) => b.rating - a.rating);

    tbody.innerHTML = '';

    list.forEach(item => {
        const tr = document.createElement('tr');
        const inPlan = myPlan.some(p => p.id === item.id);

        tr.innerHTML = `
            <td><strong>${item.name}</strong></td>
            <td>${item.city}</td>
            <td>${item.type}</td>
            <td>${item.cost === 0 ? 'Darmowe' : item.cost.toFixed(2) + ' PLN'}</td>
            <td>⭐ ${item.rating.toFixed(1)}</td>
            <td>
                <button type="button" class="btn btn-secondary" ${inPlan ? 'disabled style="opacity:0.5"' : ''}>
                    ${inPlan ? 'Dodano ✓' : 'Dodaj do planu'}
                </button>
            </td>
        `;

        if (!inPlan) {
            tr.querySelector('button').addEventListener('click', () => addToPlan(item.id));
        }

        tbody.appendChild(tr);
    });
}

function addToPlan(id) {
    const item = attractions.find(a => a.id === id);
    if (item) {
        myPlan.push(item);
        renderPlan();
        renderTable();
    }
}

function removeFromPlan(id) {
    myPlan = myPlan.filter(p => p.id !== id);
    renderPlan();
    renderTable();
}

function renderPlan() {
    const planTbody = document.querySelector('#plan-tbody');
    if (!planTbody) return;
    planTbody.innerHTML = '';
    let sum = 0;

    if (myPlan.length === 0) {
        planTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#64748b; padding:2rem;">Brak wybranych atrakcji w planie. Kliknij „Dodaj do planu” przy obiektach na stronie głównej.</td></tr>';
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
    const total = attractions.length;
    const free = attractions.filter(a => a.cost === 0).length;
    const avg = total > 0 ? (attractions.reduce((s, a) => s + a.cost, 0) / total).toFixed(2) : '0.00';

    document.querySelector('#kpi-total').textContent = total;
    document.querySelector('#kpi-avg').textContent = `${avg} PLN`;
    document.querySelector('#kpi-free').textContent = free;
}

function initChart() {
    const chartCanvas = document.querySelector('#attractionsChart');
    if (!chartCanvas) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = chartCanvas.getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Zabytki', 'Natura', 'Rozrywka'],
            datasets: [{
                data: [getCounts().zabytek, getCounts().natura, getCounts().rozrywka],
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

function getCounts() {
    return {
        zabytek: attractions.filter(a => a.type === 'zabytek').length,
        natura: attractions.filter(a => a.type === 'natura').length,
        rozrywka: attractions.filter(a => a.type === 'rozrywka').length
    };
}

function handleAddForm(e) {
    e.preventDefault();

    const email = document.querySelector('#form-email').value.trim();
    const msgEl = document.querySelector('#form-message');

    const atIndex = email.indexOf('@');
    const dotIndex = email.lastIndexOf('.');

    if (atIndex < 1 || dotIndex <= atIndex + 1 || dotIndex === email.length - 1) {
        msgEl.textContent = "Błąd: Wprowadź poprawny adres e-mail.";
        msgEl.style.backgroundColor = "#fee2e2";
        msgEl.style.color = "#991b1b";
        msgEl.style.border = "1px solid #fca5a5";
        msgEl.classList.remove('hidden');
        return;
    }

    const name = document.querySelector('#form-name').value.trim();
    const city = document.querySelector('#form-city').value.trim();
    const type = document.querySelector('#form-type').value;
    const cost = parseFloat(document.querySelector('#form-cost').value);
    const rating = parseFloat(document.querySelector('#form-rating').value);

    attractions.push({ id: Date.now(), name, city, type, cost, rating });

    renderTable();
    updateDashboard();

    msgEl.textContent = "Atrakcja została pomyślnie dodana!";
    msgEl.className = "message success";
    msgEl.style = "";
    msgEl.classList.remove('hidden');

    document.querySelector('#add-form').reset();
}
