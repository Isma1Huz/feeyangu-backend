const en = {
  APP_NAME: 'Feeyangu',
  APP_TAGLINE: 'Smart School Fee Management',
  APP_DESCRIPTION: 'Simplify fee collection, tracking, and reporting for schools and parents.',

  AUTH_TEXT: {
    login: {
      title: 'Welcome back',
      subtitle: 'Sign in to your account to continue',
      emailLabel: 'Email address',
      emailPlaceholder: 'Enter your email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      submitButton: 'Sign in',
      noAccount: "Don't have an account?",
      registerLink: 'Create one',
      orContinue: 'Or continue with',
    },
    register: {
      title: 'Create your account',
      subtitle: 'Get started with Feeyangu today',
      nameLabel: 'Full name',
      namePlaceholder: 'Enter your full name',
      emailLabel: 'Email address',
      emailPlaceholder: 'Enter your email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Create a password',
      confirmPasswordLabel: 'Confirm password',
      confirmPasswordPlaceholder: 'Confirm your password',
      roleLabel: 'I am a',
      roleParent: 'Parent',
      roleSchoolAdmin: 'School Administrator',
      schoolNameLabel: 'School name',
      schoolNamePlaceholder: 'Enter school name',
      termsText: 'I agree to the',
      termsLink: 'Terms & Conditions',
      submitButton: 'Create account',
      hasAccount: 'Already have an account?',
      loginLink: 'Sign in',
    },
    forgotPassword: {
      title: 'Reset your password',
      subtitle: "Enter your email and we'll send you a reset link",
      emailLabel: 'Email address',
      emailPlaceholder: 'Enter your email',
      submitButton: 'Send reset link',
      backToLogin: 'Back to sign in',
      successMessage: 'Check your email for a password reset link.',
    },
  },

  SIDEBAR_TEXT: {
    superAdmin: {
      label: 'Platform',
      items: { dashboard: 'Dashboard', schools: 'Schools', users: 'Users', settings: 'Settings' },
    },
    schoolAdmin: {
      main: { label: 'Main', items: { dashboard: 'Dashboard', students: 'Students', grades: 'Grades & Classes' } },
      finance: { label: 'Finance', items: { feeStructures: 'Fee Structures', payments: 'Payments', receipts: 'Receipts' } },
      settings: { label: 'Settings', items: { paymentMethods: 'Payment Methods', terms: 'Academic Terms', settings: 'School Settings' } },
    },
    parent: {
      label: 'Menu',
      items: { dashboard: 'Dashboard', children: 'My Children', payments: 'Payment History', receipts: 'Receipts', ptMeetings: 'PT Meetings' },
    },
  },

  DASHBOARD_TEXT: {
    school: {
      title: 'School Dashboard',
      bannerTitle: 'Welcome to Your School Portal',
      bannerDescription: 'Manage students, track fee payments, and generate reports from one place.',
      kpi: { totalStudents: 'Total Students', feesCollected: 'Fees Collected', pendingFees: 'Pending Fees', overdueAccounts: 'Overdue Accounts' },
      revenueChart: 'Monthly Revenue',
      recentPayments: 'Recent Payments',
      overdueAlert: 'Overdue Fees Alert',
    },
    parent: {
      title: 'Home',
      subtitle: "Overview of your children's fee management profile",
      bannerTitle: "Manage Your Children's Fees",
      bannerDescription: 'View fee balances, make payments, and download receipts for all your children in one place.',
      bannerAction: 'Make a Payment',
      childrenSection: 'My Children',
      outstandingFees: 'Total Outstanding Fees',
      recentPayments: 'Recent Payments',
      quickPay: 'Quick Pay',
      viewFees: 'View Fees',
      overviewTitle: 'Overview - Current Term 2026',
      totalFeesDue: 'Total Fees Due',
      totalPaid: 'Total Paid',
    },
    admin: {
      title: 'Platform Overview',
      bannerTitle: 'Feeyangu Admin Console',
      bannerDescription: 'Monitor platform-wide statistics, manage schools, and oversee all users.',
      kpi: { totalSchools: 'Total Schools', activeUsers: 'Active Users', monthlyRevenue: 'Monthly Revenue', pendingApprovals: 'Pending Approvals' },
      topSchools: 'Top Performing Schools',
      recentActivity: 'Recent Activity',
    },
  },

  STUDENTS_TEXT: {
    title: 'Students',
    searchPlaceholder: 'Search by name or admission number...',
    addStudent: 'Add Student',
    importCsv: 'Import CSV',
    exportCsv: 'Export CSV',
    filters: { grade: 'All Grades', status: 'All Status', class: 'All Classes' },
    table: { admissionNo: 'Admission #', name: 'Student Name', grade: 'Grade', class: 'Class', parent: 'Parent', fees: 'Fee Status', status: 'Status', actions: 'Actions' },
    emptyState: { title: 'No students found', description: 'Start by adding your first student or importing from CSV.' },
    form: { createTitle: 'Add New Student', editTitle: 'Edit Student', firstName: 'First Name', lastName: 'Last Name', admissionNumber: 'Admission Number', grade: 'Grade', className: 'Class', parentName: 'Parent Name', parentEmail: 'Parent Email', status: 'Status' },
  },

  GRADES_TEXT: {
    title: 'Grades & Classes',
    subtitle: 'Manage your school grades and class sections.',
    addGrade: 'Add Grade',
    addClass: 'Add Class',
    editGrade: 'Edit Grade',
    deleteGrade: 'Delete Grade',
    editClass: 'Edit Class',
    deleteClass: 'Delete Class',
    table: { grade: 'Grade', classes: 'Classes', students: 'Students', actions: 'Actions' },
    classTable: { name: 'Class Name', teacher: 'Class Teacher', students: 'Students', actions: 'Actions' },
    form: { gradeName: 'Grade Name', gradeNamePlaceholder: 'e.g. Grade 5', className: 'Class Name', classNamePlaceholder: 'e.g. 5A', teacher: 'Class Teacher', teacherPlaceholder: 'e.g. Mrs. Kamau', selectGrade: 'Select Grade' },
    emptyState: { title: 'No grades yet', description: 'Start by creating your first grade.' },
    deleteConfirm: 'Are you sure you want to delete this? This action cannot be undone.',
  },

  FEE_STRUCTURES_TEXT: {
    title: 'Fee Structures',
    subtitle: 'Define and manage fee structures for each grade and term.',
    addFeeStructure: 'Add Fee Structure',
    editFeeStructure: 'Edit Fee Structure',
    table: { name: 'Name', grade: 'Grade', term: 'Term', totalAmount: 'Total Amount', status: 'Status', actions: 'Actions' },
    detail: { feeBreakdown: 'Fee Breakdown', itemName: 'Item', itemAmount: 'Amount', addItem: 'Add Fee Item', total: 'Total' },
    form: { name: 'Structure Name', namePlaceholder: 'e.g. Grade 5 - Term 1 2026', grade: 'Grade', term: 'Term', status: 'Status', feeItemName: 'Item Name', feeItemNamePlaceholder: 'e.g. Tuition', feeItemAmount: 'Amount' },
    emptyState: { title: 'No fee structures', description: 'Create fee structures to assign fees to students.' },
  },

  PAYMENTS_TEXT: {
    title: 'Payments',
    subtitle: 'View and manage all payment transactions.',
    searchPlaceholder: 'Search by student name or reference...',
    exportCsv: 'Export CSV',
    table: { date: 'Date', student: 'Student', amount: 'Amount', method: 'Method', status: 'Status', reference: 'Reference', actions: 'Actions' },
    filters: { allMethods: 'All Methods', allStatus: 'All Status' },
    actions: { approve: 'Approve', reject: 'Reject', viewDetails: 'View Details' },
    emptyState: { title: 'No payments found', description: 'Payments will appear here once received.' },
  },

  RECEIPTS_TEXT: {
    title: 'Receipts',
    subtitle: 'View and download payment receipts.',
    searchPlaceholder: 'Search by receipt number or student...',
    table: { receiptNo: 'Receipt #', date: 'Date', student: 'Student', amount: 'Amount', method: 'Method', actions: 'Actions' },
    preview: { title: 'Receipt Preview', schoolName: 'Green Valley Academy', receiptLabel: 'Receipt', dateLabel: 'Date', studentLabel: 'Student', referenceLabel: 'Payment Reference', methodLabel: 'Payment Method', itemLabel: 'Description', amountLabel: 'Amount', totalLabel: 'Total Paid' },
    emptyState: { title: 'No receipts found', description: 'Receipts are generated after payments are completed.' },
  },

  PAYMENT_METHODS_TEXT: {
    title: 'Payment Methods',
    subtitle: 'Configure the payment methods available to parents.',
    addMethod: 'Add Method',
    table: { name: 'Name', type: 'Type', details: 'Details', enabled: 'Enabled', actions: 'Actions' },
    form: { name: 'Method Name', namePlaceholder: 'e.g. M-Pesa Paybill', type: 'Type', details: 'Details / Instructions', detailsPlaceholder: 'e.g. Paybill: 123456, Account: School Fees', enabled: 'Enabled' },
    emptyState: { title: 'No payment methods', description: 'Add payment methods for parents to use.' },
  },

  TERMS_TEXT: {
    title: 'Academic Terms',
    subtitle: 'Manage school terms and academic calendar.',
    addTerm: 'Add Term',
    table: { name: 'Term Name', year: 'Year', startDate: 'Start Date', endDate: 'End Date', status: 'Status', actions: 'Actions' },
    form: { name: 'Term Name', namePlaceholder: 'e.g. Term 1 2026', year: 'Year', startDate: 'Start Date', endDate: 'End Date', status: 'Status' },
    emptyState: { title: 'No terms defined', description: 'Create academic terms to organize your school calendar.' },
  },

  SCHOOL_SETTINGS_TEXT: {
    title: 'School Settings',
    subtitle: 'Customize your school profile and preferences.',
    sections: { profile: 'School Profile', branding: 'Branding', subscription: 'Subscription' },
    fields: { schoolName: 'School Name', schoolNamePlaceholder: 'Enter school name', motto: 'School Motto', mottoPlaceholder: 'Enter school motto', location: 'Location', locationPlaceholder: 'Enter location', email: 'Contact Email', emailPlaceholder: 'Enter contact email', phone: 'Phone Number', phonePlaceholder: 'Enter phone number', primaryColor: 'Primary Color', secondaryColor: 'Secondary Color', logo: 'School Logo', uploadLogo: 'Upload Logo' },
    subscription: { plan: 'Current Plan', planValue: 'Premium', status: 'Status', statusValue: 'Active', nextBilling: 'Next Billing Date', nextBillingValue: 'March 1, 2026' },
    saveButton: 'Save Changes',
    savedMessage: 'Settings saved successfully.',
  },

  COMMON_TEXT: {
    actions: { save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', view: 'View', create: 'Create', export: 'Export', import: 'Import', search: 'Search', filter: 'Filter', refresh: 'Refresh', download: 'Download', print: 'Print', close: 'Close', confirm: 'Confirm', back: 'Back', next: 'Next' },
    status: { active: 'Active', inactive: 'Inactive', pending: 'Pending', completed: 'Completed', failed: 'Failed', overdue: 'Overdue', paid: 'Paid', partial: 'Partial', suspended: 'Suspended', upcoming: 'Upcoming' },
    currency: 'KES',
    noData: 'No data available',
    loading: 'Loading...',
    logout: 'Log out',
    profile: 'Profile',
    notifications: 'Notifications',
    settings: 'Settings',
    vsLastMonth: 'vs last month',
    notFoundTitle: '404',
    notFoundMessage: 'Oops! Page not found',
    notFoundLink: 'Return to Home',
  },

  PAYMENT_METHOD_LABELS: { mpesa: 'M-Pesa', bank: 'Bank Transfer', cash: 'Cash', card: 'Card' } as Record<string, string>,

  PARENT_CHILDREN_TEXT: {
    title: 'My Children',
    subtitle: 'View fees and make payments for your children.',
    viewFees: 'View Fees',
    quickPay: 'Quick Pay',
    feeProgress: 'Fee Progress',
  },

  PARENT_FEES_TEXT: {
    title: 'Fee Details',
    subtitle: 'Fee breakdown and payment status',
    item: 'Fee Item',
    total: 'Total',
    paid: 'Paid',
    balance: 'Balance',
    status: 'Status',
    payNow: 'Pay Now',
    backToChildren: 'Back to Children',
    totalOutstanding: 'Total Outstanding',
  },

  PARENT_PAY_TEXT: {
    title: 'Make Payment',
    selectMethod: 'Select Payment Method',
    amount: 'Amount (KES)',
    reference: 'Payment Reference',
    referencePlaceholder: 'e.g. M-Pesa transaction code',
    submitPayment: 'Submit Payment',
    cancel: 'Cancel',
  },

  PARENT_PAYMENTS_TEXT: {
    title: 'Payment History',
    subtitle: 'View all your past payments across all children.',
    searchPlaceholder: 'Search by reference...',
    filterChild: 'All Children',
    table: { date: 'Date', child: 'Child', amount: 'Amount', method: 'Method', status: 'Status', reference: 'Reference' },
    emptyState: { title: 'No payments yet', description: 'Your payment history will appear here.' },
  },

  PARENT_RECEIPTS_TEXT: {
    title: 'Receipts',
    subtitle: 'Download and print receipts for your payments.',
    searchPlaceholder: 'Search by receipt number...',
    filterChild: 'All Children',
    table: { receiptNo: 'Receipt #', date: 'Date', child: 'Child', amount: 'Amount', actions: 'Actions' },
    emptyState: { title: 'No receipts', description: 'Receipts will appear after completed payments.' },
  },

  ADMIN_SCHOOLS_TEXT: {
    title: 'Schools',
    subtitle: 'Manage all schools on the platform.',
    addSchool: 'Add School',
    searchPlaceholder: 'Search schools...',
    table: { name: 'School Name', owner: 'Owner', location: 'Location', students: 'Students', feesCollected: 'Fees Collected', status: 'Status', actions: 'Actions' },
    form: { name: 'School Name', namePlaceholder: 'Enter school name', owner: 'Owner Name', ownerPlaceholder: 'Enter owner name', location: 'Location', locationPlaceholder: 'Enter location', status: 'Status' },
    emptyState: { title: 'No schools', description: 'No schools registered yet.' },
    actions: { activate: 'Activate', suspend: 'Suspend', delete: 'Delete' },
  },

  ADMIN_USERS_TEXT: {
    title: 'Users',
    subtitle: 'Manage all users across the platform.',
    searchPlaceholder: 'Search users...',
    filterRole: 'All Roles',
    filterStatus: 'All Status',
    table: { name: 'Name', email: 'Email', role: 'Role', school: 'School', status: 'Status', lastLogin: 'Last Login', actions: 'Actions' },
    actions: { deactivate: 'Deactivate', activate: 'Activate', resetPassword: 'Reset Password' },
    emptyState: { title: 'No users found', description: 'Users will appear here.' },
  },

  ADMIN_SETTINGS_TEXT: {
    title: 'Platform Settings',
    subtitle: 'Configure global platform settings.',
    sections: { general: 'General', notifications: 'Notifications', billing: 'Billing' },
    fields: { platformName: 'Platform Name', platformNamePlaceholder: 'Feeyangu', supportEmail: 'Support Email', supportEmailPlaceholder: 'support@feeyangu.com', defaultCurrency: 'Default Currency', maintenanceMode: 'Maintenance Mode', emailNotifications: 'Email Notifications', smsNotifications: 'SMS Notifications', paymentAlerts: 'Payment Alerts', overdueReminders: 'Overdue Reminders' },
    saveButton: 'Save Settings',
    savedMessage: 'Platform settings saved.',
  },

  // Header & misc
  HEADER: {
    roleLabels: { super_admin: 'Super Admin', school_admin: 'School Admin', parent: 'Parent', teacher: 'Teacher', accountant: 'Accountant' } as Record<string, string>,
    childrenSummary: 'Children Summary',
    recentReceipts: 'Recent Receipts',
    viewAll: 'View All',
    feeProgress: 'Fee Progress',
    daysOverdue: 'days overdue',
    platformStats: 'Platform-wide statistics and management.',
    welcomeBack: 'Welcome back. Here\'s your school overview.',
    studentInfo: 'Student Information',
    feeStatus: 'Fee Status',
    totalFees: 'Total Fees',
    paid: 'Paid',
    balanceLabel: 'Balance',
    paymentProgress: 'Payment Progress',
    paymentHistory: 'Payment History',
    noPaymentsYet: 'No payments recorded yet.',
    studentNotFound: 'Student not found',
    deleteConfirmGeneric: 'Are you sure? This action cannot be undone.',
    fillDetails: 'Fill in the details below.',
    paymentDetails: 'Payment transaction details.',
  },

  LANGUAGE: {
    label: 'Language',
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    nl: 'Nederlands',
    sw: 'Kiswahili',
  },

  // Teacher sidebar
  SIDEBAR_TEACHER: {
    label: 'Teaching',
    items: {
      dashboard: 'Dashboard',
      myClasses: 'My Classes',
      results: 'Results Entry',
      attendance: 'Attendance',
      portfolio: 'CBC Portfolio',
      ptMeetings: 'PT Meetings',
      announcements: 'Announcements',
      profile: 'Profile',
    },
  },

  // Portfolio
  PORTFOLIO_TEXT: {
    pageTitle: 'CBC Digital Portfolio',
    pageSubtitle: 'Manage student learning portfolios across all CBC learning areas.',
    completionRing: { complete: 'Complete', inProgress: 'In Progress', notStarted: 'Not Started' },
    evidence: {
      add: 'Add Evidence',
      edit: 'Edit Evidence',
      delete: 'Delete Evidence',
      publish: 'Publish',
      types: { photo: 'Photo', video: 'Video', document: 'Document', drawing: 'Drawing', craft_photo: 'Craft Photo', written_work: 'Written Work', audio: 'Audio' },
    },
    ratings: { EE: 'EE', ME: 'ME', AE: 'AE', BE: 'BE', EEFull: 'Exceeds Expectation', MEFull: 'Meets Expectation', AEFull: 'Approaching Expectation', BEFull: 'Below Expectation' },
    learningAreas: { empty: 'No learning areas configured', addArea: 'Add Learning Area', configure: 'Configure' },
    parentView: { downloadButton: 'Download Portfolio', draftHidden: 'Draft items are hidden from parent view.', noEvidenceYet: 'No evidence uploaded yet for this strand.' },
    bulkUpload: { title: 'Bulk Upload Evidence', dropzone: 'Drag & drop images here or click to browse', assignStudent: 'Assign to Student', saveAll: 'Save All' },
  },

  // PT Meetings
  PT_MEETINGS_TEXT: {
    pageTitle: 'Parent-Teacher Meetings',
    bookMeeting: 'Book Meeting',
    myMeetings: 'My Meetings',
    session: { create: 'Create Session', open: 'Open for Booking', close: 'Close Booking', complete: 'Mark Complete', draft: 'Draft' },
    slot: { available: 'Available', booked: 'Booked', blocked: 'Blocked', select: 'Select Slot' },
    booking: { confirm: 'Confirm', cancel: 'Cancel', reschedule: 'Reschedule', pending: 'Pending', confirmed: 'Confirmed' },
    steps: { selectChild: 'Select Child', selectTeacher: 'Select Teacher', selectSlot: 'Select Time Slot', confirm: 'Confirm Booking' },
    notifications: { bookingRequest: 'Meeting request sent', confirmed: 'Meeting confirmed', reminder: 'Meeting reminder', cancelled: 'Meeting cancelled' },
    calendar: { addToCalendar: 'Add to Calendar' },
  },

  // Health
  HEALTH_TEXT: {
    pageTitle: 'Health & Medical Records',
    healthProfile: 'Health Profile',
    condition: {
      add: 'Add Condition', edit: 'Edit Condition', deactivate: 'Deactivate',
      types: { chronic: 'Chronic', allergy: 'Allergy', disability: 'Disability', dietary: 'Dietary', mental_health: 'Mental Health', other: 'Other' },
      severities: { mild: 'Mild', moderate: 'Moderate', severe: 'Severe', critical: 'Critical', life_threatening: 'Life-Threatening' },
    },
    allergy: {
      add: 'Add Allergy', remove: 'Remove Allergy', epiPen: 'EpiPen', responseProtocol: 'Response Protocol',
      severities: { mild: 'Mild', moderate: 'Moderate', severe: 'Severe', critical: 'Critical', life_threatening: 'Life-Threatening' },
    },
    vaccination: { add: 'Add Vaccination', edit: 'Edit', statuses: { up_to_date: 'Up to Date', due_soon: 'Due Soon', overdue: 'Overdue' }, dueDate: 'Due Date', upToDate: 'Up to Date' },
    incident: {
      record: 'Record Incident', resolve: 'Resolve', followUp: 'Follow-Up', parentNotify: 'Parent Notified',
      types: { injury: 'Injury', illness: 'Illness', allergic_reaction: 'Allergic Reaction', mental_health: 'Mental Health', emergency: 'Emergency', other: 'Other' },
    },
    emergency: { contacts: 'Emergency Contacts', addContact: 'Add Contact', priority: 'Priority' },
    documents: { upload: 'Upload Document', download: 'Download', types: { medical_certificate: 'Medical Certificate', vaccination_card: 'Vaccination Card', doctor_letter: 'Doctor Letter', disability_assessment: 'Disability Assessment', insurance_card: 'Insurance Card', other: 'Other' } },
    tripSheet: { generate: 'Generate Trip Sheet', selectClass: 'Select Class', format: 'Format' },
    parentView: { flagUpdate: 'Flag an Update', downloadSummary: 'Download Health Summary', updatePending: 'Update Pending Review' },
    alerts: { severeCondition: 'Severe Condition', lifeThreateningAllergy: 'Life-Threatening Allergy', vaccinationDue: 'Vaccination Due' },
  },

  // Teacher dashboard
  TEACHER_DASHBOARD_TEXT: {
    title: 'Teacher Dashboard',
    subtitle: 'Welcome back. Here\'s your teaching overview.',
    kpi: { myClasses: 'My Classes', myStudents: 'My Students', assessmentsSubmitted: 'Assessments Submitted', attendanceRate: 'Attendance Rate' },
    schedule: 'Today\'s Schedule',
    classPerformance: 'Class Performance',
    attendanceTrend: 'Attendance Trend',
    gradeDistribution: 'Grade Distribution (CBC)',
    lowAttendance: 'Students with Low Attendance (<80%)',
    pendingPortfolios: 'Pending Portfolio Reviews',
  },

  // Teacher pages
  TEACHER_CLASSES_TEXT: {
    title: 'My Classes',
    subtitle: 'View and manage your assigned classes.',
    classDetail: 'Class Detail',
    tabs: { students: 'Students', results: 'Results', attendance: 'Attendance', portfolio: 'Portfolio', announcements: 'Announcements' },
  },

  TEACHER_RESULTS_TEXT: {
    title: 'Results Entry',
    subtitle: 'Enter and submit student exam results.',
    steps: { selectExam: 'Select Exam', enterScores: 'Enter Scores', review: 'Review & Submit' },
    fields: { term: 'Term', exam: 'Exam', subject: 'Subject', class: 'Class', score: 'Score', grade: 'Grade', remarks: 'Remarks' },
    actions: { saveDraft: 'Save as Draft', submit: 'Submit for Review', bulkUpload: 'Bulk CSV Upload' },
    cbcMode: { strand: 'Strand', rating: 'Rating' },
  },

  TEACHER_ATTENDANCE_TEXT: {
    title: 'Attendance Recording',
    subtitle: 'Record daily student attendance.',
    modes: { manual: 'Manual Entry', upload: 'Upload Sheet' },
    status: { present: 'Present', absent: 'Absent', late: 'Late', excused: 'Excused' },
    actions: { submit: 'Submit Attendance', uploadFile: 'Upload File' },
    history: 'Attendance History',
  },

  TEACHER_ANNOUNCEMENTS_TEXT: {
    title: 'Announcements',
    subtitle: 'Send announcements to parents and students.',
    create: 'Create Announcement',
    fields: { title: 'Title', body: 'Message', target: 'Target Audience', priority: 'Priority', category: 'Category' },
    priorities: { normal: 'Normal', important: 'Important', urgent: 'Urgent' },
    categories: { general: 'General', cbcMaterials: 'CBC Materials', event: 'Event', health: 'Health Notice', academic: 'Academic', portfolio: 'Portfolio' },
  },

  // Accountant sidebar
  SIDEBAR_ACCOUNTANT: {
    label: 'Finance',
    items: {
      dashboard: 'Dashboard',
      feeStructures: 'Fee Structures',
      invoicing: 'Invoicing',
      payments: 'Payments',
      reconciliation: 'Reconciliation',
      reports: 'Financial Reports',
      expenses: 'Expenses',
      integrations: 'Integrations',
      paymentGateway: 'Payment Config',
    },
  },

  // Accountant pages
  ACCOUNTANT_DASHBOARD_TEXT: {
    title: 'Accountant Dashboard',
    subtitle: 'Daily financial operations and reconciliation overview.',
    kpi: {
      dailyCollections: 'Daily Collections',
      pendingReconciliation: 'Pending Reconciliation',
      unmatchedTransactions: 'Unmatched Transactions',
      outstandingInvoices: 'Outstanding Invoices',
      paymentSuccessRate: 'Payment Success Rate',
      pettyCashBalance: 'Petty Cash Balance',
    },
    collectionTrend: 'Collection vs Invoiced',
    paymentMethods: 'Payment Method Distribution',
    receivablesAging: 'Receivables Aging',
    recentActivity: 'Today\'s Payment Activity',
    reconciliationQueue: 'Reconciliation Queue',
    integrationStatus: 'Integration Status',
  },

  ACCOUNTANT_INVOICING_TEXT: {
    title: 'Invoice Management',
    subtitle: 'Generate, send, and manage student fee invoices.',
    searchPlaceholder: 'Search by invoice number or student...',
    generateInvoices: 'Generate Invoices',
    sendReminder: 'Send Reminder',
    table: { invoiceNo: 'Invoice #', student: 'Student', grade: 'Grade', term: 'Term', total: 'Total', paid: 'Paid', balance: 'Balance', status: 'Status', dueDate: 'Due Date', actions: 'Actions' },
    filters: { allStatus: 'All Status', allGrades: 'All Grades' },
    actions: { send: 'Send', void: 'Void', download: 'Download PDF', markPaid: 'Mark as Paid', viewDetails: 'View Details' },
    emptyState: { title: 'No invoices', description: 'Generate invoices at the start of each term.' },
  },

  ACCOUNTANT_RECONCILIATION_TEXT: {
    title: 'Bank Reconciliation',
    subtitle: 'Match bank transactions with system payments.',
    importStatement: 'Import Bank Statement',
    autoMatch: 'Auto-Match',
    tabs: { matched: 'Matched', suggested: 'Suggested Matches', unmatchedBank: 'Unmatched Bank', unmatchedSystem: 'Unmatched System' },
    confidence: { high: 'High', medium: 'Medium', low: 'Low' },
    actions: { confirmMatch: 'Confirm', rejectMatch: 'Reject', manualMatch: 'Manual Match', markComplete: 'Complete Reconciliation' },
  },

  ACCOUNTANT_REPORTS_TEXT: {
    title: 'Financial Reports',
    subtitle: 'Generate and export comprehensive financial reports.',
    reports: {
      incomeStatement: 'Income Statement',
      cashFlow: 'Cash Flow Statement',
      feeCollection: 'Fee Collection Report',
      outstanding: 'Outstanding Fees Report',
      paymentMethod: 'Payment Method Analysis',
      aging: 'Receivables Aging Report',
      audit: 'Audit Trail Report',
    },
    actions: { generate: 'Generate Report', export: 'Export', schedule: 'Schedule', compare: 'Compare Periods' },
  },

  ACCOUNTANT_EXPENSES_TEXT: {
    title: 'Expense Tracking',
    subtitle: 'Record and categorize school expenses.',
    addExpense: 'Add Expense',
    table: { date: 'Date', category: 'Category', description: 'Description', amount: 'Amount', vendor: 'Vendor', status: 'Status', actions: 'Actions' },
    emptyState: { title: 'No expenses recorded', description: 'Start tracking school expenses.' },
  },

  ACCOUNTANT_INTEGRATIONS_TEXT: {
    title: 'Accounting Integrations',
    subtitle: 'Connect and manage accounting software integrations.',
    connect: 'Connect',
    disconnect: 'Disconnect',
    syncNow: 'Sync Now',
    lastSynced: 'Last Synced',
    syncFrequency: 'Sync Frequency',
    itemsSynced: 'Items Synced',
    syncErrors: 'Sync Errors',
  },

  ACCOUNTANT_PAYMENTS_TEXT: {
    title: 'Payment Processing',
    subtitle: 'Record and approve payment transactions.',
    recordPayment: 'Record Payment',
    approvalQueue: 'Approval Queue',
  },
};

export default en;
export type Translations = typeof en;
