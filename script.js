// Smart School Timetable & Next Class Alarm App
// Pair Programmed with Antigravity AI

// Default Timetable Data (Mon-Fri, 1-7 periods)
const PRESET_SUBJECTS = {
    1: { // Mon
        1: { name: '국어', room: '3-2교실', teacher: '김국어', color: 'theme-blue' },
        2: { name: '수학', room: '수학실', teacher: '이수학', color: 'theme-purple' },
        3: { name: '영어', room: '영어실', teacher: 'Park', color: 'theme-emerald' },
        4: { name: '과학', room: '과학실', teacher: '최과학', color: 'theme-coral' },
        5: { name: '체육', room: '운동장', teacher: '박체육', color: 'theme-sunset' },
        6: { name: '음악', room: '음악실', teacher: '정음악', color: 'theme-pink' },
        7: { name: '창체', room: '3-2교실', teacher: '김담임', color: 'theme-slate' }
    },
    2: { // Tue
        1: { name: '영어', room: '영어실', teacher: 'Park', color: 'theme-emerald' },
        2: { name: '영어', room: '영어실', teacher: 'Park', color: 'theme-emerald' },
        3: { name: '국어', room: '3-2교실', teacher: '김국어', color: 'theme-blue' },
        4: { name: '미술', room: '미술실', teacher: '한미술', color: 'theme-amber' },
        5: { name: '미술', room: '미술실', teacher: '한미술', color: 'theme-amber' },
        6: { name: '사회', room: '3-2교실', teacher: '윤사회', color: 'theme-slate' },
        7: { name: '진로', room: '상담실', teacher: '강진로', color: 'theme-purple' }
    },
    3: { // Wed
        1: { name: '수학', room: '수학실', teacher: '이수학', color: 'theme-purple' },
        2: { name: '과학', room: '과학실', teacher: '최과학', color: 'theme-coral' },
        3: { name: '체육', room: '강당', teacher: '박체육', color: 'theme-sunset' },
        4: { name: '체육', room: '강당', teacher: '박체육', color: 'theme-sunset' },
        5: { name: '국어', room: '3-2교실', teacher: '김국어', color: 'theme-blue' },
        6: { name: '한문', room: '3-2교실', teacher: '장한문', color: 'theme-slate' },
        7: { name: '자치', room: '3-2교실', teacher: '김담임', color: 'theme-slate' }
    },
    4: { // Thu
        1: { name: '사회', room: '3-2교실', teacher: '윤사회', color: 'theme-slate' },
        2: { name: '국어', room: '3-2교실', teacher: '김국어', color: 'theme-blue' },
        3: { name: '수학', room: '수학실', teacher: '이수학', color: 'theme-purple' },
        4: { name: '영어', room: '영어실', teacher: 'Park', color: 'theme-emerald' },
        5: { name: '정보', room: '컴퓨터실', teacher: '임정보', color: 'theme-blue' },
        6: { name: '정보', room: '컴퓨터실', teacher: '임정보', color: 'theme-blue' },
        7: { name: '동아리', room: '동아리실', teacher: '이동아', color: 'theme-pink' }
    },
    5: { // Fri
        1: { name: '과학', room: '과학실', teacher: '최과학', color: 'theme-coral' },
        2: { name: '역사', room: '3-2교실', teacher: '송역사', color: 'theme-amber' },
        3: { name: '영어', room: '영어실', teacher: 'Park', color: 'theme-emerald' },
        4: { name: '수학', room: '수학실', teacher: '이수학', color: 'theme-purple' },
        5: { name: '음악', room: '음악실', teacher: '정음악', color: 'theme-pink' },
        6: { name: '기가', room: '가사실', teacher: '최기가', color: 'theme-slate' },
        7: { name: '자습', room: '3-2교실', teacher: '김담임', color: 'theme-slate' }
    }
};

const DEFAULT_TIMETABLE_METADATA = {
    // 7 Periods schedules typical in Korea
    periods: {
        1: { start: '09:00', end: '09:50' },
        2: { start: '10:00', end: '10:50' },
        3: { start: '11:00', end: '11:50' },
        4: { start: '12:00', end: '12:50' },
        5: { start: '13:50', end: '14:40' },
        6: { start: '14:50', end: '15:40' },
        7: { start: '15:50', end: '16:40' }
    },
    lunch: { start: '12:50', end: '13:50' }
};

// Safe localStorage Wrapper
const safeStorage = {
    getItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn("localStorage is not accessible:", e);
            return null;
        }
    },
    setItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn("localStorage write failed:", e);
        }
    },
    removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn("localStorage remove failed:", e);
        }
    }
};

// Application State
let appData = {
    timetable: {}, // Day (1-5) -> Period (1-7) -> Cell Data
    settings: {}   // Period timings and lunch timings
};

