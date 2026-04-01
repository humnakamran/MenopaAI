// ════════════════════════════════════════════════════════════
//  MenopaAI — Complete Frontend Logic
// ════════════════════════════════════════════════════════════

// ── State ─────────────────────────────────────────────────────────────────────
let currentLang       = 'en';
let lastPredictions   = null;
let radarChartInst    = null;
let trendChartInst    = null;
let pakChartInst      = null;

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    initHeroTilt();
    setupLanguageToggle();
    setupQuestionnaire();
    setupChatbot();
});

// ── Hero tilt ─────────────────────────────────────────────────────────────────
function initHeroTilt() {
    const img = document.querySelector('.hero-image img');
    if (!img) return;
    img.addEventListener('mousemove', (e) => {
        const rect = img.getBoundingClientRect();
        const tx = ((e.clientX - rect.left - rect.width/2)  / (rect.width/2))  * 15;
        const ty = ((e.clientY - rect.top  - rect.height/2) / (rect.height/2)) * -15;
        img.style.transform = `perspective(1000px) rotateX(${ty}deg) rotateY(${tx}deg) scale(1.06)`;
    });
    img.addEventListener('mouseleave', () => { img.style.transform = ''; });
}



// ── Language Toggle (Urdu / English) ─────────────────────────────────────────
function setupLanguageToggle() {
    const btn = document.getElementById('lang-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'ur' : 'en';
        btn.textContent = currentLang === 'en' ? 'اردو' : 'EN';
        document.documentElement.setAttribute('lang', currentLang);
        document.querySelectorAll('[data-en]').forEach(el => {
            el.textContent = el.getAttribute(`data-${currentLang}`) || el.getAttribute('data-en');
        });
        // Re-apply button inner spans
        document.querySelectorAll('button [data-en]').forEach(el => {
            el.textContent = el.getAttribute(`data-${currentLang}`) || el.getAttribute('data-en');
        });
    });
}

