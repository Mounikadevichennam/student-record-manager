/**
 * Smart Student Record Manager - Data Visualization Charts Layer
 * Uses Chart.js to render responsive Branch, Campus, Student Type & CGPA distribution charts.
 */

const Charts = {
    instances: {},

    /**
     * Get theme-aware text & border colors
     */
    getThemeColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            textColor: isDark ? '#f1f5f9' : '#1e293b',
            gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            primary: '#1e3a8a',
            teal: '#0d9488',
            accent: '#3b82f6',
            orange: '#f59e0b',
            purple: '#8b5cf6',
            red: '#ef4444',
            green: '#10b981'
        };
    },

    /**
     * Render Dashboard Mini Branch Chart
     */
    renderDashBranchChart(canvasId, stats) {
        if (!document.getElementById(canvasId)) return;
        const ctx = document.getElementById(canvasId).getContext('2d');
        const colors = this.getThemeColors();

        if (this.instances[canvasId]) this.instances[canvasId].destroy();

        const labels = Object.keys(stats.branchCounts);
        const data = Object.values(stats.branchCounts);

        this.instances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: [colors.teal, colors.accent, colors.orange, colors.purple, colors.red],
                    borderWidth: 2,
                    borderColor: isDarkTheme() ? '#111827' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: colors.textColor, font: { family: 'Inter', size: 11 } }
                    }
                }
            }
        });
    },

    /**
     * Render Statistics View: Branch Bar Chart
     */
    renderStatsBranchChart(canvasId, stats) {
        if (!document.getElementById(canvasId)) return;
        const ctx = document.getElementById(canvasId).getContext('2d');
        const colors = this.getThemeColors();

        if (this.instances[canvasId]) this.instances[canvasId].destroy();

        const labels = Object.keys(stats.branchCounts);
        const data = Object.values(stats.branchCounts);

        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Enrolled Students',
                    data,
                    backgroundColor: [colors.teal, colors.accent, colors.orange, colors.purple, colors.red],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: colors.textColor }, grid: { color: colors.gridColor } },
                    y: { ticks: { color: colors.textColor, precision: 0 }, grid: { color: colors.gridColor }, beginAtZero: true }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    },

    /**
     * Render Statistics View: Student Type Chart (Day Scholar vs Hosteller)
     */
    renderStatsTypeChart(canvasId, stats) {
        if (!document.getElementById(canvasId)) return;
        const ctx = document.getElementById(canvasId).getContext('2d');
        const colors = this.getThemeColors();

        if (this.instances[canvasId]) this.instances[canvasId].destroy();

        const typeData = stats.typeCounts || { "Day Scholar": 0, "Hosteller": 0 };

        this.instances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Day Scholar', 'Hosteller'],
                datasets: [{
                    data: [typeData['Day Scholar'] || 0, typeData['Hosteller'] || 0],
                    backgroundColor: [colors.accent, colors.orange],
                    borderWidth: 2,
                    borderColor: isDarkTheme() ? '#111827' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: colors.textColor, font: { family: 'Inter', size: 11 } }
                    }
                }
            }
        });
    },

    /**
     * Render Statistics View: CGPA Tiers Chart
     */
    renderStatsCGPAChart(canvasId, stats) {
        if (!document.getElementById(canvasId)) return;
        const ctx = document.getElementById(canvasId).getContext('2d');
        const colors = this.getThemeColors();

        if (this.instances[canvasId]) this.instances[canvasId].destroy();

        const tiers = stats.cgpaTiers;

        this.instances[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Distinction (>=8.5)', 'First Class (7.5-8.4)', 'Second Class (6.0-7.4)', 'Pass (<6.0)'],
                datasets: [{
                    data: [tiers.distinction, tiers.firstClass, tiers.secondClass, tiers.pass],
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
                    borderWidth: 2,
                    borderColor: isDarkTheme() ? '#111827' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: colors.textColor, font: { family: 'Inter', size: 11 } }
                    }
                }
            }
        });
    },

    /**
     * Render Statistics View: Semester Bar Chart
     */
    renderStatsSemesterChart(canvasId, stats) {
        if (!document.getElementById(canvasId)) return;
        const ctx = document.getElementById(canvasId).getContext('2d');
        const colors = this.getThemeColors();

        if (this.instances[canvasId]) this.instances[canvasId].destroy();

        const semLabels = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];
        const semData = semLabels.map(sem => stats.semesterCounts[sem] || 0);

        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: semLabels,
                datasets: [{
                    label: 'Students Count',
                    data: semData,
                    backgroundColor: colors.accent,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: colors.textColor }, grid: { color: colors.gridColor } },
                    y: { ticks: { color: colors.textColor, precision: 0 }, grid: { color: colors.gridColor }, beginAtZero: true }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
};

function isDarkTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
}