// Simulation State
let isSimulating = false;
let simDate = null; // Simulated date object
let simIntervalId = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    try {
        loadData();
        initializeUI();
        startHeartbeat();
        
        // Create Lucide Icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    } catch (err) {
        console.error("Fatal initialization error. Force resetting settings to defaults...", err);
        // Force reset corrupted localStorage data
        safeStorage.removeItem('smart_timetable');
        safeStorage.removeItem('smart_timetable_settings');
        
        appData.timetable = JSON.parse(JSON.stringify(PRESET_SUBJECTS));
        appData.settings = JSON.parse(JSON.stringify(DEFAULT_TIMETABLE_METADATA));
        saveData();
        
        try {
            initializeUI();
            startHeartbeat();
            if (window.lucide) {
                window.lucide.createIcons();
            }
        } catch (retryErr) {
            console.error("Retry failed:", retryErr);
        }
    }
});

// Load data from LocalStorage or populate presets
function loadData() {
    const savedTimetable = safeStorage.getItem('smart_timetable');
    const savedSettings = safeStorage.getItem('smart_timetable_settings');
    const savedTheme = safeStorage.getItem('smart_timetable_theme') || 'dark';

    // Apply Saved Theme
    document.documentElement.setAttribute('data-theme', savedTheme);

    let isDataValid = false;
    if (savedTimetable && savedSettings) {
        try {
            const parsedTimetable = JSON.parse(savedTimetable);
            const parsedSettings = JSON.parse(savedSettings);

            // Detailed validation to ensure all periods exist and have start/end string times
            let validPeriods = true;
            if (parsedSettings && parsedSettings.periods) {
                for (let p = 1; p <= 7; p++) {
                    if (!parsedSettings.periods[p] || 
                        typeof parsedSettings.periods[p].start !== 'string' || 
                        typeof parsedSettings.periods[p].end !== 'string') {
                        validPeriods = false;
                        break;
                    }
                }
            } else {
                validPeriods = false;
            }

            if (parsedTimetable && parsedSettings && 
                validPeriods && 
                parsedSettings.lunch && 
                typeof parsedSettings.lunch.start === 'string' && 
                typeof parsedSettings.lunch.end === 'string') {
                
                appData.timetable = parsedTimetable;
                appData.settings = parsedSettings;
                isDataValid = true;
            }
        } catch (e) {
            console.error("Data validation/parse failed, resetting to defaults:", e);
        }
    }

    if (!isDataValid) {
        // First run or corrupted data: populate default presets
        appData.timetable = JSON.parse(JSON.stringify(PRESET_SUBJECTS));
        appData.settings = JSON.parse(JSON.stringify(DEFAULT_TIMETABLE_METADATA));
        saveData();
    }
}

// Save data to LocalStorage
function saveData() {
    safeStorage.setItem('smart_timetable', JSON.stringify(appData.timetable));
    safeStorage.setItem('smart_timetable_settings', JSON.stringify(appData.settings));
}

// Initialize UI layout & event listeners
function initializeUI() {
    // 1. Render Weekly Grid
    renderWeeklyGrid();

    // 2. Render Settings Inputs inside Settings Modal
    populateSettingsInputs();

    // 3. Event Listeners for Theme Toggle
    document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);

    // 4. Modal Event Listeners
    // Add Close Click Handler for all modals
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
        });
    });

    // Settings Modal toggler
    document.getElementById('btn-settings').addEventListener('click', () => {
        populateSettingsInputs();
        openModal('modal-settings');
    });

    // Save Settings Submit
    document.getElementById('form-settings').addEventListener('submit', handleSettingsSave);

    // Timetable Quick Fill
    document.getElementById('btn-quick-fill').addEventListener('click', handleQuickFill);

    // Reset All Data
    document.getElementById('btn-reset-all').addEventListener('click', handleResetAll);

    // Edit Cell Submit
    document.getElementById('form-edit-cell').addEventListener('submit', handleCellSave);

    // Delete/Empty Cell Button
    document.getElementById('btn-delete-cell').addEventListener('click', handleCellDelete);

    // Simulator Toggle Button
    document.getElementById('btn-simulator-toggle').addEventListener('click', toggleSimulatorBar);

    // Simulator Play/Reset Controls
    document.getElementById('btn-sim-play').addEventListener('click', toggleSimulation);
    document.getElementById('btn-sim-reset').addEventListener('click', resetSimulation);
    
    // Export/Import Setup
    document.getElementById('btn-export-data').addEventListener('click', exportData);
    document.getElementById('btn-import-data').addEventListener('click', () => {
        document.getElementById('file-import-data').click();
    });
    document.getElementById('file-import-data').addEventListener('change', importData);

    // Close modal on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
}