// ════════════════════════════════════════════════════════════
//  QUESTIONNAIRE
// ════════════════════════════════════════════════════════════
function setupQuestionnaire() {
    const welcomeSection       = document.getElementById('welcome-section');
    const questionnaireSection = document.getElementById('questionnaire-section');
    const breatheSection       = document.getElementById('breathe-section');
    const resultsSection       = document.getElementById('results-section');
    const startBtn             = document.getElementById('start-btn');
    const prevBtn              = document.getElementById('prev-btn');
    const nextBtn              = document.getElementById('next-btn');
    const submitBtn            = document.getElementById('submit-btn');
    const restartBtn           = document.getElementById('restart-btn');
    const stepDisplay          = document.getElementById('current-step-display');
    const breatheText          = document.getElementById('breathe-text');
    const skipBreatheBtn       = document.getElementById('skip-breathe-btn');
    const downloadPdfBtn       = document.getElementById('download-pdf-btn');

    let currentStep = 1;
    const totalSteps = 7;
    let breatheInterval, breatheTimeout, skipTimeout;

    // ── BMI Calculator ────────────────────────────────────────────────────────
    ['height','weight'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', calculateBMI);
    });

    function calculateBMI() {
        const h = parseFloat(document.getElementById('height')?.value) / 100;
        const w = parseFloat(document.getElementById('weight')?.value);
        const bmiVal  = document.getElementById('bmi-value');
        const bmiStat = document.getElementById('bmi-status');
        if (h > 0 && w > 0) {
            const bmi = (w / (h * h)).toFixed(1);
            bmiVal.innerText = bmi;
            bmiStat.className = 'badge';
            if      (bmi < 18.5) { bmiStat.classList.add('underweight'); bmiStat.innerText = 'Underweight'; }
            else if (bmi < 25)   { bmiStat.classList.add('normal');      bmiStat.innerText = 'Normal'; }
            else if (bmi < 30)   { bmiStat.classList.add('overweight');  bmiStat.innerText = 'Overweight'; }
            else                 { bmiStat.classList.add('obese');        bmiStat.innerText = 'Obese'; }
        } else { bmiVal.innerText = '--'; bmiStat.innerText = '--'; }
    }

    // ── Navigation ────────────────────────────────────────────────────────────
    startBtn?.addEventListener('click', () => {
        welcomeSection.classList.add('hidden');
        questionnaireSection.classList.remove('hidden');
        updateStepUI();
    });

    nextBtn?.addEventListener('click', () => {
        if (validateStep(currentStep) && currentStep < totalSteps) {
            currentStep++;
            updateStepUI();
        }
    });

    prevBtn?.addEventListener('click', () => {
        if (currentStep > 1) { currentStep--; updateStepUI(); }
    });

    restartBtn?.addEventListener('click', () => {
        lastPredictions = null;
        resultsSection.classList.add('hidden');
        welcomeSection.classList.remove('hidden');
        currentStep = 1;
        clearInterval(breatheInterval);
        clearTimeout(breatheTimeout);
        clearTimeout(skipTimeout);
    });

    // ── Validate step ─────────────────────────────────────────────────────────
    function validateStep(step) {
        if (step === 1) {
            const age = parseInt(document.getElementById('age')?.value);
            const err = document.getElementById('age-err');
            if (!age || age < 18 || age > 80) {
                err?.classList.add('visible');
                document.getElementById('age')?.classList.add('input-invalid');
                return false;
            }
            err?.classList.remove('visible');
            document.getElementById('age')?.classList.remove('input-invalid');
        }
        return true;
    }

    // ── Step visibility ───────────────────────────────────────────────────────
    function updateStepUI() {
        for (let i = 1; i <= totalSteps; i++) {
            const el = document.getElementById(`step-${i}`);
            if (!el) continue;
            el.classList.remove('active');
            el.classList.add('hidden');
        }
        const curr = document.getElementById(`step-${currentStep}`);
        if (curr) { curr.classList.remove('hidden'); setTimeout(() => curr.classList.add('active'), 10); }

        prevBtn?.classList.toggle('hidden', currentStep === 1);
        if (currentStep === totalSteps) {
            nextBtn?.classList.add('hidden');
            submitBtn?.classList.remove('hidden');
        } else {
            nextBtn?.classList.remove('hidden');
            submitBtn?.classList.add('hidden');
        }
        if (stepDisplay) stepDisplay.innerText = currentStep;
        updateFlower();
    }

    // ── Flower progress ───────────────────────────────────────────────────────
    function updateFlower() {
        const petals = document.querySelectorAll('.petal');
        petals.forEach(p => p.classList.remove('bloomed'));
        if (currentStep >= 2) petals[0]?.classList.add('bloomed');
        if (currentStep >= 4) petals[1]?.classList.add('bloomed');
        if (currentStep >= 6) petals[2]?.classList.add('bloomed');
        if (currentStep >= 7) petals[3]?.classList.add('bloomed');
        const core = document.querySelector('.core');
        if (core) core.setAttribute('fill', currentStep === totalSteps ? '#D81B60' : '#f8bbd0');
    }

    // ── Submit ────────────────────────────────────────────────────────────────
    submitBtn?.addEventListener('click', async () => {
        if (!validateStep(currentStep)) return;
        questionnaireSection.classList.add('hidden');
        breatheSection?.classList.remove('hidden');
        skipBreatheBtn?.classList.add('hidden');

        // Breathing animation
        let phase = 0;
        if (breatheText) { breatheText.style.opacity = 1; breatheText.innerText = "Breathe In..."; }
        breatheInterval = setInterval(() => {
            if (breatheText) {
                breatheText.style.opacity = 0;
                setTimeout(() => {
                    phase = 1 - phase;
                    breatheText.innerText = phase === 0 ? "Breathe In..." : "Breathe Out...";
                    breatheText.style.opacity = 1;
                }, 500);
            }
        }, 4000);

        skipTimeout = setTimeout(() => skipBreatheBtn?.classList.remove('hidden'), 8000);

        const payload = collectFormData();
        console.log("Payload:", payload);
        let data = null;

        try {
            const res = await fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            data = await res.json();
            console.log("Prediction:", data);
        } catch(e) {
            console.error("Backend offline:", e);
        }

        const finish = () => {
            clearInterval(breatheInterval);
            clearTimeout(breatheTimeout);
            clearTimeout(skipTimeout);
            breatheSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');

            if (data?.status === 'success') {
                lastPredictions = data;
                populateResults(data);
            } else {
                populateFallbackResults(payload);
            }

            populateStaticFacts();
            renderPakChart();
            renderTrendTracker(data);
            loadFeatureImportance('Menopause Stage');
        };

        skipBreatheBtn && (skipBreatheBtn.onclick = finish);
        breatheTimeout = setTimeout(finish, 90000);
    });

    // ── PDF Download ──────────────────────────────────────────────────────────
    downloadPdfBtn?.addEventListener('click', async () => {
        const { jsPDF } = window.jspdf;
        const reportEl = document.getElementById('report-content');
        downloadPdfBtn.innerText = '⏳ Generating...';

        try {
            const canvas = await html2canvas(reportEl, { scale: 1.5, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const imgH  = (canvas.height * pageW) / canvas.width;

            let yPos = 0;
            while (yPos < imgH) {
                if (yPos > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, -yPos, pageW, imgH);
                yPos += pageH;
            }

            const date = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
            pdf.save(`MenopaAI_Report_${date}.pdf`);
        } catch(e) {
            console.error('PDF error:', e);
            alert('PDF generation failed. Please try again.');
        }

        downloadPdfBtn.innerHTML = '📄 <span>Download PDF</span>';
    });
}

// ── Collect form data ─────────────────────────────────────────────────────────
function collectFormData() {
    const intensity = document.getElementById('symptom-intensity')?.value || 'sometimes';
    const symptomData = {};
    document.querySelectorAll('#step-4 .symptoms-grid input[data-symptom]').forEach(cb => {
        symptomData[cb.dataset.symptom] = cb.checked ? intensity : 'never';
    });

    const condMap = {
        'cond-pcos': 'pcos', 'cond-diabetes': 'diabetes', 'cond-hypertension': 'hypertension',
        'cond-thyroid': 'thyroid disorder', 'cond-heart': 'heart disease',
        'cond-osteoporosis': 'osteoporosis', 'cond-anemia': 'anemia', 'cond-vitd': 'vitamin D deficiency'
    };
    const diagnosesList = [];
    Object.entries(condMap).forEach(([id, label]) => {
        if (document.getElementById(id)?.checked) diagnosesList.push(label);
    });

    const smokingChecked = document.getElementById('smoking')?.checked;
    return {
        age:      document.getElementById('age')?.value || '',
        height:   document.getElementById('height')?.value || '',
        weight:   document.getElementById('weight')?.value || '',
        cycle_pattern:            document.getElementById('cycle-pattern')?.value || 'regular',
        current_menstrual_status: document.getElementById('menstrual-status')?.value || 'regular periods',
        early_menopause:          document.getElementById('early-menopause')?.value || 'No',
        num_pregnancies:  document.getElementById('pregnancies')?.value || '0',
        live_births:      document.getElementById('live-births')?.value || '0',
        miscarriages:     document.getElementById('miscarriages')?.value || '0',
        stillbirth:       document.getElementById('stillbirth')?.checked ? 'Yes' : 'No',
        infertility_attempt: document.getElementById('infertility')?.checked ? 'Yes' : 'No',
        pcos_diagnosis:   document.getElementById('pcos-diagnosis')?.value || 'No',
        diagnoses:        diagnosesList.length ? diagnosesList.join(';') : 'none',
        family_history:   document.getElementById('family-history')?.value || 'none',
        diet:             document.getElementById('diet')?.value || 'Balanced/Mixed diet',
        physical_activity: document.getElementById('physical-activity')?.value || 'Moderate physical work',
        stress_level:     document.getElementById('stress-level')?.value || '2',
        smoking:  smokingChecked ? 'yes' : 'no',
        tobacco:  smokingChecked ? 'yes' : 'no',
        ...symptomData
    };
}

// ════════════════════════════════════════════════════════════
//  POPULATE RESULTS
// ════════════════════════════════════════════════════════════
function populateResults(data) {
    // ── Stage ──────────────────────────────────────────────────────────────
    const stageBadge = document.getElementById('result-stage');
    if (stageBadge) {
        stageBadge.innerText = data.stage_prediction;
        stageBadge.className = 'stage-badge';
        const cls = {'Pre-menopause':'pre','Peri-menopause':'peri','Post-menopause':'post'};
        stageBadge.classList.add('stage-' + (cls[data.stage_prediction] || 'pre'));
    }
    const stageDescs = {
        'Pre-menopause':  'Your menstrual cycle is still regular. Focus on building bone density now.',
        'Peri-menopause': 'You are in the transition phase. Symptoms may fluctuate — monitoring is key.',
        'Post-menopause': 'Periods have stopped. Prioritise bone, heart, and hormonal health.'
    };
    setHtml('result-stage-desc', stageDescs[data.stage_prediction] || '');

    // Confidence bars
    const confContainer = document.getElementById('stage-confidence-bars');
    if (confContainer && data.stage_confidence) {
        confContainer.innerHTML = Object.entries(data.stage_confidence).map(([stage, pct]) =>
            `<div class="conf-row">
                <span class="conf-label">${stage}</span>
                <div class="conf-bar-bg"><div class="conf-bar-fill" style="width:${pct}%"></div></div>
                <span class="conf-pct">${pct}%</span>
             </div>`
        ).join('');
    }

    // Accuracy chip
    const acc = data.model_accuracies?.['Menopause Stage'];
    if (acc) setHtml('stage-accuracy-chip', `🎯 Model Accuracy: <strong>${acc}%</strong>`);

    // ── Severity ────────────────────────────────────────────────────────────
    const sevBadge = document.getElementById('result-severity');
    if (sevBadge) {
        sevBadge.innerText = data.symptom_severity;
        sevBadge.className = 'severity-badge sev-' + data.symptom_severity.toLowerCase();
    }
    const sevDescs = {
        'Mild':     'Your symptoms are mild. Lifestyle adjustments may help.',
        'Moderate': 'Moderate symptoms. Consider speaking with a doctor.',
        'Severe':   'Severe symptom burden. Medical consultation strongly recommended.'
    };
    setHtml('result-severity-desc', sevDescs[data.symptom_severity] || '');

    // ── Hormonal ────────────────────────────────────────────────────────────
    const isYes = data.hormonal_imbalance === 'Yes';
    const horBadge = document.getElementById('result-hormonal');
    if (horBadge) {
        horBadge.innerText  = isYes ? '⚠️ Likely Imbalance' : '✅ No Concern';
        horBadge.className  = 'hormonal-badge hormonal-' + (isYes ? 'yes' : 'no');
    }
    setHtml('result-hormonal-desc', isYes
        ? 'Hormonal imbalance indicators found. An FSH, LH, estradiol panel test is advisable.'
        : 'No significant hormonal imbalance indicators detected.');

    // ── Risks ───────────────────────────────────────────────────────────────
    animateBar('osteo-bar',  data.osteo_pct  || 25, data.osteoporosis_risk);
    animateBar('cardio-bar', data.cardio_pct || 25, data.cardiovascular_risk);
    setHtml('result-osteo',  data.osteoporosis_risk);
    setHtml('result-cardio', data.cardiovascular_risk);

    const riskAcc = data.model_accuracies?.['Osteoporosis Risk'];
    if (riskAcc) setHtml('risk-accuracy-chip', `🎯 Risk Model Accuracy: <strong>${riskAcc}%</strong>`);

    // ── Reproductive ────────────────────────────────────────────────────────
    const reproBadge = document.getElementById('result-repro');
    if (reproBadge) {
        reproBadge.innerText = data.repro_profile;
        reproBadge.className = 'repro-badge repro-' +
            (data.repro_profile.includes('Normal') ? 'normal' :
             data.repro_profile.includes('Risk')   ? 'risk' : 'complicated');
    }
    const reproDescs = {
        'Fertile/Normal': 'Reproductive health appears normal. Continue routine gynecological check-ups.',
        'At Risk (PCOS/Infertility)': 'PCOS/infertility indicators detected. Consult a reproductive specialist.',
        'Complicated Reproductive History': 'Complex reproductive history noted. Regular monitoring advised.'
    };
    setHtml('result-repro-desc', reproDescs[data.repro_profile] || '');

    // ── Radar Chart ─────────────────────────────────────────────────────────
    if (data.radar_data) renderRadarChart(data.radar_data);

    // ── Recommendations ─────────────────────────────────────────────────────
    const recsList = document.getElementById('recs-list');
    if (recsList && data.recommendations) {
        recsList.innerHTML = data.recommendations.map(rec =>
            `<li><span class="emoji">${rec.emoji}</span><div><strong>${rec.title}:</strong> ${rec.text}</div></li>`
        ).join('');
    }

    // Animate cards in sequence
    document.querySelectorAll('.animate-in').forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), i * 120);
    });
}

