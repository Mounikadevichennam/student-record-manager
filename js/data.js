/**
 * Smart Student Record Manager - Data Layer
 * Models C-Style `struct Student` records and file persistence simulation using LocalStorage.
 */

// Configuration objects for easy future expansion
const SYSTEM_CONFIG = {
    campuses: [
        { code: "B2", name: "KIET" },
        { code: "6Q", name: "KIET+" }
    ],
    branches: [
        { code: "45", name: "Artificial Intelligence and Data Science", shortName: "AID" },
        { code: "42", name: "Artificial Intelligence and Machine Learning", shortName: "AIML" },
        { code: "43", name: "Artificial Intelligence", shortName: "AI" },
        { code: "44", name: "Data Science", shortName: "DS" },
        { code: "46", name: "Cyber Security", shortName: "Cyber Security" }
    ],
    studentTypes: ["Day Scholar", "Hosteller"],
    years: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    semesters: ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"]
};

class StudentDatabase {
    constructor() {
        this.storageKey = 'smart_student_records_db_v2';
        this.activityKey = 'smart_student_activity_log_v2';
        this.sessionKey = 'smart_student_auth_session';
        this.students = [];
        this.activityLog = [];
        this.init();
    }

    /**
     * Initialize DB - Starts completely empty as a fresh installation
     */
    init() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.students = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse stored records", e);
                this.students = [];
            }
        } else {
            // Requirement 1: Completely empty initial state
            this.students = [];
            this.saveToFile();
        }

        const storedLog = localStorage.getItem(this.activityKey);
        if (storedLog) {
            try {
                this.activityLog = JSON.parse(storedLog);
            } catch (e) {
                this.activityLog = [];
            }
        } else {
            this.activityLog = [];
        }
    }

    /**
     * Simulate `fwrite()` / file sync to LocalStorage
     */
    saveToFile() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.students));
    }

    /**
     * Get all student records
     */
    getAllStudents() {
        return [...this.students];
    }

    /**
     * Get Student by Roll Number (Primary Key check)
     */
    getByRollNo(rollNo) {
        const targetRoll = String(rollNo).toUpperCase().trim();
        return this.students.find(s => String(s.rollNo).toUpperCase() === targetRoll) || null;
    }

    /**
     * Check if Roll Number already exists (Validation)
     */
    isRollNoDuplicate(rollNo, excludeRollNo = null) {
        const targetRoll = String(rollNo).toUpperCase().trim();
        const exclude = excludeRollNo ? String(excludeRollNo).toUpperCase().trim() : null;
        return this.students.some(s => String(s.rollNo).toUpperCase() === targetRoll && String(s.rollNo).toUpperCase() !== exclude);
    }

    /**
     * Validate Roll Number Structure & Code Alignment
     * Expected format: 25B21A4501
     * 25 = Admission Year, B2/6Q = Campus Code, 1A = Common Identifier, 45/42/43/44/46 = Branch Code, Serial = 01...
     */
    validateRollNumberFormat(rollNo, selectedBranch, selectedCampus) {
        const roll = String(rollNo).toUpperCase().trim();
        
        // General pattern check: 2 digits year + 2 chars campus + 1A + 2 digits branch + serial number
        // e.g. 25B21A4501 (Length 10)
        const rollRegex = /^(\d{2})([A-Z0-9]{2})(1A)(\d{2})([A-Z0-9]+)$/;
        const match = roll.match(rollRegex);

        if (!match) {
            return {
                valid: false,
                message: "Invalid Roll Number format. Example of valid format: 25B21A4501 (Year + Campus + 1A + BranchCode + Serial)"
            };
        }

        const [_, yearPart, campusPart, commonPart, branchCodePart, serialPart] = match;

        // Find expected campus code
        const campusObj = SYSTEM_CONFIG.campuses.find(c => c.name === selectedCampus || c.code === selectedCampus);
        const expectedCampusCode = campusObj ? campusObj.code : "";

        if (campusPart !== expectedCampusCode) {
            return {
                valid: false,
                message: `Invalid Campus Code in Roll Number. Selected Campus '${selectedCampus}' expects code '${expectedCampusCode}', but Roll Number has '${campusPart}'.`
            };
        }

        // Find expected branch code
        const branchObj = SYSTEM_CONFIG.branches.find(b => b.shortName === selectedBranch || b.name === selectedBranch);
        const expectedBranchCode = branchObj ? branchObj.code : "";

        if (branchCodePart !== expectedBranchCode) {
            return {
                valid: false,
                message: `Invalid Branch Code in Roll Number. Selected Branch '${selectedBranch}' expects code '${expectedBranchCode}', but Roll Number has '${branchCodePart}'.`
            };
        }

        return { valid: true };
    }

    /**
     * Add Student (C Struct Insertion)
     */
    addStudent(student) {
        student.rollNo = String(student.rollNo).toUpperCase().trim();
        student.cgpa = parseFloat(parseFloat(student.cgpa).toFixed(2));
        student.createdAt = new Date().toISOString();

        this.students.push(student);
        this.saveToFile();
        this.logActivity(`Added student: ${student.name} (${student.rollNo})`, 'add');
        return true;
    }

    /**
     * Update Student Profile
     */
    updateStudent(originalRollNo, updatedData) {
        const origRoll = String(originalRollNo).toUpperCase().trim();
        const index = this.students.findIndex(s => String(s.rollNo).toUpperCase() === origRoll);
        if (index === -1) return false;

        this.students[index] = {
            ...this.students[index],
            ...updatedData,
            rollNo: String(updatedData.rollNo).toUpperCase().trim(),
            cgpa: parseFloat(parseFloat(updatedData.cgpa).toFixed(2)),
            updatedAt: new Date().toISOString()
        };

        this.saveToFile();
        this.logActivity(`Updated student: ${updatedData.name} (${updatedData.rollNo})`, 'update');
        return true;
    }

    /**
     * Delete Student
     */
    deleteStudent(rollNo) {
        const targetRoll = String(rollNo).toUpperCase().trim();
        const index = this.students.findIndex(s => String(s.rollNo).toUpperCase() === targetRoll);
        if (index === -1) return false;

        const deletedName = this.students[index].name;
        this.students.splice(index, 1);
        this.saveToFile();
        this.logActivity(`Deleted student: ${deletedName} (${targetRoll})`, 'delete');
        return true;
    }

    /**
     * Calculate Summary Statistics (Handles 0 records gracefully)
     */
    getStatistics() {
        const total = this.students.length;
        if (total === 0) {
            return {
                total: 0,
                highestCGPA: "0.00",
                lowestCGPA: "0.00",
                avgCGPA: "0.00",
                topStudent: null,
                lowStudent: null,
                totalBranches: 0,
                branchCounts: { "AID": 0, "AIML": 0, "AI": 0, "DS": 0, "Cyber Security": 0 },
                campusCounts: { "KIET": 0, "KIET+": 0 },
                typeCounts: { "Day Scholar": 0, "Hosteller": 0 },
                semesterCounts: {},
                cgpaTiers: { distinction: 0, firstClass: 0, secondClass: 0, pass: 0 }
            };
        }

        let highest = -1;
        let lowest = 11;
        let sumCGPA = 0;
        let topStudent = null;
        let lowStudent = null;
        
        const branchCounts = { "AID": 0, "AIML": 0, "AI": 0, "DS": 0, "Cyber Security": 0 };
        const campusCounts = { "KIET": 0, "KIET+": 0 };
        const typeCounts = { "Day Scholar": 0, "Hosteller": 0 };
        const semesterCounts = {};
        const cgpaTiers = { distinction: 0, firstClass: 0, secondClass: 0, pass: 0 };

        this.students.forEach(s => {
            sumCGPA += s.cgpa;

            if (s.cgpa > highest) {
                highest = s.cgpa;
                topStudent = s;
            }

            if (s.cgpa < lowest) {
                lowest = s.cgpa;
                lowStudent = s;
            }

            // Branch counts
            branchCounts[s.branch] = (branchCounts[s.branch] || 0) + 1;

            // Campus counts
            campusCounts[s.campus] = (campusCounts[s.campus] || 0) + 1;

            // Student Type counts
            typeCounts[s.studentType] = (typeCounts[s.studentType] || 0) + 1;

            // Semester counts
            semesterCounts[s.semester] = (semesterCounts[s.semester] || 0) + 1;

            // CGPA Tiers
            if (s.cgpa >= 8.5) cgpaTiers.distinction++;
            else if (s.cgpa >= 7.5) cgpaTiers.firstClass++;
            else if (s.cgpa >= 6.0) cgpaTiers.secondClass++;
            else cgpaTiers.pass++;
        });

        const avgCGPA = (sumCGPA / total).toFixed(2);

        return {
            total,
            highestCGPA: highest.toFixed(2),
            lowestCGPA: lowest.toFixed(2),
            avgCGPA,
            topStudent,
            lowStudent,
            totalBranches: Object.keys(branchCounts).filter(k => branchCounts[k] > 0).length,
            branchCounts,
            campusCounts,
            typeCounts,
            semesterCounts,
            cgpaTiers
        };
    }

    /**
     * Activity Log
     */
    logActivity(actionText, type = 'info') {
        const entry = {
            id: Date.now(),
            text: actionText,
            type,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.activityLog.unshift(entry);
        if (this.activityLog.length > 20) this.activityLog.pop();
        localStorage.setItem(this.activityKey, JSON.stringify(this.activityLog));
    }

    getActivityLog() {
        return [...this.activityLog];
    }

    clearActivityLog() {
        this.activityLog = [];
        localStorage.removeItem(this.activityKey);
    }

    /**
     * Auth Session Management
     */
    isLoggedIn() {
        return localStorage.getItem(this.sessionKey) === 'true';
    }

    login(email, password) {

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
        u =>
        u.email.toLowerCase() === email.toLowerCase().trim() &&
        u.password === password
    );

    if (user) {

        localStorage.setItem(this.sessionKey, "true");

        localStorage.setItem(
            "smart_student_user_name",
            user.fullName
        );

        this.logActivity(
            user.fullName + " logged in successfully",
            "info"
        );

        return true;
    }

    return false;
}

    logout() {
        localStorage.removeItem(this.sessionKey);
        localStorage.removeItem('smart_student_user_name');
        this.logActivity('User logged out', 'info');
    }

    getLoggedUser() {
        return localStorage.getItem('smart_student_user_name') || 'Admin';
    }
}

// Global DB instance
window.db = new StudentDatabase();
