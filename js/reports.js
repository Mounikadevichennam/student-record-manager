/**
 * Smart Student Record Manager - Reports & Export Layer
 * Generates formatted academic merit lists, branch rosters, and CSV/JSON export files.
 */

const Reports = {
    /**
     * Generate HTML paper layout for chosen report type
     */
    generateReportHTML(type, options = {}) {
        let students = db.getAllStudents();
        let reportTitle = "Complete Academic Student Roster";
        let subTitle = "All Registered Students Across Departments & Campuses";

        if (type === 'TOP_PERFORMERS') {
            students = students.filter(s => s.cgpa >= 8.5).sort((a, b) => b.cgpa - a.cgpa);
            reportTitle = "Academic Honor Roll & Top Performers";
            subTitle = "Students with CGPA >= 8.5 (Distinction)";
        } else if (type === 'BRANCH' && options.branch) {
            students = students.filter(s => s.branch === options.branch).sort((a, b) => a.rollNo.localeCompare(b.rollNo));
            reportTitle = `Departmental Student Roster - ${options.branch}`;
            subTitle = `Filtered for Branch: ${options.branch}`;
        } else if (type === 'SEMESTER' && options.semester) {
            students = students.filter(s => s.semester === options.semester).sort((a, b) => a.rollNo.localeCompare(b.rollNo));
            reportTitle = `Semester ${options.semester} Class Roll`;
            subTitle = `Enrolled Students in Semester ${options.semester}`;
        } else {
            students.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
        }

        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        let tableRows = '';
        if (students.length === 0) {
            tableRows = `<tr><td colspan="9" style="text-align: center; color: #64748b; padding: 30px;">No student records found matching the report criteria.</td></tr>`;
        } else {
            students.forEach((s) => {
                tableRows += `
                    <tr>
                        <td><strong>${s.rollNo}</strong></td>
                        <td>${s.name}</td>
                        <td><span class="badge badge-teal">${s.campus || 'KIET'}</span></td>
                        <td><span class="badge badge-primary">${s.branch}</span></td>
                        <td>${s.year}</td>
                        <td>Sem ${s.semester}</td>
                        <td><span class="badge badge-warning">${s.studentType || 'Day Scholar'}</span></td>
                        <td>${s.mobile}</td>
                        <td><strong>${s.cgpa.toFixed(2)}</strong></td>
                    </tr>
                `;
            });
        }

        return `
            <div class="report-header">
                <h2>KIET Group of Institutions</h2>
                <h4>DEPARTMENT OF COMPUTER SCIENCE & AI ENGINEERING</h4>
                <p style="margin-top: 6px; font-weight: 700; color: #1e3a8a;">${reportTitle}</p>
                <p style="font-size: 0.85rem; color: #64748b;">${subTitle}</p>
            </div>

            <div class="report-meta-row">
                <span><strong>Date Generated:</strong> ${dateStr}</span>
                <span><strong>Total Records:</strong> ${students.length}</span>
                <span><strong>Course Code:</strong> CS201 Mini Project</span>
            </div>

            <table class="report-table">
                <thead>
                    <tr>
                        <th>Roll No</th>
                        <th>Student Name</th>
                        <th>Campus</th>
                        <th>Branch</th>
                        <th>Year</th>
                        <th>Sem</th>
                        <th>Type</th>
                        <th>Mobile</th>
                        <th>CGPA</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div class="report-footer-sign">
                <div class="sign-line">Course Coordinator</div>
                <div class="sign-line">Head of Department</div>
                <div class="sign-line">Academic Dean</div>
            </div>
        `;
    },

    /**
     * Download CSV File
     */
    exportCSV(students = db.getAllStudents()) {
        const headers = ["Roll Number", "Full Name", "Campus", "Branch", "Year", "Semester", "Student Type", "Mobile Number", "CGPA"];
        const rows = students.map(s => [s.rollNo, `"${s.name}"`, s.campus || 'KIET', s.branch, s.year, s.semester, s.studentType || 'Day Scholar', s.mobile, s.cgpa]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `student_records_report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    /**
     * Download JSON File
     */
    exportJSON(students = db.getAllStudents()) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", `student_records_file_db_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