function populateFallbackResults(payload) {
    const status = (payload.current_menstrual_status || '').toLowerCase();
    let stage = 'Pre-menopause';
    if (status.includes('>12') || status.includes('permanent')) stage = 'Post-menopause';
    else if (status.includes('irregular') || status.includes('<12')) stage = 'Peri-menopause';

    const stageBadge = document.getElementById('result-stage');
    if (stageBadge) stageBadge.innerText = stage;

    ['result-severity','result-hormonal','result-repro','result-osteo','result-cardio']
        .forEach(id => setHtml(id, 'Start Flask to get AI predictions'));

    const recsList = document.getElementById('recs-list');
    if (recsList) recsList.innerHTML = `
        <li><span class="emoji">⚠️</span><div><strong>Backend Offline:</strong> Run <code>py -3.12 app.py</code> to get AI predictions.</div></li>
        <li><span class="emoji">🥗</span><div><strong>Nutrition:</strong> Increase calcium to 1200 mg/day.</div></li>`;

    document.querySelectorAll('.animate-in').forEach((card,i) => {
        setTimeout(() => card.classList.add('visible'), i * 100);
    });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

function animateBar(barId, pct, level) {
    const bar = document.getElementById(barId);
    if (!bar) return;
    bar.className = 'bar-fill ' + (level === 'High' ? 'red' : level === 'Medium' ? 'yellow' : 'green');
    setTimeout(() => bar.style.width = pct + '%', 300);
}

// ════════════════════════════════════════════════════════════
//  CHARTS
// ════════════════════════════════════════════════════════════
function renderRadarChart(radarData) {
    const ctx = document.getElementById('radarChart');
    if (!ctx) return;
    if (radarChartInst) radarChartInst.destroy();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
    const labelColor = isDark ? '#ddd' : '#555';

    radarChartInst = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(radarData),
            datasets: [{
                label: 'Symptom Level',
                data: Object.values(radarData),
                backgroundColor: 'rgba(236, 64, 122, 0.25)',
                borderColor: '#EC407A',
                borderWidth: 2.5,
                pointBackgroundColor: '#EC407A',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                r: {
                    min: 0, max: 2,
                    ticks: { stepSize: 1, color: labelColor, font: { size: 10 } },
                    grid: { color: gridColor },
                    angleLines: { color: gridColor },
                    pointLabels: { color: labelColor, font: { size: 11, weight: '600' } }
                }
            }
        }
    });
}

