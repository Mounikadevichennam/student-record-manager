/**
 * Smart Student Record Manager - Searching & Sorting Algorithms Layer
 * Implements C-style Linear Search, Binary Search, and Sorting algorithms with step tracing.
 */

const Algorithms = {
    /**
     * C-Style Linear Search O(N)
     * Scans record by record from index 0 to N-1
     */
    linearSearch(records, key, field = 'rollNo') {
        const logs = [];
        let comparisons = 0;
        let foundRecords = [];
        const startTime = performance.now();

        logs.push(`[Linear Search] Starting sequential scan across ${records.length} array records...`);

        const isNumeric = field === 'cgpa';
        const searchVal = isNumeric ? parseFloat(key) : String(key).toLowerCase().trim();

        for (let i = 0; i < records.length; i++) {
            comparisons++;
            const currentVal = isNumeric ? records[i][field] : String(records[i][field] || '').toLowerCase();

            let matches = false;
            if (isNumeric) {
                matches = (currentVal === searchVal);
            } else {
                matches = currentVal.includes(searchVal);
            }

            if (matches) {
                logs.push(`<span class="log-step found">Step ${comparisons}: MATCH FOUND at Index [${i}] -> ${records[i].name} (Roll #${records[i].rollNo})</span>`);
                foundRecords.push(records[i]);
            } else {
                if (comparisons <= 5 || comparisons === records.length) {
                    logs.push(`Step ${comparisons}: Checked Index [${i}] (Value: '${records[i][field]}') -> No Match`);
                } else if (comparisons === 6) {
                    logs.push(`... Skipping sequential log entries for intermediate elements ...`);
                }
            }
        }

        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(3);

        if (foundRecords.length === 0) {
            logs.push(`[Linear Search] Completed ${comparisons} comparisons. Target '${key}' NOT found.`);
        } else {
            logs.push(`[Linear Search] Completed in ${duration} ms with ${comparisons} key comparisons.`);
        }

        return {
            results: foundRecords,
            comparisons,
            duration,
            logs,
            complexity: 'O(N)'
        };
    },

    /**
     * C-Style Binary Search O(log N)
     * Requires array sorted by search key. Divide and conquer.
     */
    binarySearch(records, key, field = 'rollNo') {
        const logs = [];
        let comparisons = 0;
        const startTime = performance.now();

        logs.push(`[Binary Search] Sorting array buffer in memory by '${field}' ascending...`);
        const sortedRecords = [...records].sort((a, b) => {
            if (field === 'cgpa') return a.cgpa - b.cgpa;
            return String(a[field] || '').localeCompare(String(b[field] || ''));
        });

        let low = 0;
        let high = sortedRecords.length - 1;
        let foundRecord = null;

        const isNumeric = field === 'cgpa';
        const targetVal = isNumeric ? parseFloat(key) : String(key).toLowerCase().trim();

        logs.push(`[Binary Search] Executing divide-and-conquer on sorted bounds [Low: ${low}, High: ${high}]`);

        while (low <= high) {
            comparisons++;
            const mid = Math.floor((low + high) / 2);
            const midVal = isNumeric ? sortedRecords[mid][field] : String(sortedRecords[mid][field] || '').toLowerCase();

            logs.push(`Step ${comparisons}: Low=${low}, High=${high}, Mid=[${mid}] -> Value: '${sortedRecords[mid][field]}' (${sortedRecords[mid].name})`);

            let cmp = 0;
            if (isNumeric) {
                cmp = targetVal === midVal ? 0 : (targetVal < midVal ? -1 : 1);
            } else {
                cmp = targetVal.localeCompare(midVal);
            }

            if (cmp === 0) {
                foundRecord = sortedRecords[mid];
                logs.push(`<span class="log-step found">Step ${comparisons}: BINARY MATCH FOUND at Mid Index [${mid}] -> ${foundRecord.name} (Roll #${foundRecord.rollNo})</span>`);
                break;
            } else if (cmp < 0) {
                logs.push(`Step ${comparisons}: Target < Mid Value. Shifting High boundary to ${mid - 1}`);
                high = mid - 1;
            } else {
                logs.push(`Step ${comparisons}: Target > Mid Value. Shifting Low boundary to ${mid + 1}`);
                low = mid + 1;
            }
        }

        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(3);

        if (!foundRecord) {
            logs.push(`[Binary Search] Range exhausted after ${comparisons} iterations. Key '${key}' not found.`);
        } else {
            logs.push(`[Binary Search] Target located in ${comparisons} binary steps! (${duration} ms)`);
        }

        return {
            results: foundRecord ? [foundRecord] : [],
            comparisons,
            duration,
            logs,
            complexity: 'O(log N)'
        };
    },

    /**
     * Sorting Algorithms
     */
    sortRecords(records, sortBy = 'rollNo', direction = 'asc') {
        const sorted = [...records];
        sorted.sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];

            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }
};
