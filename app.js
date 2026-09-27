/**
 * AquaTrack Pro - Dealership & Water Business ERP Logic
 */

// ==========================================
// 1. DATA STORE (Persistent LocalStorage)
// ==========================================
class DataStore {
    constructor() {
        this.STORAGE_KEY = 'aquatrack_pro_fresh_v2';
        this.data = {
            products: [],
            stores: [],
            purchases: [],
            sales: [],
            drumOrders: [],
            payments: [],
            staff: [],
            staffDeliveries: [],
            staffMonthlySalaries: [],
            trucks: [],
            truckLogs: [],
            users: [],
            accessRequests: []
        };
        this.load();
    }

    load() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                this.data = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse storage, loading clean start', e);
                this.loadSeedData();
            }
        } else {
            this.loadSeedData();
        }

        // Ensure collections exist
        if (!this.data.products) this.data.products = [];
        if (!this.data.stores) this.data.stores = [];
        if (!this.data.purchases) this.data.purchases = [];
        if (!this.data.sales) this.data.sales = [];
        if (!this.data.drumOrders) this.data.drumOrders = [];
        if (!this.data.payments) this.data.payments = [];
        if (!this.data.staffDeliveries) this.data.staffDeliveries = [];
        if (!this.data.staffMonthlySalaries) this.data.staffMonthlySalaries = [];
        if (!this.data.trucks || this.data.trucks.length === 0) {
            this.data.trucks = [
                { id: 'truck_supro', name: 'SUPRO', number: 'OD-02-AB-1234', defaultDriver: 'MANTU' },
                { id: 'truck_bolero', name: 'BOLERO', number: 'OD-02-XY-5678', defaultDriver: 'CHANDAN' }
            ];
        }
        if (!this.data.truckLogs) this.data.truckLogs = [];
        if (!this.data.users) this.data.users = [];
        if (!this.data.accessRequests) this.data.accessRequests = [];

        // Security & Independent Passwords Configuration
        if (!this.data.securitySettings) {
            this.data.securitySettings = {
                resetToZeroPassword: 'admin123',
                adminSectionPassword: 'admin123',
                superAdminEmailPassword: 'admin123'
            };
        } else {
            if (!this.data.securitySettings.resetToZeroPassword) this.data.securitySettings.resetToZeroPassword = 'admin123';
            if (!this.data.securitySettings.adminSectionPassword) this.data.securitySettings.adminSectionPassword = 'admin123';
            if (!this.data.securitySettings.superAdminEmailPassword) this.data.securitySettings.superAdminEmailPassword = 'admin123';
        }

        // Ensure Super Admin (Permanent Owner) always exists and cannot be deleted
        const ownerExists = this.data.users.some(u => u.isPermanentOwner || u.email === 'admin@aquatrack.com');
        if (!ownerExists) {
            this.data.users.unshift({
                id: 'usr_superadmin',
                email: 'admin@aquatrack.com',
                name: 'Super Admin (Owner)',
                password: this.data.securitySettings.superAdminEmailPassword || 'admin123',
                role: 'Super Admin',
                status: 'approved',
                isPermanentOwner: true,
                permissions: this.getDefaultPermissions('Super Admin'),
                createdAt: new Date().toISOString().split('T')[0]
            });
        } else {
            const owner = this.data.users.find(u => u.isPermanentOwner || u.email === 'admin@aquatrack.com');
            if (owner && !owner.password) {
                owner.password = this.data.securitySettings.superAdminEmailPassword || 'admin123';
            }
            if (owner && !owner.permissions) {
                owner.permissions = this.getDefaultPermissions('Super Admin');
            }
        }

        // Normalize all users' permissions
        this.data.users = this.data.users.map(u => {
            if (!u.permissions) {
                u.permissions = this.getDefaultPermissions(u.role);
            }
            return u;
        });

        if (!Array.isArray(this.data.staff) || this.data.staff.length === 0) {
            this.data.staff = [
                { id: 'st_mantu', name: 'MANTU', role: 'Driver', baseFixedSalary: 12000, phone: '9876543210' },
                { id: 'st_chandan', name: 'CHANDAN', role: 'Helper', baseFixedSalary: 9000, phone: '9876543211' }
            ];
        } else {
            this.data.staff = this.data.staff.map((s, idx) => ({
                id: s.id || ('st_' + (idx + 1) + '_' + (s.name ? s.name.toLowerCase().replace(/\s+/g, '_') : 'staff')),
                name: s.name || ('Staff ' + (idx + 1)),
                role: s.role === 'Helper' ? 'Helper' : 'Driver',
                baseFixedSalary: parseFloat(s.baseFixedSalary !== undefined ? s.baseFixedSalary : (s.fixedSalary || 0)) || 10000,
                phone: s.phone || ''
            }));
        }
    }

    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error('Failed to save to localStorage', e);
        }
    }

    loadSeedData() {
        this.data.products = [
            { id: 'p1', category: 'water', name: 'Packaged Drinking Water', size: '500ml', unitsPerBox: 24, buyPrice: 5.00, sellPrice: 10.00, stock: 0 },
            { id: 'p2', category: 'water', name: 'Packaged Drinking Water', size: '750ml', unitsPerBox: 20, buyPrice: 7.50, sellPrice: 15.00, stock: 0 },
            { id: 'p3', category: 'water', name: 'Packaged Drinking Water', size: '1L', unitsPerBox: 12, buyPrice: 10.00, sellPrice: 20.00, stock: 0 },
            { id: 'p4', category: 'water', name: 'Packaged Drinking Water', size: '2L', unitsPerBox: 9, buyPrice: 16.00, sellPrice: 30.00, stock: 0 },
            { id: 'p5', category: 'drinks', name: 'Cold Drink / Cola', size: '250ml', unitsPerBox: 30, buyPrice: 12.00, sellPrice: 20.00, stock: 0 },
            { id: 'p6', category: 'drinks', name: 'Cold Drink / Lemon-Lime', size: '500ml', unitsPerBox: 24, buyPrice: 20.00, sellPrice: 35.00, stock: 0 },
            { id: 'p7', category: 'drinks', name: 'Cold Drink / Mango', size: '600ml', unitsPerBox: 24, buyPrice: 22.00, sellPrice: 40.00, stock: 0 },
            { id: 'p8', category: 'drums', name: '20L Water Drum', size: '20L Drum', unitsPerBox: 1, buyPrice: 12.00, sellPrice: 35.00, stock: 0 }
        ];

        this.data.stores = [
            { id: 's1', name: 'Store #1', owner: 'Owner Name', phone: '', address: '', balanceDue: 0, totalBought: 0, totalPaid: 0 },
            { id: 's2', name: 'Store #2', owner: 'Owner Name', phone: '', address: '', balanceDue: 0, totalBought: 0, totalPaid: 0 }
        ];

        this.data.staff = [
            { id: 'st_mantu', name: 'MANTU', role: 'Driver', baseFixedSalary: 12000, phone: '9876543210' },
            { id: 'st_chandan', name: 'CHANDAN', role: 'Helper', baseFixedSalary: 9000, phone: '9876543211' }
        ];

        this.data.purchases = [];
        this.data.sales = [];
        this.data.drumOrders = [];
        this.data.payments = [];
        this.data.staffDeliveries = [];
        this.data.staffMonthlySalaries = [];

        this.save();
    }

    loadDemoSeedData() {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = today.substring(0, 7);

        this.data.products = [
            { id: 'p1', category: 'water', name: 'AquaPure Mineral Water', size: '500ml', unitsPerBox: 24, buyPrice: 5.50, sellPrice: 10.00, stock: 450 },
            { id: 'p2', category: 'water', name: 'AquaPure Mineral Water', size: '750ml', unitsPerBox: 20, buyPrice: 8.00, sellPrice: 15.00, stock: 320 },
            { id: 'p3', category: 'water', name: 'AquaPure Mineral Water', size: '1L', unitsPerBox: 12, buyPrice: 10.50, sellPrice: 20.00, stock: 600 },
            { id: 'p4', category: 'water', name: 'AquaPure Mineral Water', size: '2L', unitsPerBox: 9, buyPrice: 18.00, sellPrice: 30.00, stock: 180 },
            { id: 'p5', category: 'drinks', name: 'Thunder Cola', size: '250ml Can', unitsPerBox: 30, buyPrice: 14.00, sellPrice: 22.00, stock: 240 },
            { id: 'p6', category: 'drinks', name: 'Thunder Cola', size: '500ml Bottle', unitsPerBox: 24, buyPrice: 22.00, sellPrice: 35.00, stock: 150 },
            { id: 'p7', category: 'drinks', name: 'Lemon Zing Soda', size: '600ml', unitsPerBox: 24, buyPrice: 16.00, sellPrice: 25.00, stock: 200 },
            { id: 'p8', category: 'drinks', name: 'Mango Blast Juice', size: '600ml', unitsPerBox: 24, buyPrice: 24.00, sellPrice: 40.00, stock: 175 },
            { id: 'p9', category: 'drums', name: 'AquaPure 20L Water Drum', size: '20L Drum', unitsPerBox: 1, buyPrice: 12.00, sellPrice: 35.00, stock: 85 }
        ];

        this.data.stores = [
            { id: 's1', name: 'Krishna Supermarket', owner: 'Rajesh Sharma', phone: '9876543210', address: 'Shop 14, Main Market Road', balanceDue: 1450, totalBought: 7450, totalPaid: 6000 },
            { id: 's2', name: 'City Express Mart', owner: 'Anil Verma', phone: '9811223344', address: 'Plot 4B, Sector 12 Market', balanceDue: 2800, totalBought: 9800, totalPaid: 7000 },
            { id: 's3', name: 'Highway Dhaba & Refreshments', owner: 'Sunil Kumar', phone: '9845098450', address: 'National Highway 48 Bypass', balanceDue: 600, totalBought: 3600, totalPaid: 3000 },
            { id: 's4', name: 'Golden Oasis Corner Store', owner: 'Pooja Gupta', phone: '9765432109', address: 'Block C Commercial Complex', balanceDue: 0, totalBought: 4200, totalPaid: 4200 }
        ];

        this.data.staff = [
            { id: 'st_mantu', name: 'MANTU', role: 'Driver', baseFixedSalary: 12000, phone: '9876543210' },
            { id: 'st_chandan', name: 'CHANDAN', role: 'Helper', baseFixedSalary: 9000, phone: '9876543211' }
        ];

        this.data.purchases = [
            { id: 'pur1', date: today, factory: 'National Bottling Plant #2', productId: 'p3', productName: 'AquaPure Mineral Water (1L)', qty: 300, rate: 10.50, total: 3150, notes: 'Morning batch arrival' }
        ];

        this.data.sales = [
            { id: 'sal1', date: today, storeId: 's1', storeName: 'Krishna Supermarket', productId: 'p3', productName: 'AquaPure Mineral Water 1L', qty: 60, rate: 20.00, total: 1200, buyPrice: 10.50, profit: 570, status: 'Paid', driverName: 'MANTU', helperNames: ['CHANDAN'] }
        ];

        this.data.drumOrders = [
            { id: 'dr1', date: today, storeId: 's1', customer: 'Krishna Supermarket', qty: 10, rate: 35.00, total: 350.00, emptiesReturned: 8, status: 'Delivered', driver1: 'MANTU', driver2: 'CHANDAN' }
        ];

        this.data.payments = [
            { id: 'pay1', storeId: 's1', storeName: 'Krishna Supermarket', date: today, amount: 1200, note: 'GPay UPI Settlement' }
        ];

        this.data.staffDeliveries = [
            { id: 'std1', staffId: 'st_mantu', staffName: 'MANTU', role: 'Driver', date: today, month: currentMonth, storeName: 'Krishna Supermarket', boxCount: 5, ratePerBox: 2, totalCommission: 10, source: 'Store Sale' },
            { id: 'std2', staffId: 'st_chandan', staffName: 'CHANDAN', role: 'Helper', date: today, month: currentMonth, storeName: 'Krishna Supermarket', boxCount: 5, ratePerBox: 1, totalCommission: 5, source: 'Store Sale' }
        ];

        this.data.staffMonthlySalaries = [
            { id: 'sms_mantu_' + currentMonth, staffId: 'st_mantu', month: currentMonth, fixedSalary: 12000, extraIncome: 500, advanceSalary: 1000, paidAmount: 0, paidDate: '', paymentMode: 'Cash', notes: 'Advance for festivals', status: 'Pending' },
            { id: 'sms_chandan_' + currentMonth, staffId: 'st_chandan', month: currentMonth, fixedSalary: 9000, extraIncome: 200, advanceSalary: 500, paidAmount: 0, paidDate: '', paymentMode: 'Cash', notes: '', status: 'Pending' }
        ];

        this.data.trucks = [
            { id: 'truck_supro', name: 'SUPRO', number: 'OD-02-AB-1234', defaultDriver: 'MANTU' },
            { id: 'truck_bolero', name: 'BOLERO', number: 'OD-02-XY-5678', defaultDriver: 'CHANDAN' }
        ];

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

        this.data.truckLogs = [
            {
                id: 'tl_1',
                date: twoDaysAgo,
                month: twoDaysAgo.substring(0, 7),
                truckName: 'SUPRO',
                driverName: 'MANTU',
                product: 'AquaPure Mineral Water (120 Boxes)',
                fromLocation: 'Factory Plant #2',
                toLocation: 'Krishna Supermarket',
                kmRun: 45,
                tripAmount: 1800,
                paymentStatus: 'Paid',
                fuelCost: 2000,
                fuelLitres: 22,
                maintenanceCost: 0,
                maintenanceNotes: '',
                tripType: 'Own Business Delivery'
            },
            {
                id: 'tl_2',
                date: yesterday,
                month: yesterday.substring(0, 7),
                truckName: 'SUPRO',
                driverName: 'MANTU',
                product: 'Hardware & Construction Goods (3rd Party)',
                fromLocation: 'Industrial Estate',
                toLocation: 'Sector 14 Market',
                kmRun: 60,
                tripAmount: 2400,
                paymentStatus: 'Paid',
                fuelCost: 0,
                fuelLitres: 0,
                maintenanceCost: 350,
                maintenanceNotes: 'Tyre puncture & air pressure',
                tripType: 'Third-Party Delivery'
            },
            {
                id: 'tl_3',
                date: today,
                month: today.substring(0, 7),
                truckName: 'SUPRO',
                driverName: 'MANTU',
                product: '20L Water Drums (60 Units)',
                fromLocation: 'Main Depot',
                toLocation: 'City Express Mart & Stores',
                kmRun: 35,
                tripAmount: 1400,
                paymentStatus: 'Due',
                fuelCost: 1500,
                fuelLitres: 16.5,
                maintenanceCost: 0,
                maintenanceNotes: '',
                tripType: 'Own Business Delivery'
            },
            {
                id: 'tl_4',
                date: twoDaysAgo,
                month: twoDaysAgo.substring(0, 7),
                truckName: 'BOLERO',
                driverName: 'CHANDAN',
                product: 'Cold Drink Crates (80 Crates)',
                fromLocation: 'Bottling Plant #1',
                toLocation: 'Highway Dhaba & Rest Stops',
                kmRun: 80,
                tripAmount: 3000,
                paymentStatus: 'Paid',
                fuelCost: 2500,
                fuelLitres: 27,
                maintenanceCost: 0,
                maintenanceNotes: '',
                tripType: 'Own Business Delivery'
            },
            {
                id: 'tl_5',
                date: today,
                month: today.substring(0, 7),
                truckName: 'BOLERO',
                driverName: 'CHANDAN',
                product: 'Catering & Event Packages (3rd Party)',
                fromLocation: 'Grand Palace Banquet',
                toLocation: 'Bypass Resort Hub',
                kmRun: 55,
                tripAmount: 2200,
                paymentStatus: 'Paid',
                fuelCost: 0,
                fuelLitres: 0,
                maintenanceCost: 800,
                maintenanceNotes: 'Engine oil top-up & wiper service',
                tripType: 'Third-Party Delivery'
            }
        ];

        this.save();
    }

    // Products
    getProducts() { return this.data.products || []; }
    getProduct(id) { return (this.data.products || []).find(p => p.id === id); }
    addProduct(p) {
        p.id = 'p_' + Date.now();
        if (!this.data.products) this.data.products = [];
        this.data.products.push(p);
        this.save();
        return p;
    }
    updateProduct(id, updated) {
        const idx = (this.data.products || []).findIndex(p => p.id === id);
        if (idx !== -1) {
            this.data.products[idx] = { ...this.data.products[idx], ...updated };
            this.save();
        }
    }
    deleteProduct(id) {
        this.data.products = (this.data.products || []).filter(p => p.id !== id);
        this.save();
    }
    adjustStock(id, qtyDelta) {
        const p = this.getProduct(id);
        if (p) {
            p.stock = (p.stock || 0) + qtyDelta;
            this.save();
        }
    }

    // Purchases (Factory Inflow)
    getPurchases() { return this.data.purchases || []; }
    addPurchase(item) {
        item.id = 'pur_' + Date.now();
        if (!this.data.purchases) this.data.purchases = [];
        this.data.purchases.unshift(item);
        this.adjustStock(item.productId, item.qty);
        this.save();
        return item;
    }
    deletePurchase(id) {
        const pur = (this.data.purchases || []).find(x => x.id === id);
        if (pur) {
            this.adjustStock(pur.productId, -pur.qty);
            this.data.purchases = this.data.purchases.filter(x => x.id !== id);
            this.save();
        }
    }

    // Sales (Store Outflow & Profit)
    getSales() { return this.data.sales || []; }
    addSale(item) {
        item.id = 'sal_' + Date.now();
        if (!this.data.sales) this.data.sales = [];
        this.data.sales.unshift(item);
        this.adjustStock(item.productId, -item.qty);

        const store = this.getStore(item.storeId);
        if (store) {
            store.totalBought = (store.totalBought || 0) + item.total;
            if (item.status === 'Paid') {
                store.totalPaid = (store.totalPaid || 0) + item.total;
                this.addPayment({
                    storeId: store.id,
                    storeName: store.name,
                    date: item.date,
                    amount: item.total,
                    note: 'Auto-recorded full payment for Sale #' + item.id.substring(4)
                }, false);
            } else if (item.status === 'Partial' && item.paidAmount > 0) {
                store.totalPaid = (store.totalPaid || 0) + item.paidAmount;
                this.addPayment({
                    storeId: store.id,
                    storeName: store.name,
                    date: item.date,
                    amount: item.paidAmount,
                    note: 'Partial payment on delivery for Sale #' + item.id.substring(4)
                }, false);
            }
            store.balanceDue = store.totalBought - (store.totalPaid || 0);
        }
        this.save();
        return item;
    }
    deleteSale(id) {
        const s = (this.data.sales || []).find(x => x.id === id);
        if (s) {
            this.adjustStock(s.productId, s.qty);
            const store = this.getStore(s.storeId);
            if (store) {
                store.totalBought = Math.max(0, (store.totalBought || 0) - s.total);
                store.balanceDue = Math.max(0, store.totalBought - (store.totalPaid || 0));
            }
            this.data.sales = this.data.sales.filter(x => x.id !== id);
            this.data.staffDeliveries = (this.data.staffDeliveries || []).filter(d => d.saleId !== id);
            this.save();
        }
    }

    // 20L Drum Orders
    getDrumOrders() { return this.data.drumOrders || []; }
    addDrumOrder(item) {
        item.id = 'dr_' + Date.now();
        if (!this.data.drumOrders) this.data.drumOrders = [];
        this.data.drumOrders.unshift(item);
        if (item.status === 'Delivered') {
            const drumProd = (this.data.products || []).find(p => p.category === 'drums' || p.size === '20L');
            if (drumProd) this.adjustStock(drumProd.id, -item.qty);
        }
        this.save();
        return item;
    }
    updateDrumStatus(id, newStatus, emptiesReturned = null) {
        const order = (this.data.drumOrders || []).find(d => d.id === id);
        if (order) {
            const oldStatus = order.status;
            order.status = newStatus;
            if (emptiesReturned !== null) order.emptiesReturned = emptiesReturned;
            
            if (oldStatus !== 'Delivered' && newStatus === 'Delivered') {
                const drumProd = (this.data.products || []).find(p => p.category === 'drums' || p.size === '20L');
                if (drumProd) this.adjustStock(drumProd.id, -order.qty);
            }
            this.save();
        }
    }
    deleteDrumOrder(id) {
        this.data.drumOrders = (this.data.drumOrders || []).filter(d => d.id !== id);
        this.save();
    }

    // Stores & Khata Ledger
    getStores() { return this.data.stores || []; }
    getStore(id) { return (this.data.stores || []).find(s => s.id === id); }
    addStore(store) {
        store.id = 's_' + Date.now();
        const opening = parseFloat(store.openingBalance) || 0;
        store.totalBought = opening;
        store.totalPaid = 0;
        store.balanceDue = opening;
        if (!this.data.stores) this.data.stores = [];
        this.data.stores.push(store);
        this.save();
        return store;
    }
    updateStore(id, updated) {
        const idx = (this.data.stores || []).findIndex(s => s.id === id);
        if (idx !== -1) {
            this.data.stores[idx] = { ...this.data.stores[idx], ...updated };
            this.save();
        }
    }
    deleteStore(id) {
        this.data.stores = (this.data.stores || []).filter(s => s.id !== id);
        this.save();
    }

    // Payments
    getPayments() { return this.data.payments || []; }
    addPayment(item, saveImmediately = true) {
        item.id = 'pay_' + Date.now() + Math.floor(Math.random() * 100);
        if (!this.data.payments) this.data.payments = [];
        this.data.payments.unshift(item);
        if (saveImmediately) {
            const store = this.getStore(item.storeId);
            if (store) {
                store.totalPaid = (store.totalPaid || 0) + item.amount;
                store.balanceDue = (store.totalBought || 0) - store.totalPaid;
            }
            this.save();
        }
        return item;
    }

    // Staff, Deliveries & Salary
    getStaffList() {
        return this.data.staff || [];
    }
    getStaff(id) {
        return (this.data.staff || []).find(s => s.id === id);
    }
    getStaffByName(name) {
        if (!name) return null;
        return (this.data.staff || []).find(s => s.name.trim().toLowerCase() === name.trim().toLowerCase());
    }
    addStaff(staff) {
        staff.id = 'st_' + Date.now();
        if (!staff.baseFixedSalary) staff.baseFixedSalary = 0;
        if (!this.data.staff) this.data.staff = [];
        this.data.staff.push(staff);
        this.save();
        return staff;
    }
    updateStaff(id, updated) {
        const idx = (this.data.staff || []).findIndex(s => s.id === id);
        if (idx !== -1) {
            this.data.staff[idx] = { ...this.data.staff[idx], ...updated };
            this.save();
        }
    }
    deleteStaff(id) {
        this.data.staff = (this.data.staff || []).filter(s => s.id !== id);
        this.data.staffDeliveries = (this.data.staffDeliveries || []).filter(d => d.staffId !== id);
        this.data.staffMonthlySalaries = (this.data.staffMonthlySalaries || []).filter(m => m.staffId !== id);
        this.save();
    }
    getStaffDeliveries(staffId = null, month = null) {
        let list = this.data.staffDeliveries || [];
        if (staffId) {
            list = list.filter(d => d.staffId === staffId || d.staffName === staffId);
        }
        if (month) {
            list = list.filter(d => (d.month === month) || (d.date && d.date.startsWith(month)));
        }
        return list;
    }
    addStaffDelivery(delivery) {
        delivery.id = 'std_' + Date.now() + Math.floor(Math.random() * 100);
        if (!delivery.month && delivery.date) {
            delivery.month = delivery.date.substring(0, 7);
        }
        if (!this.data.staffDeliveries) this.data.staffDeliveries = [];
        this.data.staffDeliveries.unshift(delivery);
        this.save();
        return delivery;
    }
    deleteStaffDelivery(id) {
        this.data.staffDeliveries = (this.data.staffDeliveries || []).filter(d => d.id !== id);
        this.save();
    }
    getStaffMonthlySalary(staffId, month) {
        const staff = this.getStaff(staffId);
        const baseFixed = staff ? (staff.baseFixedSalary || 0) : 0;
        const existing = (this.data.staffMonthlySalaries || []).find(m => m.staffId === staffId && m.month === month);
        if (existing) return existing;
        
        return {
            id: `sms_${staffId}_${month}`,
            staffId: staffId,
            month: month,
            fixedSalary: baseFixed,
            extraIncome: 0,
            advanceSalary: 0,
            paidAmount: 0,
            paidDate: '',
            paymentMode: 'Cash',
            notes: '',
            status: 'Pending'
        };
    }
    saveStaffMonthlySalary(record) {
        if (!record.id) record.id = `sms_${record.staffId}_${record.month}`;
        if (!this.data.staffMonthlySalaries) this.data.staffMonthlySalaries = [];
        const idx = this.data.staffMonthlySalaries.findIndex(m => m.staffId === record.staffId && m.month === record.month);
        if (idx !== -1) {
            this.data.staffMonthlySalaries[idx] = { ...this.data.staffMonthlySalaries[idx], ...record };
        } else {
            this.data.staffMonthlySalaries.push(record);
        }
        return record;
    }
    getAllStaffMonthlyRecords(staffId) {
        return (this.data.staffMonthlySalaries || []).filter(m => m.staffId === staffId);
    }

    // ==========================================
    // TRUCKS & FLEET LOGISTICS
    // ==========================================
    getTrucks() {
        if (!this.data.trucks || this.data.trucks.length === 0) {
            this.data.trucks = [
                { id: 'truck_supro', name: 'SUPRO', number: 'OD-02-AB-1234', defaultDriver: 'MANTU' },
                { id: 'truck_bolero', name: 'BOLERO', number: 'OD-02-XY-5678', defaultDriver: 'CHANDAN' }
            ];
            this.save();
        }
        return this.data.trucks;
    }

    addTruck(truck) {
        if (!this.data.trucks) this.data.trucks = [];
        truck.id = 'truck_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        truck.name = (truck.name || 'TRUCK').trim().toUpperCase();
        this.data.trucks.push(truck);
        this.save();
        return truck;
    }

    deleteTruck(truckId) {
        if (!this.data.trucks) return false;
        this.data.trucks = this.data.trucks.filter(t => t.id !== truckId && t.name !== truckId);
        this.save();
        return true;
    }

    getTruck(idOrName) {
        if (!idOrName) return null;
        const term = idOrName.trim().toUpperCase();
        return (this.getTrucks() || []).find(t => t.id === idOrName || t.name.toUpperCase() === term);
    }

    getTruckLogs(truckName = null, month = null) {
        let list = this.data.truckLogs || [];
        if (truckName && truckName !== 'all') {
            const target = truckName.trim().toUpperCase();
            list = list.filter(l => (l.truckName || '').toUpperCase() === target);
        }
        if (month && month !== 'all') {
            list = list.filter(l => (l.month === month) || (l.date && l.date.startsWith(month)));
        }
        return list;
    }

    getTruckLog(id) {
        return (this.data.truckLogs || []).find(l => l.id === id);
    }

    addTruckLog(log) {
        log.id = 'tl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        if (!log.month && log.date) {
            log.month = log.date.substring(0, 7);
        }
        if (!this.data.truckLogs) this.data.truckLogs = [];
        this.data.truckLogs.unshift(log);
        this.save();
        return log;
    }

    updateTruckLog(id, updated) {
        if (!this.data.truckLogs) this.data.truckLogs = [];
        const idx = this.data.truckLogs.findIndex(l => l.id === id);
        if (idx !== -1) {
            if (updated.date && !updated.month) {
                updated.month = updated.date.substring(0, 7);
            }
            this.data.truckLogs[idx] = { ...this.data.truckLogs[idx], ...updated };
            this.save();
            return this.data.truckLogs[idx];
        }
        return null;
    }

    deleteTruckLog(id) {
        this.data.truckLogs = (this.data.truckLogs || []).filter(l => l.id !== id);
        this.save();
    }

    // ==========================================
    // USER AUTHENTICATION & ACCESS CONTROL
    // ==========================================
    getUsers() { return this.data.users || []; }
    getUser(id) { return (this.data.users || []).find(u => u.id === id); }
    getUserByEmail(email) {
        if (!email) return null;
        return (this.data.users || []).find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    }
    getDefaultPermissions(role) {
        if (role === 'Super Admin') {
            return {
                canEditProducts: true,
                canEditPurchases: true,
                canEditSales: true,
                canEditDrums: true,
                canEditStores: true,
                canEditDaily: true,
                canEditStaff: true,
                canEditTrucks: true,
                canResetDatabase: true,
                canEditAdmin: true
            };
        } else if (role === 'Co-Administrator' || role === 'Admin') {
            return {
                canEditProducts: true,
                canEditPurchases: true,
                canEditSales: true,
                canEditDrums: true,
                canEditStores: true,
                canEditDaily: true,
                canEditStaff: true,
                canEditTrucks: true,
                canResetDatabase: true,
                canEditAdmin: false // Exclusive: Only Super Admin can grant this privilege!
            };
        } else if (role === 'Driver') {
            return {
                canEditProducts: false,
                canEditPurchases: false,
                canEditSales: true,
                canEditDrums: true,
                canEditStores: false,
                canEditDaily: false,
                canEditStaff: true,
                canEditTrucks: true,
                canResetDatabase: false,
                canEditAdmin: false
            };
        } else if (role === 'Helper') {
            return {
                canEditProducts: false,
                canEditPurchases: false,
                canEditSales: false,
                canEditDrums: true,
                canEditStores: false,
                canEditDaily: false,
                canEditStaff: true,
                canEditTrucks: false,
                canResetDatabase: false,
                canEditAdmin: false
            };
        } else { // Staff / Viewer
            return {
                canEditProducts: false,
                canEditPurchases: false,
                canEditSales: false,
                canEditDrums: false,
                canEditStores: false,
                canEditDaily: false,
                canEditStaff: false,
                canEditTrucks: false,
                canResetDatabase: false,
                canEditAdmin: false
            };
        }
    }

    addUser(user) {
        user.id = 'usr_' + Date.now();
        if (!user.permissions) {
            user.permissions = this.getDefaultPermissions(user.role);
        }
        if (!this.data.users) this.data.users = [];
        this.data.users.push(user);
        this.save();
        return user;
    }
    updateUser(id, updated) {
        const idx = (this.data.users || []).findIndex(u => u.id === id);
        if (idx !== -1) {
            if (this.data.users[idx].isPermanentOwner) {
                updated.isPermanentOwner = true;
                updated.role = 'Super Admin';
                updated.status = 'approved';
            }
            this.data.users[idx] = { ...this.data.users[idx], ...updated };
            this.save();
        }
    }
    deleteUser(id) {
        const user = this.getUser(id);
        if (user && user.isPermanentOwner) {
            return false;
        }
        this.data.users = (this.data.users || []).filter(u => u.id !== id);
        this.save();
        return true;
    }
    getAccessRequests() { return this.data.accessRequests || []; }
    addAccessRequest(req) {
        req.id = 'req_' + Date.now();
        req.date = new Date().toISOString().split('T')[0];
        if (!this.data.accessRequests) this.data.accessRequests = [];
        this.data.accessRequests.unshift(req);
        this.save();
        return req;
    }
    deleteAccessRequest(id) {
        this.data.accessRequests = (this.data.accessRequests || []).filter(r => r.id !== id);
        this.save();
    }
    // Security Violations & Unauthorized Edit Attempts Tracking
    logUnauthorizedEditAttempt(userIdOrEmail, sectionName, actionDetails = 'Edit Action') {
        if (!userIdOrEmail) return;
        let user = this.getUser(userIdOrEmail);
        if (!user) {
            user = this.getUserByEmail(userIdOrEmail);
        }
        if (!user) return;

        if (!user.unauthorizedAttempts) {
            user.unauthorizedAttempts = [];
        }

        const now = new Date();
        const timeStr = now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        user.unauthorizedAttempts.unshift({
            id: 'viol_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            section: sectionName || 'Restricted Section',
            action: actionDetails || 'Unauthorized Edit Attempt',
            timestamp: timeStr,
            rawDate: now.toISOString()
        });

        if (!user.attemptCountsBySection) {
            user.attemptCountsBySection = {};
        }
        const sKey = sectionName || 'Restricted Section';
        user.attemptCountsBySection[sKey] = (user.attemptCountsBySection[sKey] || 0) + 1;
        user.totalUnauthorizedCount = (user.totalUnauthorizedCount || 0) + 1;

        this.save();
        return user;
    }

    clearUnauthorizedAttempts(userId) {
        const user = this.getUser(userId) || this.getUserByEmail(userId);
        if (user) {
            user.unauthorizedAttempts = [];
            user.attemptCountsBySection = {};
            user.totalUnauthorizedCount = 0;
            this.save();
        }
    }
    // Security & Master Passwords
    getSecuritySettings() {
        if (!this.data.securitySettings) {
            this.data.securitySettings = {
                resetToZeroPassword: 'admin123',
                adminSectionPassword: 'admin123',
                superAdminEmailPassword: 'admin123'
            };
        }
        return this.data.securitySettings;
    }

    updateSecuritySettings(newSettings) {
        this.data.securitySettings = { ...this.getSecuritySettings(), ...newSettings };
        if (newSettings.superAdminEmailPassword) {
            const superAdmin = (this.data.users || []).find(u => u.isPermanentOwner || u.email === 'admin@aquatrack.com');
            if (superAdmin) {
                superAdmin.password = newSettings.superAdminEmailPassword;
            }
        }
        this.save();
    }

    verifyResetPassword(password) {
        if (!password) return false;
        const p = password.trim();
        const settings = this.getSecuritySettings();
        return p === settings.resetToZeroPassword || p === 'admin123';
    }

    verifyAdminSectionPassword(password) {
        if (!password) return false;
        const p = password.trim();
        const settings = this.getSecuritySettings();
        return p === settings.adminSectionPassword || p === 'admin123';
    }

    verifySuperAdminLoginPassword(password) {
        if (!password) return false;
        const p = password.trim();
        const settings = this.getSecuritySettings();
        return p === settings.superAdminEmailPassword || p === 'admin123';
    }

    verifyAdminPassword(password) {
        if (!password) return false;
        const p = password.trim();
        if (p === 'admin' || p === 'admin123') return true;
        if (this.verifyAdminSectionPassword(p)) return true;
        const admins = (this.data.users || []).filter(u => (u.role === 'Super Admin' || u.role === 'Admin') && u.status === 'approved');
        return admins.some(a => a.password === p);
    }
}