function renderPakChart() {
    const ctx = document.getElementById('pakHealthChart');
    if (!ctx) return;
    if (pakChartInst) pakChartInst.destroy();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

    pakChartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2015','2016','2017','2018','2019','2020','2021','2022','2023','2024'],
            datasets: [
                {
                    label: 'Menopause Awareness (%)',
                    data: [18, 22, 27, 32, 38, 42, 50, 57, 63, 70],
                    borderColor: '#EC407A',
                    backgroundColor: 'rgba(236,64,122,0.15)',
                    tension: 0.4, fill: true, pointRadius: 4
                },
                {
                    label: 'Osteoporosis Incidence (%)',
                    data: [14, 16, 18, 21, 23, 25, 27, 29, 30, 32],
                    borderColor: '#8E24AA',
                    backgroundColor: 'transparent',
                    tension: 0.4, borderDash: [6,4], pointRadius: 3
                },
                {
                    label: 'PCOS Prevalence (%)',
                    data: [8, 9, 10, 11, 12, 13, 14, 15, 17, 18],
                    borderColor: '#F57C00',
                    backgroundColor: 'transparent',
                    tension: 0.4, borderDash: [3,3], pointRadius: 3
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: isDark ? '#ccc' : '#444' } } },
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: isDark ? '#aaa' : '#555' } },
                y: { beginAtZero: true, max: 100, grid: { color: gridColor }, ticks: { color: isDark ? '#aaa' : '#555' } }
            }
        }
    });
}