// Render weekly timetable HTML
function renderWeeklyGrid() {
    const tbody = document.getElementById('timetable-tbody');
    tbody.innerHTML = '';

    const maxPeriods = 7; // Fixed 7 periods for this layout

    for (let period = 1; period <= maxPeriods; period++) {
        const tr = document.createElement('tr');

        // Period Number Cell (First column)
        const periodTime = appData.settings.periods[period];
        const tdNum = document.createElement('td');
        tdNum.className = 'period-num-cell';
        tdNum.innerHTML = `
            <div class="period-num">${period}</div>
            <div class="period-time">${periodTime.start}~${periodTime.end}</div>
        `;
        tr.appendChild(tdNum);

        // Days columns (Mon=1, Tue=2, Wed=3, Thu=4, Fri=5)
        for (let day = 1; day <= 5; day++) {
            const td = document.createElement('td');
            td.setAttribute('data-day', day);
            td.setAttribute('data-period', period);
            
            const cellData = appData.timetable[day] ? appData.timetable[day][period] : null;

            if (cellData && cellData.name) {
                td.innerHTML = `
                    <div class="grid-cell-filled ${cellData.color || 'theme-blue'}" data-theme-class="${cellData.color || 'theme-blue'}">
                        <div class="cell-subject">${cellData.name}</div>
                        <div class="cell-room">${cellData.room || ''}</div>
                        <div class="cell-teacher">${cellData.teacher || ''}</div>
                    </div>
                `;
            } else {
                td.innerHTML = `
                    <div class="cell-empty" style="height: 100%; display: flex; justify-content: center; align-items: center; color: var(--text-dim); font-size: 11px;">
                        <i data-lucide="plus" style="width: 14px; height: 14px; opacity: 0.3;"></i>
                    </div>
                `;
            }

            // Cell edit click
            td.addEventListener('click', () => {
                openCellEditor(day, period);
            });

            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Open Editor Modal for a specific slot
function openCellEditor(day, period) {
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    document.getElementById('edit-day').value = day;
    document.getElementById('edit-period').value = period;
    document.getElementById('edit-cell-title-badge').innerText = `${dayNames[day]} ${period}교시 수정`;

    // Fill existing details
    const cellData = appData.timetable[day] ? appData.timetable[day][period] : null;
    if (cellData) {
        document.getElementById('input-subject').value = cellData.name || '';
        document.getElementById('input-room').value = cellData.room || '';
        document.getElementById('input-teacher').value = cellData.teacher || '';
        
        // Select color radio
        const colorVal = cellData.color || 'theme-blue';
        const colorRadio = document.querySelector(`input[name="cell-color"][value="${colorVal}"]`);
        if (colorRadio) colorRadio.checked = true;
        
        document.getElementById('btn-delete-cell').style.display = 'inline-flex';
    } else {
        document.getElementById('input-subject').value = '';
        document.getElementById('input-room').value = '';
        document.getElementById('input-teacher').value = '';
        document.querySelector('input[name="cell-color"][value="theme-blue"]').checked = true;
        
        document.getElementById('btn-delete-cell').style.display = 'none';
    }

    openModal('modal-edit-cell');
    
    // Auto-focus subject input
    setTimeout(() => {
        document.getElementById('input-subject').focus();
    }, 100);
}

// Handle cell editing save
function handleCellSave(e) {
    e.preventDefault();
    const day = document.getElementById('edit-day').value;
    const period = document.getElementById('edit-period').value;

    const name = document.getElementById('input-subject').value.trim();
    const room = document.getElementById('input-room').value.trim();
    const teacher = document.getElementById('input-teacher').value.trim();
    const color = document.querySelector('input[name="cell-color"]:checked').value;

    if (!appData.timetable[day]) {
        appData.timetable[day] = {};
    }

    appData.timetable[day][period] = { name, room, teacher, color };
    saveData();
    renderWeeklyGrid();
    closeAllModals();
    showToast('시간표가 저장되었습니다!', 'success');
    
    // Force immediate UI heartbeat update
    runTick();
}

// Handle cell clear/delete
function handleCellDelete() {
    const day = document.getElementById('edit-day').value;
    const period = document.getElementById('edit-period').value;

    if (appData.timetable[day] && appData.timetable[day][period]) {
        delete appData.timetable[day][period];
        saveData();
        renderWeeklyGrid();
        closeAllModals();
        showToast('과목 카드를 비웠습니다.', 'success');
        
        // Force immediate UI heartbeat update
        runTick();
    }
}

// Open settings Modal and load settings timings
function populateSettingsInputs() {
    const container = document.getElementById('period-settings-container');
    container.innerHTML = '';

    for (let period = 1; period <= 7; period++) {
        const timeConfig = appData.settings.periods[period];
        const div = document.createElement('div');
        div.className = 'period-setting-item';
        div.innerHTML = `
            <span class="period-label-bold">${period}교시</span>
            <div class="time-range-row">
                <input type="time" id="setting-p-${period}-start" value="${timeConfig.start}" required>
                <span>~</span>
                <input type="time" id="setting-p-${period}-end" value="${timeConfig.end}" required>
            </div>
        `;
        container.appendChild(div);
    }

    // Lunch timings
    document.getElementById('setting-lunch-start').value = appData.settings.lunch.start;
    document.getElementById('setting-lunch-end').value = appData.settings.lunch.end;
}

// Save App Settings (Timing schedule)
function handleSettingsSave(e) {
    e.preventDefault();

    const newPeriods = {};
    for (let period = 1; period <= 7; period++) {
        const start = document.getElementById(`setting-p-${period}-start`).value;
        const end = document.getElementById(`setting-p-${period}-end`).value;

        // Validation: Start time must be before end time
        if (timeToSeconds(start) >= timeToSeconds(end)) {
            showToast(`${period}교시 시작 시간은 종료 시간보다 빨라야 합니다.`, 'error');
            return;
        }

        newPeriods[period] = { start, end };
    }

    const lunchStart = document.getElementById('setting-lunch-start').value;
    const lunchEnd = document.getElementById('setting-lunch-end').value;

    if (timeToSeconds(lunchStart) >= timeToSeconds(lunchEnd)) {
        showToast(`점심시간 시작 시간은 종료 시간보다 빨라야 합니다.`, 'error');
        return;
    }

    appData.settings.periods = newPeriods;
    appData.settings.lunch = { start: lunchStart, end: lunchEnd };
    
    saveData();
    renderWeeklyGrid();
    closeAllModals();
    showToast('일과 시간 설정이 완벽하게 업데이트되었습니다!', 'success');
    
    // Force immediate UI heartbeat update
    runTick();
}

// Quick Sample Autofill
function handleQuickFill() {
    if (confirm('현재 시간표 데이터를 지우고 멋진 샘플 시간표로 가득 채우시겠습니까?')) {
        appData.timetable = JSON.parse(JSON.stringify(PRESET_SUBJECTS));
        appData.settings = JSON.parse(JSON.stringify(DEFAULT_TIMETABLE_METADATA));
        saveData();
        renderWeeklyGrid();
        showToast('샘플 시간표가 성공적으로 채워졌습니다!', 'success');
        runTick();
    }
}

// Reset all app settings & storage
function handleResetAll() {
    if (confirm('💥 경고: 모든 시간표 설정과 과목 데이터가 삭제되며 처음 상태로 돌아갑니다. 진행하시겠습니까?')) {
        safeStorage.removeItem('smart_timetable');
        safeStorage.removeItem('smart_timetable_settings');
        loadData();
        renderWeeklyGrid();
        closeAllModals();
        showToast('모든 데이터가 완전히 초기화되었습니다.', 'success');
        runTick();
    }
}

// Helper: Open Modal by ID
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

// Helper: Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Helper: Toggle Dark/Light Theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    safeStorage.setItem('smart_timetable_theme', newTheme);
    showToast(`${newTheme === 'dark' ? '다크 모드' : '라이트 모드'}가 적용되었습니다.`, 'success');
}

// Toast System
function showToast(message, type = 'success') {
    // Remove existing toast
    const oldToast = document.querySelector('.toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconName = type === 'success' ? 'check-circle-2' : 'alert-circle';
    const iconClass = type === 'success' ? 'toast-icon-success' : 'toast-icon-error';

    toast.innerHTML = `
        <i data-lucide="${iconName}" class="${iconClass}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);
    
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Trigger reflow & show
    setTimeout(() => toast.classList.add('show'), 50);

    // Auto hide
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Export data as JSON
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "smart_timetable_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('시간표 데이터가 내보내기 되었습니다.', 'success');
}

// Import data from JSON file
function importData(e) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const parsedData = JSON.parse(event.target.result);
            if (parsedData.timetable && parsedData.settings) {
                appData = parsedData;
                saveData();
                renderWeeklyGrid();
                populateSettingsInputs();
                showToast('시간표 데이터를 완벽히 복원했습니다!', 'success');
                closeAllModals();
                runTick();
            } else {
                showToast('올바르지 않은 백업 파일 양식입니다.', 'error');
            }
        } catch (err) {
            showToast('JSON 파일을 분석하는 중에 오류가 발생했습니다.', 'error');
        }
    };
    if (e.target.files[0]) {
        fileReader.readAsText(e.target.files[0]);
    }
}


/* ==========================================================================
   🕒 REAL-TIME TRACKING & TIME ENGINE & SIMULATOR
   ========================================================================== */

// Start App Clock Heartbeat
function startHeartbeat() {
    // Tick immediately
    runTick();
    
    // Tick every 1 second
    setInterval(() => {
        if (!isSimulating) {
            runTick();
        }
    }, 1000);
}

// Helper: Convert time string "HH:MM" to seconds from midnight
function timeToSeconds(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 3600) + (m * 60);
}

// Helper: Convert time string with optional seconds "HH:MM:SS" or "HH:MM"
function fullTimeToSeconds(timeStr) {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
        return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    } else {
        return (parts[0] * 3600) + (parts[1] * 60);
    }
}

// Helper: Seconds to Timer String "MM:SS" or "HH:MM:SS"
function secondsToTimerString(totalSecs) {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');

    if (h > 0) {
        return `${h}:${mm}:${ss}`;
    } else {
        return `${mm}:${ss}`;
    }
}

// Main Time Update Engine
function runTick() {
    let now;

    if (isSimulating && simDate) {
        // Increment simulator time by 1 second
        simDate.setSeconds(simDate.getSeconds() + 1);
        now = new Date(simDate);
        
        // Sync simulator input values to match ticks
        const inputTime = document.getElementById('sim-time');
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        inputTime.value = `${h}:${m}:${s}`;
        document.getElementById('sim-day').value = now.getDay();
    } else {
        now = new Date();
    }

    // 1. Update Header Clock
    updateHeaderClock(now);

    // 2. Identify Current State
    processCurrentScheduleState(now);
}

// Update Top Right Live Clock Display
function updateHeaderClock(date) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const day = days[date.getDay()];
    
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');

    document.getElementById('header-date').innerText = `${yyyy}년 ${mm}월 ${dd}일 (${day})`;
    document.getElementById('header-time').innerText = `${h}:${m}:${s}`;
}

// Core Engine: Evaluates schedule based on Date and timings
function processCurrentScheduleState(date) {
    const currentDay = date.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
    const currentSeconds = (date.getHours() * 3600) + (date.getMinutes() * 60) + date.getSeconds();
    
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    document.getElementById('today-timeline-date').innerText = `${dayNames[currentDay]} 일정`;

    // Reset Highlight classes
    document.querySelectorAll('.timetable-grid td').forEach(td => td.classList.remove('active-grid-cell'));

    // Handle Weekend (Saturday, Sunday)
    if (currentDay === 0 || currentDay === 6) {
        renderDashboardFreeDay("주말 자유 시간 🎉", "주말은 달콤한 휴식 시간입니다! 재충전해 보세요.", "weekend");
        renderTodayTimeline(currentDay, null);
        return;
    }

    const periodsData = appData.settings.periods;
    const lunchData = appData.settings.lunch;

    const lunchStartSec = timeToSeconds(lunchData.start);
    const lunchEndSec = timeToSeconds(lunchData.end);

    // Find chronological bounds
    const firstPeriodStartSec = timeToSeconds(periodsData[1].start);
    const lastPeriodEndSec = timeToSeconds(periodsData[7].end);

    // Render Timeline listing for Today
    // We pass current active period if any, to render it with high priority
    let activePeriodNum = null;
    let dashboardState = null; // 'class', 'break', 'lunch', 'before', 'after'
    let stateInfo = {};

    // 1. Before School (Before Period 1 starts)
    if (currentSeconds < firstPeriodStartSec) {
        dashboardState = 'before';
        const nextClass = getPeriodClass(currentDay, 1);
        stateInfo = {
            statusBadgeText: '등교 시간',
            statusBadgeClass: 'status-free',
            countdownLabel: '1교시 수업 시작까지',
            remainingSecs: firstPeriodStartSec - currentSeconds,
            totalSecs: firstPeriodStartSec, // from midnight
            progressPercent: (currentSeconds / firstPeriodStartSec) * 100,
            currentClassTitle: '수업 준비 중 📖',
            currentClassMeta: { room: '내 교실', teacher: '조회 시간' },
            nextClassTitle: nextClass ? `${nextClass.name}` : '1교시 수업 등록 필요',
            nextClassMeta: nextClass ? { room: nextClass.room, teacher: nextClass.teacher } : { room: '-', teacher: '-' },
            activeColor: '#6366f1'
        };
    } 
    // 2. After School (After Period 7 ends)
    else if (currentSeconds >= lastPeriodEndSec) {
        dashboardState = 'after';
        renderDashboardFreeDay("방과 후 하교 🏠", "오늘 모든 수업이 완료되었습니다. 고생 많으셨습니다!", "after-school");
        renderTodayTimeline(currentDay, null);
        return;
    }
    // 3. Regular school hours
    else {
        // Let's iterate through all 7 periods
        let isClassTime = false;
        
        for (let p = 1; p <= 7; p++) {
            const startSec = timeToSeconds(periodsData[p].start);
            const endSec = timeToSeconds(periodsData[p].end);

            // Is in Period P class?
            if (currentSeconds >= startSec && currentSeconds < endSec) {
                isClassTime = true;
                activePeriodNum = p;
                dashboardState = 'class';
                
                const curClass = getPeriodClass(currentDay, p);
                
                // Determine next item (Could be next class, lunch, or after school)
                let nextTitle = '방과 후 하교 🏠';
                let nextMeta = { room: '-', teacher: '-' };
                
                if (p === 4) {
                    nextTitle = '맛있는 점심 시간 🍕';
                    nextMeta = { room: '급식실', teacher: '맛점하세요' };
                } else if (p < 7) {
                    const nextClass = getPeriodClass(currentDay, p + 1);
                    if (nextClass) {
                        nextTitle = `${p + 1}교시 ${nextClass.name}`;
                        nextMeta = { room: nextClass.room, teacher: nextClass.teacher };
                    } else {
                        nextTitle = `${p + 1}교시 비어있음`;
                    }
                }

                // Color Theme logic
                const themeClass = curClass ? curClass.color : 'theme-blue';
                const activeColor = getHexForThemeClass(themeClass);

                stateInfo = {
                    statusBadgeText: `${p}교시 수업 중`,
                    statusBadgeClass: 'status-in-class',
                    countdownLabel: `${p}교시 종료까지`,
                    remainingSecs: endSec - currentSeconds,
                    totalSecs: endSec - startSec,
                    progressPercent: ((currentSeconds - startSec) / (endSec - startSec)) * 100,
                    currentClassTitle: curClass ? `${p}교시 ${curClass.name}` : `${p}교시 비어있음`,
                    currentClassMeta: curClass ? { room: curClass.room, teacher: curClass.teacher } : { room: '-', teacher: '-' },
                    nextClassTitle: nextTitle,
                    nextClassMeta: nextMeta,
                    activeColor: activeColor,
                    themeClass: themeClass
                };

                // Highlight the active grid cell in weekly table
                highlightWeeklyCell(currentDay, p);
                break;
            }
        }

        // If not in a class, check if it's Lunch Time
        if (!isClassTime && currentSeconds >= lunchStartSec && currentSeconds < lunchEndSec) {
            dashboardState = 'lunch';
            const nextClass5 = getPeriodClass(currentDay, 5);
            stateInfo = {
                statusBadgeText: '점심 시간',
                statusBadgeClass: 'status-lunch',
                countdownLabel: '점심 시간 종료까지',
                remainingSecs: lunchEndSec - currentSeconds,
                totalSecs: lunchEndSec - lunchStartSec,
                progressPercent: ((currentSeconds - lunchStartSec) / (lunchEndSec - lunchStartSec)) * 100,
                currentClassTitle: '맛있는 점심 시간 🍕',
                currentClassMeta: { room: '급식실', teacher: '즐거운 시간' },
                nextClassTitle: nextClass5 ? `5교시 ${nextClass5.name}` : '5교시 비어있음',
                nextClassMeta: nextClass5 ? { room: nextClass5.room, teacher: nextClass5.teacher } : { room: '-', teacher: '-' },
                activeColor: '#f59e0b'
            };
        }

        // If not class and not lunch, but inside school hours: must be Break Time (쉬는 시간)
        if (!isClassTime && !stateInfo.statusBadgeText) {
            // Find which break it is. It's between period p and p+1
            // Let's check which period we just finished
            for (let p = 1; p < 7; p++) {
                const prevEndSec = timeToSeconds(periodsData[p].end);
                const nextStartSec = timeToSeconds(periodsData[p + 1].start);

                if (currentSeconds >= prevEndSec && currentSeconds < nextStartSec) {
                    // This is a break!
                    // Note: if it's lunch, it's already caught above because of the timing check,
                    // but just to be sure, check if this is the 4-to-5 gap. If so, and we didn't match lunch,
                    // treat as general break.
                    dashboardState = 'break';
                    const nextClass = getPeriodClass(currentDay, p + 1);
                    
                    stateInfo = {
                        statusBadgeText: '쉬는 시간',
                        statusBadgeClass: 'status-break',
                        countdownLabel: `${p+1}교시 시작까지`,
                        remainingSecs: nextStartSec - currentSeconds,
                        totalSecs: nextStartSec - prevEndSec,
                        progressPercent: ((currentSeconds - prevEndSec) / (nextStartSec - prevEndSec)) * 100,
                        currentClassTitle: '쉬는 시간 ☕',
                        currentClassMeta: { room: '자유 시간', teacher: '휴식' },
                        nextClassTitle: nextClass ? `${p + 1}교시 ${nextClass.name}` : `${p + 1}교시 비어있음`,
                        nextClassMeta: nextClass ? { room: nextClass.room, teacher: nextClass.teacher } : { room: '-', teacher: '-' },
                        activeColor: '#10b981'
                    };
                    break;
                }
            }
        }
    }

    // Apply state updates to Dashboard DOM
    if (stateInfo.statusBadgeText) {
        applyDashboardState(stateInfo);
        renderTodayTimeline(currentDay, activePeriodNum);
    }
}

// Get subject card details for day and period
function getPeriodClass(day, period) {
    if (appData.timetable[day] && appData.timetable[day][period]) {
        return appData.timetable[day][period];
    }
    return null;
}

// Convert CSS Preset Class to Hex string for dynamic styles
function getHexForThemeClass(themeClass) {
    switch (themeClass) {
        case 'theme-blue': return 'hsl(210, 80%, 45%)';
        case 'theme-purple': return 'hsl(270, 75%, 50%)';
        case 'theme-emerald': return 'hsl(150, 70%, 40%)';
        case 'theme-coral': return 'hsl(10, 80%, 55%)';
        case 'theme-sunset': return 'hsl(30, 85%, 50%)';
        case 'theme-amber': return 'hsl(45, 85%, 48%)';
        case 'theme-pink': return 'hsl(330, 80%, 55%)';
        case 'theme-slate': return 'hsl(200, 15%, 50%)';
        default: return '#6366f1';
    }
}

// Apply dashboard card text, colors and circular progress bar
function applyDashboardState(info) {
    // 1. Status Badge
    const badge = document.getElementById('current-status-badge');
    badge.className = `status-badge ${info.statusBadgeClass}`;
    badge.innerText = info.statusBadgeText;

    // 2. Countdown Timer Text
    const timerText = document.getElementById('countdown-timer');
    timerText.innerText = secondsToTimerString(info.remainingSecs);
    document.getElementById('countdown-label').innerText = info.countdownLabel;

    // 3. Circular Progress Ring
    const circle = document.getElementById('progress-ring-bar');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    // Percentage elapsed goes from 0% (full bar) to 100% (empty bar)
    // Actually, let's make it go from 100% full down to 0% as time ticks out, or vice versa.
    // Let's show the REMAINING percentage, so it drains clockwise.
    const percentRemaining = (info.remainingSecs / info.totalSecs);
    const offset = circumference - (percentRemaining * circumference);
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
    circle.style.stroke = info.activeColor;

    // Apply color values to dashboard containers
    const dashboardCard = document.querySelector('.dashboard-card');
    dashboardCard.style.setProperty('--primary-color', info.activeColor);

    // Apply specific theme visual classes
    if (info.themeClass) {
        dashboardCard.className = `card dashboard-card theme-active ${info.themeClass}`;
    } else {
        dashboardCard.className = 'card dashboard-card';
        dashboardCard.style.borderTopColor = info.activeColor;
    }

    // 4. Current Class Info
    document.getElementById('current-class-name').innerText = info.currentClassTitle;
    document.getElementById('current-class-room').innerHTML = `<i data-lucide="map-pin"></i> ${info.currentClassMeta.room || '-'}`;
    document.getElementById('current-class-teacher').innerHTML = `<i data-lucide="user"></i> ${info.currentClassMeta.teacher || '-'}`;

    // Apply dynamic classes on Current Box
    const curBox = document.querySelector('.current-box');
    curBox.classList.add('active-glow');
    
    // Inject active theme HSL values to custom variables
    const rgbVal = getRGBComponents(info.activeColor);
    curBox.style.setProperty('--active-color-rgb', rgbVal);

    // 5. Next Class Info
    document.getElementById('next-class-name').innerText = info.nextClassTitle;
    document.getElementById('next-class-room').innerHTML = `<i data-lucide="map-pin"></i> ${info.nextClassMeta.room || '-'}`;
    document.getElementById('next-class-teacher').innerHTML = `<i data-lucide="user"></i> ${info.nextClassMeta.teacher || '-'}`;

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Highlight the cell that is currently active on the weekly grid
function highlightWeeklyCell(day, period) {
    const cell = document.querySelector(`td[data-day="${day}"][data-period="${period}"]`);
    if (cell) {
        cell.classList.add('active-grid-cell');
        
        // Dynamic style in JS
        const filledBox = cell.querySelector('.grid-cell-filled');
        if (filledBox) {
            const themeClass = filledBox.getAttribute('data-theme-class');
            const colorHex = getHexForThemeClass(themeClass);
            cell.style.setProperty('--primary-color', colorHex);
        }
    }
}

// Helper to convert HSL/RGB string to simple comma-separated RGB values for backdrop transparency
function getRGBComponents(colorStr) {
    if (colorStr.startsWith('hsl')) {
        // Simple fallback colors since converting HSL to RGB in vanilla JS is lengthy.
        // We can just map our preset classes to RGB strings!
        if (colorStr.includes('210')) return '14, 116, 144'; // Blue
        if (colorStr.includes('270')) return '109, 40, 217'; // Purple
        if (colorStr.includes('150')) return '4, 120, 87'; // Emerald
        if (colorStr.includes('10')) return '185, 28, 28'; // Coral
        if (colorStr.includes('30')) return '194, 65, 12'; // Sunset
        if (colorStr.includes('45')) return '180, 83, 9'; // Amber
        if (colorStr.includes('330')) return '190, 24, 74'; // Pink
        if (colorStr.includes('200')) return '71, 85, 105'; // Slate
    }
    return '99, 102, 241'; // Primary Indigo
}

// Render the dashboard when there are no classes (Weekend or after school)
function renderDashboardFreeDay(title, subtitle, type) {
    // 1. Status Badge
    const badge = document.getElementById('current-status-badge');
    badge.className = 'status-badge status-free';
    badge.innerText = type === 'weekend' ? '주말 휴일' : '일과 종료';

    // 2. Countdown Timer
    document.getElementById('countdown-timer').innerText = '--:--';
    document.getElementById('countdown-label').innerText = '자유 시간';

    // Progress Ring empty
    const circle = document.getElementById('progress-ring-bar');
    circle.style.strokeDashoffset = circle.r.baseVal.value * 2 * Math.PI;
    circle.style.stroke = 'var(--text-dim)';

    // Reset card dynamic classes
    const dashboardCard = document.querySelector('.dashboard-card');
    dashboardCard.className = 'card dashboard-card';
    dashboardCard.style.borderTopColor = 'var(--text-dim)';

    // 3. Current Info Box
    document.getElementById('current-class-name').innerText = title;
    document.getElementById('current-class-room').innerHTML = `<i data-lucide="map-pin"></i> 온누리`;
    document.getElementById('current-class-teacher').innerHTML = `<i data-lucide="smile"></i> ${subtitle}`;

    // Remove glows
    document.querySelector('.current-box').classList.remove('active-glow');

    // 4. Next Info Box
    document.getElementById('next-class-name').innerText = '내일의 일정을 확인하세요!';
    document.getElementById('next-class-room').innerHTML = `<i data-lucide="map-pin"></i> -`;
    document.getElementById('next-class-teacher').innerHTML = `<i data-lucide="user"></i> -`;

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Render vertical timeline cards for Today's Day
function renderTodayTimeline(day, activePeriodNum) {
    const list = document.getElementById('today-timeline-list');
    list.innerHTML = '';

    // If Weekend
    if (day === 0 || day === 6) {
        list.innerHTML = `
            <div class="timeline-empty">
                <i data-lucide="sun" style="width: 32px; height: 32px; color: var(--text-dim); margin-bottom: 8px; opacity: 0.5;"></i>
                <p>오늘은 달콤한 주말 휴일입니다!</p>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    const periodsData = appData.settings.periods;
    
    for (let p = 1; p <= 7; p++) {
        const timeConfig = periodsData[p];
        const cellData = getPeriodClass(day, p);
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'timeline-item';
        
        // Highlight active period card
        if (p === activePeriodNum) {
            itemDiv.classList.add('active');
            
            // Inject theme color HSL values
            const themeClass = cellData ? cellData.color : 'theme-blue';
            const colorHex = getHexForThemeClass(themeClass);
            const rgbVal = getRGBComponents(colorHex);
            itemDiv.style.setProperty('--active-color-rgb', rgbVal);
        }

        const subjectName = cellData ? cellData.name : '<비어있음>';
        const room = cellData ? cellData.room : '-';
        const teacher = cellData ? cellData.teacher : '-';
        
        itemDiv.innerHTML = `
            <div class="timeline-item-time">
                <div class="timeline-period">${p}교시</div>
                <div class="timeline-clock">${timeConfig.start}</div>
            </div>
            <div class="timeline-item-content">
                <div class="timeline-subject">${subjectName}</div>
                <div class="timeline-room-teacher">
                    <span>📍 ${room}</span>
                    <span>👤 ${teacher}</span>
                </div>
            </div>
        `;

        list.appendChild(itemDiv);
    }
}


/* ==========================================================================
   🔬 TEST ENGINE / SIMULATOR CODE
   ========================================================================== */

// Toggle collapsible simulator bar
function toggleSimulatorBar() {
    const bar = document.getElementById('simulator-bar');
    bar.classList.toggle('hidden');
}

// Toggle simulation active state
function toggleSimulation() {
    const playBtn = document.getElementById('btn-sim-play');
    const playText = document.getElementById('sim-play-text');
    const playIcon = playBtn.querySelector('.sim-play-icon');

    if (!isSimulating) {
        // Start simulation
        isSimulating = true;
        
        // Setup initial simulation time
        const simTimeVal = document.getElementById('sim-time').value; // "HH:MM:SS" or "HH:MM"
        const simDayVal = parseInt(document.getElementById('sim-day').value); // 0-6

        const now = new Date();
        
        // We set the day of week to selected day, and time to selected time.
        // Finding date for selected day of week:
        const currentDay = now.getDay();
        const diff = simDayVal - currentDay;
        now.setDate(now.getDate() + diff);

        // Set time
        const parts = simTimeVal.split(':').map(Number);
        now.setHours(parts[0], parts[1], parts.length === 3 ? parts[2] : 0, 0);
        
        simDate = now;

        // Button changes
        playBtn.classList.remove('btn-primary');
        playBtn.classList.add('btn-danger');
        playText.innerText = '시뮬레이션 일시정지';
        playIcon.setAttribute('data-lucide', 'pause');
        
        showToast('가상 시간 시뮬레이션이 활성화되었습니다!', 'success');
        
        // Tick immediately
        runTick();

        // Run interval for simulator ticks
        simIntervalId = setInterval(() => {
            if (isSimulating) {
                runTick();
            }
        }, 1000);

    } else {
        // Pause simulation
        isSimulating = false;
        if (simIntervalId) clearInterval(simIntervalId);
        
        playBtn.classList.remove('btn-danger');
        playBtn.classList.add('btn-primary');
        playText.innerText = '시뮬레이션 재개';
        playIcon.setAttribute('data-lucide', 'play');
        
        showToast('시뮬레이션이 일시정지되었습니다.', 'error');
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Reset simulation to real time
function resetSimulation() {
    isSimulating = false;
    if (simIntervalId) {
        clearInterval(simIntervalId);
        simIntervalId = null;
    }
    simDate = null;

    // Reset button state
    const playBtn = document.getElementById('btn-sim-play');
    const playText = document.getElementById('sim-play-text');
    const playIcon = playBtn.querySelector('.sim-play-icon');
    
    playBtn.classList.remove('btn-danger');
    playBtn.classList.add('btn-primary');
    playText.innerText = '시뮬레이션 시작';
    playIcon.setAttribute('data-lucide', 'play');

    showToast('실제 시간 모드로 전환되었습니다.', 'success');
    
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Force immediately update with real system time
    runTick();
}
