/**
 * Smart Student Record Manager - Main Application Controller
 * Handles Login Auth, SPA Routing, Form Validation, View Rendering, C-Concept Accordions & Event Binding.
 */

class AppController {
    constructor() {
        this.currentView = 'home';
        this.currentPage = 1;
        this.pageSize = 8;
        this.currentSortField = 'rollNo';
        this.selectedForDelete = null;
        this.init();
    }

    init() {
        if (window.lucide) window.lucide.createIcons();

        // Check authentication state
        this.bindAuth();

        // Bind Navigation & UI Events
        this.bindNavigation();
        this.bindThemeToggle();
        this.bindQuickSearch();
        this.bindAddStudentForm();
        this.bindTableControls();
        this.bindSearchEngineForm();
        this.bindUpdateFlow();
        this.bindDeleteFlow();
        this.bindReportsControls();

        // Render C-Concept accordions on all pages
        this.renderAllTechAccordions();

        // Listen for direct URL hash changes and block if not authenticated
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if (!db.isLoggedIn()) {
                this.showLoginView();
            } else if (hash) {
                this.navigateTo(hash);
            }
        });

        if (db.isLoggedIn()) {
            this.showMainApp();
            const initialHash = window.location.hash.replace('#', '');
            this.navigateTo(initialHash || 'dashboard');
        } else {
            this.showLoginView();
        }

        this.refreshGlobalCounters();
    }

    /**
     * Authentication Management
     */
    bindAuth() {
        const loginForm = document.getElementById('loginForm');
        const loginErrEl = document.getElementById('loginErrorMsg');
        const loginErrText = document.getElementById('loginErrorText');

        loginForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('loginUsername').value.trim();
            const pass = document.getElementById('loginPassword').value.trim();

            if (db.login(user, pass)) {
                if (loginErrEl) loginErrEl.style.display = 'none';
                this.showToast(`Login successful! Welcome, ${db.getLoggedUser()}.`, 'success');
                this.showMainApp();
                this.navigateTo('dashboard');
            } else {
                if (loginErrEl) {
                    if (loginErrText) loginErrText.textContent = 'Invalid Username or Password.';
                    loginErrEl.style.display = 'flex';
                }
                this.showToast('Invalid Username or Password.', 'error');
            }
        });

        const handleLogout = () => {
            db.logout();
            const uInput = document.getElementById('loginUsername');
            const pInput = document.getElementById('loginPassword');
            if (uInput) uInput.value = '';
            if (pInput) pInput.value = '';
            if (loginErrEl) loginErrEl.style.display = 'none';
            this.showLoginView();
            this.showToast('Logged out successfully.', 'info');
        };

        document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
        document.getElementById('sidebarLogoutBtn')?.addEventListener('click', handleLogout);
    }

    showLoginView() {
        document.getElementById('view-login').classList.add('active');
        document.getElementById('appMainContainer').style.display = 'none';
        window.location.hash = '';
    }

    showMainApp() {
        document.getElementById('view-login').classList.remove('active');
        document.getElementById('appMainContainer').style.display = 'flex';

        const userName = db.getLoggedUser();
        const topbarUserEl = document.getElementById('loggedInUserDisplay');
        const sidebarUserEl = document.getElementById('sidebarUserName');
        if (topbarUserEl) topbarUserEl.textContent = userName;
        if (sidebarUserEl) sidebarUserEl.textContent = userName;

        if (window.lucide) window.lucide.createIcons();
    }

    /**
     * View Router Handler
     */
    navigateTo(viewId) {
        if (!db.isLoggedIn()) {
            this.showLoginView();
            return;
        }

        const validViews = ['home', 'dashboard', 'add-student', 'view-students', 'search-student', 'update-student', 'delete-student', 'statistics', 'reports', 'about'];
        if (!validViews.includes(viewId)) viewId = 'dashboard';

        this.currentView = viewId;
        window.location.hash = viewId;

        document.querySelectorAll('.view-page').forEach(el => el.classList.remove('active'));
        const targetEl = document.getElementById(`view-${viewId}`);
        if (targetEl) targetEl.classList.add('active');

        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('data-view') === viewId) item.classList.add('active');
            else item.classList.remove('active');
        });

        const titles = {
            'home': { title: 'Home', sub: 'Welcome to Smart Student Record Manager' },
            'dashboard': { title: 'Dashboard', sub: 'Overview of records, metrics & quick actions' },
            'add-student': { title: 'Add Student', sub: 'Register new student profile with format validations' },
            'view-students': { title: 'View Students', sub: 'Explore, sort, filter & paginate student roster' },
            'search-student': { title: 'Search Engine', sub: 'Compare Linear vs Binary Search algorithm metrics' },
            'update-student': { title: 'Update Record', sub: 'Search and modify student information' },
            'delete-student': { title: 'Delete Record', sub: 'Remove record via C file rewrite simulation' },
            'statistics': { title: 'Statistics', sub: 'Interactive branch, campus & student type charts' },
            'reports': { title: 'Reports Generator', sub: 'Generate printable merit lists & export files' },
            'about': { title: 'About & C Concepts', sub: 'Academic details, C-structure mapping & team' }
        };

        const info = titles[viewId] || titles['home'];
        document.getElementById('currentPageTitle').textContent = info.title;
        document.getElementById('currentPageSubtitle').textContent = info.sub;

        this.onViewActivated(viewId);

        if (window.lucide) window.lucide.createIcons();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    onViewActivated(viewId) {
        this.refreshGlobalCounters();

        if (viewId === 'home') {
            const stats = db.getStatistics();
            document.getElementById('heroStatTotal').textContent = stats.total;
            document.getElementById('heroStatAvg').textContent = stats.avgCGPA;
        } else if (viewId === 'dashboard') {
            this.renderDashboardView();
        } else if (viewId === 'view-students') {
            this.renderStudentsTable();
        } else if (viewId === 'statistics') {
            this.renderStatisticsView();
        } else if (viewId === 'reports') {
            this.renderReportsView();
        }
    }

    refreshGlobalCounters() {
        const count = db.getAllStudents().length;
        document.getElementById('recordCountBadge').textContent = `${count} Records`;
    }

    /**
     * Dashboard View Renderer
     */
    renderDashboardView() {
        const stats = db.getStatistics();
        document.getElementById('dashTotalStudents').textContent = stats.total;
        document.getElementById('dashHighestCGPA').textContent = stats.highestCGPA;
        document.getElementById('dashTopStudentName').textContent = stats.topStudent ? stats.topStudent.name : '--';
        document.getElementById('dashLowestCGPA').textContent = stats.lowestCGPA;
        document.getElementById('dashLowStudentName').textContent = stats.lowStudent ? stats.lowStudent.name : '--';
        document.getElementById('dashAvgCGPA').textContent = stats.avgCGPA;

        const hostellerCount = stats.typeCounts ? (stats.typeCounts['Hosteller'] || 0) : 0;
        const dayScholarCount = stats.typeCounts ? (stats.typeCounts['Day Scholar'] || 0) : 0;
        document.getElementById('dashHostellerRatio').textContent = `${hostellerCount} / ${dayScholarCount}`;

        // Activity log list
        const logListEl = document.getElementById('dashboardActivityList');
        const logs = db.getActivityLog();

        if (logs.length === 0) {
            logListEl.innerHTML = `<li class="activity-item"><div class="activity-content"><p style="color:var(--text-muted);">No recent activity recorded.</p></div></li>`;
        } else {
            logListEl.innerHTML = logs.slice(0, 6).map(log => `
                <li class="activity-item">
                    <div class="activity-icon-bullet ${log.type}">
                        <i data-lucide="${log.type === 'add' ? 'plus' : (log.type === 'update' ? 'edit-2' : 'trash')}"></i>
                    </div>
                    <div class="activity-content">
                        <p>${log.text}</p>
                        <span>${log.time}</span>
                    </div>
                </li>
            `).join('');
        }

        Charts.renderDashBranchChart('dashBranchChart', stats);
    }

    /**
     * Add Student Form Validation & Submission
     */
    bindAddStudentForm() {
        const form = document.getElementById('addStudentForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
            document.querySelectorAll('.form-group input, .form-group select').forEach(el => el.classList.remove('error'));

            const campus = document.getElementById('addCampus').value;
            const branch = document.getElementById('addBranch').value;
            const rollNo = document.getElementById('addRollNo').value.trim().toUpperCase();
            const fullName = document.getElementById('addFullName').value.trim();
            const studentType = document.getElementById('addStudentType').value;
            const year = document.getElementById('addYear').value;
            const semester = document.getElementById('addSemester').value;
            const mobile = document.getElementById('addMobile').value.trim();
            const cgpaStr = document.getElementById('addCGPA').value.trim();

            let isValid = true;

            if (!campus) { this.showFieldError('addCampus', 'addCampusErr', 'Campus selection is required'); isValid = false; }
            if (!branch) { this.showFieldError('addBranch', 'addBranchErr', 'Branch selection is required'); isValid = false; }
            if (!studentType) { this.showFieldError('addStudentType', 'addStudentTypeErr', 'Student type selection is required'); isValid = false; }
            if (!year) { this.showFieldError('addYear', 'addYearErr', 'Year selection is required'); isValid = false; }
            if (!semester) { this.showFieldError('addSemester', 'addSemesterErr', 'Semester selection is required'); isValid = false; }
            if (!fullName) { this.showFieldError('addFullName', 'addFullNameErr', 'Full name is required'); isValid = false; }

            // Roll Number Validation (Format + Uniqueness + Code Alignment)
            if (!rollNo) {
                this.showFieldError('addRollNo', 'addRollNoErr', 'Roll Number is required');
                isValid = false;
            } else if (db.isRollNoDuplicate(rollNo)) {
                this.showFieldError('addRollNo', 'addRollNoErr', `Roll Number '${rollNo}' already exists! Must be unique.`);
                isValid = false;
            } else if (campus && branch) {
                const formatCheck = db.validateRollNumberFormat(rollNo, branch, campus);
                if (!formatCheck.valid) {
                    this.showFieldError('addRollNo', 'addRollNoErr', formatCheck.message);
                    isValid = false;
                }
            }

            // Mobile Validation
            if (!/^\d{10}$/.test(mobile)) {
                this.showFieldError('addMobile', 'addMobileErr', 'Mobile Number must contain exactly 10 digits');
                isValid = false;
            }

            // CGPA Validation
            const cgpa = parseFloat(cgpaStr);
            if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
                this.showFieldError('addCGPA', 'addCGPAErr', 'CGPA must be between 0.00 and 10.00');
                isValid = false;
            }

            if (!isValid) return;

            const newStudent = { rollNo, name: fullName, campus, branch, studentType, year, semester, mobile, cgpa };
            db.addStudent(newStudent);

            this.showToast(`Student record for ${fullName} (${rollNo}) created successfully!`, 'success');
            form.reset();
            this.navigateTo('view-students');
        });

        document.getElementById('resetAddFormBtn')?.addEventListener('click', () => {
            form.reset();
            document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
        });
    }

    showFieldError(inputId, errId, message) {
        const input = document.getElementById(inputId);
        const errEl = document.getElementById(errId);
        if (input) input.classList.add('error');
        if (errEl) errEl.textContent = message;
    }

    /**
     * View Students Table Handler with Empty State & Filters
     */
    bindTableControls() {
        document.getElementById('tableSearchInput')?.addEventListener('input', () => { this.currentPage = 1; this.renderStudentsTable(); });
        document.getElementById('filterCampusSelect')?.addEventListener('change', () => { this.currentPage = 1; this.renderStudentsTable(); });
        document.getElementById('filterBranchSelect')?.addEventListener('change', () => { this.currentPage = 1; this.renderStudentsTable(); });
        document.getElementById('filterTypeSelect')?.addEventListener('change', () => { this.currentPage = 1; this.renderStudentsTable(); });
        document.getElementById('filterSemesterSelect')?.addEventListener('change', () => { this.currentPage = 1; this.renderStudentsTable(); });

        document.getElementById('resetTableFiltersBtn')?.addEventListener('click', () => {
            document.getElementById('tableSearchInput').value = '';
            document.getElementById('filterCampusSelect').value = 'ALL';
            document.getElementById('filterBranchSelect').value = 'ALL';
            document.getElementById('filterTypeSelect').value = 'ALL';
            document.getElementById('filterSemesterSelect').value = 'ALL';
            this.currentPage = 1;
            this.renderStudentsTable();
        });

        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSortField = btn.getAttribute('data-sort');
                this.renderStudentsTable();
            });
        });

        document.getElementById('prevPageBtn')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderStudentsTable();
            }
        });
        document.getElementById('nextPageBtn')?.addEventListener('click', () => {
            this.currentPage++;
            this.renderStudentsTable();
        });
    }

    renderStudentsTable() {
        let records = db.getAllStudents();

        const query = (document.getElementById('tableSearchInput')?.value || '').toLowerCase().trim();
        if (query) {
            records = records.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.rollNo.toLowerCase().includes(query) ||
                s.mobile.includes(query) ||
                s.branch.toLowerCase().includes(query) ||
                s.campus.toLowerCase().includes(query)
            );
        }

        const campusVal = document.getElementById('filterCampusSelect')?.value || 'ALL';
        const branchVal = document.getElementById('filterBranchSelect')?.value || 'ALL';
        const typeVal = document.getElementById('filterTypeSelect')?.value || 'ALL';
        const semVal = document.getElementById('filterSemesterSelect')?.value || 'ALL';

        if (campusVal !== 'ALL') records = records.filter(s => s.campus === campusVal);
        if (branchVal !== 'ALL') records = records.filter(s => s.branch === branchVal);
        if (typeVal !== 'ALL') records = records.filter(s => s.studentType === typeVal);
        if (semVal !== 'ALL') records = records.filter(s => s.semester === semVal);

        records = Algorithms.sortRecords(records, this.currentSortField, this.currentSortField === 'cgpa' ? 'desc' : 'asc');

        const totalRecords = records.length;
        document.getElementById('recordsCounterText').textContent = `Showing ${totalRecords} Records`;

        const totalPages = Math.max(1, Math.ceil(totalRecords / this.pageSize));
        if (this.currentPage > totalPages) this.currentPage = totalPages;

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const paginatedRecords = records.slice(startIndex, startIndex + this.pageSize);

        const tbody = document.getElementById('studentsTableBody');
        
        // Requirement 1 Empty State Display Message
        if (paginatedRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center" style="padding: 50px 20px;">
                        <div class="empty-state">
                            <i data-lucide="user-x" class="empty-icon"></i>
                            <h3>No student records found.</h3>
                            <p>Click <strong>'Add Student'</strong> to create your first student record.</p>
                            <button class="btn btn-teal btn-sm margin-top-md" onclick="app.navigateTo('add-student')">
                                <i data-lucide="user-plus"></i> Add Student Now
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = paginatedRecords.map(s => `
                <tr>
                    <td><strong>${s.rollNo}</strong></td>
                    <td><strong>${s.name}</strong></td>
                    <td><span class="badge badge-teal">${s.campus}</span></td>
                    <td><span class="badge badge-primary">${s.branch}</span></td>
                    <td>${s.year}</td>
                    <td>Sem ${s.semester}</td>
                    <td><span class="badge badge-warning">${s.studentType}</span></td>
                    <td>${s.mobile}</td>
                    <td><span class="badge ${s.cgpa >= 8.5 ? 'badge-success' : (s.cgpa >= 7.5 ? 'badge-primary' : 'badge-warning')}">${s.cgpa.toFixed(2)}</span></td>
                    <td class="text-right">
                        <div class="table-actions">
                            <button class="btn btn-xs btn-outline" onclick="app.showStudentDetails('${s.rollNo}')" title="View Complete Profile"><i data-lucide="eye"></i></button>
                            <button class="btn btn-xs btn-secondary" onclick="app.loadStudentForEdit('${s.rollNo}')" title="Edit Profile"><i data-lucide="edit-2"></i></button>
                            <button class="btn btn-xs btn-danger" onclick="app.loadStudentForDelete('${s.rollNo}')" title="Delete Profile"><i data-lucide="trash-2"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        document.getElementById('paginationInfo').textContent = `Page ${this.currentPage} of ${totalPages}`;
        document.getElementById('prevPageBtn').disabled = (this.currentPage === 1);
        document.getElementById('nextPageBtn').disabled = (this.currentPage === totalPages || totalRecords === 0);

        if (window.lucide) window.lucide.createIcons();
    }

    /**
     * Search Engine Page
     */
    bindSearchEngineForm() {
        const form = document.getElementById('searchForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const criteria = document.querySelector('input[name="searchCriteria"]:checked').value;
            const query = document.getElementById('searchQueryInput').value.trim();
            const algorithm = document.getElementById('searchAlgorithmSelect').value;

            if (!query) return;

            const records = db.getAllStudents();
            let linearRes = null;
            let binaryRes = null;

            if (algorithm === 'LINEAR' || algorithm === 'BOTH') {
                linearRes = Algorithms.linearSearch(records, query, criteria);
            }

            if (algorithm === 'BINARY' || algorithm === 'BOTH') {
                binaryRes = Algorithms.binarySearch(records, query, criteria);
            }

            const metricsBox = document.getElementById('algoMetricsBox');
            metricsBox.style.display = 'block';
            document.getElementById('linearComparisons').textContent = linearRes ? linearRes.comparisons : 'N/A';
            document.getElementById('binaryComparisons').textContent = binaryRes ? binaryRes.comparisons : 'N/A';

            const tracerBox = document.getElementById('stepTracerContainer');
            const tracerLogs = document.getElementById('tracerLogs');
            tracerBox.style.display = 'block';

            const activeRes = binaryRes || linearRes;
            tracerLogs.innerHTML = activeRes.logs.map(l => `<div class="log-step">${l}</div>`).join('');

            const outputContainer = document.getElementById('searchOutputContainer');
            const foundList = activeRes.results;

            if (foundList.length === 0) {
                outputContainer.innerHTML = `
                    <div class="empty-state">
                        <i data-lucide="alert-circle" class="empty-icon" style="color: #ef4444;"></i>
                        <h3>Record Not Found</h3>
                        <p>No student profile found with ${criteria} matching '${query}'.</p>
                    </div>
                `;
            } else {
                outputContainer.innerHTML = foundList.map(s => `
                    <div class="glass-card student-profile-preview margin-top-md">
                        <div class="card-header-flex">
                            <h3><i data-lucide="user-check"></i> ${s.name}</h3>
                            <span class="badge badge-success">Match Found</span>
                        </div>
                        <div class="form-grid margin-top-md">
                            <div><strong>Roll Number:</strong> ${s.rollNo}</div>
                            <div><strong>Campus:</strong> ${s.campus}</div>
                            <div><strong>Branch:</strong> ${s.branch}</div>
                            <div><strong>Type:</strong> ${s.studentType}</div>
                            <div><strong>Year / Semester:</strong> ${s.year} / Sem ${s.semester}</div>
                            <div><strong>Mobile Number:</strong> ${s.mobile}</div>
                            <div><strong>CGPA Score:</strong> ${s.cgpa.toFixed(2)}</div>
                        </div>
                        <div class="form-actions">
                            <button class="btn btn-sm btn-secondary" onclick="app.loadStudentForEdit('${s.rollNo}')"><i data-lucide="edit-2"></i> Edit Record</button>
                            <button class="btn btn-sm btn-danger" onclick="app.loadStudentForDelete('${s.rollNo}')"><i data-lucide="trash-2"></i> Delete Record</button>
                        </div>
                    </div>
                `).join('');
            }

            if (window.lucide) window.lucide.createIcons();
        });
    }

    /**
     * Update Record Flow
     */
    bindUpdateFlow() {
        document.getElementById('fetchForUpdateBtn')?.addEventListener('click', () => {
            const rollNo = document.getElementById('updateSearchRollNo').value.trim();
            if (!rollNo) return;
            this.loadStudentForEdit(rollNo);
        });

        const updateForm = document.getElementById('updateStudentForm');
        updateForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const origRoll = document.getElementById('editOriginalRollNo').value;
            const updated = {
                campus: document.getElementById('editCampus').value,
                branch: document.getElementById('editBranch').value,
                rollNo: document.getElementById('editRollNo').value.trim().toUpperCase(),
                name: document.getElementById('editFullName').value.trim(),
                studentType: document.getElementById('editStudentType').value,
                year: document.getElementById('editYear').value,
                semester: document.getElementById('editSemester').value,
                mobile: document.getElementById('editMobile').value.trim(),
                cgpa: document.getElementById('editCGPA').value.trim()
            };

            if (db.isRollNoDuplicate(updated.rollNo, origRoll)) {
                this.showToast(`Roll Number '${updated.rollNo}' is already assigned to another student!`, 'error');
                return;
            }

            const formatCheck = db.validateRollNumberFormat(updated.rollNo, updated.branch, updated.campus);
            if (!formatCheck.valid) {
                this.showToast(formatCheck.message, 'error');
                return;
            }

            if (!/^\d{10}$/.test(updated.mobile)) {
                this.showToast('Mobile number must be exactly 10 digits.', 'error');
                return;
            }

            if (parseFloat(updated.cgpa) < 0 || parseFloat(updated.cgpa) > 10) {
                this.showToast('CGPA must be between 0.00 and 10.00', 'error');
                return;
            }

            db.updateStudent(origRoll, updated);
            this.showToast(`Profile for ${updated.name} updated successfully!`, 'success');
            document.getElementById('updateFormCard').style.display = 'none';
            this.navigateTo('view-students');
        });

        document.getElementById('cancelUpdateBtn')?.addEventListener('click', () => {
            document.getElementById('updateFormCard').style.display = 'none';
        });
    }

    loadStudentForEdit(rollNo) {
        const student = db.getByRollNo(rollNo);
        if (!student) {
            this.showToast(`No student record found with Roll '${rollNo}'`, 'error');
            return;
        }

        this.navigateTo('update-student');
        document.getElementById('updateSearchRollNo').value = student.rollNo;
        document.getElementById('updateFormCard').style.display = 'block';

        document.getElementById('editOriginalRollNo').value = student.rollNo;
        document.getElementById('editCampus').value = student.campus || 'KIET';
        document.getElementById('editBranch').value = student.branch;
        document.getElementById('editRollNo').value = student.rollNo;
        document.getElementById('editFullName').value = student.name;
        document.getElementById('editStudentType').value = student.studentType || 'Day Scholar';
        document.getElementById('editYear').value = student.year;
        document.getElementById('editSemester').value = student.semester;
        document.getElementById('editMobile').value = student.mobile;
        document.getElementById('editCGPA').value = student.cgpa;
    }

    /**
     * Delete Record Flow
     */
    bindDeleteFlow() {
        document.getElementById('fetchForDeleteBtn')?.addEventListener('click', () => {
            const rollNo = document.getElementById('deleteSearchRollNo').value.trim();
            if (!rollNo) return;
            this.loadStudentForDelete(rollNo);
        });

        document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
            if (!this.selectedForDelete) return;
            const roll = this.selectedForDelete.rollNo;
            const name = this.selectedForDelete.name;

            db.deleteStudent(roll);
            this.showToast(`Record for ${name} (${roll}) deleted and file rewritten!`, 'success');
            document.getElementById('deletePreviewCard').style.display = 'none';
            this.selectedForDelete = null;
            this.navigateTo('view-students');
        });

        document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
            document.getElementById('deletePreviewCard').style.display = 'none';
            this.selectedForDelete = null;
        });
    }

    loadStudentForDelete(rollNo) {
        const student = db.getByRollNo(rollNo);
        if (!student) {
            this.showToast(`No student record found with Roll '${rollNo}'`, 'error');
            return;
        }

        this.selectedForDelete = student;
        this.navigateTo('delete-student');
        document.getElementById('deleteSearchRollNo').value = student.rollNo;
        document.getElementById('deletePreviewCard').style.display = 'block';

        document.getElementById('deleteStudentProfile').innerHTML = `
            <div class="form-grid">
                <div><strong>Full Name:</strong> ${student.name}</div>
                <div><strong>Roll Number:</strong> ${student.rollNo}</div>
                <div><strong>Campus:</strong> ${student.campus}</div>
                <div><strong>Branch:</strong> ${student.branch}</div>
                <div><strong>Student Type:</strong> ${student.studentType}</div>
                <div><strong>Year & Semester:</strong> ${student.year} / Sem ${student.semester}</div>
                <div><strong>Mobile Number:</strong> ${student.mobile}</div>
                <div><strong>CGPA Score:</strong> ${student.cgpa.toFixed(2)}</div>
            </div>
        `;
    }

    /**
     * Statistics View Handler
     */
    renderStatisticsView() {
        const stats = db.getStatistics();
        document.getElementById('statsTotal').textContent = stats.total;
        document.getElementById('statsHighest').textContent = stats.highestCGPA;
        document.getElementById('statsLowest').textContent = stats.lowestCGPA;
        document.getElementById('statsAvg').textContent = stats.avgCGPA;

        Charts.renderStatsBranchChart('statsBranchChart', stats);
        Charts.renderStatsTypeChart('statsTypeChart', stats);
        Charts.renderStatsCGPAChart('statsCGPAChart', stats);
        Charts.renderStatsSemesterChart('statsSemesterChart', stats);
    }

    /**
     * Reports View Handler & Controls
     */
    bindReportsControls() {
        const typeSelect = document.getElementById('reportTypeSelect');
        typeSelect?.addEventListener('change', () => {
            const type = typeSelect.value;
            document.getElementById('reportBranchGroup').style.display = (type === 'BRANCH') ? 'block' : 'none';
            document.getElementById('reportSemGroup').style.display = (type === 'SEMESTER') ? 'block' : 'none';
        });

        document.getElementById('generateReportBtn')?.addEventListener('click', () => {
            this.renderReportsView();
        });

        document.getElementById('printReportBtn')?.addEventListener('click', () => {
            window.print();
        });

        document.getElementById('exportCSVBtn')?.addEventListener('click', () => {
            Reports.exportCSV();
            this.showToast('Exported CSV file successfully!', 'info');
        });

        document.getElementById('exportJSONBtn')?.addEventListener('click', () => {
            Reports.exportJSON();
            this.showToast('Exported C-Struct JSON file buffer successfully!', 'info');
        });
    }

    renderReportsView() {
        const type = document.getElementById('reportTypeSelect').value;
        const branch = document.getElementById('reportBranchSelect').value;
        const semester = document.getElementById('reportSemSelect').value;

        const paperContainer = document.getElementById('reportPaperContainer');
        paperContainer.innerHTML = Reports.generateReportHTML(type, { branch, semester });
    }

    /**
     * Quick Search Bar in Topbar
     */
    bindQuickSearch() {
        const input = document.getElementById('quickSearchInput');
        const resultsBox = document.getElementById('quickSearchResults');
        if (!input || !resultsBox) return;

        input.addEventListener('input', () => {
            const query = input.value.toLowerCase().trim();
            if (!query) {
                resultsBox.classList.remove('active');
                return;
            }

            const records = db.getAllStudents().filter(s =>
                s.name.toLowerCase().includes(query) || s.rollNo.toLowerCase().includes(query)
            ).slice(0, 5);

            if (records.length === 0) {
                resultsBox.innerHTML = `<div class="search-res-item"><span>No matching student found</span></div>`;
            } else {
                resultsBox.innerHTML = records.map(s => `
                    <div class="search-res-item" onclick="app.showStudentDetails('${s.rollNo}')">
                        <div>
                            <strong>${s.name}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${s.branch})</span>
                        </div>
                        <span class="badge badge-teal">${s.rollNo}</span>
                    </div>
                `).join('');
            }
            resultsBox.classList.add('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.quick-search-wrapper')) {
                resultsBox.classList.remove('active');
            }
        });

        document.getElementById('topbarQuickAddBtn')?.addEventListener('click', () => {
            this.navigateTo('add-student');
        });
    }

    /**
     * Navigation Binding & Drawer Toggle
     */
    bindNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                this.navigateTo(view);
                document.getElementById('sidebar').classList.remove('active');
            });
        });

        document.getElementById('menuToggleBtn')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.add('active');
        });

        document.getElementById('sidebarCloseBtn')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('active');
        });

        document.getElementById('clearActivityLogBtn')?.addEventListener('click', () => {
            db.clearActivityLog();
            this.renderDashboardView();
            this.showToast('Activity log cleared.', 'info');
        });

        const closeDetail = () => document.getElementById('detailModalOverlay').classList.remove('active');
        document.getElementById('closeDetailModalBtn')?.addEventListener('click', closeDetail);
        document.getElementById('closeDetailModalBtn2')?.addEventListener('click', closeDetail);
        document.getElementById('printDetailModalBtn')?.addEventListener('click', () => window.print());

        const closeCode = () => document.getElementById('codeModalOverlay').classList.remove('active');
        document.getElementById('closeCodeModalBtn')?.addEventListener('click', closeCode);
        document.getElementById('closeCodeModalBtn2')?.addEventListener('click', closeCode);
    }

    /**
     * Show Detailed Student Profile Modal
     */
    showStudentDetails(rollNo) {
        const s = db.getByRollNo(rollNo);
        if (!s) return;

        const body = document.getElementById('detailModalBody');
        body.innerHTML = `
            <div style="text-align:center; margin-bottom:20px;">
                <div style="width:70px; height:70px; border-radius:50%; background:linear-gradient(135deg, var(--teal), var(--primary)); color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:1.8rem; font-weight:700;">
                    ${s.name.charAt(0)}
                </div>
                <h3 style="margin-top:10px;">${s.name}</h3>
                <span class="badge badge-teal">${s.campus} - ${s.branch}</span>
            </div>
            <div class="form-grid">
                <div><strong>Roll Number:</strong> ${s.rollNo}</div>
                <div><strong>Campus:</strong> ${s.campus}</div>
                <div><strong>Branch:</strong> ${s.branch}</div>
                <div><strong>Student Type:</strong> ${s.studentType}</div>
                <div><strong>Academic Year:</strong> ${s.year}</div>
                <div><strong>Semester:</strong> Semester ${s.semester}</div>
                <div><strong>Mobile Number:</strong> ${s.mobile}</div>
                <div><strong>CGPA Grade:</strong> <span class="badge badge-success">${s.cgpa.toFixed(2)}</span></div>
            </div>
        `;
        document.getElementById('detailModalOverlay').classList.add('active');
        if (window.lucide) window.lucide.createIcons();
    }

    /**
     * Dark / Light Theme Toggle
     */
    bindThemeToggle() {
        const toggleBtn = document.getElementById('themeToggleBtn');
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        toggleBtn?.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);

            this.onViewActivated(this.currentView);
        });
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i data-lucide="${type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-triangle' : 'info')}"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);
        if (window.lucide) window.lucide.createIcons();

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 4500);
    }

    /**
     * Render "Technologies & Concepts Used" Accordion Card on EVERY Page View
     */
    renderAllTechAccordions() {
        const techData = {
            'homeTechAccordion': {
                title: "Technologies & Concepts Used on Home Page",
                purpose: "Introduces project objectives, technical architecture, and bridges C language basics with modern web design.",
                tech: "HTML5 Semantic Tags, CSS3 Glassmorphism & Custom Properties, ES6 Vanilla JavaScript.",
                concepts: "Structures (`struct Student`), Data Buffers, Modular Design, Single-Page App (SPA) Routing.",
                algorithms: "Sequential rendering, UI State Router.",
                cSnippet: `// C Structure Definition
struct Student {
    char rollNo[15];     // 25B21A4501
    char name[50];
    char campus[10];     // B2 / 6Q
    char branch[10];     // AID(45), AIML(42)...
    char studentType[15];// Day Scholar / Hosteller
    char year[15];
    char semester[10];
    char mobile[11];
    float cgpa;
};
struct Student database[1000];`
            },
            'dashTechAccordion': {
                title: "Technologies & Concepts Used on Dashboard",
                purpose: "Displays real-time aggregated metrics, campus distributions, and activity feed.",
                tech: "Chart.js Data Visualization, DOM Manipulation, CSS Grid Flexbox.",
                concepts: "Array Traversal, Accumulation Loops, Hash Map frequency mapping for branches and student types.",
                algorithms: "O(N) Min/Max calculation algorithm, Mean CGPA accumulator.",
                cSnippet: `// C Code for Computing High, Low & Average CGPA
float sum = 0, highest = -1, lowest = 11;
for(int i = 0; i < n; i++) {
    sum += db[i].cgpa;
    if(db[i].cgpa > highest) highest = db[i].cgpa;
    if(db[i].cgpa < lowest) lowest = db[i].cgpa;
}`
            },
            'addTechAccordion': {
                title: "Technologies & Concepts Used on Add Student Page",
                purpose: "Captures student details with strict format validation (25B21A4501) and campus/branch code verification.",
                tech: "HTML5 Form API, JavaScript Regex Validation, Toast Notification Dispatcher.",
                concepts: "Format Constraint Enforcement, Array Element Append, Memory Allocation, C File Append (`fwrite`).",
                algorithms: "Linear uniqueness check O(N) prior to array insertion.",
                cSnippet: `// C Code for Roll Format & Branch Code Validation
int validateRollCode(char roll[], char expectedBranchCode[]) {
    // 25B21A4501 -> Extract branch code at index 6..7
    char branchCode[3] = { roll[6], roll[7], '\\0' };
    return strcmp(branchCode, expectedBranchCode) == 0;
}`
            },
            'viewTechAccordion': {
                title: "Technologies & Concepts Used on View Students Page",
                purpose: "Displays complete roster with dynamic search, multi-column sorting, campus/branch/type filters, and pagination.",
                tech: "Dynamic HTML Table Rendering, Event Delegation, CSS Custom Badges.",
                concepts: "Array Filtering, In-memory Multi-Criteria Sorting, Pagination offset computation.",
                algorithms: "QuickSort / BubbleSort simulation, Linear Array Filtering.",
                cSnippet: `// C Code for Sorting Array of Structs by CGPA
void sortByCGPA(struct Student arr[], int n) {
    for(int i=0; i<n-1; i++) {
        for(int j=0; j<n-i-1; j++) {
            if(arr[j].cgpa < arr[j+1].cgpa) {
                struct Student temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
}`
            },
            'searchTechAccordion': {
                title: "Technologies & Concepts Used on Search Engine Page",
                purpose: "Demonstrates and compares Linear Search vs Binary Search algorithms with visual step counts.",
                tech: "JavaScript High-Resolution Timer (`performance.now()`), Step Tracer DOM Renderer.",
                concepts: "Linear Search O(N) vs Binary Search O(log N), Divide & Conquer strategy, Array pre-sorting.",
                algorithms: "Sequential Scan, Binary Search with Low/Mid/High index pointers.",
                cSnippet: `// C Binary Search Implementation O(log N)
int binarySearch(struct Student arr[], int n, char keyRoll[]) {
    int low = 0, high = n - 1;
    while(low <= high) {
        int mid = low + (high - low)/2;
        int cmp = strcmp(arr[mid].rollNo, keyRoll);
        if(cmp == 0) return mid; // Found
        if(cmp < 0) low = mid + 1;
        else high = mid - 1;
    }
    return -1; // Not Found
}`
            },
            'updateTechAccordion': {
                title: "Technologies & Concepts Used on Update Page",
                purpose: "Retrieves student record, provides editable interface, validates input, and updates profile.",
                tech: "Form Pre-population, Controlled Inputs, Modal Confirmations.",
                concepts: "Pointer Dereferencing, In-Place Array Element Mutation `db[index] = updatedStruct`, File Position Seek (`fseek`).",
                algorithms: "Direct Index Lookup O(1) after linear/binary search.",
                cSnippet: `// C Code for In-Place File Record Update
void updateRecord(char rollNo[], struct Student newDetails) {
    FILE *fp = fopen("students.dat", "rb+");
    struct Student temp;
    while(fread(&temp, sizeof(struct Student), 1, fp)) {
        if(strcmp(temp.rollNo, rollNo) == 0) {
            fseek(fp, -sizeof(struct Student), SEEK_CUR);
            fwrite(&newDetails, sizeof(struct Student), 1, fp);
            break;
        }
    }
    fclose(fp);
}`
            },
            'deleteTechAccordion': {
                title: "Technologies & Concepts Used on Delete Page",
                purpose: "Removes student record from array buffer and simulates C temporary file rewrite deletion.",
                tech: "Confirmation Dialogs, Warning Banner Components, Toast Feedback.",
                concepts: "Array Element Shifting `db[j] = db[j+1]`, Array Size Decrement `n--`, Temporary File Rewrite Pattern.",
                algorithms: "Left Shifting Array Deletion O(N).",
                cSnippet: `// C Code for Deleting Record via File Rewrite
void deleteRecord(char rollNo[]) {
    FILE *fp = fopen("students.dat", "rb");
    FILE *temp = fopen("temp.dat", "wb");
    struct Student s;
    while(fread(&s, sizeof(struct Student), 1, fp)) {
        if(strcmp(s.rollNo, rollNo) != 0) {
            fwrite(&s, sizeof(struct Student), 1, temp);
        }
    }
    fclose(fp); fclose(temp);
    remove("students.dat"); rename("temp.dat", "students.dat");
}`
            },
            'statsTechAccordion': {
                title: "Technologies & Concepts Used on Statistics Page",
                purpose: "Visualizes branch distributions, student type breakdown, CGPA grade tiers, and semester breakdown.",
                tech: "Chart.js Canvas API, HSL Color Math, Responsive Grid Layouts.",
                concepts: "Data Aggregation, Frequency Arrays, Percentage Calculations.",
                algorithms: "Single-pass O(N) multi-variable statistics compilation.",
                cSnippet: `// C Frequency Map for Branch Statistics
int branchCounts[5] = {0}; // AID, AIML, AI, DS, Cyber Security
for(int i = 0; i < n; i++) {
    if(strcmp(db[i].branch, "AID") == 0) branchCounts[0]++;
    else if(strcmp(db[i].branch, "AIML") == 0) branchCounts[1]++;
}`
            },
            'reportsTechAccordion': {
                title: "Technologies & Concepts Used on Reports Page",
                purpose: "Generates formatted merit lists, branch rosters, printable PDF layouts, and CSV/JSON export files.",
                tech: "CSS Print Media Stylesheets, Blob File Generation, JSON Formatting.",
                concepts: "Sequential Report Formatting, Data Exporting, Buffer Serializing.",
                algorithms: "Sorted Array Traversal and Formatted Output Stream.",
                cSnippet: `// C Code for Generating Text/CSV File Report
void exportCSVReport() {
    FILE *fp = fopen("student_report.csv", "w");
    fprintf(fp, "RollNo,Name,Campus,Branch,Year,Semester,StudentType,Mobile,CGPA\\n");
    for(int i = 0; i < n; i++) {
        fprintf(fp, "%s,\\"%s\\",%s,%s,%s,%s,%s,%s,%.2f\\n",
            db[i].rollNo, db[i].name, db[i].campus, db[i].branch,
            db[i].year, db[i].semester, db[i].studentType, db[i].mobile, db[i].cgpa);
    }
    fclose(fp);
}`
            },
            'aboutTechAccordion': {
                title: "Technologies & Concepts Used Overview",
                purpose: "Explains project architecture, academic team roles, and C concept bridge mapping.",
                tech: "HTML5, CSS3, ES6 JavaScript, Lucide Icons, Chart.js.",
                concepts: "Arrays, Structs, File Handling, Linear/Binary Search, QuickSort, Input Validation.",
                algorithms: "Linear Search, Binary Search, QuickSort, Data Aggregation.",
                cSnippet: `// Comprehensive Architecture Mapping:
// C CLI Concept          --> Modern Web SPA Equivalent
// -------------------------------------------------------------
// struct Student db[100]  --> LocalStorage Array of Objects
// fopen("data.dat", "ab") --> localStorage.setItem()
// printf() / scanf()      --> Form Controls & Dynamic DOM
// binarySearch()          --> JS Divide-and-Conquer Algorithm`
            }
        };

        Object.keys(techData).forEach(containerId => {
            const container = document.getElementById(containerId);
            if (!container) return;

            const item = techData[containerId];
            container.innerHTML = `
                <div class="accordion-card">
                    <div class="accordion-header" onclick="app.toggleAccordion(this)">
                        <h3><i data-lucide="cpu"></i> ${item.title}</h3>
                        <i data-lucide="chevron-down" class="accordion-icon"></i>
                    </div>
                    <div class="accordion-body">
                        <div class="tech-concepts-grid">
                            <div class="concept-box">
                                <h4><i data-lucide="target"></i> Purpose of Page</h4>
                                <p>${item.purpose}</p>
                            </div>
                            <div class="concept-box">
                                <h4><i data-lucide="code"></i> Technologies Used</h4>
                                <p>${item.tech}</p>
                            </div>
                            <div class="concept-box">
                                <h4><i data-lucide="layers"></i> Programming Concepts</h4>
                                <p>${item.concepts}</p>
                            </div>
                            <div class="concept-box">
                                <h4><i data-lucide="activity"></i> Algorithms Used</h4>
                                <p>${item.algorithms}</p>
                            </div>
                        </div>
                        <div style="margin-top: 16px;">
                            <button class="btn btn-xs btn-outline inspect-c-code-btn" onclick="app.showCodeModal('${item.title}', \`${escapeCode(item.cSnippet)}\`, '${item.purpose}')">
                                <i data-lucide="code-2"></i> Inspect C Code Snippet
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    toggleAccordion(headerEl) {
        const card = headerEl.closest('.accordion-card');
        card.classList.toggle('open');
    }

    showCodeModal(title, snippet, desc) {
        document.getElementById('codeModalDescription').textContent = `${title}: ${desc}`;
        document.getElementById('codeModalSnippet').textContent = unescapeCode(snippet);
        document.getElementById('codeModalOverlay').classList.add('active');
    }
}

function escapeCode(code) {
    return code.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function unescapeCode(code) {
    return code;
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AppController();
});