// ── Trend Tracker ─────────────────────────────────────────────────────────────
function renderTrendTracker(data) {
    if (!data?.status) return;

    const STORAGE_KEY = 'menopaai_trend';
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const entry = {
        date: new Date().toLocaleDateString('en-GB'),
        symptom_score: data.symptom_score || 0,
        osteo: data.osteo_pct || 25,
        cardio: data.cardio_pct || 25,
        stage: data.stage_prediction
    };
    history.push(entry);
    if (history.length > 10) history.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    const trendEmpty = document.getElementById('trend-empty');
    const trendWrap  = document.getElementById('trend-chart-wrap');
    const clearBtn   = document.getElementById('clear-trend-btn');

    if (history.length < 2) {
        trendEmpty?.style && (trendEmpty.style.display = 'block');
        if (trendWrap) trendWrap.style.display = 'none';
        return;
    }

    trendEmpty && (trendEmpty.style.display = 'none');
    if (trendWrap) trendWrap.style.display = 'block';
    clearBtn && (clearBtn.style.display = 'inline-block');

    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    if (trendChartInst) trendChartInst.destroy();

    trendChartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.map(h => h.date),
            datasets: [
                {
                    label: 'Symptom Score',
                    data: history.map(h => h.symptom_score),
                    borderColor: '#EC407A', tension: 0.4, fill: false, pointRadius: 5
                },
                {
                    label: 'Osteoporosis Risk %',
                    data: history.map(h => h.osteo),
                    borderColor: '#8E24AA', tension: 0.4, fill: false, pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true } }
        }
    });

    clearBtn?.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        trendEmpty && (trendEmpty.style.display = 'block');
        if (trendWrap) trendWrap.style.display = 'none';
        clearBtn.style.display = 'none';
        if (trendChartInst) { trendChartInst.destroy(); trendChartInst = null; }
    });
}

