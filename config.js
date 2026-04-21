// Configuration and Data Management
const SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';

// DataStore handles local persistence and remote synchronization
const DataStore = {
    _cache: null,
    // Default initial data
    defaults: {
        students: [
            { id: '1001', name: 'James Wilson', status: 'Active' },
            { id: '1002', name: 'Sarah Chen', status: 'Active' },
            { id: '1003', name: 'Michael Ross', status: 'Active' },
            { id: '1004', name: 'Elena Rodriguez', status: 'Active' }
        ],
        attendance: [],
        stats: { total: 4, present: 0 }
    },

    // Initialize data from LocalStorage or Defaults
    async init() {
        if (!localStorage.getItem('chronograph_data')) {
            localStorage.setItem('chronograph_data', JSON.stringify(this.defaults));
        }
        
        // Try to sync with remote if URL is provided
        if (SCRIPT_URL && SCRIPT_URL !== 'YOUR_APPS_SCRIPT_URL_HERE') {
            try {
                const response = await fetch(SCRIPT_URL);
                const remoteData = await response.json();
                if (remoteData) {
                    localStorage.setItem('chronograph_data', JSON.stringify(remoteData));
                }
            } catch (err) {
                console.warn("Using local cache: Sync failed", err);
            }
        }
    },

    getData() {
        if (!this._cache) {
            this._cache = JSON.parse(localStorage.getItem('chronograph_data')) || this.defaults;
        }
        return this._cache;
    },

    saveData(data) {
        this._cache = data;
        localStorage.setItem('chronograph_data', JSON.stringify(data));
        this.syncRemote(data);
    },

    async syncRemote(data) {
        if (!SCRIPT_URL || SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') return;
        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ action: 'sync', data: data })
            });
        } catch (err) {
            console.error("Remote sync failed", err);
        }
    },

    // Business Logic Methods
    getStudents() {
        return this.getData().students;
    },

    getAttendance() {
        return this.getData().attendance;
    },

    markAttendance(studentId) {
        const data = this.getData();
        const student = data.students.find(s => s.id === studentId);
        if (!student) return { success: false, message: 'Student not found' };

        // Prevent double scans in same hour (optional logic)
        const now = new Date();
        const alreadyPresent = data.attendance.some(a => 
            a.studentid === studentId && 
            new Date(a.timestamp).toDateString() === now.toDateString()
        );

        if (!alreadyPresent) {
            data.attendance.push({
                studentid: studentId,
                timestamp: now.toISOString()
            });
            this.saveData(data);
            return { success: true, message: `Welcome, ${student.name}` };
        }
        return { success: true, message: 'Already recorded' };
    },

    addStudent(name, id) {
        const data = this.getData();
        if (data.students.some(s => s.id === id)) return { success: false, message: 'ID already exists' };
        
        data.students.push({ id, name, status: 'Active' });
        this.saveData(data);
        return { success: true };
    },

    deleteStudent(id) {
        const data = this.getData();
        data.students = data.students.filter(s => s.id !== id);
        data.attendance = data.attendance.filter(a => a.studentid !== id);
        this.saveData(data);
        return { success: true };
    },

    getStats() {
        const data = this.getData();
        const total = data.students.length;
        const today = new Date().toDateString();
        const todayAttendance = data.attendance.filter(a => 
            new Date(a.timestamp).toDateString() === today
        );
        const presentIds = new Set(todayAttendance.map(a => a.studentid));
        return {
            total: total,
            present: presentIds.size,
            percent: total > 0 ? Math.round((presentIds.size / total) * 100) : 0
        };
    }
};

// Initialize on script load
DataStore.init();