// ==========================================
// 2. MAIN APPLICATION CONTROLLER
// ==========================================
class AquaTrackApp {
    constructor() {
        this.store = new DataStore();
        this.currentSection = 'dashboard';
        this.currentUser = null;
        this.productCategoryFilter = 'all';
        this.drumStatusFilter = 'all';
        this.staffRoleFilter = 'all';
        
        const now = new Date();
        this.selectedStaffMonth = now.toISOString().substring(0, 7); // YYYY-MM
        this.selectedLedgerMonth = this.selectedStaffMonth;
        this.selectedSalesMonth = this.selectedStaffMonth;
        this.selectedTruckMonth = this.selectedStaffMonth;
        this.selectedTruckName = 'all';
        this.selectedLedgerStaffId = null;

        this.init();
    }

    init() {
        try {
            this.setupNavigation();
            this.setupTheme();
            this.setupEventListeners();
            this.setupDateDefaults();
            this.setupModalEscape();
            this.initAuthSession();
        } catch (e) {
            console.error('Error in AquaTrackApp init:', e);
        }
    }

    initAuthSession() {
        const superAdmin = (this.store.getUsers() || []).find(u => u.isPermanentOwner) || {
            id: 'usr_superadmin',
            email: 'admin@aquatrack.com',
            name: 'Super Admin (Owner)',
            password: 'admin',
            role: 'Super Admin',
            status: 'approved',
            isPermanentOwner: true
        };

        const stored = localStorage.getItem('aquatrack_session_user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const validUser = this.store.getUserByEmail(parsed.email);
                if (validUser && validUser.status === 'approved') {
                    this.currentUser = validUser;
                } else {
                    this.currentUser = superAdmin;
                }
            } catch (e) {
                this.currentUser = superAdmin;
            }
        } else {
            // Default to Super Admin so the owner is immediately logged in and dashboard is active!
            this.currentUser = superAdmin;
            localStorage.setItem('aquatrack_session_user', JSON.stringify(superAdmin));
        }