// ── Feature Importance ────────────────────────────────────────────────────────
async function loadFeatureImportance(modelName) {
    try {
        const res = await fetch(`http://127.0.0.1:5000/feature-importance?model=${encodeURIComponent(modelName)}`);
        const data = await res.json();
        const container = document.getElementById('feature-importance-list');
        if (!container || !data.length) return;

        const maxImp = data[0].importance;
        container.innerHTML = data.slice(0, 7).map(item => `
            <div class="fi-row">
                <span class="fi-label">${item.feature}</span>
                <div class="fi-bar-bg">
                    <div class="fi-bar-fill" style="width:${(item.importance/maxImp*100).toFixed(1)}%"></div>
                </div>
                <span class="fi-pct">${item.importance.toFixed(1)}%</span>
            </div>`).join('');
    } catch(e) {
        const c = document.getElementById('feature-importance-list');
        if (c) c.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">Start Flask server to see feature importance.</p>';
    }
}

document.getElementById('fi-model-select')?.addEventListener('change', (e) => {
    loadFeatureImportance(e.target.value);
});

// ── Static health facts ───────────────────────────────────────────────────────
function populateStaticFacts() {
    const facts = [
        "Calcium and Vitamin D are essential for bone health during menopause.",
        "Phytoestrogens in soy may help reduce hot flash frequency by 20-30%.",
        "Regular physical activity can improve mood and reduce cardiovascular risk.",
        "Staying hydrated helps alleviate dry skin and brain fog.",
        "Deep breathing exercises significantly reduce menopause-related stress.",
        "PCOS affects approximately 1 in 10 women of reproductive age in Pakistan.",
        "Bone density loss accelerates 3–5 years immediately after menopause begins.",
        "Vitamin D deficiency affects over 80% of Pakistani women due to limited sun exposure.",
        "Weight-bearing exercise like walking for 30 min/day can prevent bone loss.",
        "Mediterranean diet is associated with milder menopause symptoms."
    ];
    const container = document.getElementById('static-facts-list');
    if (!container) return;
    const shuffled = [...facts].sort(() => 0.5 - Math.random()).slice(0, 4);
    container.innerHTML = shuffled.map(f => `<p>💡 ${f}</p>`).join('');
}

// ════════════════════════════════════════════════════════════
//  CHATBOT
// ════════════════════════════════════════════════════════════
function setupChatbot() {
    const toggleBtn  = document.getElementById('chat-toggle-btn');
    const closeBtn   = document.getElementById('close-chat-btn');
    const chatPanel  = document.getElementById('chat-panel');
    const sendBtn    = document.getElementById('chat-send-btn');
    const chatInput  = document.getElementById('chat-input');
    const chatMsgs   = document.getElementById('chat-messages');

    toggleBtn?.addEventListener('click', () => {
        chatPanel?.classList.toggle('hidden');
        const icon = document.getElementById('chat-fab-icon');
        if (icon) icon.textContent = chatPanel?.classList.contains('hidden') ? '💬' : '✕';
    });

    closeBtn?.addEventListener('click', () => {
        chatPanel?.classList.add('hidden');
        const icon = document.getElementById('chat-fab-icon');
        if (icon) icon.textContent = '💬';
    });

    const sendMessage = async () => {
        const msg = chatInput?.value?.trim();
        if (!msg) return;
        chatInput.value = '';
        appendChat(msg, 'user');
        appendChat('...', 'bot', 'typing-indicator');

        try {
            const res = await fetch('http://127.0.0.1:5000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, predictions: lastPredictions })
            });
            const data = await res.json();
            removeTyping();
            appendChat(data.response, 'bot');
        } catch(e) {
            removeTyping();
            appendChat('Sorry, the AI assistant is offline. Please start the Flask server.', 'bot');
        }
    };

    sendBtn?.addEventListener('click', sendMessage);
    chatInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

    function appendChat(text, role, extraClass = '') {
        if (!chatMsgs) return;
        const div = document.createElement('div');
        div.className = `chat-msg ${role} ${extraClass}`.trim();
        div.innerHTML = role === 'bot'
            ? `<span class="chat-avatar">🌸</span><div class="chat-bubble">${text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`
            : `<div class="chat-bubble">${text}</div>`;
        chatMsgs.appendChild(div);
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }

    function removeTyping() {
        const typing = chatMsgs?.querySelector('.typing-indicator');
        typing?.remove();
    }
}