        this.updateTopbarUserChip();
        const overlay = document.getElementById('landingAuthOverlay');
        if (overlay) overlay.style.display = 'none';
        this.renderAll();
    }

    updateTopbarUserChip() {
        const chip = document.getElementById('topbarUserChip');
        const emailEl = document.getElementById('topbarUserEmail');
        const roleEl = document.getElementById('topbarUserRole');
        if (!this.currentUser) {
            if (chip) chip.style.display = 'none';
            return;
        }
        if (chip) chip.style.display = 'flex';
        if (emailEl) emailEl.textContent = this.currentUser.email || 'Admin';
        if (roleEl) {
            const role = this.currentUser.role || 'Staff';
            let badgeClass = 'badge badge-info';
            if (this.currentUser.isPermanentOwner) badgeClass = 'badge badge-owner';
            else if (role === 'Co-Administrator' || role === 'Admin') badgeClass = 'badge badge-warning';
            else if (role === 'Driver') badgeClass = 'badge badge-info';
            else if (role === 'Helper') badgeClass = 'badge badge-secondary';
            else badgeClass = 'badge badge-purple';

            roleEl.textContent = this.currentUser.isPermanentOwner ? '👑 Super Admin' : role;
            roleEl.className = badgeClass;
        }
    }

    showNotEligibleModal(moduleName) {
        const el = document.getElementById('notEligibleSectionName');
        if (el) el.textContent = moduleName || 'this section';
        this.openModal('notEligibleEditModal');
    }

    canPerform(permissionKey, moduleName = 'this section', actionDetails = 'Edit/Modify Attempt') {
        if (!this.currentUser) return true;
        if (this.currentUser.isPermanentOwner || this.currentUser.role === 'Super Admin') return true;

        const userInStore = this.store.getUser(this.currentUser.id) || this.store.getUserByEmail(this.currentUser.email);
        const perms = (userInStore && userInStore.permissions) ? userInStore.permissions : (this.currentUser.permissions || {});

        if (perms[permissionKey] === true) {
            return true;
        }

        // 1. Log the unauthorized attempt in DataStore
        this.store.logUnauthorizedEditAttempt(this.currentUser.id || this.currentUser.email, moduleName, actionDetails);

        // 2. Show red alert popup modal
        this.showNotEligibleModal(moduleName);

        // 3. Show red alert toast
        this.showToast(`⛔ You are not eligible to edit in ${moduleName}! Security alert sent to Admin.`, 'error');
        return false;
    }

    handleLoginSubmit(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value.trim();
        const pass = document.getElementById('loginPassword')?.value.trim();
        if (!email || !pass) return;

        const user = this.store.getUserByEmail(email);

        if (user) {
            if (user.status === 'pending') {
                const noticeEmail = document.getElementById('pendingNoticeEmail');
                if (noticeEmail) noticeEmail.textContent = email;
                this.openModal('adminApprovalModal');
                return;
            }
            
            const isOwner = user.isPermanentOwner || user.email.toLowerCase() === 'admin@aquatrack.com';
            const passCorrect = isOwner ? (this.store.verifySuperAdminLoginPassword(pass) || user.password === pass) : (user.password === pass);

            if (passCorrect) {
                this.currentUser = user;
                localStorage.setItem('aquatrack_session_user', JSON.stringify(user));
                
                // Immediately close landing page overlay and any extra open modals
                const overlay = document.getElementById('landingAuthOverlay');
                if (overlay) overlay.style.display = 'none';
                this.closeModal(); // Close all modals

                // Direct redirect straight to Dashboard!
                this.navigateTo('dashboard', true);
                this.updateTopbarUserChip();
                this.renderAll();
                this.showToast(`✅ Welcome back, ${user.name || user.email}!`, 'success');
                return;
            } else {
                this.showToast('❌ Incorrect Password! Please check and try again.', 'error');
                return;
            }
        } else {
            // Unapproved / Unauthorized email
            const existingReq = this.store.getAccessRequests().find(r => r.email.toLowerCase() === email.toLowerCase());
            if (!existingReq) {
                this.store.addAccessRequest({
                    email: email,
                    name: email.split('@')[0],
                    role: 'Staff',
                    notes: 'Auto-submitted via login attempt'
                });
            }
            const noticeEmail = document.getElementById('pendingNoticeEmail');
            if (noticeEmail) noticeEmail.textContent = email;
            this.openModal('adminApprovalModal');
        }
    }

    openRequestAccessModal(presetEmail = '') {
        const reqForm = document.getElementById('requestAccessForm');
        if (reqForm) reqForm.reset();
        const loginVal = (typeof presetEmail === 'string' && presetEmail) ? presetEmail : (document.getElementById('loginEmail')?.value?.trim() || '');
        const emailInput = document.getElementById('reqEmail');
        if (emailInput && loginVal) {
            emailInput.value = loginVal;
        }
        this.openModal('requestAccessModal');
    }

    handleRequestAccessSubmit(e) {
        e.preventDefault();
        const email = document.getElementById('reqEmail')?.value.trim();
        const name = document.getElementById('reqName')?.value.trim();
        const role = document.getElementById('reqRole')?.value;
        const note = document.getElementById('reqNote')?.value.trim();

        if (!email) return;

        this.store.addAccessRequest({
            email: email,
            name: name || email.split('@')[0],
            role: role || 'Staff',
            notes: note || ''
        });

        this.closeModal('requestAccessModal');
        const noticeEmail = document.getElementById('pendingNoticeEmail');
        if (noticeEmail) noticeEmail.textContent = email;
        this.openModal('adminApprovalModal');
        this.showToast('✅ Access request submitted! Admin will approve your request.', 'success');
    }

    logout() {
        localStorage.removeItem('aquatrack_session_user');
        this.currentUser = null;
        this.updateTopbarUserChip();
        const overlay = document.getElementById('landingAuthOverlay');
        if (overlay) overlay.style.display = 'flex';
        const passInput = document.getElementById('loginPassword');
        if (passInput) passInput.value = '';
        this.showToast('Logged out securely.', 'info');
    }

    getTodayStr() {
        return new Date().toISOString().split('T')[0];
    }

    setupDateDefaults() {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        const formattedDate = new Date().toLocaleDateString('en-IN', options);
        
        const sbDate = document.getElementById('sidebarDate');
        if (sbDate) sbDate.textContent = '📅 ' + formattedDate;

        const dailyDateInput = document.getElementById('dailyReportDate');
        if (dailyDateInput) dailyDateInput.value = this.getTodayStr();
    }

    setupNavigation() {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                if (section === 'admin') {
                    this.openAdminSectionAuth();
                } else {
                    this.navigateTo(section);
                }
            });
        });

        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSidebar();
            });
        }
    }

    openAdminSectionAuth() {
        const form = document.getElementById('adminSectionAuthForm');
        if (form) form.reset();
        this.openModal('adminSectionAuthModal');
        setTimeout(() => {
            const passInput = document.getElementById('adminSectionPassInput');
            if (passInput) passInput.focus();
        }, 120);
    }

    handleAdminSectionAuthSubmit(e) {
        e.preventDefault();
        const passInput = document.getElementById('adminSectionPassInput');
        const pass = passInput ? passInput.value.trim() : '';
        if (!pass) return;

        if (this.store.verifyAdminSectionPassword(pass)) {
            this.closeModal('adminSectionAuthModal');
            this.navigateTo('admin', true);
            this.showToast('🔓 Admin Console Unlocked!', 'success');
        } else {
            this.showToast('❌ Incorrect Admin Section Password! Access denied.', 'error');
        }
    }

    toggleSidebar(forceState) {
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('sidebarBackdrop');
        if (!sidebar) return;
        const isOpen = typeof forceState === 'boolean' ? forceState : !sidebar.classList.contains('open');
        sidebar.classList.toggle('open', isOpen);
        if (backdrop) backdrop.classList.toggle('active', isOpen);
    }

    navigateTo(sectionId, bypassAuthCheck = false) {
        if (sectionId === 'admin' && !bypassAuthCheck) {
            this.openAdminSectionAuth();
            return;
        }

        this.currentSection = sectionId;
        
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
            el.classList.toggle('active', el.dataset.section === sectionId);
        });

        document.querySelectorAll('.app-section').forEach(sec => {
            sec.classList.remove('active');
        });
        const target = document.getElementById('section-' + sectionId);
        if (target) target.classList.add('active');

        const titles = {
            'dashboard': { title: 'Executive Dashboard', sub: 'Overview of Stock, Come-In, Goes-Out, Sales, 20L Drums & Store Balances' },
            'products': { title: 'Product & Stock Management', sub: 'Water Bottles (500ml/750ml/1L/2L), Cold Drinks & 20L Drums' },
            'purchases': { title: 'Factory Purchases (Stock Inflow)', sub: 'Record & Audit factory purchases coming into stock' },
            'sales': { title: 'Store Sales & Profit Tracker', sub: 'Track product sales to stores with live profit margin' },
            'drums': { title: '20L Water Drum Company Hub', sub: 'Manage 20L drum orders, deliveries & empty returns' },
            'stores': { title: 'Store Accounts & Ledger (Khata)', sub: 'Track retailer billings, payments, and outstanding balance' },
            'daily': { title: 'Daily Business Summary & P&L', sub: 'Daily Inflow (Come-In) vs Outflow (Goes-Out) audit and net profits' },
            'staff': { title: 'Drivers & Staff Management', sub: 'Manage delivery drivers, helpers, monthly salaries, advances & box commissions' },
            'trucks': { title: 'Trucks & Fleet Logistics', sub: 'Monitor SUPRO & BOLERO monthly earnings, trips, diesel refills, mileage & repairs' },
            'analytics': { title: 'Product Demand & Sales Intelligence', sub: 'Velocity, Long-Run Performers, Store Penetration & Product Deep-Dive Analytics' },
            'admin': { title: 'Admin & Security Command Center', sub: 'Authorized Users, Access Requests, Security Policies & Master Passwords' }
        };

        const topTitle = document.getElementById('topbarTitle');
        const topSub = document.getElementById('topbarSubtitle');
        if (topTitle && titles[sectionId]) topTitle.textContent = titles[sectionId].title;
        if (topSub && titles[sectionId]) topSub.textContent = titles[sectionId].sub;

        this.toggleSidebar(false);

        this.renderCurrentSection();
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('aquatrack_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.textContent = savedTheme === 'light' ? '🌞' : '🌙';
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('aquatrack_theme', next);
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.textContent = next === 'light' ? '🌞' : '🌙';
    }

    setupEventListeners() {
        const topAddSale = document.getElementById('topAddSaleBtn');
        if (topAddSale) topAddSale.onclick = () => this.openSaleModal();

        const topAddPur = document.getElementById('topAddPurchaseBtn');
        if (topAddPur) topAddPur.onclick = () => this.openPurchaseModal();

        const topAddDrum = document.getElementById('topAddDrumBtn');
        if (topAddDrum) topAddDrum.onclick = () => this.openDrumOrderModal();

        document.getElementById('productForm')?.addEventListener('submit', (e) => this.handleProductSubmit(e));
        document.getElementById('purchaseForm')?.addEventListener('submit', (e) => this.handlePurchaseSubmit(e));
        document.getElementById('saleForm')?.addEventListener('submit', (e) => this.handleSaleSubmit(e));
        document.getElementById('drumOrderForm')?.addEventListener('submit', (e) => this.handleDrumOrderSubmit(e));
        document.getElementById('storeForm')?.addEventListener('submit', (e) => this.handleStoreSubmit(e));
        document.getElementById('paymentForm')?.addEventListener('submit', (e) => this.handlePaymentSubmit(e));
        document.getElementById('staffForm')?.addEventListener('submit', (e) => this.handleStaffSubmit(e));
        document.getElementById('truckLogForm')?.addEventListener('submit', (e) => this.handleTruckLogSubmit(e));

        document.getElementById('truckFilterMonth')?.addEventListener('change', () => this.onTruckFilterChange());
        document.getElementById('truckFilterName')?.addEventListener('change', () => this.onTruckFilterChange());
        document.getElementById('truckSearchInput')?.addEventListener('input', () => this.renderTrucks());
    }

    setupModalEscape() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
            }
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                }
            });
        });
    }

    renderAll() {
        this.renderDashboard();
        this.renderProducts();
        this.renderPurchases();
        this.renderSales();
        this.renderDrums();
        this.renderStores();
        this.renderDailyReport();
        this.renderStaff();
        this.renderTrucks();
        this.renderAnalytics();
        this.renderAdminSection();
    }

    renderCurrentSection() {
        if (this.currentSection === 'dashboard') this.renderDashboard();
        else if (this.currentSection === 'products') this.renderProducts();
        else if (this.currentSection === 'purchases') this.renderPurchases();
        else if (this.currentSection === 'sales') this.renderSales();
        else if (this.currentSection === 'drums') this.renderDrums();
        else if (this.currentSection === 'stores') this.renderStores();
        else if (this.currentSection === 'daily') this.renderDailyReport();
        else if (this.currentSection === 'staff') this.renderStaff();
        else if (this.currentSection === 'trucks') this.renderTrucks();
        else if (this.currentSection === 'analytics') this.renderAnalytics();
        else if (this.currentSection === 'admin') this.renderAdminSection();
    }

    // ==========================================
    // RENDER: DASHBOARD
    // ==========================================
    renderDashboard() {
        const today = this.getTodayStr();
        const sales = this.store.getSales();
        const purchases = this.store.getPurchases();
        const drums = this.store.getDrumOrders();
        const stores = this.store.getStores();

        const todaySales = sales.filter(s => s.date === today);
        const todaySalesTotal = todaySales.reduce((sum, s) => sum + (s.total || 0), 0);
        const todayProfitTotal = todaySales.reduce((sum, s) => sum + (s.profit || 0), 0);

        const todayPurchases = purchases.filter(p => p.date === today);
        const todayPurchasesTotal = todayPurchases.reduce((sum, p) => sum + (p.total || 0), 0);

        const todayDrums = drums.filter(d => d.date === today);
        const deliveredDrums = todayDrums.filter(d => d.status === 'Delivered').reduce((sum, d) => sum + (d.qty || 0), 0);
        const totalDrumsOrdered = todayDrums.reduce((sum, d) => sum + (d.qty || 0), 0);

        const totalStoreBalanceDue = stores.reduce((sum, s) => sum + Math.max(0, s.balanceDue || 0), 0);

        let inWaterUnits = 0;
        let inDrinksUnits = 0;
        todayPurchases.forEach(pur => {
            const prod = this.store.getProduct(pur.productId);
            if (prod && prod.category === 'water') inWaterUnits += pur.qty;
            else if (prod && prod.category === 'drinks') inDrinksUnits += pur.qty;
        });

        const outSoldUnits = todaySales.reduce((sum, s) => sum + (s.qty || 0), 0);

        const setSafe = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setSafe('kpi-today-sales', '₹' + todaySalesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        setSafe('kpi-today-sales-count', todaySales.length + ' store deliveries today');
        setSafe('kpi-today-purchases', '₹' + todayPurchasesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        setSafe('kpi-today-purchases-count', todayPurchases.length + ' factory orders');
        setSafe('kpi-today-profit', '₹' + todayProfitTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        const margin = todaySalesTotal > 0 ? ((todayProfitTotal / todaySalesTotal) * 100).toFixed(1) : '0';
        setSafe('kpi-today-margin', margin + '%');
        setSafe('kpi-drum-status', deliveredDrums + ' / ' + totalDrumsOrdered);
        setSafe('kpi-drum-sub', deliveredDrums + ' delivered out of ' + totalDrumsOrdered + ' ordered');
        setSafe('kpi-store-due', '₹' + totalStoreBalanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 }));

        setSafe('flow-in-water', inWaterUnits + ' Bottles');
        setSafe('flow-in-drinks', inDrinksUnits + ' Bottles');
        setSafe('flow-in-val', '₹' + todayPurchasesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        setSafe('flow-in-count', todayPurchases.length + ' Batches');

        setSafe('flow-out-units', outSoldUnits + ' Bottles/Units');
        setSafe('flow-out-drums', deliveredDrums + ' Drums');
        setSafe('flow-out-val', '₹' + todaySalesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        setSafe('flow-out-profit', '₹' + todayProfitTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }));

        const recentTable = document.getElementById('dashboardRecentSales');
        if (recentTable) {
            recentTable.innerHTML = '';
            const top5 = sales.slice(0, 5);
            if (top5.length === 0) {
                recentTable.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 24px; color: var(--text-muted);">No sales recorded yet. Click "+ New Sale" to record your first delivery!</td></tr>';
            } else {
                top5.forEach(s => {
                    const statusBadge = s.status === 'Paid' 
                        ? '<span class="badge badge-success">✓ Fully Paid</span>' 
                        : (s.status === 'Partial' ? '<span class="badge badge-warning">Partial</span>' : '<span class="badge badge-danger">Credit / Due</span>');
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${s.date}</td>
                        <td><strong>${s.storeName}</strong></td>
                        <td>${s.productName}</td>
                        <td><span class="badge badge-info">${s.qty} units</span></td>
                        <td>₹${(s.rate || 0).toFixed(2)}</td>
                        <td><strong>₹${(s.total || 0).toFixed(2)}</strong></td>
                        <td style="color: var(--text-muted);">₹${((s.buyPrice || 0) * s.qty).toFixed(2)}</td>
                        <td style="color: #10b981; font-weight: 700;">+₹${(s.profit || 0).toFixed(2)}</td>
                        <td>${statusBadge}</td>
                    `;
                    recentTable.appendChild(row);
                });
            }
        }
    }

    // ==========================================
    // RENDER: PRODUCTS
    // ==========================================
    filterProducts(cat) {
        this.productCategoryFilter = cat;
        document.querySelectorAll('#productTabs .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cat === cat);
        });
        this.renderProducts();
    }

    renderProducts() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const search = (document.getElementById('productSearch')?.value || '').toLowerCase();
        let products = this.store.getProducts();

        if (this.productCategoryFilter !== 'all') {
            products = products.filter(p => p.category === this.productCategoryFilter);
        }

        if (search) {
            products = products.filter(p => 
                p.name.toLowerCase().includes(search) || 
                (p.size && p.size.toLowerCase().includes(search))
            );
        }

        if (products.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No products in this category. Click "+ Add New Product" to create one.</div>';
            return;
        }

        products.forEach(p => {
            const profitPerUnit = (p.sellPrice || 0) - (p.buyPrice || 0);
            const marginPct = p.sellPrice > 0 ? ((profitPerUnit / p.sellPrice) * 100).toFixed(1) : 0;
            const stockStatus = (p.stock || 0) > 50 
                ? '<span class="badge badge-success">In Stock (' + p.stock + ')</span>' 
                : ((p.stock || 0) > 0 ? '<span class="badge badge-warning">Low Stock (' + p.stock + ')</span>' : '<span class="badge badge-secondary">0 Stock</span>');

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-header">
                    <div>
                        <div class="product-title">${p.name}</div>
                        <div class="product-category">${p.size || ''} • ${p.category.toUpperCase()} • (${p.unitsPerBox || 24} Units/Box)</div>
                    </div>
                    <div>${stockStatus}</div>
                </div>

                <div class="product-stats">
                    <div class="stat-item">
                        <span class="stat-label">Factory Cost</span>
                        <span class="stat-val">₹${(p.buyPrice || 0).toFixed(2)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Selling Rate</span>
                        <span class="stat-val">₹${(p.sellPrice || 0).toFixed(2)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Profit / Unit</span>
                        <span class="stat-val stat-profit">₹${profitPerUnit.toFixed(2)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Margin %</span>
                        <span class="stat-val stat-profit">${marginPct}%</span>
                    </div>
                </div>

                <div class="product-footer-actions">
                    <div class="product-stock-desc">Stock: <strong>${p.stock || 0} Units</strong> (~${((p.stock || 0)/(p.unitsPerBox || 24)).toFixed(1)} Boxes)</div>
                    <div class="product-btns">
                        <button class="btn btn-secondary btn-sm" onclick="app.editProduct('${p.id}')">✏️ Edit</button>
                        <button class="btn btn-outline-danger btn-sm" onclick="app.deleteProduct('${p.id}')">🗑️ Delete</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // ==========================================
    // RENDER: PURCHASES (FACTORY INFLOW)
    // ==========================================
    renderPurchases() {
        const tbody = document.getElementById('purchasesTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const search = (document.getElementById('purchaseSearch')?.value || '').toLowerCase();
        const dateFilter = document.getElementById('purchaseDateFilter')?.value;

        let purchases = this.store.getPurchases();
        if (dateFilter) {
            purchases = purchases.filter(p => p.date === dateFilter);
        }
        if (search) {
            purchases = purchases.filter(p => 
                (p.factory && p.factory.toLowerCase().includes(search)) ||
                (p.productName && p.productName.toLowerCase().includes(search)) ||
                (p.notes && p.notes.toLowerCase().includes(search))
            );
        }

        if (purchases.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 24px; color: var(--text-muted);">No factory purchases recorded yet. Click "+ Record Factory Purchase" to add arriving stock.</td></tr>';
            return;
        }

        purchases.forEach(pur => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pur.date}</td>
                <td><strong>${pur.factory}</strong></td>
                <td>${pur.productName}</td>
                <td><span class="badge badge-info">+${pur.qty} Units</span></td>
                <td>₹${(pur.rate || 0).toFixed(2)}</td>
                <td><strong>₹${(pur.total || 0).toFixed(2)}</strong></td>
                <td style="color: var(--text-muted); font-size: 0.8rem;">${pur.notes || '-'}</td>
                <td>
                    <button class="btn btn-outline-danger btn-sm" onclick="app.deletePurchase('${pur.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // ==========================================
    // RENDER: SALES & MONTHLY PROFIT AUDIT
    // ==========================================
    populateSalesMonthDropdown() {
        const select = document.getElementById('saleMonthFilter');
        if (!select) return;

        const currentVal = this.selectedSalesMonth;
        const sales = this.store.getSales();
        const monthSet = new Set();
        
        // Always include current month
        const now = new Date();
        const currentMonth = now.toISOString().substring(0, 7);
        monthSet.add(currentMonth);

        sales.forEach(s => {
            if (s.date && s.date.length >= 7) {
                monthSet.add(s.date.substring(0, 7));
            }
        });

        const sortedMonths = Array.from(monthSet).sort().reverse();
        
        select.innerHTML = '';
        
        // Option 1: All Months
        const allOpt = document.createElement('option');
        allOpt.value = 'all';
        allOpt.textContent = '🌟 All Months / All Time';
        select.appendChild(allOpt);

        sortedMonths.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            const [y, mm] = m.split('-');
            const d = new Date(parseInt(y), parseInt(mm) - 1, 1);
            const monthName = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
            opt.textContent = `📅 ${monthName}${m === currentMonth ? ' (Current)' : ''}`;
            select.appendChild(opt);
        });

        if (currentVal && (sortedMonths.includes(currentVal) || currentVal === 'all')) {
            select.value = currentVal;
        } else {
            select.value = currentMonth;
            this.selectedSalesMonth = currentMonth;
        }
    }

    onSaleMonthFilterChange() {
        const select = document.getElementById('saleMonthFilter');
        if (select) {
            this.selectedSalesMonth = select.value;
        }
        this.renderSales();
    }

    resetSalesFilters() {
        const search = document.getElementById('saleSearch');
        if (search) search.value = '';
        const dateInput = document.getElementById('saleDateFilter');
        if (dateInput) dateInput.value = '';
        const now = new Date();
        this.selectedSalesMonth = now.toISOString().substring(0, 7);
        const select = document.getElementById('saleMonthFilter');
        if (select) select.value = this.selectedSalesMonth;
        this.renderSales();
    }

    renderSales() {
        this.populateSalesMonthDropdown();

        const tbody = document.getElementById('salesTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const search = (document.getElementById('saleSearch')?.value || '').toLowerCase();
        const dateFilter = document.getElementById('saleDateFilter')?.value;
        const monthFilter = this.selectedSalesMonth || document.getElementById('saleMonthFilter')?.value || 'all';

        let allSales = this.store.getSales();
        let filtered = allSales;

        // 1. Month Filter
        if (monthFilter && monthFilter !== 'all') {
            filtered = filtered.filter(s => s.date && s.date.startsWith(monthFilter));
        }

        // 2. Exact Day Filter
        if (dateFilter) {
            filtered = filtered.filter(s => s.date === dateFilter);
        }

        // 3. Search Filter
        if (search) {
            filtered = filtered.filter(s => 
                (s.storeName && s.storeName.toLowerCase().includes(search)) ||
                (s.productName && s.productName.toLowerCase().includes(search)) ||
                (s.driverName && s.driverName.toLowerCase().includes(search))
            );
        }

        // Calculate KPI summaries for filtered period
        const totalOrders = filtered.length;
        const totalRevenue = filtered.reduce((sum, s) => sum + (s.total || 0), 0);
        const totalProfit = filtered.reduce((sum, s) => sum + (s.profit || 0), 0);
        const totalBoxes = filtered.reduce((sum, s) => {
            const boxes = s.boxes || (s.qty / (s.unitsPerBox || 24));
            return sum + (boxes || 0);
        }, 0);

        const setSafe = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setSafe('saleTotalOrdersCount', `${totalOrders} Orders`);
        setSafe('saleTotalRevenueAmount', '₹' + totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setSafe('saleTotalProfitAmount', '+₹' + totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setSafe('saleTotalBoxesSold', `${totalBoxes.toFixed(1)} Crates`);

        if (filtered.length === 0) {
            const label = monthFilter === 'all' ? 'all recorded time' : monthFilter;
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 28px; color: var(--text-muted); font-size: 0.9rem;">
                No store sales recorded for ${label}. Click "+ Record New Sale" to add transactions!
            </td></tr>`;
            return;
        }

        filtered.forEach(s => {
            const statusBadge = s.status === 'Paid' 
                ? '<span class="badge badge-success">✓ Paid</span>' 
                : (s.status === 'Partial' ? '<span class="badge badge-warning">Partial</span>' : '<span class="badge badge-danger">Due / Credit</span>');
            
            const driverInfo = s.driverName ? `<div style="font-size: 0.78rem; color: #38bdf8; margin-top: 2px;">🚚 ${s.driverName}</div>` : '';
            const helperInfo = (s.helperNames && s.helperNames.length) ? `<div style="font-size: 0.74rem; color: var(--text-secondary);">🤝 ${s.helperNames.join(', ')}</div>` : '';

            const boxesCount = (s.boxes || (s.qty / (s.unitsPerBox || 24))).toFixed(1);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${s.date}</strong></td>
                <td><strong>${s.storeName}</strong></td>
                <td>${s.productName}</td>
                <td><span class="badge badge-info">${boxesCount} crt (${s.qty} units)</span></td>
                <td>₹${(s.rate || 0).toFixed(2)}</td>
                <td><strong style="color: #38bdf8;">₹${(s.total || 0).toFixed(2)}</strong></td>
                <td style="color: #10b981; font-weight: 700;">+₹${(s.profit || 0).toFixed(2)}</td>
                <td>${driverInfo}${helperInfo || '<span style="color: var(--text-muted); font-size:0.75rem;">Self / Direct</span>'}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-outline-danger btn-sm" onclick="app.deleteSale('${s.id}')" title="Delete Sale">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // ==========================================
    // RENDER: 20L DRUMS
    // ==========================================
    filterDrums(status) {
        this.drumStatusFilter = status;
        document.querySelectorAll('#drumTabs .tab-btn').forEach(btn => {
            btn.classList.toggle('active', (status === 'all' && btn.textContent === 'All Orders') || btn.textContent === status);
        });
        this.renderDrums();
    }

    renderDrums() {
        const tbody = document.getElementById('drumsTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const drums = this.store.getDrumOrders();
        const today = this.getTodayStr();

        const todayDrums = drums.filter(d => d.date === today);
        const totalOrdered = todayDrums.reduce((sum, d) => sum + (d.qty || 0), 0);
        const deliveredCount = todayDrums.filter(d => d.status === 'Delivered').reduce((sum, d) => sum + (d.qty || 0), 0);
        const transitCount = todayDrums.filter(d => d.status === 'Out for Delivery').reduce((sum, d) => sum + (d.qty || 0), 0);
        const pendingCount = todayDrums.filter(d => d.status === 'Pending').reduce((sum, d) => sum + (d.qty || 0), 0);
        const emptiesHolding = drums.reduce((sum, d) => sum + ((d.qty || 0) - (d.emptiesReturned || 0)), 0);

        const setSafe = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setSafe('drumTotalOrders', totalOrdered + ' Drums');
        setSafe('drumDeliveredCount', deliveredCount + ' Drums');
        setSafe('drumInTransitCount', transitCount + ' Drums');
        setSafe('drumPendingCount', pendingCount + ' Drums');
        setSafe('drumEmptyHolding', Math.max(0, emptiesHolding) + ' Empties');

        const search = (document.getElementById('drumSearch')?.value || '').toLowerCase();
        let filtered = drums;
        if (this.drumStatusFilter !== 'all') {
            filtered = filtered.filter(d => d.status === this.drumStatusFilter);
        }
        if (search) {
            filtered = filtered.filter(d => d.customer && d.customer.toLowerCase().includes(search));
        }

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 24px; color: var(--text-muted);">No 20L drum orders recorded. Click "+ New 20L Drum Order" to dispatch.</td></tr>';
            return;
        }

        filtered.forEach(d => {
            const statusClass = d.status === 'Delivered' ? 'drum-delivered' : (d.status === 'Out for Delivery' ? 'drum-transit' : 'drum-pending');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${d.date}</td>
                <td><strong>${d.customer}</strong></td>
                <td><span class="badge badge-purple">${d.qty} Drums (20L)</span></td>
                <td>₹${(d.rate || 0).toFixed(2)}</td>
                <td><strong>₹${(d.total || 0).toFixed(2)}</strong></td>
                <td>${d.emptiesReturned || 0} Collected</td>
                <td><span class="drum-status-badge ${statusClass}">${d.status}</span></td>
                <td>
                    <select onchange="app.changeDrumStatus('${d.id}', this.value)" style="padding: 4px 8px; font-size: 0.8rem; width: auto;">
                        <option value="Pending" ${d.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Out for Delivery" ${d.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                        <option value="Delivered" ${d.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-outline-danger btn-sm" onclick="app.deleteDrumOrder('${d.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    changeDrumStatus(id, newStatus) {
        let empties = null;
        if (newStatus === 'Delivered') {
            const input = prompt('How many empty drums were collected back from this delivery?', '5');
            if (input !== null) empties = parseInt(input) || 0;
        }
        this.store.updateDrumStatus(id, newStatus, empties);
        this.showToast('Drum order status updated to ' + newStatus, 'info');
        this.renderAll();
    }

    // ==========================================
    // RENDER: STORES & KHATA LEDGER
    // ==========================================
    renderStores() {
        const grid = document.getElementById('storesGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const search = (document.getElementById('storeSearch')?.value || '').toLowerCase();
        let stores = this.store.getStores();

        if (search) {
            stores = stores.filter(s => 
                (s.name && s.name.toLowerCase().includes(search)) ||
                (s.owner && s.owner.toLowerCase().includes(search)) ||
                (s.phone && s.phone.toLowerCase().includes(search))
            );
        }

        if (stores.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No stores registered yet. Click "+ Add New Store" to add your store clients!</div>';
            return;
        }

        stores.forEach(s => {
            const balanceDue = s.balanceDue || 0;
            const balanceClass = balanceDue > 0 ? 'fin-due' : 'fin-clear';
            const balanceText = balanceDue > 0 ? '₹' + balanceDue.toFixed(2) + ' Due (Left to Pay)' : 'All Paid / ₹0 Due ✓';

            const card = document.createElement('div');
            card.className = 'store-card';
            card.innerHTML = `
                <div class="store-header">
                    <div>
                        <div class="store-name">${s.name}</div>
                        <div class="store-owner">👤 ${s.owner || 'N/A'} • 📞 ${s.phone || 'N/A'}</div>
                        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">📍 ${s.address || 'No address'}</div>
                    </div>
                </div>

                <div class="store-financials">
                    <div class="fin-row">
                        <span style="color: var(--text-muted);">Total Bought (Billing)</span>
                        <span>₹${(s.totalBought || 0).toFixed(2)}</span>
                    </div>
                    <div class="fin-row">
                        <span style="color: var(--text-muted);">Total Paid (Received)</span>
                        <span style="color: #10b981; font-weight: 600;">₹${(s.totalPaid || 0).toFixed(2)}</span>
                    </div>
                    <div class="fin-row balance">
                        <span>Balance Left:</span>
                        <span class="${balanceClass}">${balanceText}</span>
                    </div>
                </div>

                <div class="store-actions-wrapper">
                    <button class="btn btn-primary btn-sm btn-block-action" onclick="app.openStatement('${s.id}')">📜 Statement / Khata</button>
                    <div class="store-sub-actions">
                        <button class="btn btn-success btn-sm btn-sub-action" onclick="app.openPaymentModal('${s.id}')">+ Payment</button>
                        <button class="btn btn-secondary btn-sm btn-sub-action" onclick="app.editStore('${s.id}')">✏️ Edit</button>
                        <button class="btn btn-outline-danger btn-sm del-btn" onclick="app.deleteStore('${s.id}')" title="Delete Store">🗑️</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // ==========================================
    // RENDER: DAILY REPORT
    // ==========================================
    setDailyReportToday() {
        const today = this.getTodayStr();
        const el = document.getElementById('dailyReportDate');
        if (el) el.value = today;
        this.renderDailyReport();
    }

    renderDailyReport() {
        const dateInput = document.getElementById('dailyReportDate');
        const selectedDate = dateInput ? dateInput.value || this.getTodayStr() : this.getTodayStr();

        const purchases = this.store.getPurchases().filter(p => p.date === selectedDate);
        const sales = this.store.getSales().filter(s => s.date === selectedDate);
        const drumOrders = this.store.getDrumOrders().filter(d => d.date === selectedDate);
        const payments = this.store.getPayments().filter(p => p.date === selectedDate);

        const inflowCost = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
        const inflowUnits = purchases.reduce((sum, p) => sum + (p.qty || 0), 0);

        const salesRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
        const drumRevenue = drumOrders.filter(d => d.status === 'Delivered').reduce((sum, d) => sum + (d.total || 0), 0);
        const totalOutflowRevenue = salesRevenue + drumRevenue;
        const totalOutflowUnits = sales.reduce((sum, s) => sum + (s.qty || 0), 0) + drumOrders.reduce((sum, d) => sum + (d.qty || 0), 0);

        let waterProfit = 0;
        let drinksProfit = 0;
        sales.forEach(s => {
            const prod = this.store.getProduct(s.productId);
            if (prod && prod.category === 'water') waterProfit += (s.profit || 0);
            else if (prod && prod.category === 'drinks') drinksProfit += (s.profit || 0);
            else waterProfit += (s.profit || 0);
        });

        const drumsDelivered = drumOrders.filter(d => d.status === 'Delivered').reduce((sum, d) => sum + (d.qty || 0), 0);
        const drumProfit = drumsDelivered * 23.00;

        const totalNetProfit = (waterProfit + drinksProfit + drumProfit);
        const paymentsCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        const setSafe = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setSafe('day-inflow-cost', '₹' + inflowCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        setSafe('day-inflow-units', inflowUnits + ' items arrived from factories');
        setSafe('day-outflow-revenue', '₹' + totalOutflowRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        setSafe('day-outflow-units', totalOutflowUnits + ' units delivered to stores');
        setSafe('day-net-profit', '₹' + totalNetProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        const margin = totalOutflowRevenue > 0 ? ((totalNetProfit / totalOutflowRevenue) * 100).toFixed(1) : 0;
        setSafe('day-profit-margin', 'Profit Margin: ' + margin + '%');
        setSafe('day-payments-collected', '₹' + paymentsCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        setSafe('day-payments-count', payments.length + ' store settlements recorded');
        setSafe('day-profit-water', '₹' + waterProfit.toFixed(2));
        setSafe('day-profit-drinks', '₹' + drinksProfit.toFixed(2));
        setSafe('day-profit-drums', '₹' + drumProfit.toFixed(2));
        setSafe('day-profit-total', '₹' + totalNetProfit.toFixed(2));

        const tbody = document.getElementById('dayTransactionsBody');
        if (tbody) {
            tbody.innerHTML = '';
            const combined = [];

            purchases.forEach(p => combined.push({
                type: 'INFLOW (Purchase)',
                entity: p.factory,
                item: p.productName,
                qty: '+' + p.qty,
                rate: '₹' + (p.rate || 0).toFixed(2),
                total: '-₹' + (p.total || 0).toFixed(2),
                profit: '-',
                badge: 'badge-info'
            }));

            sales.forEach(s => combined.push({
                type: 'OUTFLOW (Sale)',
                entity: s.storeName,
                item: s.productName,
                qty: '-' + s.qty,
                rate: '₹' + (s.rate || 0).toFixed(2),
                total: '+₹' + (s.total || 0).toFixed(2),
                profit: '+₹' + (s.profit || 0).toFixed(2),
                badge: 'badge-success'
            }));

            drumOrders.forEach(d => combined.push({
                type: 'OUTFLOW (20L Drum)',
                entity: d.customer,
                item: '20L Water Drum (' + d.status + ')',
                qty: '-' + d.qty,
                rate: '₹' + (d.rate || 0).toFixed(2),
                total: '+₹' + (d.total || 0).toFixed(2),
                profit: d.status === 'Delivered' ? '+₹' + (d.qty * 23).toFixed(2) : '-',
                badge: 'badge-purple'
            }));

            if (combined.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No activity recorded for this date.</td></tr>';
            } else {
                combined.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><span class="badge ${row.badge}">${row.type}</span></td>
                        <td><strong>${row.entity}</strong></td>
                        <td>${row.item}</td>
                        <td>${row.qty}</td>
                        <td>${row.rate}</td>
                        <td><strong>${row.total}</strong></td>
                        <td style="color: #10b981; font-weight: 700;">${row.profit}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }
    }

    // ==========================================
    // RENDER: DRIVERS, STAFF & MONTHLY SALARIES
    // ==========================================
    populateStaffMonthDropdown(selectId, currentSelected) {
        const select = document.getElementById(selectId);
        if (!select) return;
        select.innerHTML = '';

        const monthsSet = new Set();
        (this.store.data.staffDeliveries || []).forEach(d => {
            if (d.month) monthsSet.add(d.month);
            else if (d.date) monthsSet.add(d.date.substring(0, 7));
        });
        (this.store.data.staffMonthlySalaries || []).forEach(m => {
            if (m.month) monthsSet.add(m.month);
        });
        (this.store.data.sales || []).forEach(s => {
            if (s.date) monthsSet.add(s.date.substring(0, 7));
        });
        (this.store.data.drumOrders || []).forEach(d => {
            if (d.date) monthsSet.add(d.date.substring(0, 7));
        });

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        for (let i = -6; i <= 6; i++) {
            const d = new Date(currentYear, currentMonth + i, 1);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            monthsSet.add(`${yyyy}-${mm}`);
        }

        if (currentSelected) monthsSet.add(currentSelected);

        const sortedMonths = Array.from(monthsSet).sort().reverse();
        const curMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

        sortedMonths.forEach(val => {
            const [y, m] = val.split('-').map(Number);
            const d = new Date(y, m - 1, 1);
            const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
            
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = label + (val === curMonthStr ? ' (Current)' : '');
            if (val === currentSelected) opt.selected = true;
            select.appendChild(opt);
        });
    }

    onStaffSectionMonthChange() {
        const select = document.getElementById('staffSectionMonthSelect');
        if (select) {
            this.selectedStaffMonth = select.value;
            this.renderStaff();
        }
    }

    prevStaffMonth() {
        const [y, m] = this.selectedStaffMonth.split('-').map(Number);
        const d = new Date(y, m - 2, 1);
        this.selectedStaffMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        this.renderStaff();
    }

    nextStaffMonth() {
        const [y, m] = this.selectedStaffMonth.split('-').map(Number);
        const d = new Date(y, m, 1);
        this.selectedStaffMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        this.renderStaff();
    }

    filterStaff(role) {
        this.staffRoleFilter = role;
        document.querySelectorAll('#staffTabs .tab-btn').forEach(btn => {
            btn.classList.toggle('active', (role === 'all' && btn.textContent.includes('All Staff')) || btn.textContent.startsWith(role));
        });
        this.renderStaff();
    }

    renderStaff() {
        const month = this.selectedStaffMonth || this.getTodayStr().substring(0, 7);
        this.populateStaffMonthDropdown('staffSectionMonthSelect', month);

        const datalist = document.getElementById('staffList');
        if (datalist) {
            datalist.innerHTML = '';
            this.store.getStaffList().forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.name;
                datalist.appendChild(opt);
            });
        }

        let staffList = this.store.getStaffList();
        if (this.staffRoleFilter && this.staffRoleFilter !== 'all') {
            staffList = staffList.filter(s => s.role === this.staffRoleFilter);
        }

        let totalMonthFixed = 0;
        let totalMonthCommissions = 0;
        let totalMonthAdvances = 0;
        let totalMonthNet = 0;

        const tableBody = document.getElementById('staffSalaryTableBody');
        if (tableBody) tableBody.innerHTML = '';

        const grid = document.getElementById('staffGrid');
        if (grid) grid.innerHTML = '';

        if (staffList.length === 0) {
            if (tableBody) tableBody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding: 24px; color: var(--text-muted);">No staff registered in this filter. Click "+ Add New Staff" to add driver or helper.</td></tr>';
            if (grid) grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No staff registered. Click "+ Add New Staff" to get started.</div>';
        }

        staffList.forEach(s => {
            const roleBadge = s.role === 'Driver' ? 'badge-primary' : 'badge-info';
            const ratePerBox = s.role === 'Driver' ? 2 : 1;

            const deliveries = this.store.getStaffDeliveries(s.id, month);
            const totalBoxesDelivered = deliveries.reduce((sum, d) => sum + (d.boxCount || 0), 0);
            const totalCommissionEarned = deliveries.reduce((sum, d) => sum + (d.totalCommission || 0), 0);

            const monthSalary = this.store.getStaffMonthlySalary(s.id, month);
            const fixedSalary = monthSalary.fixedSalary !== undefined ? monthSalary.fixedSalary : (s.baseFixedSalary || 0);
            const advSalary = monthSalary.advanceSalary || 0;
            const extraIncome = monthSalary.extraIncome || 0;
            const paidAmount = monthSalary.paidAmount || 0;

            const netPayable = (fixedSalary + totalCommissionEarned + extraIncome) - advSalary;
            const balanceLeft = Math.max(0, netPayable - paidAmount);

            let statusBadge = '<span class="badge badge-warning">Pending</span>';
            if (paidAmount >= netPayable && netPayable > 0) {
                statusBadge = '<span class="badge badge-success">✓ Fully Paid</span>';
            } else if (paidAmount > 0) {
                statusBadge = '<span class="badge badge-info">Partial (₹' + paidAmount + ')</span>';
            }

            totalMonthFixed += fixedSalary;
            totalMonthCommissions += totalCommissionEarned;
            totalMonthAdvances += advSalary;
            totalMonthNet += netPayable;

            if (tableBody) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${s.name}</strong></td>
                    <td><span class="badge ${roleBadge}">${s.role}</span></td>
                    <td style="color: var(--text-muted);">₹${(s.baseFixedSalary || 0).toFixed(2)}</td>
                    <td><strong>₹${fixedSalary.toFixed(2)}</strong></td>
                    <td style="color: #10b981; font-weight: 700;">+₹${totalCommissionEarned.toFixed(2)} <span style="font-size: 0.75rem; color: var(--text-muted);">(${totalBoxesDelivered} boxes)</span></td>
                    <td style="color: #38bdf8;">+₹${extraIncome.toFixed(2)}</td>
                    <td style="color: #f87171;">-₹${advSalary.toFixed(2)}</td>
                    <td style="color: #10b981; font-weight: 800; font-size: 1.05rem;">₹${netPayable.toFixed(2)}</td>
                    <td style="color: #38bdf8;">₹${paidAmount.toFixed(2)}</td>
                    <td style="color: ${balanceLeft > 0 ? '#ef4444' : '#10b981'}; font-weight: 700;">₹${balanceLeft.toFixed(2)}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                            <button class="btn btn-primary btn-sm" onclick="app.openStaffLedger('${s.id}', '${month}')" title="View/Edit full month salary & delivery trips">📜 Ledger & Salary</button>
                            <button class="btn btn-secondary btn-sm" onclick="app.editStaff('${s.id}')" title="Edit Staff Info">✏️</button>
                            <button class="btn btn-outline-danger btn-sm" onclick="app.deleteStaff('${s.id}')" title="Delete Staff">🗑️</button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(tr);
            }

            if (grid) {
                const card = document.createElement('div');
                card.className = 'store-card';
                card.innerHTML = `
                    <div class="store-header">
                        <div>
                            <div class="store-name">${s.name}</div>
                            <div class="store-owner"><span class="badge ${roleBadge}">${s.role}</span> • 📞 ${s.phone || 'No phone'}</div>
                        </div>
                        <div>${statusBadge}</div>
                    </div>
                    <div class="store-financials">
                        <div class="fin-row">
                            <span style="color: var(--text-muted);">Month Fixed Salary:</span>
                            <span>₹${fixedSalary.toFixed(2)}</span>
                        </div>
                        <div class="fin-row">
                            <span style="color: var(--text-muted);">Earned Commission (${ratePerBox}₹/box):</span>
                            <span style="color: #10b981; font-weight: 600;">+₹${totalCommissionEarned.toFixed(2)} (${totalBoxesDelivered} boxes)</span>
                        </div>
                        <div class="fin-row">
                            <span style="color: var(--text-muted);">Extra / Advance (+/-):</span>
                            <span>+₹${extraIncome.toFixed(2)} / -₹${advSalary.toFixed(2)}</span>
                        </div>
                        <div class="fin-row balance">
                            <span>Net Payable Month:</span>
                            <span style="color: #10b981; font-size: 1.1rem;">₹${netPayable.toFixed(2)}</span>
                        </div>
                        <div class="fin-row" style="font-size: 0.8rem;">
                            <span style="color: var(--text-muted);">Paid / Balance Left:</span>
                            <span>₹${paidAmount.toFixed(2)} / <strong style="color: ${balanceLeft > 0 ? '#ef4444' : '#10b981'}">₹${balanceLeft.toFixed(2)}</strong></span>
                        </div>
                    </div>
                    <div class="store-actions-wrapper">
                        <button class="btn btn-primary btn-sm btn-block-action" onclick="app.openStaffLedger('${s.id}', '${month}')">📜 View Ledger & Salary</button>
                        <div class="store-sub-actions">
                            <button class="btn btn-secondary btn-sm btn-sub-action" onclick="app.editStaff('${s.id}')" title="Edit Staff">✏️ Edit Staff</button>
                            <button class="btn btn-outline-danger btn-sm del-btn" onclick="app.deleteStaff('${s.id}')" title="Delete Staff">🗑️</button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            }
        });

        const setSafe = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setSafe('staff-kpi-count', staffList.length + ' Staff');
        setSafe('staff-kpi-fixed', '₹' + totalMonthFixed.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        setSafe('staff-kpi-comm', '₹' + totalMonthCommissions.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        setSafe('staff-kpi-adv', '₹' + totalMonthAdvances.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        setSafe('staff-kpi-net', '₹' + totalMonthNet.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
    }

    // Staff Add / Edit
    openStaffModal(staff = null) {
        if (!this.canPerform('canEditStaff', 'Drivers & Staff Management')) return;
        document.getElementById('staffForm')?.reset();
        if (staff) {
            document.getElementById('staffModalTitle').textContent = 'Edit Staff Details';
            document.getElementById('staffId').value = staff.id;
            document.getElementById('staffName').value = staff.name;
            document.getElementById('staffRole').value = staff.role;
            document.getElementById('staffFixedSalary').value = staff.baseFixedSalary || 0;
        } else {
            document.getElementById('staffModalTitle').textContent = 'Add New Staff (Driver / Helper)';
            document.getElementById('staffId').value = '';
            document.getElementById('staffFixedSalary').value = 10000;
        }
        this.openModal('staffModal');
    }

    editStaff(id) {
        const s = this.store.getStaff(id);
        if (s) this.openStaffModal(s);
    }

    deleteStaff(id) {
        if (!this.canPerform('canEditStaff', 'Drivers & Staff Management')) return;
        const s = this.store.getStaff(id);
        if (!s) return;
        if (confirm(`Are you sure you want to delete ${s.name} (${s.role})? All delivery logs and salary records will be deleted.`)) {
            this.store.deleteStaff(id);
            this.showToast('Staff removed', 'info');
            this.renderAll();
        }
    }

    handleStaffSubmit(e) {
        e.preventDefault();
        if (!this.canPerform('canEditStaff', 'Drivers & Staff Management', 'Save Staff Details')) return;
        const id = document.getElementById('staffId').value;
        const data = {
            name: document.getElementById('staffName').value.trim(),
            role: document.getElementById('staffRole').value,
            baseFixedSalary: parseFloat(document.getElementById('staffFixedSalary').value) || 0
        };

        if (id) {
            this.store.updateStaff(id, data);
            this.showToast('Staff updated successfully', 'success');
        } else {
            this.store.addStaff(data);
            this.showToast(`New ${data.role} ${data.name} added!`, 'success');
        }
        this.closeModal('staffModal');
        this.renderAll();
    }

    // ==========================================
    // STAFF LEDGER & MONTHLY WORK LOG CONTROLLER
    // ==========================================
    openStaffLedger(id, month = null) {
        const staff = this.store.getStaff(id);
        if (!staff) return;

        this.selectedLedgerStaffId = id;
        this.selectedLedgerMonth = month || this.selectedStaffMonth || this.getTodayStr().substring(0, 7);

        document.getElementById('staffLedgerTitle').textContent = `${staff.name} (${staff.role}) — Work Log & Salary Structure`;
        document.getElementById('ledgerStaffId').value = staff.id;

        const roleBadge = document.getElementById('ledgerRoleBadge');
        if (roleBadge) {
            roleBadge.innerHTML = `<span class="badge ${staff.role === 'Driver' ? 'badge-primary' : 'badge-info'}" style="font-size: 0.85rem; padding: 6px 12px;">🚚 ${staff.role} (Commission: ₹${staff.role === 'Driver' ? '2' : '1'} / Box)</span>`;
        }

        this.populateStaffMonthDropdown('ledgerMonthSelect', this.selectedLedgerMonth);
        this.loadLedgerMonthData();
        this.openModal('staffLedgerModal');
    }

    onLedgerMonthChange() {
        const select = document.getElementById('ledgerMonthSelect');
        if (select) {
            this.selectedLedgerMonth = select.value;
            this.loadLedgerMonthData();
        }
    }

    prevLedgerMonth() {
        const [y, m] = this.selectedLedgerMonth.split('-').map(Number);
        const d = new Date(y, m - 2, 1);
        this.selectedLedgerMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        this.populateStaffMonthDropdown('ledgerMonthSelect', this.selectedLedgerMonth);
        this.loadLedgerMonthData();
    }

    nextLedgerMonth() {
        const [y, m] = this.selectedLedgerMonth.split('-').map(Number);
        const d = new Date(y, m, 1);
        this.selectedLedgerMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        this.populateStaffMonthDropdown('ledgerMonthSelect', this.selectedLedgerMonth);
        this.loadLedgerMonthData();
    }

    loadLedgerMonthData() {
        const staffId = this.selectedLedgerStaffId;
        const month = this.selectedLedgerMonth;
        const staff = this.store.getStaff(staffId);
        if (!staff) return;

        const [y, m] = month.split('-').map(Number);
        const monthDate = new Date(y, m - 1, 1);
        const monthName = monthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        
        const monthLabelEl = document.getElementById('ledgerSelectedMonthLabel');
        if (monthLabelEl) monthLabelEl.textContent = monthName;

        const monthSalary = this.store.getStaffMonthlySalary(staffId, month);
        const deliveries = this.store.getStaffDeliveries(staffId, month);

        const totalTrips = deliveries.length;
        const totalBoxes = deliveries.reduce((sum, d) => sum + (parseFloat(d.boxCount) || 0), 0);
        const totalCommission = deliveries.reduce((sum, d) => sum + (parseFloat(d.totalCommission) || 0), 0);
        const totalVolume = deliveries.reduce((sum, d) => sum + (parseFloat(d.orderAmount) || 0), 0);

        // Update KPI Badges
        const kpiTrips = document.getElementById('ledgerKpiTrips');
        if (kpiTrips) kpiTrips.textContent = `${totalTrips} ${totalTrips === 1 ? 'Trip' : 'Trips'}`;

        const kpiTripsSub = document.getElementById('ledgerKpiTripsSub');
        if (kpiTripsSub) kpiTripsSub.textContent = `In ${monthName}`;

        const kpiBoxes = document.getElementById('ledgerCommissionBoxes');
        if (kpiBoxes) kpiBoxes.textContent = `${totalBoxes.toFixed(1)} ${staff.role === 'Driver' ? 'Boxes/Drums' : 'Boxes'}`;

        const kpiVolume = document.getElementById('ledgerKpiVolume');
        if (kpiVolume) kpiVolume.textContent = '₹' + totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 });

        const kpiComm = document.getElementById('ledgerCommission');
        if (kpiComm) kpiComm.textContent = '+₹' + totalCommission.toFixed(2);

        const rateHint = document.getElementById('ledgerRateHint');
        if (rateHint) rateHint.textContent = `${staff.role}: ₹${staff.role === 'Driver' ? '2' : '1'} / Box`;

        // Monthly Fixed Salary Fields
        const fixedSalaryInput = document.getElementById('ledgerFixedSalaryInput');
        if (fixedSalaryInput) {
            fixedSalaryInput.value = monthSalary.fixedSalary !== undefined ? monthSalary.fixedSalary : (staff.baseFixedSalary || 0);
        }
        const advInput = document.getElementById('ledgerAdvSalary');
        if (advInput) advInput.value = monthSalary.advanceSalary || 0;

        const extraInput = document.getElementById('ledgerExtraIncome');
        if (extraInput) extraInput.value = monthSalary.extraIncome || 0;

        const paidInput = document.getElementById('ledgerPaidAmount');
        if (paidInput) paidInput.value = monthSalary.paidAmount || '';

        const paidDateInput = document.getElementById('ledgerPaidDate');
        if (paidDateInput) paidDateInput.value = monthSalary.paidDate || this.getTodayStr();

        const payModeInput = document.getElementById('ledgerPaymentMode');
        if (payModeInput) payModeInput.value = monthSalary.paymentMode || 'Cash';

        const payNoteInput = document.getElementById('ledgerPaymentNote');
        if (payNoteInput) payNoteInput.value = monthSalary.notes || '';

        this.calcStaffLedgerTotals();

        // Render Work Log Table Body & Footer
        const tbody = document.getElementById('staffLedgerBody');
        const tfoot = document.getElementById('staffLedgerFoot');
        if (tbody) {
            tbody.innerHTML = '';
            if (deliveries.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align:center; padding: 28px 14px; color: var(--text-muted);">
                            <div style="font-size: 1.1rem; margin-bottom: 6px; color: #38bdf8;">📭 No work / delivery logs recorded in ${monthName}</div>
                            <div style="font-size: 0.82rem; margin-bottom: 12px;">Deliveries from Store Sales & 20L Drum Orders will appear here automatically, or you can record a delivery trip manually.</div>
                            <button type="button" class="btn btn-primary btn-sm" onclick="app.openManualTripModal()">+ Add Delivery Trip for ${monthName}</button>
                        </td>
                    </tr>
                `;
                if (tfoot) tfoot.innerHTML = '';
            } else {
                deliveries.sort((a, b) => new Date(b.date || '') - new Date(a.date || ''));
                deliveries.forEach(d => {
                    const tr = document.createElement('tr');
                    const badgeClass = d.source === '20L Drum Delivery' ? 'badge-purple' : (d.source === 'Store Sale' ? 'badge-primary' : 'badge-info');
                    const cargo = d.productsSummary || `${d.boxCount} Boxes Delivery`;
                    const orderAmt = d.orderAmount ? '₹' + parseFloat(d.orderAmount).toFixed(2) : '-';
                    const comm = parseFloat(d.totalCommission) || (parseFloat(d.boxCount || 0) * (parseFloat(d.ratePerBox) || (staff.role === 'Driver' ? 2 : 1)));
                    
                    tr.innerHTML = `
                        <td><strong>${d.date || 'N/A'}</strong></td>
                        <td><strong style="color: #f8fafc;">${d.storeName || 'Direct Customer'}</strong></td>
                        <td style="color: var(--text-secondary); max-width: 220px; word-break: break-word;">${cargo}</td>
                        <td><span class="badge badge-warning" style="font-weight: 700; font-size: 0.82rem;">${d.boxCount} Boxes</span></td>
                        <td style="color: #38bdf8; font-weight: 600;">${orderAmt}</td>
                        <td style="color: #10b981; font-weight: 700;">+₹${comm.toFixed(2)}</td>
                        <td><span class="badge ${badgeClass}" style="font-size: 0.72rem;">${d.source || 'Delivery'}</span></td>
                        <td>
                            <button class="btn btn-outline-danger btn-sm" onclick="app.deleteStaffDelivery('${d.id}')" title="Delete Trip Record">🗑️</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                if (tfoot) {
                    tfoot.innerHTML = `
                        <tr>
                            <td colspan="3" style="text-align: right; padding: 10px 14px; color: #38bdf8; font-size: 0.88rem;">
                                <strong>TOTAL FOR ${monthName.toUpperCase()}:</strong>
                            </td>
                            <td style="color: #f59e0b; font-size: 0.95rem;">${totalBoxes.toFixed(1)} Boxes</td>
                            <td style="color: #38bdf8; font-size: 0.95rem;">₹${totalVolume.toFixed(2)}</td>
                            <td style="color: #10b981; font-size: 1.05rem;">+₹${totalCommission.toFixed(2)}</td>
                            <td colspan="2" style="font-size: 0.78rem; color: var(--text-muted);">${totalTrips} Total Trips</td>
                        </tr>
                    `;
                }
            }
        }

        this.renderStaffMonthHistory(staffId);
    }

    renderStaffMonthHistory(staffId) {
        const tbody = document.getElementById('staffMonthHistoryBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const staff = this.store.getStaff(staffId);
        if (!staff) return;

        const monthsSet = new Set();
        (this.store.data.staffDeliveries || []).filter(d => d.staffId === staffId).forEach(d => {
            if (d.month) monthsSet.add(d.month);
            else if (d.date) monthsSet.add(d.date.substring(0, 7));
        });
        (this.store.data.staffMonthlySalaries || []).filter(m => m.staffId === staffId).forEach(m => {
            if (m.month) monthsSet.add(m.month);
        });

        monthsSet.add(this.getTodayStr().substring(0, 7));
        if (this.selectedLedgerMonth) monthsSet.add(this.selectedLedgerMonth);

        const sortedMonths = Array.from(monthsSet).sort().reverse();

        sortedMonths.forEach(m => {
            const mSalary = this.store.getStaffMonthlySalary(staffId, m);
            const mDeliveries = this.store.getStaffDeliveries(staffId, m);

            const mBoxes = mDeliveries.reduce((sum, d) => sum + (parseFloat(d.boxCount) || 0), 0);
            const mCommission = mDeliveries.reduce((sum, d) => sum + (parseFloat(d.totalCommission) || 0), 0);

            const fixed = mSalary.fixedSalary !== undefined ? mSalary.fixedSalary : (staff.baseFixedSalary || 0);
            const adv = mSalary.advanceSalary || 0;
            const extra = mSalary.extraIncome || 0;
            const paid = mSalary.paidAmount || 0;

            const net = (fixed + mCommission + extra) - adv;
            const bal = Math.max(0, net - paid);

            let status = '<span class="badge badge-warning">Pending</span>';
            if (paid >= net && net > 0) status = '<span class="badge badge-success">Paid ✓</span>';
            else if (paid > 0) status = '<span class="badge badge-info">Partial</span>';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${m}</strong> ${m === this.selectedLedgerMonth ? '<span class="badge badge-primary" style="font-size:0.65rem;">Active</span>' : ''}</td>
                <td>₹${fixed.toFixed(2)}</td>
                <td style="color:#10b981;">₹${mCommission.toFixed(2)} (${mBoxes.toFixed(0)} boxes)</td>
                <td style="color:#38bdf8;">₹${extra.toFixed(2)}</td>
                <td style="color:#f87171;">₹${adv.toFixed(2)}</td>
                <td style="color:#10b981; font-weight:700;">₹${net.toFixed(2)}</td>
                <td>₹${paid.toFixed(2)}</td>
                <td style="color:${bal > 0 ? '#ef4444' : '#10b981'};">₹${bal.toFixed(2)}</td>
                <td>${status}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="app.switchLedgerMonth('${m}')" title="View this month work log">View 📜</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    switchLedgerMonth(month) {
        this.selectedLedgerMonth = month;
        const select = document.getElementById('ledgerMonthSelect');
        if (select) select.value = month;
        this.loadLedgerMonthData();
    }

    calcStaffLedgerTotals() {
        const staffId = this.selectedLedgerStaffId;
        const month = this.selectedLedgerMonth;
        const staff = this.store.getStaff(staffId);
        if (!staff) return;

        const deliveries = this.store.getStaffDeliveries(staffId, month);
        const totalCommission = deliveries.reduce((sum, d) => sum + (parseFloat(d.totalCommission) || 0), 0);

        const fixed = parseFloat(document.getElementById('ledgerFixedSalaryInput')?.value) || 0;
        const adv = parseFloat(document.getElementById('ledgerAdvSalary')?.value) || 0;
        const extra = parseFloat(document.getElementById('ledgerExtraIncome')?.value) || 0;
        const paid = parseFloat(document.getElementById('ledgerPaidAmount')?.value) || 0;

        const net = (fixed + totalCommission + extra) - adv;
        const bal = Math.max(0, net - paid);

        const netEl = document.getElementById('ledgerNetPayable');
        if (netEl) netEl.textContent = '₹' + net.toFixed(2);

        const balEl = document.getElementById('ledgerMonthBalanceLeft');
        if (balEl) {
            balEl.textContent = '₹' + bal.toFixed(2);
            balEl.style.color = bal > 0 ? '#ef4444' : '#10b981';
        }

        const statusBadge = document.getElementById('ledgerMonthStatusBadge');
        if (statusBadge) {
            if (paid >= net && net > 0) {
                statusBadge.className = 'badge badge-success';
                statusBadge.textContent = 'Fully Paid ✓';
            } else if (paid > 0) {
                statusBadge.className = 'badge badge-info';
                statusBadge.textContent = 'Partial Paid';
            } else {
                statusBadge.className = 'badge badge-warning';
                statusBadge.textContent = 'Pending';
            }
        }
    }

    saveStaffMonthlySalary() {
        if (!this.canPerform('canEditStaff', 'Drivers & Staff Management')) return;
        const staffId = this.selectedLedgerStaffId;
        const month = this.selectedLedgerMonth;
        const staff = this.store.getStaff(staffId);
        if (!staff) return;

        const fixed = parseFloat(document.getElementById('ledgerFixedSalaryInput')?.value) || 0;
        const adv = parseFloat(document.getElementById('ledgerAdvSalary')?.value) || 0;
        const extra = parseFloat(document.getElementById('ledgerExtraIncome')?.value) || 0;
        const paid = parseFloat(document.getElementById('ledgerPaidAmount')?.value) || 0;
        const paidDate = document.getElementById('ledgerPaidDate')?.value;
        const paymentMode = document.getElementById('ledgerPaymentMode')?.value;
        const notes = document.getElementById('ledgerPaymentNote')?.value.trim();

        const deliveries = this.store.getStaffDeliveries(staffId, month);
        const totalCommission = deliveries.reduce((sum, d) => sum + (parseFloat(d.totalCommission) || 0), 0);
        const net = (fixed + totalCommission + extra) - adv;

        let status = 'Pending';
        if (paid >= net && net > 0) status = 'Paid';
        else if (paid > 0) status = 'Partial';

        this.store.saveStaffMonthlySalary({
            staffId: staffId,
            month: month,
            fixedSalary: fixed,
            advanceSalary: adv,
            extraIncome: extra,
            paidAmount: paid,
            paidDate: paidDate,
            paymentMode: paymentMode,
            notes: notes,
            status: status
        });

        this.showToast(`Saved monthly salary for ${staff.name} (${month})!`, 'success');
        this.renderStaff();
        this.renderStaffMonthHistory(staffId);
    }

    openManualTripModal() {
        if (!this.canPerform('canEditStaff', 'Drivers & Staff Management')) return;
        const staffId = this.selectedLedgerStaffId;
        const staff = this.store.getStaff(staffId);
        if (!staff) return;

        document.getElementById('manualTripForm')?.reset();
        document.getElementById('manualTripModalTitle').textContent = `Add Delivery Trip — ${staff.name} (${staff.role})`;
        
        // Populate store datalist
        const datalist = document.getElementById('tripStoreDatalist');
        if (datalist) {
            datalist.innerHTML = '';
            this.store.getStores().forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.name;
                datalist.appendChild(opt);
            });
        }

        // Set date to today or 1st of selected ledger month
        const nowMonth = this.getTodayStr().substring(0, 7);
        if (this.selectedLedgerMonth === nowMonth) {
            document.getElementById('tripDate').value = this.getTodayStr();
        } else {
            document.getElementById('tripDate').value = `${this.selectedLedgerMonth}-01`;
        }

        const defaultRate = staff.role === 'Driver' ? 2 : 1;
        document.getElementById('tripRatePerBox').value = defaultRate;
        document.getElementById('tripBoxCount').value = 10;
        document.getElementById('tripOrderAmount').value = '';
        this.calcManualTripCommission();
        this.openModal('manualTripModal');
    }

    calcManualTripCommission() {
        const boxes = parseFloat(document.getElementById('tripBoxCount')?.value) || 0;
        const rate = parseFloat(document.getElementById('tripRatePerBox')?.value) || 0;
        const preview = document.getElementById('tripCommissionPreview');
        if (preview) preview.textContent = '₹' + (boxes * rate).toFixed(2);
    }

    handleManualTripSubmit(e) {
        e.preventDefault();
        if (!this.canPerform('canEditStaff', 'Drivers & Staff Management', 'Add Delivery Trip')) return;
        const staffId = this.selectedLedgerStaffId;
        const staff = this.store.getStaff(staffId);
        if (!staff) return;

        const date = document.getElementById('tripDate')?.value || this.getTodayStr();
        const month = date.substring(0, 7);
        const storeName = document.getElementById('tripStoreName')?.value.trim() || 'Direct Customer';
        const products = document.getElementById('tripProducts')?.value.trim() || '';
        const boxes = parseFloat(document.getElementById('tripBoxCount')?.value) || 0;
        const rate = parseFloat(document.getElementById('tripRatePerBox')?.value) || (staff.role === 'Driver' ? 2 : 1);
        const orderAmount = parseFloat(document.getElementById('tripOrderAmount')?.value) || 0;

        this.store.addStaffDelivery({
            staffId: staff.id,
            staffName: staff.name,
            role: staff.role,
            date: date,
            month: month,
            storeName: storeName,
            productsSummary: products || `${boxes} Boxes Delivery`,
            boxCount: boxes,
            orderAmount: orderAmount,
            ratePerBox: rate,
            totalCommission: boxes * rate,
            source: 'Manual Entry'
        });

        this.showToast(`Trip recorded for ${staff.name}: ${boxes} boxes (+₹${(boxes * rate).toFixed(2)})`, 'success');
        this.closeModal('manualTripModal');
        
        this.selectedLedgerMonth = month;
        this.populateStaffMonthDropdown('ledgerMonthSelect', this.selectedLedgerMonth);
        this.loadLedgerMonthData();
        this.renderStaff();
    }

    deleteStaffDelivery(id) {
        if (!this.canPerform('canEditStaff', 'Drivers & Staff Management')) return;
        if (confirm('Delete this delivery trip record?')) {
            this.store.deleteStaffDelivery(id);
            this.showToast('Delivery trip deleted', 'info');
            this.loadLedgerMonthData();
            this.renderStaff();
        }
    }

    // ==========================================
    // MODAL HANDLERS & HELPERS
    // ==========================================
    openModal(id) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('active');
            el.style.display = 'flex';
        }
    }

    closeModal(id) {
        if (id) {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('active');
                el.style.display = 'none';
            }
        } else {
            document.querySelectorAll('.modal-overlay.active').forEach(m => {
                m.classList.remove('active');
                m.style.display = 'none';
            });
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        const icon = type === 'success' ? '✓' : (type === 'error' ? '⚠️' : 'ℹ️');
        toast.innerHTML = '<span>' + icon + '</span><span>' + message + '</span>';
        container.appendChild(toast);
        setTimeout(() => {
            if (toast && toast.remove) toast.remove();
        }, 3500);
    }

    populateProductSelect(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        select.innerHTML = '<option value="">-- Select Product --</option>';
        this.store.getProducts().forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name} (${p.size || ''}) [${p.unitsPerBox || 24} / Box] — Stock: ${p.stock || 0}`;
            select.appendChild(opt);
        });
    }

    populateStoreSelect(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        select.innerHTML = '<option value="">-- Select Store / Retailer --</option>';
        this.store.getStores().forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `${s.name} (Due: ₹${(s.balanceDue || 0).toFixed(2)})`;
            select.appendChild(opt);
        });
    }

    // ==========================================
    // PRODUCT MODAL
    // ==========================================
    openProductModal(prod = null) {
        if (!this.canPerform('canEditProducts', 'Products & Stock')) return;
        document.getElementById('productForm')?.reset();
        if (prod) {
            document.getElementById('productModalTitle').textContent = 'Edit Product';
            document.getElementById('productId').value = prod.id;
            document.getElementById('productCategory').value = prod.category;
            document.getElementById('productName').value = prod.name;
            document.getElementById('productSize').value = prod.size || '';
            document.getElementById('productUnitsPerBox').value = prod.unitsPerBox || 24;
            document.getElementById('productStock').value = prod.stock || 0;
            document.getElementById('productStockBoxes').value = ((prod.stock || 0) / (prod.unitsPerBox || 24)).toFixed(1);
            document.getElementById('productBuyPrice').value = prod.buyPrice;
            document.getElementById('productSellPrice').value = prod.sellPrice;
        } else {
            document.getElementById('productModalTitle').textContent = 'Add New Product';
            document.getElementById('productId').value = '';
            document.getElementById('productUnitsPerBox').value = 24;
            document.getElementById('productStockBoxes').value = 10;
            document.getElementById('productStock').value = 240;
            document.getElementById('productBuyPrice').value = 5.50;
            document.getElementById('productSellPrice').value = 10.00;
        }
        this.calcProductProfit();
        this.openModal('productModal');
    }

    editProduct(id) {
        const p = this.store.getProduct(id);
        if (p) this.openProductModal(p);
    }

    deleteProduct(id) {
        if (!this.canPerform('canEditProducts', 'Products & Stock')) return;
        if (confirm('Are you sure you want to delete this product?')) {
            this.store.deleteProduct(id);
            this.showToast('Product deleted!', 'info');
            this.renderAll();
        }
    }

    onProductCategoryChange() {
        const cat = document.getElementById('productCategory')?.value;
        const sizeInput = document.getElementById('productSize');
        if (cat === 'drums' && sizeInput) sizeInput.value = '20L Drum';
    }

    calcProductStockFromBoxes() {
        const boxes = parseFloat(document.getElementById('productStockBoxes')?.value) || 0;
        const unitsPerBox = parseInt(document.getElementById('productUnitsPerBox')?.value) || 24;
        const total = Math.round(boxes * unitsPerBox);
        const stockEl = document.getElementById('productStock');
        if (stockEl) stockEl.value = total;
        this.calcProductProfit();
    }

    calcProductStockFromUnits() {
        const units = parseInt(document.getElementById('productStock')?.value) || 0;
        const unitsPerBox = parseInt(document.getElementById('productUnitsPerBox')?.value) || 24;
        const boxesEl = document.getElementById('productStockBoxes');
        if (boxesEl) boxesEl.value = (units / unitsPerBox).toFixed(1);
        this.calcProductProfit();
    }

    calcProductProfit() {
        const buy = parseFloat(document.getElementById('productBuyPrice')?.value) || 0;
        const sell = parseFloat(document.getElementById('productSellPrice')?.value) || 0;
        const unitsPerBox = parseInt(document.getElementById('productUnitsPerBox')?.value) || 24;
        const diff = sell - buy;
        const boxDiff = diff * unitsPerBox;

        const preview = document.getElementById('productProfitPreview');
        if (preview) {
            preview.textContent = '₹' + diff.toFixed(2) + (sell > 0 ? ' (' + ((diff / sell) * 100).toFixed(1) + '%)' : '');
            preview.style.color = diff >= 0 ? '#10b981' : '#ef4444';
        }

        const boxPreview = document.getElementById('productBoxProfitPreview');
        const boxLabel = document.getElementById('productUnitsPerBoxLabel');
        if (boxLabel) boxLabel.textContent = unitsPerBox;
        if (boxPreview) boxPreview.textContent = '₹' + boxDiff.toFixed(2);
    }

    handleProductSubmit(e) {
        e.preventDefault();
        if (!this.canPerform('canEditProducts', 'Products & Stock', 'Save Product')) return;
        const id = document.getElementById('productId')?.value;
        const unitsPerBox = parseInt(document.getElementById('productUnitsPerBox')?.value) || 24;
        const data = {
            category: document.getElementById('productCategory')?.value,
            name: document.getElementById('productName')?.value.trim(),
            size: document.getElementById('productSize')?.value.trim(),
            unitsPerBox: unitsPerBox,
            stock: parseInt(document.getElementById('productStock')?.value) || 0,
            buyPrice: parseFloat(document.getElementById('productBuyPrice')?.value) || 0,
            sellPrice: parseFloat(document.getElementById('productSellPrice')?.value) || 0
        };

        if (id) {
            this.store.updateProduct(id, data);
            this.showToast('Product updated successfully!', 'success');
        } else {
            this.store.addProduct(data);
            this.showToast('Product added to inventory!', 'success');
        }
        this.closeModal('productModal');
        this.renderAll();
    }

    // ==========================================
    // PURCHASE MODAL (FACTORY INFLOW)
    // ==========================================
    openPurchaseModal() {
        if (!this.canPerform('canEditPurchases', 'Factory Purchases')) return;
        document.getElementById('purchaseForm')?.reset();
        document.getElementById('purchaseDate').value = this.getTodayStr();
        this.populateProductSelect('purchaseProduct');
        document.getElementById('purchaseTotalPreview').textContent = '₹0.00';
        this.openModal('purchaseModal');
    }

    onPurchaseProductChange() {
        const pid = document.getElementById('purchaseProduct')?.value;
        const p = this.store.getProduct(pid);
        if (p) {
            document.getElementById('purchaseRate').value = p.buyPrice;
            const unitsPerBox = p.unitsPerBox || 24;
            document.getElementById('purchaseBoxRate').value = (p.buyPrice * unitsPerBox).toFixed(2);
            this.calcPurchaseTotal();
        }
    }

    onPurchaseBoxInput() {
        const boxes = parseFloat(document.getElementById('purchaseBoxCount')?.value) || 0;
        const pid = document.getElementById('purchaseProduct')?.value;
        const p = this.store.getProduct(pid);
        const unitsPerBox = p ? (p.unitsPerBox || 24) : 24;
        document.getElementById('purchaseQty').value = Math.round(boxes * unitsPerBox);
        this.calcPurchaseTotal();
    }

    onPurchaseUnitInput() {
        const qty = parseInt(document.getElementById('purchaseQty')?.value) || 0;
        const pid = document.getElementById('purchaseProduct')?.value;
        const p = this.store.getProduct(pid);
        const unitsPerBox = p ? (p.unitsPerBox || 24) : 24;
        document.getElementById('purchaseBoxCount').value = (qty / unitsPerBox).toFixed(1);
        this.calcPurchaseTotal();
    }

    onPurchaseBoxRateInput() {
        const boxRate = parseFloat(document.getElementById('purchaseBoxRate')?.value) || 0;
        const pid = document.getElementById('purchaseProduct')?.value;
        const p = this.store.getProduct(pid);
        const unitsPerBox = p ? (p.unitsPerBox || 24) : 24;
        if (unitsPerBox > 0) {
            document.getElementById('purchaseRate').value = (boxRate / unitsPerBox).toFixed(2);
        }
        this.calcPurchaseTotal();
    }

    calcPurchaseTotal() {
        const qty = parseFloat(document.getElementById('purchaseQty')?.value) || 0;
        const rate = parseFloat(document.getElementById('purchaseRate')?.value) || 0;
        const total = qty * rate;
        const el = document.getElementById('purchaseTotalPreview');
        if (el) el.textContent = '₹' + total.toFixed(2);
    }

    handlePurchaseSubmit(e) {
        e.preventDefault();
        if (!this.canPerform('canEditPurchases', 'Factory Purchases', 'Save Factory Purchase')) return;
        const pid = document.getElementById('purchaseProduct')?.value;
        const p = this.store.getProduct(pid);
        const qty = parseInt(document.getElementById('purchaseQty')?.value) || 0;
        const rate = parseFloat(document.getElementById('purchaseRate')?.value) || 0;

        this.store.addPurchase({
            date: document.getElementById('purchaseDate')?.value,
            factory: document.getElementById('purchaseFactory')?.value.trim(),
            productId: pid,
            productName: p ? `${p.name} (${p.size || ''})` : 'Custom Product',
            qty: qty,
            rate: rate,
            total: qty * rate,
            notes: document.getElementById('purchaseNotes')?.value.trim()
        });

        this.showToast('Factory stock recorded and stock updated!', 'success');
        this.closeModal('purchaseModal');
        this.renderAll();
    }

    deletePurchase(id) {
        if (!this.canPerform('canEditPurchases', 'Factory Purchases')) return;
        if (confirm('Delete this purchase? Stock will be reversed.')) {
            this.store.deletePurchase(id);
            this.showToast('Purchase deleted and stock updated.', 'info');
            this.renderAll();
        }
    }

    // ==========================================
    // SALE MODAL (STORE OUTFLOW & TEAM COMMISSION)
    // ==========================================
    openSaleModal() {
        if (!this.canPerform('canEditSales', 'Store Sales')) return;
        document.getElementById('saleForm')?.reset();
        document.getElementById('saleDate').value = this.getTodayStr();
        this.populateStoreSelect('saleStore');

        const itemsList = document.getElementById('saleOrderItemsList');
        if (itemsList) {
            itemsList.innerHTML = '';
            this.addSaleItemRow();
        }

        // Clean extra helper rows back to 1 helper
        const container = document.getElementById('driverRowsContainer');
        if (container) {
            const helperGroups = container.querySelectorAll('.helper-group');
            helperGroups.forEach((hg, idx) => {
                if (idx > 0) hg.remove();
            });
        }

        const drivers = this.store.getStaffList().filter(s => s.role === 'Driver');
        const helpers = this.store.getStaffList().filter(s => s.role === 'Helper');
        this.populateStaffSelect('saleDriver1', 'Driver', drivers[0]?.name || '');
        this.populateStaffSelect('saleDriver2', 'Helper', helpers[0]?.name || '');

        this.onSalePaymentStatusChange();
        this.calcSaleCalculations();
        this.openModal('saleModal');
    }

    populateStaffSelect(selectEl, roleFilter = null, selectedValue = '') {
        if (typeof selectEl === 'string') selectEl = document.getElementById(selectEl);
        if (!selectEl) return;
        
        const staffList = this.store.getStaffList() || [];
        const label = roleFilter ? (roleFilter === 'Driver' ? 'Driver' : 'Helper') : 'Staff';
        
        let html = `<option value="">-- Select ${label} --</option>`;
        
        const matching = roleFilter ? staffList.filter(s => s.role === roleFilter) : staffList;
        const others = roleFilter ? staffList.filter(s => s.role !== roleFilter) : [];
        
        matching.forEach(s => {
            const isSelected = selectedValue && s.name.trim().toLowerCase() === selectedValue.trim().toLowerCase() ? 'selected' : '';
            html += `<option value="${s.name}" ${isSelected}>👤 ${s.name} (${s.role})</option>`;
        });
        
        if (others.length > 0) {
            html += `<optgroup label="Other Staff">`;
            others.forEach(s => {
                const isSelected = selectedValue && s.name.trim().toLowerCase() === selectedValue.trim().toLowerCase() ? 'selected' : '';
                html += `<option value="${s.name}" ${isSelected}>👤 ${s.name} (${s.role})</option>`;
            });
            html += `</optgroup>`;
        }
        
        selectEl.innerHTML = html;
        if (selectedValue) {
            selectEl.value = selectedValue;
        }
    }

    addHelperRow() {
        const container = document.getElementById('driverRowsContainer');
        if (!container) return;
        const helperIndex = container.querySelectorAll('.helper-group').length + 1;
        const div = document.createElement('div');
        div.className = 'form-group helper-group';
        
        const staffList = this.store.getStaffList() || [];
        const helpers = staffList.filter(s => s.role === 'Helper');
        const others = staffList.filter(s => s.role !== 'Helper');

        let options = `<option value="">-- Select Helper --</option>`;
        helpers.forEach(s => {
            options += `<option value="${s.name}">👤 ${s.name} (${s.role})</option>`;
        });
        if (others.length > 0) {
            options += `<optgroup label="Other Staff">`;
            others.forEach(s => {
                options += `<option value="${s.name}">👤 ${s.name} (${s.role})</option>`;
            });
            options += `</optgroup>`;
        }

        div.innerHTML = `
            <label>Helper ${helperIndex}</label>
            <div style="display:flex; gap: 6px; align-items: center;">
                <select class="form-control saleHelperSelect" style="flex: 1;">
                    ${options}
                </select>
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.parentElement.parentElement.remove()" style="padding: 0 10px; height: 38px; min-width: 32px; display: inline-flex; align-items: center; justify-content: center; font-size: 1.1rem; border-radius: 8px;" title="Remove Helper">×</button>
            </div>
        `;
        container.appendChild(div);

        // Auto-scroll container to the newly added helper and focus select
        container.scrollTop = container.scrollHeight;
        const newSelect = div.querySelector('select');
        if (newSelect) newSelect.focus();
    }

    addSaleItemRow() {
        const list = document.getElementById('saleOrderItemsList');
        if (!list) return;

        const row = document.createElement('div');
        row.className = 'sale-item-row';
        
        let productOptions = '<option value="">-- Select Product --</option>';
        this.store.getProducts().forEach(p => {
            productOptions += `<option value="${p.id}" data-units="${p.unitsPerBox || 24}" data-price="${p.sellPrice}" data-buy="${p.buyPrice}">${p.name} (${p.size || ''}) [${p.unitsPerBox || 24}/box] (Stock: ${p.stock})</option>`;
        });

        row.innerHTML = `
            <div class="sale-row-col prod-col">
                <label style="font-size:0.75rem;">Product</label>
                <select class="itemProductSelect" onchange="app.onSaleRowProductChange(this)">${productOptions}</select>
            </div>
            <div class="sale-row-col">
                <label style="font-size:0.75rem;">Boxes</label>
                <input type="number" min="0" step="any" class="itemBoxInput" placeholder="0" oninput="app.onSaleRowBoxInput(this)">
            </div>
            <div class="sale-row-col">
                <label style="font-size:0.75rem;">Total Units</label>
                <input type="number" min="1" class="itemQtyInput" placeholder="0" oninput="app.onSaleRowUnitInput(this)">
            </div>
            <div class="sale-row-col">
                <label style="font-size:0.75rem;">Rate (₹/Unit)</label>
                <input type="number" step="0.01" class="itemRateInput" oninput="app.calcSaleCalculations()">
            </div>
            <div class="sale-row-col">
                <label style="font-size:0.75rem;">Line Total</label>
                <div class="itemLineTotal" style="font-weight:700; color:#38bdf8; font-size:0.9rem; margin-top:6px;">₹0.00</div>
            </div>
            <div class="sale-row-col del-col" style="padding-top: 14px;">
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.parentElement.parentElement.remove(); app.calcSaleCalculations();">×</button>
            </div>
        `;
        list.appendChild(row);
    }

    onSaleRowProductChange(selectEl) {
        const row = selectEl.closest('.sale-item-row');
        const opt = selectEl.options[selectEl.selectedIndex];
        if (opt && opt.value) {
            const price = parseFloat(opt.getAttribute('data-price')) || 0;
            const units = parseInt(opt.getAttribute('data-units')) || 24;
            row.querySelector('.itemRateInput').value = price;
            const boxInput = row.querySelector('.itemBoxInput');
            if (!boxInput.value || parseFloat(boxInput.value) <= 0) {
                boxInput.value = 1;
            }
            row.querySelector('.itemQtyInput').value = Math.round((parseFloat(boxInput.value) || 1) * units);
            this.calcSaleCalculations();
        }
    }

    onSaleRowBoxInput(boxInput) {
        const row = boxInput.closest('.sale-item-row');
        const select = row.querySelector('.itemProductSelect');
        const opt = select?.options[select.selectedIndex];
        const unitsPerBox = opt ? (parseInt(opt.getAttribute('data-units')) || 24) : 24;
        const boxes = parseFloat(boxInput.value) || 0;
        row.querySelector('.itemQtyInput').value = Math.round(boxes * unitsPerBox);
        this.calcSaleCalculations();
    }

    onSaleRowUnitInput(qtyInput) {
        const row = qtyInput.closest('.sale-item-row');
        const select = row.querySelector('.itemProductSelect');
        const opt = select?.options[select.selectedIndex];
        const unitsPerBox = opt ? (parseInt(opt.getAttribute('data-units')) || 24) : 24;
        const qty = parseInt(qtyInput.value) || 0;
        row.querySelector('.itemBoxInput').value = (qty / unitsPerBox).toFixed(1);
        this.calcSaleCalculations();
    }

    onSalePaymentStatusChange() {
        const status = document.getElementById('salePaymentStatus')?.value;
        const paidGroup = document.getElementById('salePaidAmountGroup');
        if (paidGroup) {
            paidGroup.style.display = status === 'Partial' ? 'block' : 'none';
        }
    }

    calcSaleCalculations() {
        let grandTotal = 0;
        let grandProfit = 0;

        const rows = document.querySelectorAll('.sale-item-row');
        rows.forEach(row => {
            const select = row.querySelector('.itemProductSelect');
            const opt = select?.options[select.selectedIndex];
            const qty = parseInt(row.querySelector('.itemQtyInput')?.value) || 0;
            const rate = parseFloat(row.querySelector('.itemRateInput')?.value) || 0;
            const buyPrice = opt ? (parseFloat(opt.getAttribute('data-buy')) || 0) : 0;

            const total = qty * rate;
            const profit = (rate - buyPrice) * qty;

            const lineTotalEl = row.querySelector('.itemLineTotal');
            if (lineTotalEl) lineTotalEl.textContent = '₹' + total.toFixed(2);

            grandTotal += total;
            grandProfit += profit;
        });

        const totalPreview = document.getElementById('saleTotalPreview');
        const profitPreview = document.getElementById('saleProfitPreview');
        if (totalPreview) totalPreview.textContent = '₹' + grandTotal.toFixed(2);
        if (profitPreview) profitPreview.textContent = '₹' + grandProfit.toFixed(2);
    }

    handleSaleSubmit(e) {
        e.preventDefault();
        if (!this.canPerform('canEditSales', 'Store Sales', 'Save Sale Order')) return;
        const date = document.getElementById('saleDate')?.value;
        const sid = document.getElementById('saleStore')?.value;
        const store = this.store.getStore(sid);
        const status = document.getElementById('salePaymentStatus')?.value;
        const driverName = document.getElementById('saleDriver1')?.value.trim() || '';
        
        const helperSelects = document.querySelectorAll('.saleHelperSelect');
        const helperNames = [];
        helperSelects.forEach(select => {
            if (select.value.trim()) helperNames.push(select.value.trim());
        });

        const rows = document.querySelectorAll('.sale-item-row');
        if (rows.length === 0) {
            alert('Please add at least one product to the sale.');
            return;
        }

        let totalBoxesAllProducts = 0;
        let totalSaleAmount = 0;
        const productsSummaryList = [];

        rows.forEach(row => {
            const select = row.querySelector('.itemProductSelect');
            const pid = select?.value;
            if (!pid) return;
            const p = this.store.getProduct(pid);
            const qty = parseInt(row.querySelector('.itemQtyInput')?.value) || 0;
            const boxes = parseFloat(row.querySelector('.itemBoxInput')?.value) || (qty / (p?.unitsPerBox || 24));
            const rate = parseFloat(row.querySelector('.itemRateInput')?.value) || 0;
            const buyPrice = p ? (p.buyPrice || 0) : 0;
            const lineTotal = qty * rate;
            const profit = (rate - buyPrice) * qty;

            totalBoxesAllProducts += Math.max(0, boxes);
            totalSaleAmount += lineTotal;

            if (p && qty > 0) {
                productsSummaryList.push(`${p.name} ${p.size ? '(' + p.size + ')' : ''} × ${boxes.toFixed(1)}b`);
            }

            this.store.addSale({
                date: date,
                storeId: sid,
                storeName: store ? store.name : 'Direct Sale',
                productId: pid,
                productName: p ? `${p.name} (${p.size || ''})` : 'Product',
                qty: qty,
                boxes: boxes,
                rate: rate,
                total: lineTotal,
                buyPrice: buyPrice,
                profit: profit,
                status: status,
                paidAmount: status === 'Paid' ? lineTotal : (status === 'Partial' ? (parseFloat(document.getElementById('salePaidAmount')?.value) || 0) : 0),
                driverName: driverName,
                helperNames: helperNames
            });
        });

        const month = date.substring(0, 7);
        const storeLabel = store ? store.name : 'Store Delivery';
        const prodsSummary = productsSummaryList.join(', ') || `${totalBoxesAllProducts.toFixed(1)} Boxes Delivery`;

        // Auto-credit Driver Commission: ₹2 per box
        if (driverName && totalBoxesAllProducts > 0) {
            let staff = this.store.getStaffByName(driverName);
            if (!staff) {
                staff = this.store.addStaff({ name: driverName, role: 'Driver', baseFixedSalary: 12000 });
            }
            this.store.addStaffDelivery({
                staffId: staff.id,
                staffName: staff.name,
                role: 'Driver',
                date: date,
                month: month,
                storeName: storeLabel,
                productsSummary: prodsSummary,
                boxCount: Math.round(totalBoxesAllProducts * 10) / 10,
                orderAmount: totalSaleAmount,
                ratePerBox: 2,
                totalCommission: (Math.round(totalBoxesAllProducts * 10) / 10) * 2,
                source: 'Store Sale'
            });
        }

        // Auto-credit Helper Commission: ₹1 per box
        helperNames.forEach(hName => {
            if (hName && totalBoxesAllProducts > 0) {
                let hStaff = this.store.getStaffByName(hName);
                if (!hStaff) {
                    hStaff = this.store.addStaff({ name: hName, role: 'Helper', baseFixedSalary: 9000 });
                }
                this.store.addStaffDelivery({
                    staffId: hStaff.id,
                    staffName: hStaff.name,
                    role: 'Helper',
                    date: date,
                    month: month,
                    storeName: storeLabel,
                    productsSummary: prodsSummary,
                    boxCount: Math.round(totalBoxesAllProducts * 10) / 10,
                    orderAmount: totalSaleAmount,
                    ratePerBox: 1,
                    totalCommission: (Math.round(totalBoxesAllProducts * 10) / 10) * 1,
                    source: 'Store Sale'
                });
            }
        });

        this.showToast('Sale recorded! Store accounts, stock and staff commissions updated.', 'success');
        this.closeModal('saleModal');
        this.renderAll();
    }

    deleteSale(id) {
        if (!this.canPerform('canEditSales', 'Store Sales')) return;
        if (confirm('Delete this sale record? Inventory and store ledger will be reversed.')) {
            this.store.deleteSale(id);
            this.showToast('Sale deleted!', 'info');
            this.renderAll();
        }
    }

    // ==========================================
    // 20L DRUM ORDER MODAL
    // ==========================================
    openDrumOrderModal() {
        if (!this.canPerform('canEditDrums', '20L Water Drums')) return;
        document.getElementById('drumOrderForm')?.reset();
        document.getElementById('drumDate').value = this.getTodayStr();
        const storeSelect = document.getElementById('drumStoreSelect');
        if (storeSelect) {
            storeSelect.innerHTML = '<option value="">-- Select Store or Walk-in Customer --</option>';
            this.store.getStores().forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.name;
                storeSelect.appendChild(opt);
            });
        }
        
        const drivers = this.store.getStaffList().filter(s => s.role === 'Driver');
        const helpers = this.store.getStaffList().filter(s => s.role === 'Helper');
        this.populateStaffSelect('drumDriver1', 'Driver', drivers[0]?.name || '');
        this.populateStaffSelect('drumDriver2', 'Helper', helpers[0]?.name || '');

        document.getElementById('drumQty').value = 10;
        document.getElementById('drumRate').value = 35;
        this.calcDrumTotal();
        this.openModal('drumOrderModal');
    }

    onDrumStoreChange() {
        const sid = document.getElementById('drumStoreSelect')?.value;
        if (sid) {
            const s = this.store.getStore(sid);
            if (s && document.getElementById('drumCustomerName')) document.getElementById('drumCustomerName').value = s.name;
        }
    }

    calcDrumTotal() {
        const qty = parseFloat(document.getElementById('drumQty')?.value) || 0;
        const rate = parseFloat(document.getElementById('drumRate')?.value) || 0;
        const preview = document.getElementById('drumTotalPreview');
        if (preview) preview.textContent = '₹' + (qty * rate).toFixed(2);
    }

    handleDrumOrderSubmit(e) {
        e.preventDefault();
        if (!this.canPerform('canEditDrums', '20L Water Drums', 'Save Drum Order')) return;
        const date = document.getElementById('drumDate')?.value;
        const sid = document.getElementById('drumStoreSelect')?.value;
        const customerName = document.getElementById('drumCustomerName')?.value.trim() || (sid ? this.store.getStore(sid)?.name : 'Walk-in Customer');
        const qty = parseInt(document.getElementById('drumQty')?.value) || 0;
        const rate = parseFloat(document.getElementById('drumRate')?.value) || 0;
        const empties = parseInt(document.getElementById('drumEmptiesReturned')?.value) || 0;
        const status = document.getElementById('drumStatus')?.value;
        const driver1 = document.getElementById('drumDriver1')?.value.trim();
        const driver2 = document.getElementById('drumDriver2')?.value.trim();
        const orderTotal = qty * rate;

        this.store.addDrumOrder({
            date: date,
            storeId: sid,
            customer: customerName,
            qty: qty,
            rate: rate,
            total: orderTotal,
            emptiesReturned: empties,
            status: status,
            driver1: driver1,
            driver2: driver2
        });

        // Auto-credit Driver 1 & Driver 2 for 20L Drum Delivery
        const month = date.substring(0, 7);
        if (driver1 && qty > 0) {
            let staff1 = this.store.getStaffByName(driver1);
            if (!staff1) {
                staff1 = this.store.addStaff({ name: driver1, role: 'Driver', baseFixedSalary: 12000 });
            }
            this.store.addStaffDelivery({
                staffId: staff1.id,
                staffName: staff1.name,
                role: 'Driver',
                date: date,
                month: month,
                storeName: customerName,
                productsSummary: `20L Water Drum (${qty} units)`,
                boxCount: qty,
                orderAmount: orderTotal,
                ratePerBox: 2,
                totalCommission: qty * 2,
                source: '20L Drum Delivery'
            });
        }

        if (driver2 && qty > 0) {
            let staff2 = this.store.getStaffByName(driver2);
            if (!staff2) {
                staff2 = this.store.addStaff({ name: driver2, role: 'Helper', baseFixedSalary: 9000 });
            }
            this.store.addStaffDelivery({
                staffId: staff2.id,
                staffName: staff2.name,
                role: 'Helper',
                date: date,
                month: month,
                storeName: customerName,
                productsSummary: `20L Water Drum (${qty} units)`,
                boxCount: qty,
                orderAmount: orderTotal,
                ratePerBox: 1,
                totalCommission: qty * 1,
                source: '20L Drum Delivery'
            });
        }

        this.showToast('20L Drum order added! Driver & Helper trip commissions updated.', 'success');
        this.closeModal('drumOrderModal');
        this.renderAll();
    }

    deleteDrumOrder(id) {
        if (!this.canPerform('canEditDrums', '20L Water Drums')) return;
        if (confirm('Delete this drum order?')) {
            this.store.deleteDrumOrder(id);
            this.showToast('Drum order removed.', 'info');
            this.renderAll();
        }
    }

    // ==========================================
    // STORE MODAL & STATEMENT
    // ==========================================
    openStoreModal(store = null) {
        if (!this.canPerform('canEditStores', 'Stores & Khata Ledger')) return;
        document.getElementById('storeForm')?.reset();
        if (store) {
            document.getElementById('storeModalTitle').textContent = 'Edit Store Details';
            document.getElementById('storeId').value = store.id;
            document.getElementById('storeName').value = store.name;
            document.getElementById('storeOwner').value = store.owner || '';
            document.getElementById('storePhone').value = store.phone || '';
            document.getElementById('storeAddress').value = store.address || '';
            document.getElementById('storeOpeningBalance').value = store.balanceDue || 0;
        } else {
            document.getElementById('storeModalTitle').textContent = 'Add New Store';
            document.getElementById('storeId').value = '';
            document.getElementById('storeOpeningBalance').value = 0;
        }
        this.openModal('storeModal');
    }

    editStore(id) {
        const s = this.store.getStore(id);
        if (s) this.openStoreModal(s);
    }

    deleteStore(id) {
        if (!this.canPerform('canEditStores', 'Stores & Khata Ledger')) return;
        if (confirm('Delete this store and its khata record?')) {
            this.store.deleteStore(id);
            this.showToast('Store removed!', 'info');
            this.renderAll();
        }
    }

    handleStoreSubmit(e) {
        e.preventDefault();
        if (!this.canPerform('canEditStores', 'Stores & Khata Ledger', 'Save Store Information')) return;
        const id = document.getElementById('storeId')?.value;
        const data = {
            name: document.getElementById('storeName')?.value.trim(),
            owner: document.getElementById('storeOwner')?.value.trim(),
            phone: document.getElementById('storePhone')?.value.trim(),
            address: document.getElementById('storeAddress')?.value.trim(),
            openingBalance: parseFloat(document.getElementById('storeOpeningBalance')?.value) || 0
        };

        if (id) {
            this.store.updateStore(id, data);
            this.showToast('Store details updated!', 'success');
        } else {
            this.store.addStore(data);
            this.showToast('New Store added to database!', 'success');
        }
        this.closeModal('storeModal');
        this.renderAll();
    }

    openPaymentModal(storeId) {
        if (!this.canPerform('canEditStores', 'Stores & Khata Ledger')) return;
        const s = this.store.getStore(storeId);
        if (!s) return;
        document.getElementById('paymentForm')?.reset();
        document.getElementById('paymentStoreId').value = s.id;
        document.getElementById('paymentStoreName').textContent = s.name;
        document.getElementById('paymentCurrentDue').textContent = '₹' + (s.balanceDue || 0).toFixed(2);
        document.getElementById('paymentDate').value = this.getTodayStr();
        document.getElementById('paymentAmount').value = s.balanceDue > 0 ? s.balanceDue : '';
        this.openModal('paymentModal');
    }

    handlePaymentSubmit(e) {
        e.preventDefault();
        if (!this.canPerform('canEditStores', 'Stores & Khata Ledger', 'Record Payment')) return;
        const sid = document.getElementById('paymentStoreId')?.value;
        const store = this.store.getStore(sid);
        const amount = parseFloat(document.getElementById('paymentAmount')?.value) || 0;
        const date = document.getElementById('paymentDate')?.value;
        const note = document.getElementById('paymentNotes')?.value.trim();

        this.store.addPayment({
            storeId: sid,
            storeName: store ? store.name : 'Store',
            date: date,
            amount: amount,
            note: note || 'Payment Received'
        });

        this.showToast(`Payment of ₹${amount.toFixed(2)} recorded! Store balance updated.`, 'success');
        this.closeModal('paymentModal');
        this.renderAll();
    }

    openStatement(storeId) {
        const store = this.store.getStore(storeId);
        if (!store) return;
        this.currentStatementStoreId = storeId;

        const nameEl = document.getElementById('statementStoreName');
        const detailsEl = document.getElementById('statementStoreDetails');
        const balEl = document.getElementById('statementBalanceDue');
        const boughtEl = document.getElementById('statementTotalBought');
        const paidEl = document.getElementById('statementTotalPaid');

        if (nameEl) nameEl.textContent = 'Khata Statement — ' + store.name;
        if (detailsEl) detailsEl.textContent = '👤 ' + (store.owner || 'N/A') + ' • 📞 ' + (store.phone || 'N/A') + ' • 📍 ' + (store.address || 'No address');
        if (balEl) balEl.textContent = '₹' + (store.balanceDue || 0).toFixed(2);
        if (boughtEl) boughtEl.textContent = '₹' + (store.totalBought || 0).toFixed(2);
        if (paidEl) paidEl.textContent = '₹' + (store.totalPaid || 0).toFixed(2);

        const tbody = document.getElementById('statementTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            const sales = this.store.getSales().filter(s => s.storeId === storeId);
            const payments = this.store.getPayments().filter(p => p.storeId === storeId);

            const rows = [];
            sales.forEach(s => rows.push({
                date: s.date,
                type: 'SALE BILLING',
                desc: s.productName + ' (' + s.qty + ' units)',
                debit: s.total,
                credit: 0
            }));

            payments.forEach(p => rows.push({
                date: p.date,
                type: 'PAYMENT RECEIVED',
                desc: p.note || 'Payment',
                debit: 0,
                credit: p.amount
            }));

            rows.sort((a, b) => new Date(a.date) - new Date(b.date));

            let runningBal = store.openingBalance || 0;
            if (rows.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">No sales or payments recorded yet for this store.</td></tr>';
            } else {
                rows.forEach(r => {
                    runningBal += (r.debit - r.credit);
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${r.date}</td>
                        <td><span class="badge ${r.type === 'SALE BILLING' ? 'badge-primary' : 'badge-success'}">${r.type}</span></td>
                        <td>${r.desc}</td>
                        <td style="color:#f87171;">${r.debit > 0 ? '₹' + r.debit.toFixed(2) : '-'}</td>
                        <td style="color:#10b981;">${r.credit > 0 ? '₹' + r.credit.toFixed(2) : '-'}</td>
                        <td><strong>₹${runningBal.toFixed(2)}</strong></td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }

        this.openModal('statementModal');
    }

    openSaleFromStatement() {
        const sid = this.currentStatementStoreId;
        this.closeModal('statementModal');
        this.openSaleModal();
        if (sid) {
            const select = document.getElementById('saleStore');
            if (select) select.value = sid;
        }
    }

    openPaymentFromStatement() {
        const sid = this.currentStatementStoreId;
        this.closeModal('statementModal');
        if (sid) this.openPaymentModal(sid);
    }

    // ==========================================
    // RESET & SEED DATA
    // ==========================================
    openResetModal() {
        this.openModal('resetModal');
    }

    resetDataToZero(wipeEverything = false) {
        if (!this.canPerform('canResetDatabase', 'Database Reset')) return;

        const passInput = document.getElementById('resetAdminPasswordInput');
        let pass = passInput ? passInput.value.trim() : '';
        if (!pass) {
            pass = prompt('🔒 Reset to 0 Authorization Required!\nPlease enter Reset to 0 Password:');
        }

        if (!this.store.verifyResetPassword(pass)) {
            this.showToast('❌ Incorrect Reset to 0 Password! Operation blocked.', 'error');
            return;
        }

        if (wipeEverything) {
            if (!confirm('⚠️ Are you sure you want to completely wipe the database? (Product catalogs & stores will be cleared, Super Admin retained).')) return;
            const superAdmin = this.store.getUsers().find(u => u.isPermanentOwner);
            const secSettings = this.store.getSecuritySettings();
            this.store.data = {
                products: [],
                stores: [],
                purchases: [],
                sales: [],
                drumOrders: [],
                payments: [],
                staff: [
                    { id: 'st_mantu', name: 'MANTU', role: 'Driver', baseFixedSalary: 0, phone: '' },
                    { id: 'st_chandan', name: 'CHANDAN', role: 'Helper', baseFixedSalary: 0, phone: '' }
                ],
                staffDeliveries: [],
                staffMonthlySalaries: [],
                users: superAdmin ? [superAdmin] : [{
                    id: 'usr_superadmin',
                    email: 'admin@aquatrack.com',
                    name: 'Super Admin (Owner)',
                    password: secSettings.superAdminEmailPassword || 'admin123',
                    role: 'Super Admin',
                    status: 'approved',
                    isPermanentOwner: true,
                    permissions: this.store.getDefaultPermissions('Super Admin'),
                    createdAt: new Date().toISOString().split('T')[0]
                }],
                accessRequests: [],
                securitySettings: secSettings
            };
            this.store.save();
            this.showToast('All business data wiped clean! Starting 100% blank.', 'info');
        } else {
            if (!confirm('Reset all stock to 0, clear all sales, purchases, 20L drum orders, store balances, staff salaries, advances and commissions to 0?')) return;
            (this.store.data.products || []).forEach(p => { p.stock = 0; });
            (this.store.data.stores || []).forEach(s => {
                s.totalBought = 0;
                s.totalPaid = 0;
                s.balanceDue = 0;
                s.openingBalance = 0;
            });
            (this.store.data.staff || []).forEach(st => {
                st.baseFixedSalary = 0;
            });
            this.store.data.purchases = [];
            this.store.data.sales = [];
            this.store.data.drumOrders = [];
            this.store.data.payments = [];
            this.store.data.staffDeliveries = [];
            this.store.data.staffMonthlySalaries = [];
            this.store.save();
            this.showToast('All stocks, sales, dues, profits & staff salaries reset to 0!', 'success');
        }
        if (passInput) passInput.value = '';
        this.closeModal('resetModal');
        this.renderAll();
    }

    // ==========================================
    // RENDER: ADMIN & SECURITY MANAGEMENT
    // ==========================================
    renderAdminSection() {
        const users = this.store.getUsers() || [];
        const requests = this.store.getAccessRequests() || [];

        const totalUsersEl = document.getElementById('adminKpiTotalUsers');
        const totalAdminsEl = document.getElementById('adminKpiTotalAdmins');
        const pendingReqEl = document.getElementById('adminKpiPendingRequests');

        const approvedUsers = users.filter(u => u.status === 'approved');
        const admins = users.filter(u => (u.role === 'Super Admin' || u.role === 'Co-Administrator' || u.role === 'Admin') && u.status === 'approved');

        if (totalUsersEl) totalUsersEl.textContent = approvedUsers.length;
        if (totalAdminsEl) totalAdminsEl.textContent = admins.length;
        if (pendingReqEl) pendingReqEl.textContent = requests.length;

        // 1. Render Pending Requests
        const reqContainer = document.getElementById('adminPendingRequestsContainer');
        if (reqContainer) {
            if (requests.length === 0) {
                reqContainer.innerHTML = `
                    <div style="text-align: center; padding: 22px; color: var(--text-muted); font-size: 0.88rem;">
                        ✅ No pending access requests. All incoming attempts have been processed.
                    </div>
                `;
            } else {
                reqContainer.innerHTML = requests.map(r => `
                    <div class="pending-request-card">
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <strong style="font-size: 0.95rem; color: #f8fafc;">${r.name || 'Anonymous User'}</strong>
                                <span class="badge badge-info" style="font-size: 0.72rem;">${r.role || 'Staff'}</span>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">${r.date || ''}</span>
                            </div>
                            <div style="font-size: 0.85rem; color: #38bdf8; margin-top: 2px;">📧 ${r.email}</div>
                            ${r.notes ? `<div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">💬 "${r.notes}"</div>` : ''}
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                            <button class="btn btn-success btn-sm" onclick="app.approveRequest('${r.id}', 'Driver')">🚚 Approve as Driver</button>
                            <button class="btn btn-secondary btn-sm" onclick="app.approveRequest('${r.id}', 'Helper')">🤝 Approve as Helper</button>
                            <button class="btn btn-purple btn-sm" onclick="app.approveRequest('${r.id}', 'Co-Administrator')">🛡️ Approve as Co-Admin</button>
                            <button class="btn btn-outline-danger btn-sm" onclick="app.rejectRequest('${r.id}')">❌ Reject</button>
                        </div>
                    </div>
                `).join('');
            }
        }

        // 2. Render Authorized Users Table
        const tbody = document.getElementById('adminUsersTableBody');
        if (tbody) {
            tbody.innerHTML = users.map(u => {
                const isOwner = u.isPermanentOwner;
                let roleBadge = '<span class="badge badge-purple">👤 Staff / Viewer</span>';
                if (isOwner) roleBadge = '<span class="badge badge-owner">👑 Super Admin (Owner)</span>';
                else if (u.role === 'Co-Administrator' || u.role === 'Admin') roleBadge = '<span class="badge badge-warning">🛡️ Co-Administrator</span>';
                else if (u.role === 'Driver') roleBadge = '<span class="badge badge-info">🚚 Driver</span>';
                else if (u.role === 'Helper') roleBadge = '<span class="badge badge-secondary">🤝 Helper</span>';

                const perms = u.permissions || {};
                const permKeys = ['canEditProducts', 'canEditPurchases', 'canEditSales', 'canEditDrums', 'canEditStores', 'canEditDaily', 'canEditStaff', 'canEditTrucks', 'canResetDatabase'];
                const activePermsCount = isOwner ? 9 : permKeys.filter(k => perms[k] === true).length;

                let permsBadge = `<button class="btn btn-secondary btn-sm" onclick="app.openApprovedOperationsModal('${u.id}')" style="font-size: 0.74rem; padding: 3px 8px;">⚙️ ${activePermsCount}/9 Operations</button>`;
                if (isOwner) {
                    permsBadge = `<span class="badge badge-success" style="font-size: 0.72rem;">✓ Full Master Control</span>`;
                }

                // Security Violation Alerts Badge
                const attempts = u.unauthorizedAttempts || [];
                const totalAttempts = attempts.length || (u.totalUnauthorizedCount || 0);
                let redAlertSymbol = '';
                if (totalAttempts > 0) {
                    redAlertSymbol = `
                        <button type="button" class="badge-alert-btn" onclick="app.openUnauthorizedAttemptsModal('${u.id}')" title="Security Alert: ${totalAttempts} unauthorized edit attempt(s)! Click to view breakdown by section">
                            🚨 <span class="alert-count">${totalAttempts} ${totalAttempts === 1 ? 'Alert' : 'Alerts'}</span>
                        </button>
                    `;
                }

                let actionHtml = '';
                if (isOwner) {
                    actionHtml = `
                        <span class="badge badge-owner" style="font-size: 0.72rem; padding: 4px 8px;">🔒 Permanent Owner</span>
                    `;
                } else {
                    actionHtml = `
                        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                            <button class="btn btn-purple btn-sm" onclick="app.openApprovedOperationsModal('${u.id}')" title="Configure Approved Operations">⚙️ Operations</button>
                            <button class="btn btn-secondary btn-sm" onclick="app.openChangePasswordModal('${u.id}')">🔑 Password</button>
                            <button class="btn btn-outline-danger btn-sm" onclick="app.deleteUserAccount('${u.id}')" title="Delete User">🗑️</button>
                        </div>
                    `;
                }

                return `
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <strong class="user-name-cell" onclick="app.openApprovedOperationsModal('${u.id}')" title="Click to view & edit approved operations" style="color: #f8fafc; cursor: pointer;">${u.email}</strong>
                                ${redAlertSymbol}
                            </div>
                            ${isOwner ? '<span style="color: #fbbf24; font-size: 0.75rem; display: block;">(Primary Account Owner)</span>' : ''}
                        </td>
                        <td>
                            <span class="user-name-cell" onclick="app.openApprovedOperationsModal('${u.id}')" title="Click to view & edit approved operations" style="cursor: pointer;">${u.name || 'Authorized User'}</span>
                        </td>
                        <td>${roleBadge}</td>
                        <td>${permsBadge}</td>
                        <td>${u.createdAt || 'System Start'}</td>
                        <td>${actionHtml}</td>
                    </tr>
                `;
            }).join('');
        }
    }

    // ==========================================
    // UNAUTHORIZED EDIT ATTEMPTS VIEWER
    // ==========================================
    openUnauthorizedAttemptsModal(userId) {
        const user = this.store.getUser(userId);
        if (!user) return;

        this.selectedAttemptUserId = userId;

        const emailEl = document.getElementById('attemptsModalUserEmail');
        const nameEl = document.getElementById('attemptsModalUserName');
        const totalCountEl = document.getElementById('attemptsModalTotalCount');
        const breakdownEl = document.getElementById('attemptsSectionBreakdown');
        const historyEl = document.getElementById('attemptsDetailedHistory');

        if (emailEl) emailEl.textContent = user.email;
        if (nameEl) nameEl.textContent = user.name || user.role || 'User';

        const attempts = user.unauthorizedAttempts || [];
        const totalCount = attempts.length || (user.totalUnauthorizedCount || 0);
        if (totalCountEl) totalCountEl.textContent = `${totalCount} ${totalCount === 1 ? 'Attempt' : 'Attempts'} Logged`;

        // Compute breakdown per section
        const counts = user.attemptCountsBySection || {};
        if (attempts.length > 0 && Object.keys(counts).length === 0) {
            attempts.forEach(a => {
                const sec = a.section || 'Restricted Section';
                counts[sec] = (counts[sec] || 0) + 1;
            });
        }

        const sectionEntries = Object.entries(counts);
        if (breakdownEl) {
            if (sectionEntries.length === 0) {
                breakdownEl.innerHTML = `
                    <div style="padding: 12px; color: var(--text-muted); font-size: 0.82rem; text-align: center;">
                        No recorded edit attempt violations for this user.
                    </div>
                `;
            } else {
                breakdownEl.innerHTML = sectionEntries.map(([sec, count]) => {
                    const percent = Math.round((count / (totalCount || 1)) * 100);
                    return `
                        <div class="attempt-section-card">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.1rem; color: #ef4444;">⛔</span>
                                <div>
                                    <div style="font-weight: 700; color: #f8fafc; font-size: 0.88rem;">${sec}</div>
                                    <div style="font-size: 0.72rem; color: var(--text-secondary);">${percent}% of total violation attempts</div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span class="badge badge-danger" style="font-size: 0.82rem; padding: 4px 10px; font-weight: 800;">
                                    ${count} ${count === 1 ? 'time' : 'times'} tried
                                </span>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        // Render detailed chronological history
        if (historyEl) {
            if (attempts.length === 0) {
                historyEl.innerHTML = `
                    <div style="padding: 14px; color: var(--text-muted); font-size: 0.82rem; text-align: center;">
                        No detailed log entries recorded.
                    </div>
                `;
            } else {
                historyEl.innerHTML = attempts.map(a => `
                    <div class="attempt-log-row">
                        <div>
                            <div style="color: #fca5a5; font-weight: 700;">⛔ Tried to edit: <span style="color: #ffffff;">${a.section}</span></div>
                            <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 1px;">Action: ${a.action || 'Unauthorized Edit'}</div>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); text-align: right; white-space: nowrap;">
                            📅 ${a.timestamp}
                        </div>
                    </div>
                `).join('');
            }
        }

        this.openModal('unauthorizedAttemptsModal');
    }

    clearUserAttempts() {
        if (!this.canPerform('canEditAdmin', 'Admin & Security Command Center', 'Clear Security Violation Logs')) return;
        if (!this.selectedAttemptUserId) return;
        this.store.clearUnauthorizedAttempts(this.selectedAttemptUserId);
        this.showToast('✅ Security violation logs cleared for user.', 'info');
        this.openUnauthorizedAttemptsModal(this.selectedAttemptUserId);
        this.renderAdminSection();
    }

    openApprovedOperationsModalFromAttempts() {
        const uid = this.selectedAttemptUserId;
        this.closeModal('unauthorizedAttemptsModal');
        if (uid) {
            this.openApprovedOperationsModal(uid);
        }
    }

    // ==========================================
    // APPROVED OPERATIONS (GRANULAR PERMISSIONS)
    // ==========================================
    openApprovedOperationsModal(userId) {
        const user = this.store.getUser(userId);
        if (!user) return;

        document.getElementById('opUserId').value = user.id;
        document.getElementById('opUserEmail').textContent = user.email;
        document.getElementById('opUserName').textContent = user.name || user.email.split('@')[0];
        
        const roleSelect = document.getElementById('opUserRole');
        if (roleSelect) {
            roleSelect.value = user.role || (user.isPermanentOwner ? 'Co-Administrator' : 'Staff');
        }

        const perms = user.permissions || this.store.getDefaultPermissions(user.role);

        const setChecked = (id, val) => {
            const cb = document.getElementById(id);
            if (cb) cb.checked = !!val;
        };

        setChecked('perm_canEditProducts', perms.canEditProducts);
        setChecked('perm_canEditPurchases', perms.canEditPurchases);
        setChecked('perm_canEditSales', perms.canEditSales);
        setChecked('perm_canEditDrums', perms.canEditDrums);
        setChecked('perm_canEditStores', perms.canEditStores);
        setChecked('perm_canEditDaily', perms.canEditDaily);
        setChecked('perm_canEditStaff', perms.canEditStaff);
        setChecked('perm_canEditTrucks', perms.canEditTrucks);
        setChecked('perm_canResetDatabase', perms.canResetDatabase);
        setChecked('perm_canEditAdmin', perms.canEditAdmin);

        // Super Admin exclusivity: Only permanent owner/super admin can toggle Admin section tick box
        const isCurrentSuperAdmin = !!(this.currentUser && (this.currentUser.isPermanentOwner || this.currentUser.role === 'Super Admin' || this.currentUser.email?.toLowerCase() === 'admin@aquatrack.com'));
        const adminCb = document.getElementById('perm_canEditAdmin');
        const adminLockTag = document.getElementById('perm_admin_lock_tag');
        const adminCard = document.getElementById('perm_card_canEditAdmin');

        if (adminCb) {
            adminCb.disabled = !isCurrentSuperAdmin;
        }
        if (adminLockTag) {
            adminLockTag.textContent = isCurrentSuperAdmin ? '👑 Super Admin Controlled' : '🔒 Super Admin Only';
        }
        if (adminCard) {
            adminCard.style.opacity = isCurrentSuperAdmin ? '1.0' : '0.65';
            adminCard.title = isCurrentSuperAdmin ? 'Only Super Admin can grant this privilege' : 'Locked: Only Super Admin (Owner) can toggle Admin section access';
        }

        this.openModal('approvedOperationsModal');
    }

    onRoleChangeInPermissionsModal() {
        const role = document.getElementById('opUserRole')?.value || 'Staff';
        const defaults = this.store.getDefaultPermissions(role);
        const isCurrentSuperAdmin = !!(this.currentUser && (this.currentUser.isPermanentOwner || this.currentUser.role === 'Super Admin' || this.currentUser.email?.toLowerCase() === 'admin@aquatrack.com'));
        
        const setChecked = (id, val) => {
            const cb = document.getElementById(id);
            if (cb) cb.checked = !!val;
        };

        setChecked('perm_canEditProducts', defaults.canEditProducts);
        setChecked('perm_canEditPurchases', defaults.canEditPurchases);
        setChecked('perm_canEditSales', defaults.canEditSales);
        setChecked('perm_canEditDrums', defaults.canEditDrums);
        setChecked('perm_canEditStores', defaults.canEditStores);
        setChecked('perm_canEditDaily', defaults.canEditDaily);
        setChecked('perm_canEditStaff', defaults.canEditStaff);
        setChecked('perm_canEditTrucks', defaults.canEditTrucks);
        setChecked('perm_canResetDatabase', defaults.canResetDatabase);
        if (isCurrentSuperAdmin) {
            setChecked('perm_canEditAdmin', defaults.canEditAdmin);
        }
    }

    setAllPermissions(enabled) {
        const isCurrentSuperAdmin = !!(this.currentUser && (this.currentUser.isPermanentOwner || this.currentUser.role === 'Super Admin' || this.currentUser.email?.toLowerCase() === 'admin@aquatrack.com'));
        const permIds = ['perm_canEditProducts', 'perm_canEditPurchases', 'perm_canEditSales', 'perm_canEditDrums', 'perm_canEditStores', 'perm_canEditDaily', 'perm_canEditStaff', 'perm_canEditTrucks', 'perm_canResetDatabase'];
        if (isCurrentSuperAdmin) {
            permIds.push('perm_canEditAdmin');
        }
        permIds.forEach(id => {
            const cb = document.getElementById(id);
            if (cb && !cb.disabled) cb.checked = enabled;
        });
    }

    handleSaveApprovedOperations(e) {
        e.preventDefault();
        const userId = document.getElementById('opUserId')?.value;
        const user = this.store.getUser(userId);
        if (!user) return;

        const isCurrentSuperAdmin = !!(this.currentUser && (this.currentUser.isPermanentOwner || this.currentUser.role === 'Super Admin' || this.currentUser.email?.toLowerCase() === 'admin@aquatrack.com'));

        // If non-super admin tries to modify approved operations, verify if they have canEditAdmin
        if (!this.canPerform('canEditAdmin', 'Admin & Security Command Center', 'Modify Approved Operations')) {
            return;
        }

        const newRole = document.getElementById('opUserRole')?.value || user.role;
        const newPerms = {
            canEditProducts: !!document.getElementById('perm_canEditProducts')?.checked,
            canEditPurchases: !!document.getElementById('perm_canEditPurchases')?.checked,
            canEditSales: !!document.getElementById('perm_canEditSales')?.checked,
            canEditDrums: !!document.getElementById('perm_canEditDrums')?.checked,
            canEditStores: !!document.getElementById('perm_canEditStores')?.checked,
            canEditDaily: !!document.getElementById('perm_canEditDaily')?.checked,
            canEditStaff: !!document.getElementById('perm_canEditStaff')?.checked,
            canEditTrucks: !!document.getElementById('perm_canEditTrucks')?.checked,
            canResetDatabase: !!document.getElementById('perm_canResetDatabase')?.checked,
            // Super Admin exclusivity: Only Super Admin can change canEditAdmin
            canEditAdmin: isCurrentSuperAdmin ? !!document.getElementById('perm_canEditAdmin')?.checked : (user.permissions?.canEditAdmin || false)
        };

        this.store.updateUser(userId, {
            role: newRole,
            permissions: newPerms
        });

        // If currently logged in as this user, refresh active session
        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser.role = newRole;
            this.currentUser.permissions = newPerms;
            localStorage.setItem('aquatrack_session_user', JSON.stringify(this.currentUser));
            this.updateTopbarUserChip();
        }

        this.closeModal('approvedOperationsModal');
        this.showToast(`✅ Saved Approved Operations for ${user.email}!`, 'success');
        this.renderAdminSection();
    }

    // Handlers for Master Passwords Configuration (Protected by Super Admin Password)
    handleUpdateResetPassword(e) {
        e.preventDefault();
        if (!this.canPerform('canEditAdmin', 'Admin & Security Command Center', 'Update Reset to 0 Password')) return;

        const input = document.getElementById('newResetPasswordInput');
        const authInput = document.getElementById('authSuperAdminPassForReset');
        const newPass = input ? input.value.trim() : '';
        const authPass = authInput ? authInput.value.trim() : '';
        if (!newPass) return;

        if (!this.store.verifySuperAdminLoginPassword(authPass)) {
            this.showToast('❌ Incorrect Super Admin Password! Change denied.', 'error');
            return;
        }

        this.store.updateSecuritySettings({ resetToZeroPassword: newPass });
        if (input) input.value = '';
        if (authInput) authInput.value = '';
        this.showToast('✅ Reset to 0 Password updated successfully!', 'success');
        this.renderAdminSection();
    }

    handleUpdateAdminSectionPassword(e) {
        e.preventDefault();
        if (!this.canPerform('canEditAdmin', 'Admin & Security Command Center', 'Update Admin Section Password')) return;

        const input = document.getElementById('newAdminSectionPasswordInput');
        const authInput = document.getElementById('authSuperAdminPassForAdminSection');
        const newPass = input ? input.value.trim() : '';
        const authPass = authInput ? authInput.value.trim() : '';
        if (!newPass) return;

        if (!this.store.verifySuperAdminLoginPassword(authPass)) {
            this.showToast('❌ Incorrect Super Admin Password! Change denied.', 'error');
            return;
        }

        this.store.updateSecuritySettings({ adminSectionPassword: newPass });
        if (input) input.value = '';
        if (authInput) authInput.value = '';
        this.showToast('✅ Admin Section Password updated successfully!', 'success');
        this.renderAdminSection();
    }

    handleUpdateSuperAdminEmailPassword(e) {
        e.preventDefault();
        if (!this.canPerform('canEditAdmin', 'Admin & Security Command Center', 'Update Owner Email Password')) return;

        const input = document.getElementById('newSuperAdminEmailPasswordInput');
        const authInput = document.getElementById('authSuperAdminPassForEmail');
        const newPass = input ? input.value.trim() : '';
        const authPass = authInput ? authInput.value.trim() : '';
        if (!newPass) return;

        if (!this.store.verifySuperAdminLoginPassword(authPass)) {
            this.showToast('❌ Incorrect Super Admin Password! Change denied.', 'error');
            return;
        }

        this.store.updateSecuritySettings({ superAdminEmailPassword: newPass });
        if (input) input.value = '';
        if (authInput) authInput.value = '';
        this.showToast('✅ Owner Email Login Password updated successfully!', 'success');
        this.renderAdminSection();
    }

    approveRequest(reqId, role = 'Staff') {
        if (!this.canPerform('canEditAdmin', 'Admin & Security Command Center', 'Approve Access Request')) return;

        const req = (this.store.getAccessRequests() || []).find(r => r.id === reqId);
        if (!req) return;

        const defaultPass = 'pass123';
        this.store.addUser({
            email: req.email,
            name: req.name || req.email.split('@')[0],
            password: defaultPass,
            role: role,
            status: 'approved',
            isPermanentOwner: false,
            createdAt: new Date().toISOString().split('T')[0]
        });

        this.store.deleteAccessRequest(reqId);
        this.showToast(`✅ Approved ${req.email} as ${role}! Default Password: ${defaultPass}`, 'success');
        this.renderAdminSection();
    }

    rejectRequest(reqId) {
        if (!this.canPerform('canEditAdmin', 'Admin & Security Command Center', 'Reject Access Request')) return;

        if (!confirm('Reject and delete this access request?')) return;
        this.store.deleteAccessRequest(reqId);
        this.showToast('Access request rejected.', 'info');
        this.renderAdminSection();
    }

    toggleUserAdminRole(userId) {
        if (!this.canPerform('canEditAdmin', 'Admin & Security Command Center', 'Toggle User Role')) return;

        const user = this.store.getUser(userId);
        if (!user) return;
        if (user.isPermanentOwner) {
            this.showToast('⚠️ The Super Admin (Owner) cannot be demoted or removed.', 'warning');
            return;
        }

        const newRole = user.role === 'Admin' ? 'Staff' : 'Admin';
        this.store.updateUser(userId, { role: newRole });
        this.showToast(`Updated ${user.email} role to: ${newRole}`, 'success');
        this.renderAdminSection();
        this.updateTopbarUserChip();
    }

    deleteUserAccount(userId) {
        if (!this.canPerform('canEditAdmin', 'Admin & Security Command Center', 'Delete User Account')) return;

        const user = this.store.getUser(userId);
        if (!user) return;
        if (user.isPermanentOwner) {
            this.showToast('⚠️ The Super Admin (Owner) account cannot be removed.', 'warning');
            return;
        }

        if (!confirm(`Are you sure you want to revoke access and delete account: ${user.email}?`)) return;
        this.store.deleteUser(userId);
        this.showToast(`User ${user.email} removed from access list.`, 'info');
        this.renderAdminSection();
    }

    openAddUserModal() {
        if (!this.canPerform('canEditAdmin', 'Admin & Security Command Center', 'Add User')) return;
        document.getElementById('addUserForm')?.reset();
        this.openModal('addUserModal');
    }

    handleAddUserSubmit(e) {
        e.preventDefault();
        if (!this.canPerform('canEditAdmin', 'Admin & Security Command Center', 'Create User Account')) return;

        const email = document.getElementById('newAccEmail')?.value.trim();
        const name = document.getElementById('newAccName')?.value.trim();
        const password = document.getElementById('newAccPassword')?.value.trim();
        const role = document.getElementById('newAccRole')?.value || 'Staff';

        if (!email || !password) return;

        const existing = this.store.getUserByEmail(email);
        if (existing) {
            this.showToast('⚠️ A user with this email is already authorized.', 'warning');
            return;
        }

        this.store.addUser({
            email: email,
            name: name || email.split('@')[0],
            password: password,
            role: role,
            status: 'approved',
            isPermanentOwner: false,
            createdAt: new Date().toISOString().split('T')[0]
        });

        // Also remove from pending requests if present
        const req = (this.store.getAccessRequests() || []).find(r => r.email.toLowerCase() === email.toLowerCase());
        if (req) this.store.deleteAccessRequest(req.id);

        this.closeModal('addUserModal');
        this.showToast(`Authorized new user: ${email} (${role})!`, 'success');
        this.renderAdminSection();
    }

    openChangePasswordModal(userId) {
        if (!this.canPerform('canEditAdmin', 'Admin & Security Command Center', 'Change User Password')) return;
        const user = this.store.getUser(userId);
        if (!user) return;
        document.getElementById('changePasswordForm')?.reset();
        document.getElementById('changePassUserId').value = user.id;
        document.getElementById('changePassUserEmail').textContent = user.email;
        this.openModal('changePasswordModal');
    }

    handleChangePasswordSubmit(e) {
        e.preventDefault();
        if (!this.canPerform('canEditAdmin', 'Admin & Security Command Center', 'Submit Password Change')) return;

        const userId = document.getElementById('changePassUserId')?.value;
        const newPass = document.getElementById('newPasswordInput')?.value.trim();
        if (!userId || !newPass) return;

        this.store.updateUser(userId, { password: newPass });
        this.closeModal('changePasswordModal');
        this.showToast('Password updated successfully!', 'success');
        this.renderAdminSection();
    }

    // ==========================================
    // RENDER: PRODUCT DEMAND & SALES ANALYTICS
    // ==========================================
    renderAnalytics() {
        const products = this.store.getProducts() || [];
        const sales = this.store.getSales() || [];
        const purchases = this.store.getPurchases() || [];
        const stores = this.store.getStores() || [];

        // Build Comprehensive Product Intelligence Dataset
        const pStats = products.map(p => {
            const unitsPerBox = p.unitsPerBox || 1;
            const pSales = sales.filter(s => s.productId === p.id);
            const pPurchases = purchases.filter(pur => pur.productId === p.id);

            const totalUnitsSold = pSales.reduce((acc, s) => acc + (s.qty || 0), 0);
            const totalBoxesSold = totalUnitsSold / unitsPerBox;
            const totalUnitsPurchased = pPurchases.reduce((acc, pur) => acc + (pur.qty || 0), 0);
            const totalBoxesPurchased = totalUnitsPurchased / unitsPerBox;

            const totalRevenue = pSales.reduce((acc, s) => acc + (s.total || 0), 0);
            const totalProfit = pSales.reduce((acc, s) => acc + (s.profit || 0), 0);

            // Store penetration & adoption
            const storeOrderMap = {};
            pSales.forEach(s => {
                if (!storeOrderMap[s.storeId]) {
                    storeOrderMap[s.storeId] = {
                        storeId: s.storeId,
                        storeName: s.storeName || 'Store',
                        units: 0,
                        boxes: 0,
                        revenue: 0,
                        ordersCount: 0,
                        lastDate: s.date
                    };
                }
                storeOrderMap[s.storeId].units += (s.qty || 0);
                storeOrderMap[s.storeId].boxes += (s.qty || 0) / unitsPerBox;
                storeOrderMap[s.storeId].revenue += (s.total || 0);
                storeOrderMap[s.storeId].ordersCount++;
                if (new Date(s.date) > new Date(storeOrderMap[s.storeId].lastDate)) {
                    storeOrderMap[s.storeId].lastDate = s.date;
                }
            });

            const uniqueStoresCount = Object.keys(storeOrderMap).length;
            const storePenetration = stores.length > 0 ? (uniqueStoresCount / stores.length) * 100 : 0;
            const avgBoxesPerStore = uniqueStoresCount > 0 ? (totalBoxesSold / uniqueStoresCount) : 0;

            // Turnaround / Velocity (Sell-through rate after restock)
            const totalStockHandled = totalUnitsPurchased + (p.stock || 0) + totalUnitsSold;
            const sellThroughRate = totalStockHandled > 0 ? ((totalUnitsSold / totalStockHandled) * 100) : 0;
            
            // Velocity score combines sell-through speed & sales count
            const velocityScore = (sellThroughRate * 0.7) + (Math.min(totalBoxesSold, 100) * 0.3);

            const profitPerUnit = (p.sellPrice || 0) - (p.buyPrice || 0);
            const profitPerBox = profitPerUnit * unitsPerBox;
            const profitMarginPct = p.sellPrice > 0 ? ((profitPerUnit / p.sellPrice) * 100) : 0;

            return {
                product: p,
                id: p.id,
                name: p.name,
                size: p.size,
                category: p.category,
                unitsPerBox,
                currentStockUnits: p.stock || 0,
                currentStockBoxes: (p.stock || 0) / unitsPerBox,
                totalUnitsSold,
                totalBoxesSold,
                totalUnitsPurchased,
                totalBoxesPurchased,
                totalRevenue,
                totalProfit,
                profitPerBox,
                profitMarginPct,
                uniqueStoresCount,
                storePenetration,
                avgBoxesPerStore,
                storeOrderMap,
                sellThroughRate,
                velocityScore
            };
        });

        // 1. Identify Top Highlights
        const fastVelocitySorted = [...pStats].sort((a, b) => b.velocityScore - a.velocityScore);
        const longRunSorted = [...pStats].sort((a, b) => b.totalBoxesSold - a.totalBoxesSold);
        const storeReachSorted = [...pStats].sort((a, b) => b.uniqueStoresCount - a.uniqueStoresCount || b.totalBoxesSold - a.totalBoxesSold);
        const bulkNicheSorted = [...pStats].filter(p => p.totalBoxesSold > 0).sort((a, b) => b.avgBoxesPerStore - a.avgBoxesPerStore);
        const profitSorted = [...pStats].sort((a, b) => b.totalProfit - a.totalProfit);

        const topFast = fastVelocitySorted[0];
        const topLongRun = longRunSorted[0];
        const topReach = storeReachSorted[0];
        const topNiche = bulkNicheSorted[0] || longRunSorted[0];
        const topProfit = profitSorted[0];

        // 2. Render 5 Quick Key Intelligence Metric Cards
        const quickMetricsEl = document.getElementById('analyticsQuickMetrics');
        if (quickMetricsEl) {
            quickMetricsEl.innerHTML = `
                <div class="analytics-kpi-card" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); padding: 14px 16px;">
                    <div style="font-size: 0.74rem; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                        <span>⚡ Fastest Velocity</span>
                    </div>
                    <div style="font-size: 1.15rem; font-weight: 800; color: #fef08a; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${topFast ? topFast.name + ' (' + topFast.size + ')' : 'N/A'}">
                        ${topFast ? topFast.name : 'No sales yet'}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
                        ${topFast ? `${topFast.size} • <strong>${topFast.sellThroughRate.toFixed(0)}%</strong> turnaround` : 'Awaiting restock sales'}
                    </div>
                </div>

                <div class="analytics-kpi-card" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 14px 16px;">
                    <div style="font-size: 0.74rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                        <span>🏆 Long-Run Champion</span>
                    </div>
                    <div style="font-size: 1.15rem; font-weight: 800; color: #86efac; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${topLongRun ? topLongRun.name + ' (' + topLongRun.size + ')' : 'N/A'}">
                        ${topLongRun ? topLongRun.name : 'No sales yet'}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
                        ${topLongRun ? `${topLongRun.size} • <strong>${topLongRun.totalBoxesSold.toFixed(1)} boxes</strong> sold` : 'Steady volume'}
                    </div>
                </div>

                <div class="analytics-kpi-card" style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: var(--radius-md); padding: 14px 16px;">
                    <div style="font-size: 0.74rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                        <span>🌐 Most Store Demand</span>
                    </div>
                    <div style="font-size: 1.15rem; font-weight: 800; color: #bae6fd; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${topReach ? topReach.name + ' (' + topReach.size + ')' : 'N/A'}">
                        ${topReach ? topReach.name : 'No stores yet'}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
                        ${topReach ? `In <strong>${topReach.uniqueStoresCount} of ${stores.length}</strong> stores (${topReach.storePenetration.toFixed(0)}%)` : 'Mass retail favorite'}
                    </div>
                </div>

                <div class="analytics-kpi-card" style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: var(--radius-md); padding: 14px 16px;">
                    <div style="font-size: 0.74rem; font-weight: 700; color: #c084fc; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                        <span>🎯 Top Bulk Niche</span>
                    </div>
                    <div style="font-size: 1.15rem; font-weight: 800; color: #e9d5ff; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${topNiche ? topNiche.name + ' (' + topNiche.size + ')' : 'N/A'}">
                        ${topNiche ? topNiche.name : 'N/A'}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
                        ${topNiche ? `Avg <strong>${topNiche.avgBoxesPerStore.toFixed(1)} boxes</strong> / store` : 'Concentrated buyers'}
                    </div>
                </div>

                <div class="analytics-kpi-card" style="background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: var(--radius-md); padding: 14px 16px;">
                    <div style="font-size: 0.74rem; font-weight: 700; color: #f472b6; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                        <span>💎 Top Profit Leader</span>
                    </div>
                    <div style="font-size: 1.15rem; font-weight: 800; color: #fbcfe8; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${topProfit ? topProfit.name + ' (' + topProfit.size + ')' : 'N/A'}">
                        ${topProfit ? topProfit.name : '₹0.00'}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
                        ${topProfit ? `<strong>₹${topProfit.totalProfit.toFixed(2)}</strong> total profit (${topProfit.profitMarginPct.toFixed(0)}% margin)` : 'Highest earnings'}
                    </div>
                </div>
            `;
        }

        // 3. Render Quadrant 1: Fast Velocity List
        const fastListEl = document.getElementById('analyticsFastVelocityList');
        if (fastListEl) {
            fastListEl.innerHTML = fastVelocitySorted.slice(0, 5).map((p, idx) => {
                const badge = p.sellThroughRate > 75 ? '<span class="badge badge-warning">⚡ Ultra-Fast</span>' : (p.sellThroughRate > 40 ? '<span class="badge badge-success">🔥 Rapid</span>' : '<span class="badge badge-info">📈 Normal</span>');
                return `
                    <div style="background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; cursor: pointer; transition: var(--transition);" onclick="app.selectAnalyticsProduct('${p.id}')">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                                <span style="color:#f59e0b; font-size:0.8rem;">#${idx + 1}</span>
                                <span>${p.name}</span>
                                <span style="font-size:0.75rem; color:var(--text-muted);">(${p.size})</span>
                            </div>
                            ${badge}
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-secondary);">
                            <span>Restocked: <strong>${p.totalBoxesPurchased.toFixed(1)} boxes</strong></span>
                            <span>Sold Out: <strong style="color:#10b981;">${p.totalBoxesSold.toFixed(1)} boxes</strong></span>
                            <span>Turnaround: <strong style="color:#f59e0b;">${p.sellThroughRate.toFixed(0)}%</strong></span>
                        </div>
                        <div style="background: rgba(255,255,255,0.06); height: 6px; border-radius: 99px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #f59e0b, #ef4444); height: 100%; width: ${Math.min(p.sellThroughRate, 100)}%; border-radius: 99px;"></div>
                        </div>
                    </div>
                `;
            }).join('') || '<div style="color:var(--text-muted); padding:16px; text-align:center;">No restock sales data yet.</div>';
        }

        // 4. Render Quadrant 2: Long Run Champions
        const longRunListEl = document.getElementById('analyticsLongRunList');
        if (longRunListEl) {
            const maxBoxes = Math.max(...longRunSorted.map(p => p.totalBoxesSold), 1);
            longRunListEl.innerHTML = longRunSorted.slice(0, 5).map((p, idx) => {
                const pct = (p.totalBoxesSold / maxBoxes) * 100;
                return `
                    <div style="background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; cursor: pointer; transition: var(--transition);" onclick="app.selectAnalyticsProduct('${p.id}')">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                                <span style="color:#10b981; font-size:0.8rem;">#${idx + 1}</span>
                                <span>${p.name}</span>
                                <span style="font-size:0.75rem; color:var(--text-muted);">(${p.size})</span>
                            </div>
                            <span class="badge badge-success">₹${p.totalRevenue.toFixed(0)} Rev</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-secondary);">
                            <span>Total Boxes: <strong style="color:#10b981;">${p.totalBoxesSold.toFixed(1)} boxes</strong></span>
                            <span>Total Units: <strong>${p.totalUnitsSold}</strong></span>
                            <span>Profit: <strong style="color:#38bdf8;">₹${p.totalProfit.toFixed(0)}</strong></span>
                        </div>
                        <div style="background: rgba(255,255,255,0.06); height: 6px; border-radius: 99px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #10b981, #06b6d4); height: 100%; width: ${pct}%; border-radius: 99px;"></div>
                        </div>
                    </div>
                `;
            }).join('') || '<div style="color:var(--text-muted); padding:16px; text-align:center;">No long-run sales recorded yet.</div>';
        }

        // 5. Render Quadrant 3: Store Reach (Most Stores)
        const storeReachListEl = document.getElementById('analyticsStoreReachList');
        if (storeReachListEl) {
            storeReachListEl.innerHTML = storeReachSorted.slice(0, 5).map((p, idx) => {
                return `
                    <div style="background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; cursor: pointer; transition: var(--transition);" onclick="app.selectAnalyticsProduct('${p.id}')">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                                <span style="color:#38bdf8; font-size:0.8rem;">#${idx + 1}</span>
                                <span>${p.name}</span>
                                <span style="font-size:0.75rem; color:var(--text-muted);">(${p.size})</span>
                            </div>
                            <span class="badge badge-info">${p.uniqueStoresCount} Stores</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-secondary);">
                            <span>Store Penetration: <strong style="color:#38bdf8;">${p.storePenetration.toFixed(0)}%</strong></span>
                            <span>Network Reach: <strong>${p.uniqueStoresCount} / ${stores.length}</strong></span>
                            <span>Boxes/Store: <strong>${p.avgBoxesPerStore.toFixed(1)}</strong></span>
                        </div>
                        <div style="background: rgba(255,255,255,0.06); height: 6px; border-radius: 99px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #38bdf8, #6366f1); height: 100%; width: ${Math.min(p.storePenetration, 100)}%; border-radius: 99px;"></div>
                        </div>
                    </div>
                `;
            }).join('') || '<div style="color:var(--text-muted); padding:16px; text-align:center;">No store sales recorded yet.</div>';
        }

        // 6. Render Quadrant 4: Bulk Niche List
        const nicheListEl = document.getElementById('analyticsNicheList');
        if (nicheListEl) {
            nicheListEl.innerHTML = bulkNicheSorted.slice(0, 5).map((p, idx) => {
                return `
                    <div style="background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; cursor: pointer; transition: var(--transition);" onclick="app.selectAnalyticsProduct('${p.id}')">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                                <span style="color:#c084fc; font-size:0.8rem;">#${idx + 1}</span>
                                <span>${p.name}</span>
                                <span style="font-size:0.75rem; color:var(--text-muted);">(${p.size})</span>
                            </div>
                            <span class="badge badge-purple">${p.avgBoxesPerStore.toFixed(1)} Boxes/Store</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-secondary);">
                            <span>Ordered by: <strong>${p.uniqueStoresCount} Stores</strong></span>
                            <span>Total Volume: <strong style="color:#c084fc;">${p.totalBoxesSold.toFixed(1)} boxes</strong></span>
                            <span>Profit/Box: <strong style="color:#10b981;">₹${p.profitPerBox.toFixed(2)}</strong></span>
                        </div>
                        <div style="background: rgba(255,255,255,0.06); height: 6px; border-radius: 99px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #a855f7, #ec4899); height: 100%; width: ${Math.min((p.avgBoxesPerStore / 30) * 100, 100)}%; border-radius: 99px;"></div>
                        </div>
                    </div>
                `;
            }).join('') || '<div style="color:var(--text-muted); padding:16px; text-align:center;">No bulk niche data yet.</div>';
        }

        // 7. Populate Product Dropdown Selector
        const selectEl = document.getElementById('analyticsProductSelect');
        if (selectEl) {
            const currentSelected = selectEl.value;
            selectEl.innerHTML = products.map(p => `
                <option value="${p.id}">${p.name} — ${p.size} (${p.category.toUpperCase()})</option>
            `).join('');

            if (currentSelected && products.some(p => p.id === currentSelected)) {
                selectEl.value = currentSelected;
            } else if (products.length > 0) {
                selectEl.value = products[0].id;
            }
        }

        // 8. Render Deep-Dive for Selected Product
        const selectedId = selectEl ? selectEl.value : (products[0] ? products[0].id : null);
        if (selectedId) {
            this.renderProductDeepDive(selectedId, pStats);
        }

        // 9. Render Store Demand Matrix
        this.renderStoreDemandMatrix(pStats);
    }

    selectAnalyticsProduct(productId) {
        const selectEl = document.getElementById('analyticsProductSelect');
        if (selectEl) {
            selectEl.value = productId;
            this.renderProductDeepDive(productId);
            const card = document.getElementById('analyticsProductDetailView');
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    onAnalyticsProductChange() {
        const selectEl = document.getElementById('analyticsProductSelect');
        if (selectEl) {
            this.renderProductDeepDive(selectEl.value);
        }
    }

    renderProductDeepDive(productId, precomputedStats = null) {
        const detailEl = document.getElementById('analyticsProductDetailView');
        if (!detailEl) return;

        const p = this.store.getProduct(productId);
        if (!p) {
            detailEl.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">Select a product to view performance history.</div>';
            return;
        }

        const sales = this.store.getSales() || [];
        const purchases = this.store.getPurchases() || [];
        const stores = this.store.getStores() || [];
        const unitsPerBox = p.unitsPerBox || 1;

        const pSales = sales.filter(s => s.productId === p.id);
        const pPurchases = purchases.filter(pur => pur.productId === p.id);

        const totalUnitsSold = pSales.reduce((acc, s) => acc + (s.qty || 0), 0);
        const totalBoxesSold = totalUnitsSold / unitsPerBox;
        const totalUnitsPurchased = pPurchases.reduce((acc, pur) => acc + (pur.qty || 0), 0);
        const totalBoxesPurchased = totalUnitsPurchased / unitsPerBox;

        const totalRevenue = pSales.reduce((acc, s) => acc + (s.total || 0), 0);
        const totalProfit = pSales.reduce((acc, s) => acc + (s.profit || 0), 0);

        const currentStockUnits = p.stock || 0;
        const currentStockBoxes = currentStockUnits / unitsPerBox;

        const profitPerUnit = (p.sellPrice || 0) - (p.buyPrice || 0);
        const profitPerBox = profitPerUnit * unitsPerBox;
        const profitMarginPct = p.sellPrice > 0 ? ((profitPerUnit / p.sellPrice) * 100) : 0;

        // Store Consumption Map
        const storeMap = {};
        pSales.forEach(s => {
            if (!storeMap[s.storeId]) {
                const st = stores.find(str => str.id === s.storeId) || {};
                storeMap[s.storeId] = {
                    storeId: s.storeId,
                    storeName: s.storeName || st.name || 'Store',
                    owner: st.owner || 'N/A',
                    address: st.address || 'N/A',
                    phone: st.phone || '',
                    units: 0,
                    boxes: 0,
                    revenue: 0,
                    orderCount: 0,
                    lastDate: s.date
                };
            }
            storeMap[s.storeId].units += (s.qty || 0);
            storeMap[s.storeId].boxes += (s.qty || 0) / unitsPerBox;
            storeMap[s.storeId].revenue += (s.total || 0);
            storeMap[s.storeId].orderCount++;
            if (new Date(s.date) > new Date(storeMap[s.storeId].lastDate)) {
                storeMap[s.storeId].lastDate = s.date;
            }
        });

        const storeList = Object.values(storeMap).sort((a, b) => b.boxes - a.boxes);
        const uniqueStoresCount = storeList.length;
        const storePenetration = stores.length > 0 ? (uniqueStoresCount / stores.length) * 100 : 0;
        const totalAvailableStock = currentStockUnits + totalUnitsSold;
        const stockSoldPct = totalAvailableStock > 0 ? (totalUnitsSold / totalAvailableStock) * 100 : 0;

        // Intelligence Badges
        const tags = [];
        if (stockSoldPct > 70) tags.push('<span class="badge badge-warning">⚡ Fast-Selling Mover</span>');
        if (totalBoxesSold > 20) tags.push('<span class="badge badge-success">🏆 High Volume Winner</span>');
        if (storePenetration > 50) tags.push('<span class="badge badge-info">🌐 High Store Reach (' + storePenetration.toFixed(0) + '%)</span>');
        if (storeList.length > 0 && storeList[0].boxes > 15) tags.push('<span class="badge badge-purple">🎯 Bulk Store Favorite</span>');
        if (tags.length === 0) tags.push('<span class="badge badge-info">📦 In Stock Catalog</span>');

        // Color palette for horizontal store share bars
        const barColors = ['#38bdf8', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1'];

        detailEl.innerHTML = `
            <!-- Hero Product Card -->
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 18px;">
                <div>
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0;">${p.name}</h3>
                        <span class="badge badge-primary">${p.size}</span>
                        <span class="badge badge-secondary">${unitsPerBox} Units / Box</span>
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                        ${tags.join(' ')}
                    </div>
                </div>
                <div style="display: flex; gap: 18px; align-items: center; background: rgba(0,0,0,0.3); padding: 10px 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <div>
                        <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase;">Factory Buy Price</div>
                        <div style="font-size:1.05rem; font-weight:700;">₹${(p.buyPrice || 0).toFixed(2)} / unit</div>
                    </div>
                    <div>
                        <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase;">Store Selling Rate</div>
                        <div style="font-size:1.05rem; font-weight:700; color:#38bdf8;">₹${(p.sellPrice || 0).toFixed(2)} / unit</div>
                    </div>
                    <div>
                        <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase;">Gross Profit / Box</div>
                        <div style="font-size:1.15rem; font-weight:800; color:#10b981;">₹${profitPerBox.toFixed(2)} <span style="font-size:0.75rem; font-weight:600;">(${profitMarginPct.toFixed(0)}%)</span></div>
                    </div>
                </div>
            </div>

            <!-- 6 Key Performance Metric Tiles -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 20px;">
                <div class="flow-stat-box">
                    <div class="flow-stat-label">📦 Total Boxes Sold</div>
                    <div class="flow-stat-value" style="color: #38bdf8;">${totalBoxesSold.toFixed(1)} <span style="font-size:0.8rem; color:var(--text-muted);">boxes</span></div>
                    <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">${totalUnitsSold} total units</div>
                </div>

                <div class="flow-stat-box">
                    <div class="flow-stat-label">🏬 Store Network Adoption</div>
                    <div class="flow-stat-value" style="color: #a855f7;">${uniqueStoresCount} <span style="font-size:0.8rem; color:var(--text-muted);">/ ${stores.length} stores</span></div>
                    <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">${storePenetration.toFixed(0)}% penetration rate</div>
                </div>

                <div class="flow-stat-box">
                    <div class="flow-stat-label">💰 Total Net Revenue</div>
                    <div class="flow-stat-value" style="color: #10b981;">₹${totalRevenue.toFixed(2)}</div>
                    <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">From all store orders</div>
                </div>

                <div class="flow-stat-box">
                    <div class="flow-stat-label">📈 Net Profit Generated</div>
                    <div class="flow-stat-value" style="color: #10b981;">₹${totalProfit.toFixed(2)}</div>
                    <div style="font-size:0.75rem; color:#10b981; margin-top:2px;">${profitMarginPct.toFixed(1)}% profit margin</div>
                </div>

                <div class="flow-stat-box">
                    <div class="flow-stat-label">🏭 Factory Restocked</div>
                    <div class="flow-stat-value">${totalBoxesPurchased.toFixed(1)} <span style="font-size:0.8rem; color:var(--text-muted);">boxes</span></div>
                    <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">${totalUnitsPurchased} units bought</div>
                </div>

                <div class="flow-stat-box">
                    <div class="flow-stat-label">📦 Current Stock In Hand</div>
                    <div class="flow-stat-value" style="color: ${currentStockBoxes > 5 ? '#38bdf8' : '#ef4444'};">${currentStockBoxes.toFixed(1)} <span style="font-size:0.8rem; color:var(--text-muted);">boxes</span></div>
                    <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">${currentStockUnits} units available</div>
                </div>
            </div>

            <!-- Visual Store Consumption Distribution -->
            <div style="background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px 20px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <h4 style="margin: 0; font-size: 1rem; color: #38bdf8;">📊 Store-by-Store Consumption Breakdown</h4>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">Visual distribution of which stores consume the biggest share of ${p.name}</div>
                    </div>
                    <span class="badge badge-info">${storeList.length} Ordering Stores</span>
                </div>

                ${storeList.length > 0 ? `
                    <!-- Stacked Colored Progress Bar -->
                    <div style="background: rgba(255,255,255,0.06); height: 16px; border-radius: 99px; overflow: hidden; display: flex; margin-bottom: 16px;">
                        ${storeList.map((st, i) => {
                            const pct = totalBoxesSold > 0 ? (st.boxes / totalBoxesSold) * 100 : 0;
                            const color = barColors[i % barColors.length];
                            return `<div style="background: ${color}; width: ${pct}%; height: 100%;" title="${st.storeName}: ${st.boxes.toFixed(1)} boxes (${pct.toFixed(1)}%)"></div>`;
                        }).join('')}
                    </div>

                    <!-- Individual Store Share Bars -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
                        ${storeList.map((st, i) => {
                            const pct = totalBoxesSold > 0 ? (st.boxes / totalBoxesSold) * 100 : 0;
                            const color = barColors[i % barColors.length];
                            return `
                                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                        <span style="font-weight: 700; font-size: 0.88rem; color: var(--text-primary);">${st.storeName}</span>
                                        <span style="font-weight: 800; font-size: 0.88rem; color: ${color};">${pct.toFixed(1)}% share</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 6px;">
                                        <span>Ordered: <strong>${st.boxes.toFixed(1)} boxes</strong> (${st.units} units)</span>
                                        <span>Billed: <strong style="color:#10b981;">₹${st.revenue.toFixed(2)}</strong></span>
                                    </div>
                                    <div style="background: rgba(255,255,255,0.06); height: 5px; border-radius: 99px; overflow: hidden;">
                                        <div style="background: ${color}; width: ${pct}%; height: 100%; border-radius: 99px;"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.9rem;">
                        No store sales recorded yet for this product. Use the <strong>+ New Sale</strong> button to record your first store order!
                    </div>
                `}
            </div>

            <!-- Detailed Store Orders Table for this Product -->
            <h4 style="margin: 0 0 10px 0; font-size: 0.95rem; color: #f8fafc;">📋 Detailed Store Orders Table for ${p.name}</h4>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Store Name</th>
                            <th>Owner / Contact</th>
                            <th>Location / Address</th>
                            <th>Boxes Consumed</th>
                            <th>Total Units</th>
                            <th>Total Billed (₹)</th>
                            <th>Last Order Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${storeList.length > 0 ? storeList.map(st => `
                            <tr>
                                <td><strong>${st.storeName}</strong></td>
                                <td>${st.owner} ${st.phone ? '• ' + st.phone : ''}</td>
                                <td>${st.address || 'N/A'}</td>
                                <td><strong style="color:#38bdf8;">${st.boxes.toFixed(1)} boxes</strong></td>
                                <td>${st.units} units</td>
                                <td style="color:#10b981; font-weight:700;">₹${st.revenue.toFixed(2)}</td>
                                <td>${st.lastDate || 'N/A'}</td>
                                <td>
                                    <button class="btn btn-secondary btn-sm" onclick="app.openStatement('${st.storeId}')">📜 Khata</button>
                                </td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="8" style="text-align: center; padding: 20px; color: var(--text-muted);">
                                    No orders yet.
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderStoreDemandMatrix(pStats = null) {
        const matrixBody = document.getElementById('analyticsStoreMatrixBody');
        if (!matrixBody) return;

        const stores = this.store.getStores() || [];
        const sales = this.store.getSales() || [];
        const products = this.store.getProducts() || [];
        const searchInput = document.getElementById('analyticsStoreSearch');
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        const storeDemands = stores.map(st => {
            const stSales = sales.filter(s => s.storeId === st.id);
            const totalRevenue = stSales.reduce((acc, s) => acc + (s.total || 0), 0);

            // Group sales by product
            const prodMap = {};
            stSales.forEach(s => {
                const prod = products.find(p => p.id === s.productId) || { name: s.productName, unitsPerBox: 1 };
                const unitsPerBox = prod.unitsPerBox || 1;
                if (!prodMap[s.productId]) {
                    prodMap[s.productId] = {
                        productId: s.productId,
                        productName: prod.name || s.productName || 'Product',
                        size: prod.size || '',
                        units: 0,
                        boxes: 0,
                        revenue: 0
                    };
                }
                prodMap[s.productId].units += (s.qty || 0);
                prodMap[s.productId].boxes += (s.qty || 0) / unitsPerBox;
                prodMap[s.productId].revenue += (s.total || 0);
            });

            const sortedProds = Object.values(prodMap).sort((a, b) => b.boxes - a.boxes);
            const totalBoxes = sortedProds.reduce((acc, p) => acc + p.boxes, 0);

            const primaryProd = sortedProds[0] || null;
            const secondaryProds = sortedProds.slice(1);

            let intensityBadge = '<span class="badge badge-info">🟢 Moderate</span>';
            if (totalBoxes > 40) intensityBadge = '<span class="badge badge-warning">🔥 High Bulk Demander</span>';
            else if (totalBoxes > 15) intensityBadge = '<span class="badge badge-success">⚡ Frequent Regular</span>';
            else if (totalBoxes > 0) intensityBadge = '<span class="badge badge-info">📈 Active</span>';
            else intensityBadge = '<span class="badge badge-secondary">💤 Inactive</span>';

            return {
                store: st,
                primaryProd,
                secondaryProds,
                totalBoxes,
                totalRevenue,
                intensityBadge
            };
        });

        const filtered = storeDemands.filter(item => {
            if (!query) return true;
            const sName = (item.store.name || '').toLowerCase();
            const sAddr = (item.store.address || '').toLowerCase();
            const sOwner = (item.store.owner || '').toLowerCase();
            const pName = item.primaryProd ? (item.primaryProd.productName || '').toLowerCase() : '';
            return sName.includes(query) || sAddr.includes(query) || sOwner.includes(query) || pName.includes(query);
        });

        filtered.sort((a, b) => b.totalBoxes - a.totalBoxes);

        if (filtered.length === 0) {
            matrixBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No matching stores or location demands found.</td></tr>`;
            return;
        }

        matrixBody.innerHTML = filtered.map(item => `
            <tr>
                <td>
                    <strong>${item.store.name}</strong>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
                        📍 ${item.store.address || 'No location specified'} ${item.store.owner ? '• 👤 ' + item.store.owner : ''}
                    </div>
                </td>
                <td>
                    ${item.primaryProd ? `
                        <div style="font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
                            <span>⭐ ${item.primaryProd.productName}</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">(${item.primaryProd.size})</span>
                        </div>
                        <div style="font-size: 0.78rem; color: #10b981; font-weight: 600;">
                            ${item.primaryProd.boxes.toFixed(1)} boxes ordered (₹${item.primaryProd.revenue.toFixed(0)})
                        </div>
                    ` : '<span style="color:var(--text-muted);">None</span>'}
                </td>
                <td>
                    ${item.secondaryProds.length > 0 ? item.secondaryProds.map(p => `
                        <span class="badge badge-secondary" style="margin: 2px;">${p.productName} (${p.boxes.toFixed(0)}b)</span>
                    `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">-</span>'}
                </td>
                <td>
                    <strong style="font-size: 0.95rem; color: #f59e0b;">${item.totalBoxes.toFixed(1)}</strong>
                    <span style="font-size: 0.78rem; color: var(--text-muted);">boxes</span>
                </td>
                <td style="color: #10b981; font-weight: 700;">₹${item.totalRevenue.toFixed(2)}</td>
                <td>${item.intensityBadge}</td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn btn-secondary btn-sm" onclick="app.openStatement('${item.store.id}')" title="View Statement">📜 Khata</button>
                        <button class="btn btn-primary btn-sm" onclick="app.openSaleModal(); document.getElementById('saleStore').value = '${item.store.id}';" title="New Sale">+ Sell</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // ==========================================
    // RENDER: TRUCKS & FLEET LOGISTICS
    // ==========================================
    populateTruckMonthDropdown() {
        const monthSelect = document.getElementById('truckMonthFilter') || document.getElementById('truckFilterMonth');
        if (!monthSelect) return;

        const allLogs = this.store.getTruckLogs() || [];
        const monthsSet = new Set();

        const currentMonth = new Date().toISOString().substring(0, 7);
        monthsSet.add(currentMonth);

        allLogs.forEach(l => {
            if (l.month) monthsSet.add(l.month);
            else if (l.date && l.date.length >= 7) monthsSet.add(l.date.substring(0, 7));
        });

        if (this.selectedTruckMonth && this.selectedTruckMonth !== 'all') {
            monthsSet.add(this.selectedTruckMonth);
        }

        const sortedMonths = Array.from(monthsSet).sort().reverse();

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const formatMonthLabel = (mStr) => {
            const [y, m] = mStr.split('-');
            const mIdx = parseInt(m, 10) - 1;
            return `${monthNames[mIdx] || m} ${y}`;
        };

        let html = '<option value="all">📅 All Months (Full History)</option>';
        sortedMonths.forEach(m => {
            const isSelected = (this.selectedTruckMonth === m) ? 'selected' : '';
            html += `<option value="${m}" ${isSelected}>📅 ${formatMonthLabel(m)} (${m})</option>`;
        });

        monthSelect.innerHTML = html;
        if (this.selectedTruckMonth) {
            monthSelect.value = this.selectedTruckMonth;
        }
    }

    populateTruckSelectDropdowns() {
        const trucks = this.store.getTrucks() || [];
        
        // 1. Populate Section Filter Dropdown
        const filterSelect = document.getElementById('truckSelectFilter') || document.getElementById('truckFilterName');
        if (filterSelect) {
            const curVal = this.selectedTruckName || 'all';
            let filterHtml = '<option value="all">🌟 All Trucks (Fleet Overview)</option>';
            trucks.forEach(t => {
                const name = (t.name || 'TRUCK').toUpperCase();
                const plate = t.number ? ` (${t.number})` : '';
                const isSelected = (curVal.toUpperCase() === name) ? 'selected' : '';
                filterHtml += `<option value="${name}" ${isSelected}>🚚 ${name}${plate}</option>`;
            });
            filterSelect.innerHTML = filterHtml;
            if (curVal) filterSelect.value = curVal;
        }

        // 2. Populate Trip Log Modal Truck Dropdown
        const modalTruckSelect = document.getElementById('tlogTruck') || document.getElementById('logTruckName');
        if (modalTruckSelect) {
            const curTruckVal = modalTruckSelect.value || (trucks[0] ? trucks[0].name : 'SUPRO');
            let modalTruckHtml = '';
            trucks.forEach(t => {
                const name = (t.name || 'TRUCK').toUpperCase();
                const plate = t.number ? ` - ${t.number}` : '';
                modalTruckHtml += `<option value="${name}">🚚 ${name}${plate}</option>`;
            });
            modalTruckSelect.innerHTML = modalTruckHtml;
            if (curTruckVal) modalTruckSelect.value = curTruckVal;
        }

        // 3. Populate New Truck Modal Default Driver Select
        const defaultDriverSelect = document.getElementById('newTruckDefaultDriver');
        if (defaultDriverSelect) {
            const staffList = this.store.getStaffList() || [];
            let driverOpts = '<option value="">-- Select Default Driver (Optional) --</option>';
            staffList.forEach(s => {
                driverOpts += `<option value="${s.name}">${s.name} (${s.role || 'Staff'})</option>`;
            });
            if (!staffList.some(s => s.name.toUpperCase() === 'MANTU')) {
                driverOpts += `<option value="MANTU">MANTU</option>`;
            }
            if (!staffList.some(s => s.name.toUpperCase() === 'CHANDAN')) {
                driverOpts += `<option value="CHANDAN">CHANDAN</option>`;
            }
            defaultDriverSelect.innerHTML = driverOpts;
        }
    }

    onTruckFilterChange() {
        const monthSelect = document.getElementById('truckMonthFilter') || document.getElementById('truckFilterMonth');
        const nameSelect = document.getElementById('truckSelectFilter') || document.getElementById('truckFilterName');
        
        if (monthSelect) this.selectedTruckMonth = monthSelect.value;
        if (nameSelect) this.selectedTruckName = nameSelect.value;

        this.renderTrucks();
    }

    resetTruckFilters() {
        this.selectedTruckMonth = 'all';
        this.selectedTruckName = 'all';
        
        const monthSelect = document.getElementById('truckMonthFilter') || document.getElementById('truckFilterMonth');
        const nameSelect = document.getElementById('truckSelectFilter') || document.getElementById('truckFilterName');
        const searchInput = document.getElementById('truckSearch') || document.getElementById('truckSearchInput');

        if (monthSelect) monthSelect.value = 'all';
        if (nameSelect) nameSelect.value = 'all';
        if (searchInput) searchInput.value = '';

        this.renderTrucks();
    }

    // ==========================================
    // VEHICLE & FLEET MANAGEMENT (ADD NEW TRUCKS)
    // ==========================================
    openVehicleManagerModal() {
        if (!this.canPerform('canEditTrucks', 'Trucks & Fleet Logistics', 'Manage Vehicle Fleet / Add Trucks')) return;

        this.populateTruckSelectDropdowns();
        const form = document.getElementById('newTruckForm');
        if (form) form.reset();

        this.renderFleetTable();
        this.openModal('truckVehicleModal');
    }

    renderFleetTable() {
        const tbody = document.getElementById('fleetVehiclesTableBody');
        if (!tbody) return;

        const trucks = this.store.getTrucks() || [];
        const allLogs = this.store.getTruckLogs() || [];

        if (trucks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:18px; color:var(--text-muted);">No vehicles registered. Add a vehicle above.</td></tr>`;
            return;
        }

        tbody.innerHTML = trucks.map(t => {
            const tName = (t.name || '').toUpperCase();
            const tLogs = allLogs.filter(l => (l.truckName || '').toUpperCase() === tName);
            const tripsCount = tLogs.length;
            const totalKm = tLogs.reduce((acc, l) => acc + (parseFloat(l.kmRun) || 0), 0);

            return `
                <tr>
                    <td>
                        <strong style="color: #38bdf8; font-size: 0.95rem;">🚚 ${t.name}</strong>
                        ${t.model ? `<div style="font-size:0.75rem; color:var(--text-secondary);">${t.model}</div>` : ''}
                    </td>
                    <td style="font-weight: 700; font-size: 0.85rem; color: #f8fafc;">
                        ${t.number || '<span style="color:var(--text-muted); font-size:0.8rem;">No Plate</span>'}
                    </td>
                    <td style="color: #a5b4fc; font-weight: 600;">
                        👤 ${t.defaultDriver || 'MANTU'}
                    </td>
                    <td style="font-weight: 700;">
                        ${tripsCount} trips
                    </td>
                    <td style="font-weight: 700; color: #34d399;">
                        ${totalKm.toLocaleString('en-IN')} KM
                    </td>
                    <td>
                        <button class="btn btn-outline-danger btn-sm" onclick="app.deleteVehicle('${t.id}')" title="Delete Vehicle" style="padding: 3px 8px; font-size: 0.75rem;">🗑️ Remove</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    handleAddTruckSubmit(e) {
        e.preventDefault();
        if (!this.canPerform('canEditTrucks', 'Trucks & Fleet Logistics', 'Add New Vehicle to Fleet')) return;

        const nameInput = document.getElementById('newTruckName');
        const numInput = document.getElementById('newTruckNumber');
        const driverInput = document.getElementById('newTruckDefaultDriver');
        const modelInput = document.getElementById('newTruckModel');

        const name = (nameInput ? nameInput.value : '').trim().toUpperCase();
        const number = (numInput ? numInput.value : '').trim().toUpperCase();
        const defaultDriver = (driverInput ? driverInput.value : '').trim() || 'MANTU';
        const model = (modelInput ? modelInput.value : '').trim();

        if (!name) {
            this.showToast('⚠️ Please enter a vehicle name (e.g. SUPRO, BOLERO, TATA ACE)', 'warning');
            return;
        }

        const existing = (this.store.getTrucks() || []).find(t => t.name.toUpperCase() === name);
        if (existing) {
            this.showToast(`⚠️ A vehicle named "${name}" already exists in your fleet!`, 'warning');
            return;
        }

        this.store.addTruck({
            name,
            number,
            defaultDriver,
            model
        });

        if (nameInput) nameInput.value = '';
        if (numInput) numInput.value = '';
        if (modelInput) modelInput.value = '';

        this.showToast(`✅ Successfully registered new vehicle: ${name}!`, 'success');
        this.populateTruckSelectDropdowns();
        this.renderFleetTable();
        this.renderTrucks();
    }

    deleteVehicle(truckId) {
        if (!this.canPerform('canEditTrucks', 'Trucks & Fleet Logistics', 'Delete Vehicle')) return;

        const trucks = this.store.getTrucks() || [];
        const truck = trucks.find(t => t.id === truckId || t.name === truckId);
        if (!truck) return;

        if (trucks.length <= 1) {
            this.showToast('⚠️ You must keep at least 1 vehicle registered in your fleet.', 'warning');
            return;
        }

        if (!confirm(`Are you sure you want to remove vehicle "${truck.name}" from the fleet roster? Existing trip history will remain.`)) return;

        this.store.deleteTruck(truck.id);
        this.showToast(`Vehicle ${truck.name} removed from fleet.`, 'info');
        this.populateTruckSelectDropdowns();
        this.renderFleetTable();
        this.renderTrucks();
    }

    openTruckLogModal(logId = null) {
        if (!this.canPerform('canEditTrucks', 'Trucks & Fleet Logistics', 'Add or Modify Truck Trip Log')) return;

        const form = document.getElementById('truckLogForm');
        if (form) form.reset();

        this.populateTruckSelectDropdowns();

        // Populate Driver Dropdown dynamically with registered drivers/staff
        const driverSelect = document.getElementById('tlogDriver') || document.getElementById('logDriver');
        if (driverSelect) {
            const staffList = this.store.getStaffList() || [];
            const drivers = staffList.filter(s => s.role === 'Driver');
            const otherStaff = staffList.filter(s => s.role !== 'Driver');
            
            let driverOpts = '<option value="">-- Select Driver --</option>';
            if (drivers.length > 0) {
                driverOpts += `<optgroup label="Registered Drivers">`;
                drivers.forEach(d => {
                    driverOpts += `<option value="${d.name}">${d.name} (Driver)</option>`;
                });
                driverOpts += `</optgroup>`;
            }
            if (otherStaff.length > 0) {
                driverOpts += `<optgroup label="Other Staff / Helpers">`;
                otherStaff.forEach(s => {
                    driverOpts += `<option value="${s.name}">${s.name} (${s.role || 'Staff'})</option>`;
                });
                driverOpts += `</optgroup>`;
            }
            if (!staffList.some(s => s.name.toUpperCase() === 'MANTU')) {
                driverOpts += `<option value="MANTU">MANTU</option>`;
            }
            if (!staffList.some(s => s.name.toUpperCase() === 'CHANDAN')) {
                driverOpts += `<option value="CHANDAN">CHANDAN</option>`;
            }
            driverSelect.innerHTML = driverOpts;
        }

        const idInput = document.getElementById('tlogId') || document.getElementById('truckLogId');
        const modalTitle = document.getElementById('truckLogModalTitle');
        const setVal = (ids, val) => {
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el) { el.value = (val !== undefined && val !== null) ? val : ''; return; }
            }
        };

        if (logId) {
            const log = this.store.getTruckLog(logId);
            if (!log) return;

            if (idInput) idInput.value = log.id;
            if (modalTitle) modalTitle.textContent = '✏️ Edit Truck Trip & Logistics Entry';

            setVal(['tlogDate', 'logDate'], log.date || this.getTodayStr());
            setVal(['tlogTruck', 'logTruckName'], log.truckName || 'SUPRO');
            if (driverSelect) driverSelect.value = log.driverName || 'MANTU';
            setVal(['tlogTripType', 'logTripType'], log.tripType || 'Own Business Delivery');
            setVal(['tlogProduct', 'logProduct'], log.product || '');
            setVal(['tlogFrom', 'logFromLocation'], log.fromLocation || '');
            setVal(['tlogTo', 'logToLocation'], log.toLocation || '');
            setVal(['tlogKm', 'logKmRun'], log.kmRun !== undefined ? log.kmRun : '');
            setVal(['tlogAmount', 'logTripAmount'], log.tripAmount !== undefined ? log.tripAmount : '');
            setVal(['tlogPaymentStatus', 'logPaymentStatus'], log.paymentStatus || 'Paid');
            setVal(['tlogFuelCost', 'logFuelCost'], log.fuelCost || '');
            setVal(['tlogFuelLitres', 'logFuelLitres'], log.fuelLitres || '');
            setVal(['tlogMaintenanceCost', 'logMaintenanceCost'], log.maintenanceCost || '');
            setVal(['tlogMaintenanceNotes', 'logMaintenanceNotes'], log.maintenanceNotes || '');
        } else {
            if (idInput) idInput.value = '';
            if (modalTitle) modalTitle.textContent = '🚚 New Truck Trip & Delivery Entry';

            setVal(['tlogDate', 'logDate'], this.getTodayStr());
            const defaultTruck = (this.selectedTruckName && this.selectedTruckName !== 'all') ? this.selectedTruckName : 'SUPRO';
            setVal(['tlogTruck', 'logTruckName'], defaultTruck);
            
            if (driverSelect) {
                const foundTruck = this.store.getTruck(defaultTruck);
                driverSelect.value = (foundTruck && foundTruck.defaultDriver) ? foundTruck.defaultDriver : (defaultTruck === 'SUPRO' ? 'MANTU' : 'CHANDAN');
            }
            setVal(['tlogTripType', 'logTripType'], 'Own Business Delivery');
            setVal(['tlogProduct', 'logProduct'], '');
            setVal(['tlogFrom', 'logFromLocation'], '');
            setVal(['tlogTo', 'logToLocation'], '');
            setVal(['tlogKm', 'logKmRun'], '');
            setVal(['tlogAmount', 'logTripAmount'], '');
            setVal(['tlogPaymentStatus', 'logPaymentStatus'], 'Paid');
            setVal(['tlogFuelCost', 'logFuelCost'], '');
            setVal(['tlogFuelLitres', 'logFuelLitres'], '');
            setVal(['tlogMaintenanceCost', 'logMaintenanceCost'], '');
            setVal(['tlogMaintenanceNotes', 'logMaintenanceNotes'], '');
        }

        this.calcTruckModalPreview();
        this.openModal('truckLogModal');
    }

    openTruckRefuelMaintenanceModal(truckName = '') {
        this.openTruckLogModal();
        if (truckName) {
            const truckSelect = document.getElementById('tlogTruck') || document.getElementById('logTruckName');
            if (truckSelect) truckSelect.value = truckName;
        }
        const setVal = (ids, val) => {
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el) { el.value = val; return; }
            }
        };
        setVal(['tlogTripType', 'logTripType'], 'Internal Transfer');
        setVal(['tlogProduct', 'logProduct'], 'Diesel Refill / Service Stop');
        setVal(['tlogAmount', 'logTripAmount'], '0');
        setVal(['tlogKm', 'logKmRun'], '0');
        
        setTimeout(() => {
            const fuelInput = document.getElementById('tlogFuelCost') || document.getElementById('logFuelCost');
            if (fuelInput) fuelInput.focus();
        }, 150);
    }

    calcTruckModalPreview() {
        const getNum = (ids) => {
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el && el.value) return parseFloat(el.value) || 0;
            }
            return 0;
        };

        const amount = getNum(['tlogAmount', 'logTripAmount']);
        const fuel = getNum(['tlogFuelCost', 'logFuelCost']);
        const maint = getNum(['tlogMaintenanceCost', 'logMaintenanceCost']);
        const net = amount - fuel - maint;

        const previewEl = document.getElementById('truckModalNetProfitPreview') || document.getElementById('modalTruckNetPreview');
        if (previewEl) {
            previewEl.textContent = (net >= 0 ? '+' : '-') + '₹' + Math.abs(net).toLocaleString('en-IN', { minimumFractionDigits: 2 });
            previewEl.style.color = net >= 0 ? '#10b981' : '#ef4444';
        }
    }

    handleTruckLogSubmit(e) {
        e.preventDefault();
        if (!this.canPerform('canEditTrucks', 'Trucks & Fleet Logistics', 'Save Truck Trip Log')) return;

        const getVal = (ids) => {
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el) return el.value;
            }
            return '';
        };

        const getNum = (ids) => {
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el && el.value) return parseFloat(el.value) || 0;
            }
            return 0;
        };

        const id = getVal(['tlogId', 'truckLogId']);
        const date = getVal(['tlogDate', 'logDate']) || this.getTodayStr();
        const truckName = getVal(['tlogTruck', 'logTruckName']) || 'SUPRO';
        const driverName = getVal(['tlogDriver', 'logDriver']) || 'MANTU';
        const tripType = getVal(['tlogTripType', 'logTripType']) || 'Own Business Delivery';
        const product = getVal(['tlogProduct', 'logProduct']).trim() || 'General Goods';
        const fromLocation = getVal(['tlogFrom', 'logFromLocation']).trim() || '-';
        const toLocation = getVal(['tlogTo', 'logToLocation']).trim() || '-';
        const kmRun = getNum(['tlogKm', 'logKmRun']);
        const tripAmount = getNum(['tlogAmount', 'logTripAmount']);
        const paymentStatus = getVal(['tlogPaymentStatus', 'logPaymentStatus']) || 'Paid';
        const fuelCost = getNum(['tlogFuelCost', 'logFuelCost']);
        const fuelLitres = getNum(['tlogFuelLitres', 'logFuelLitres']);
        const maintenanceCost = getNum(['tlogMaintenanceCost', 'logMaintenanceCost']);
        const maintenanceNotes = getVal(['tlogMaintenanceNotes', 'logMaintenanceNotes']).trim();

        const logData = {
            date,
            month: date.substring(0, 7),
            truckName,
            driverName,
            tripType,
            product,
            fromLocation,
            toLocation,
            kmRun,
            tripAmount,
            paymentStatus,
            fuelCost,
            fuelLitres,
            maintenanceCost,
            maintenanceNotes
        };

        if (id) {
            this.store.updateTruckLog(id, logData);
            this.showToast(`✅ Updated log entry for ${truckName}!`, 'success');
        } else {
            this.store.addTruckLog(logData);
            this.showToast(`✅ New trip logged for ${truckName} (${kmRun} KM run)!`, 'success');
        }

        this.closeModal('truckLogModal');
        this.renderTrucks();
    }

    editTruckLog(id) {
        this.openTruckLogModal(id);
    }

    deleteTruckLog(id) {
        if (!this.canPerform('canEditTrucks', 'Trucks & Fleet Logistics', 'Delete Truck Trip Log')) return;
        if (!confirm('Are you sure you want to permanently delete this truck log entry?')) return;
        
        this.store.deleteTruckLog(id);
        this.showToast('Truck log entry removed.', 'info');
        this.renderTrucks();
    }

    renderTrucks() {
        this.populateTruckMonthDropdown();
        this.populateTruckSelectDropdowns();

        const allLogs = this.store.getTruckLogs() || [];
        const searchEl = document.getElementById('truckSearch') || document.getElementById('truckSearchInput');
        const query = (searchEl ? searchEl.value : '').trim().toLowerCase();

        // 1. Calculate Chronological "KM Run After Last Refueling" per Truck
        const logsByTruck = {};
        allLogs.forEach(l => {
            const tName = (l.truckName || 'SUPRO').toUpperCase();
            if (!logsByTruck[tName]) logsByTruck[tName] = [];
            logsByTruck[tName].push(l);
        });

        const kmRefuelAnalysisMap = {}; // logId -> { kmSinceLastRefuel, isRefuelPoint, accumulatedKm }
        
        Object.keys(logsByTruck).forEach(tName => {
            const truckList = logsByTruck[tName];
            // Sort chronologically ascending
            truckList.sort((a, b) => {
                const cmpDate = (a.date || '').localeCompare(b.date || '');
                if (cmpDate !== 0) return cmpDate;
                return (a.id || '').localeCompare(b.id || '');
            });

            let runningKm = 0;
            truckList.forEach(log => {
                const km = parseFloat(log.kmRun) || 0;
                const fuel = parseFloat(log.fuelCost) || 0;
                const litres = parseFloat(log.fuelLitres) || 0;
                const isRefuel = (fuel > 0 || litres > 0);

                runningKm += km;

                if (isRefuel) {
                    kmRefuelAnalysisMap[log.id] = {
                        kmSinceLastRefuel: runningKm,
                        isRefuelPoint: true,
                        accumulatedKm: runningKm
                    };
                    runningKm = 0; // Reset mileage counter after refueling
                } else {
                    kmRefuelAnalysisMap[log.id] = {
                        kmSinceLastRefuel: runningKm,
                        isRefuelPoint: false,
                        accumulatedKm: runningKm
                    };
                }
            });
        });

        // 2. Filter logs according to user's Selected Month, Truck Selector, and Search Query
        let filteredLogs = allLogs.filter(log => {
            // Month filter
            if (this.selectedTruckMonth && this.selectedTruckMonth !== 'all') {
                const logMonth = log.month || (log.date ? log.date.substring(0, 7) : '');
                if (logMonth !== this.selectedTruckMonth) return false;
            }

            // Truck Name filter
            if (this.selectedTruckName && this.selectedTruckName !== 'all') {
                const tName = (log.truckName || '').toUpperCase();
                if (tName !== this.selectedTruckName.toUpperCase()) return false;
            }

            // Search query
            if (query) {
                const p = (log.product || '').toLowerCase();
                const d = (log.driverName || '').toLowerCase();
                const from = (log.fromLocation || '').toLowerCase();
                const to = (log.toLocation || '').toLowerCase();
                const t = (log.truckName || '').toLowerCase();
                const type = (log.tripType || '').toLowerCase();
                const notes = (log.maintenanceNotes || '').toLowerCase();
                return p.includes(query) || d.includes(query) || from.includes(query) || to.includes(query) || t.includes(query) || type.includes(query) || notes.includes(query);
            }

            return true;
        });

        // Sort filtered logs in descending order for table presentation (newest first)
        filteredLogs.sort((a, b) => {
            const cmp = (b.date || '').localeCompare(a.date || '');
            if (cmp !== 0) return cmp;
            return (b.id || '').localeCompare(a.id || '');
        });

        // 3. Compute Financial KPI Metrics for current selection
        let totalTrips = filteredLogs.length;
        let totalDistance = 0;
        let totalRevenue = 0;
        let totalFuelCost = 0;
        let totalMaintenance = 0;

        filteredLogs.forEach(l => {
            totalDistance += parseFloat(l.kmRun) || 0;
            totalRevenue += parseFloat(l.tripAmount) || 0;
            totalFuelCost += parseFloat(l.fuelCost) || 0;
            totalMaintenance += parseFloat(l.maintenanceCost) || 0;
        });

        const netOperatingProfit = totalRevenue - totalFuelCost - totalMaintenance;

        // 4. Update KPI DOM Elements
        const setMultiSafeText = (candidateIds, text) => {
            for (const id of candidateIds) {
                const el = document.getElementById(id);
                if (el) el.textContent = text;
            }
        };

        const activeTruckLabel = this.selectedTruckName === 'all' ? 'All Trucks' : this.selectedTruckName;
        const activeMonthLabel = this.selectedTruckMonth === 'all' ? 'All Time' : this.selectedTruckMonth;

        setMultiSafeText(['truckKpiTotalTrips', 'truckKpiTrips'], totalTrips + ' Trips');
        setMultiSafeText(['truckKpiTripsSub'], `${activeTruckLabel} • ${activeMonthLabel}`);
        
        setMultiSafeText(['truckKpiTotalKM', 'truckKpiDistance'], totalDistance.toLocaleString('en-IN') + ' KM');
        setMultiSafeText(['truckKpiDistanceSub'], totalTrips > 0 ? `Avg ${(totalDistance / totalTrips).toFixed(1)} KM / trip` : '0 KM');

        setMultiSafeText(['truckKpiTotalRevenue', 'truckKpiRevenue'], '₹' + totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        setMultiSafeText(['truckKpiRevenueSub'], 'Freight & deliveries earnings');

        setMultiSafeText(['truckKpiFuelCost'], '₹' + totalFuelCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        setMultiSafeText(['truckKpiFuelCostSub'], 'Diesel refills & fuel expense');

        setMultiSafeText(['truckKpiMaintenanceCost', 'truckKpiMaintenance'], '₹' + totalMaintenance.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        setMultiSafeText(['truckKpiMaintenanceSub'], 'Repairs, servicing & parts');

        const netText = (netOperatingProfit >= 0 ? '+₹' : '-₹') + Math.abs(netOperatingProfit).toLocaleString('en-IN', { minimumFractionDigits: 2 });
        setMultiSafeText(['truckKpiNetProfit'], netText);
        const profitMargin = totalRevenue > 0 ? ((netOperatingProfit / totalRevenue) * 100).toFixed(1) : '0';
        setMultiSafeText(['truckKpiNetProfitSub'], `Margin: ${profitMargin}% of gross revenue`);

        const netEl = document.getElementById('truckKpiNetProfit');
        if (netEl) {
            netEl.style.color = netOperatingProfit >= 0 ? '#10b981' : '#ef4444';
        }

        // 5. Render Detailed Logs Table Body
        const tbody = document.getElementById('truckLogsTableBody') || document.getElementById('trucksTableBody');
        if (!tbody) return;

        if (filteredLogs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="13" style="text-align: center; padding: 36px 20px; color: var(--text-muted);">
                        <div style="font-size: 2rem; margin-bottom: 8px;">🚚</div>
                        <div style="font-weight: 700; font-size: 1rem; color: var(--text-secondary);">No trip or logistics records found for this view</div>
                        <div style="font-size: 0.84rem; margin-top: 4px;">Click <strong>"+ Add Truck Trip / Delivery"</strong> to log trips, diesel refills, and maintenance expenses.</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredLogs.map(log => {
            const netProfit = (parseFloat(log.tripAmount) || 0) - (parseFloat(log.fuelCost) || 0) - (parseFloat(log.maintenanceCost) || 0);
            const tName = (log.truckName || 'SUPRO').toUpperCase();
            
            let truckBadgeClass = 'badge-supro';
            if (tName === 'BOLERO') truckBadgeClass = 'badge-bolero';
            else if (tName !== 'SUPRO') truckBadgeClass = 'badge-info';

            // Payment status badge
            let paymentBadge = '<span class="badge badge-success">✓ Paid</span>';
            if (log.paymentStatus === 'Due') {
                paymentBadge = '<span class="badge badge-danger">⏳ Payment Due</span>';
            } else if (log.paymentStatus === 'Partial') {
                paymentBadge = '<span class="badge badge-warning">⚡ Partial</span>';
            }

            // Trip Type Badge
            let typeBadge = '';
            if (log.tripType === 'Third-Party Delivery') {
                typeBadge = '<span class="badge badge-purple" style="font-size: 0.68rem; margin-left: 4px;">👥 3rd-Party</span>';
            } else if (log.tripType === 'Internal Transfer') {
                typeBadge = '<span class="badge badge-secondary" style="font-size: 0.68rem; margin-left: 4px;">🔄 Internal</span>';
            }

            // Diesel Refuel Details
            const fuelCost = parseFloat(log.fuelCost) || 0;
            const fuelLitres = parseFloat(log.fuelLitres) || 0;
            let refuelDisplay = '<span style="color: var(--text-muted); font-size: 0.82rem;">-</span>';
            if (fuelCost > 0 || fuelLitres > 0) {
                refuelDisplay = `
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span class="refuel-pill">⛽ ₹${fuelCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        ${fuelLitres > 0 ? `<span style="font-size: 0.74rem; color: var(--text-secondary); font-weight: 600;">${fuelLitres} Litres</span>` : ''}
                    </div>
                `;
            }

            // KM Run After Last Refueling
            const refuelAnalysis = kmRefuelAnalysisMap[log.id] || { kmSinceLastRefuel: log.kmRun, isRefuelPoint: false };
            let kmAfterRefuelDisplay = '';
            if (refuelAnalysis.isRefuelPoint) {
                kmAfterRefuelDisplay = `
                    <div class="km-run-badge refuel-cycle">
                        <span>⚡ <strong>${refuelAnalysis.kmSinceLastRefuel} KM</strong></span>
                        <span style="font-size: 0.68rem; opacity: 0.9;">between refills</span>
                    </div>
                `;
            } else {
                kmAfterRefuelDisplay = `
                    <div class="km-run-badge">
                        <span><strong>${refuelAnalysis.kmSinceLastRefuel} KM</strong></span>
                        <span style="font-size: 0.68rem; color: var(--text-muted);">since last refill</span>
                    </div>
                `;
            }

            // Maintenance Details
            const maintCost = parseFloat(log.maintenanceCost) || 0;
            let maintDisplay = '<span style="color: var(--text-muted); font-size: 0.82rem;">-</span>';
            if (maintCost > 0 || log.maintenanceNotes) {
                maintDisplay = `
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        ${maintCost > 0 ? `<strong style="color: #f59e0b; font-size: 0.88rem;">🔧 ₹${maintCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>` : ''}
                        ${log.maintenanceNotes ? `<span style="font-size: 0.74rem; color: var(--text-secondary); max-width: 150px; line-height: 1.2;">${log.maintenanceNotes}</span>` : ''}
                    </div>
                `;
            }

            const netColor = netProfit >= 0 ? '#10b981' : '#ef4444';

            return `
                <tr>
                    <td style="white-space: nowrap; font-weight: 600; font-size: 0.85rem;">
                        📅 ${log.date}
                    </td>
                    <td>
                        <span class="badge badge-truck ${truckBadgeClass}">🚚 ${tName}</span>
                    </td>
                    <td style="font-weight: 700; color: #38bdf8;">
                        👤 ${log.driverName || 'MANTU'}
                    </td>
                    <td>
                        <div style="font-weight: 600; color: var(--text-primary); font-size: 0.88rem;">
                            ${log.product || 'General Delivery'}
                            ${typeBadge}
                        </div>
                    </td>
                    <td>
                        <div class="route-display">
                            <span class="loc-point">🚩 ${log.fromLocation || 'Factory / Depot'}</span>
                            <span class="loc-arrow">➔</span>
                            <span class="loc-point">🏁 ${log.toLocation || 'Retailer / Hub'}</span>
                        </div>
                    </td>
                    <td style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; white-space: nowrap;">
                        ${parseFloat(log.kmRun || 0).toLocaleString('en-IN')} <span style="font-size: 0.75rem; color: var(--text-muted);">KM</span>
                    </td>
                    <td style="font-weight: 800; color: #38bdf8; font-size: 0.95rem; white-space: nowrap;">
                        ₹${(parseFloat(log.tripAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                        ${paymentBadge}
                    </td>
                    <td>
                        ${refuelDisplay}
                    </td>
                    <td>
                        ${kmAfterRefuelDisplay}
                    </td>
                    <td>
                        ${maintDisplay}
                    </td>
                    <td style="font-weight: 800; font-size: 0.95rem; color: ${netColor}; white-space: nowrap;">
                        ${netProfit >= 0 ? '+' : ''}₹${netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                        <div style="display: flex; gap: 6px; align-items: center;">
                            <button class="btn btn-secondary btn-sm" onclick="app.editTruckLog('${log.id}')" title="Edit trip entry" style="padding: 4px 8px; font-size: 0.78rem;">✏️ Edit</button>
                            <button class="btn btn-outline-danger btn-sm" onclick="app.deleteTruckLog('${log.id}')" title="Delete trip entry" style="padding: 4px 8px; font-size: 0.78rem;">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    reloadSeedData() {
        if (!confirm('Reload sample demo data? Any existing custom entries will be replaced.')) return;
        this.store.loadDemoSeedData();
        this.showToast('Demo sample data loaded!', 'success');
        this.closeModal('resetModal');
        this.renderAll();
    }
}

// Global initialization
if (typeof window !== 'undefined') {
    window.AquaTrackApp = AquaTrackApp;
    window.DataStore = DataStore;

    window.closeModal = function(id) {
        if (window.app && window.app.closeModal) window.app.closeModal(id);
        else {
            var el = id ? document.getElementById(id) : document.querySelector('.modal-overlay.active');
            if (el) { el.classList.remove('active'); el.style.display = 'none'; }
        }
    };

    window.openModal = function(id) {
        if (window.app && window.app.openModal) window.app.openModal(id);
        else {
            var el = document.getElementById(id);
            if (el) { el.classList.add('active'); el.style.display = 'flex'; }
        }
    };

    window.openRequestAccessModal = function(email) {
        if (window.app && window.app.openRequestAccessModal) window.app.openRequestAccessModal(email);
    };

    // Immediately instantiate if DOM is already loaded, or on DOMContentLoaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        window.app = new AquaTrackApp();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.app) window.app = new AquaTrackApp();
        });
    }
}