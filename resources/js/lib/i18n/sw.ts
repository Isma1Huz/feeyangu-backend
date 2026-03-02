import type { Translations } from './en';

const sw: Partial<Translations> & Record<string, any> = {
  APP_NAME: 'Feeyangu',
  APP_TAGLINE: 'Usimamizi wa Ada za Shule kwa Akili',
  APP_DESCRIPTION: 'Rahisisha ukusanyaji, ufuatiliaji na utoaji wa ripoti za ada kwa shule na wazazi.',

  AUTH_TEXT: {
    login: { title: 'Karibu tena', subtitle: 'Ingia katika akaunti yako ili kuendelea', emailLabel: 'Anwani ya barua pepe', emailPlaceholder: 'Ingiza barua pepe yako', passwordLabel: 'Neno la siri', passwordPlaceholder: 'Ingiza neno la siri', rememberMe: 'Nikumbuke', forgotPassword: 'Umesahau neno la siri?', submitButton: 'Ingia', noAccount: 'Huna akaunti?', registerLink: 'Tengeneza moja', orContinue: 'Au endelea na' },
    register: { title: 'Tengeneza akaunti yako', subtitle: 'Anza na Feeyangu leo', nameLabel: 'Jina kamili', namePlaceholder: 'Ingiza jina lako kamili', emailLabel: 'Anwani ya barua pepe', emailPlaceholder: 'Ingiza barua pepe yako', passwordLabel: 'Neno la siri', passwordPlaceholder: 'Tengeneza neno la siri', confirmPasswordLabel: 'Thibitisha neno la siri', confirmPasswordPlaceholder: 'Thibitisha neno la siri', roleLabel: 'Mimi ni', roleParent: 'Mzazi', roleSchoolAdmin: 'Msimamizi wa Shule', schoolNameLabel: 'Jina la shule', schoolNamePlaceholder: 'Ingiza jina la shule', termsText: 'Ninakubali', termsLink: 'Masharti na Vigezo', submitButton: 'Tengeneza akaunti', hasAccount: 'Tayari una akaunti?', loginLink: 'Ingia' },
    forgotPassword: { title: 'Weka upya neno la siri', subtitle: 'Ingiza barua pepe yako na tutakutumia kiungo cha kuweka upya', emailLabel: 'Anwani ya barua pepe', emailPlaceholder: 'Ingiza barua pepe yako', submitButton: 'Tuma kiungo', backToLogin: 'Rudi kuingia', successMessage: 'Angalia barua pepe yako kwa kiungo cha kuweka upya.' },
  },

  SIDEBAR_TEXT: {
    superAdmin: { label: 'Jukwaa', items: { dashboard: 'Dashibodi', schools: 'Shule', users: 'Watumiaji', settings: 'Mipangilio' } },
    schoolAdmin: {
      main: { label: 'Kuu', items: { dashboard: 'Dashibodi', students: 'Wanafunzi', grades: 'Daraja na Madarasa' } },
      finance: { label: 'Fedha', items: { feeStructures: 'Miundo ya Ada', payments: 'Malipo', receipts: 'Risiti' } },
      settings: { label: 'Mipangilio', items: { paymentMethods: 'Njia za Malipo', terms: 'Vipindi vya Masomo', settings: 'Mipangilio ya Shule' } },
    },
    parent: { label: 'Menyu', items: { dashboard: 'Dashibodi', children: 'Watoto Wangu', payments: 'Historia ya Malipo', receipts: 'Risiti', ptMeetings: 'Mikutano na Walimu' } },
  },

  DASHBOARD_TEXT: {
    school: {
      title: 'Dashibodi ya Shule', bannerTitle: 'Karibu kwenye Portali ya Shule Yako', bannerDescription: 'Simamia wanafunzi, fuatilia malipo ya ada na tengeneza ripoti.',
      kpi: { totalStudents: 'Jumla ya Wanafunzi', feesCollected: 'Ada Zilizokusanywa', pendingFees: 'Ada Zinazosubiri', overdueAccounts: 'Akaunti Zilizochelewa' },
      revenueChart: 'Mapato ya Kila Mwezi', recentPayments: 'Malipo ya Hivi Karibuni', overdueAlert: 'Tahadhari ya Ada Zilizochelewa',
    },
    parent: {
      title: 'Nyumbani', subtitle: 'Muhtasari wa usimamizi wa ada za watoto wako',
      bannerTitle: 'Simamia Ada za Watoto Wako', bannerDescription: 'Angalia salio, fanya malipo na pakua risiti kwa watoto wako wote.',
      bannerAction: 'Fanya Malipo', childrenSection: 'Watoto Wangu', outstandingFees: 'Jumla ya Ada Zilizobaki', recentPayments: 'Malipo ya Hivi Karibuni', quickPay: 'Lipa Haraka', viewFees: 'Angalia Ada',
      overviewTitle: 'Muhtasari - Kipindi cha Sasa 2026', totalFeesDue: 'Jumla ya Ada Zinazodaiwa', totalPaid: 'Jumla Iliyolipwa',
    },
    admin: {
      title: 'Muhtasari wa Jukwaa', bannerTitle: 'Konsoli ya Msimamizi wa Feeyangu', bannerDescription: 'Fuatilia takwimu, simamia shule na watumiaji wote.',
      kpi: { totalSchools: 'Jumla ya Shule', activeUsers: 'Watumiaji Amilifu', monthlyRevenue: 'Mapato ya Mwezi', pendingApprovals: 'Idhini Zinazosubiri' },
      topSchools: 'Shule Bora', recentActivity: 'Shughuli za Hivi Karibuni',
    },
  },

  STUDENTS_TEXT: {
    title: 'Wanafunzi', searchPlaceholder: 'Tafuta kwa jina au nambari ya kuandikishwa...', addStudent: 'Ongeza Mwanafunzi', importCsv: 'Ingiza CSV', exportCsv: 'Hamisha CSV',
    filters: { grade: 'Daraja Zote', status: 'Hali Zote', class: 'Madarasa Yote' },
    table: { admissionNo: 'Nambari #', name: 'Jina la Mwanafunzi', grade: 'Daraja', class: 'Darasa', parent: 'Mzazi', fees: 'Hali ya Ada', status: 'Hali', actions: 'Vitendo' },
    emptyState: { title: 'Hakuna wanafunzi', description: 'Anza kwa kuongeza mwanafunzi au kuingiza kutoka CSV.' },
    form: { createTitle: 'Ongeza Mwanafunzi Mpya', editTitle: 'Hariri Mwanafunzi', firstName: 'Jina la Kwanza', lastName: 'Jina la Mwisho', admissionNumber: 'Nambari ya Kuandikishwa', grade: 'Daraja', className: 'Darasa', parentName: 'Jina la Mzazi', parentEmail: 'Barua pepe ya Mzazi', status: 'Hali' },
  },

  GRADES_TEXT: {
    title: 'Daraja na Madarasa', subtitle: 'Simamia daraja za shule na sehemu za madarasa.',
    addGrade: 'Ongeza Daraja', addClass: 'Ongeza Darasa', editGrade: 'Hariri Daraja', deleteGrade: 'Futa Daraja', editClass: 'Hariri Darasa', deleteClass: 'Futa Darasa',
    table: { grade: 'Daraja', classes: 'Madarasa', students: 'Wanafunzi', actions: 'Vitendo' },
    classTable: { name: 'Jina la Darasa', teacher: 'Mwalimu Mkuu', students: 'Wanafunzi', actions: 'Vitendo' },
    form: { gradeName: 'Jina la Daraja', gradeNamePlaceholder: 'mf. Daraja la 5', className: 'Jina la Darasa', classNamePlaceholder: 'mf. 5A', teacher: 'Mwalimu Mkuu', teacherPlaceholder: 'mf. Bi. Kamau', selectGrade: 'Chagua Daraja' },
    emptyState: { title: 'Hakuna daraja', description: 'Anza kwa kuunda daraja lako la kwanza.' },
    deleteConfirm: 'Una uhakika unataka kufuta? Kitendo hiki hakiwezi kutenduliwa.',
  },

  FEE_STRUCTURES_TEXT: {
    title: 'Miundo ya Ada', subtitle: 'Fafanua na usimamie miundo ya ada.',
    addFeeStructure: 'Ongeza Muundo', editFeeStructure: 'Hariri Muundo',
    table: { name: 'Jina', grade: 'Daraja', term: 'Kipindi', totalAmount: 'Jumla', status: 'Hali', actions: 'Vitendo' },
    detail: { feeBreakdown: 'Uchambuzi wa Ada', itemName: 'Kipengele', itemAmount: 'Kiasi', addItem: 'Ongeza Kipengele', total: 'Jumla' },
    form: { name: 'Jina la Muundo', namePlaceholder: 'mf. Daraja 5 - Kipindi 1 2026', grade: 'Daraja', term: 'Kipindi', status: 'Hali', feeItemName: 'Jina la Kipengele', feeItemNamePlaceholder: 'mf. Karo', feeItemAmount: 'Kiasi' },
    emptyState: { title: 'Hakuna miundo ya ada', description: 'Tengeneza miundo ya ada kwa wanafunzi.' },
  },

  PAYMENTS_TEXT: {
    title: 'Malipo', subtitle: 'Angalia na usimamie miamala yote.', searchPlaceholder: 'Tafuta kwa jina au rejea...', exportCsv: 'Hamisha CSV',
    table: { date: 'Tarehe', student: 'Mwanafunzi', amount: 'Kiasi', method: 'Njia', status: 'Hali', reference: 'Rejea', actions: 'Vitendo' },
    filters: { allMethods: 'Njia Zote', allStatus: 'Hali Zote' },
    actions: { approve: 'Idhinisha', reject: 'Kataa', viewDetails: 'Angalia Maelezo' },
    emptyState: { title: 'Hakuna malipo yaliyopatikana', description: 'Malipo yataonekana hapa baada ya kupokelewa.' },
  },

  RECEIPTS_TEXT: {
    title: 'Risiti', subtitle: 'Angalia na upakue risiti za malipo.', searchPlaceholder: 'Tafuta kwa nambari ya risiti au mwanafunzi...',
    table: { receiptNo: 'Risiti #', date: 'Tarehe', student: 'Mwanafunzi', amount: 'Kiasi', method: 'Njia', actions: 'Vitendo' },
    preview: { title: 'Muhtasari wa Risiti', schoolName: 'Green Valley Academy', receiptLabel: 'Risiti', dateLabel: 'Tarehe', studentLabel: 'Mwanafunzi', referenceLabel: 'Rejea ya Malipo', methodLabel: 'Njia ya Malipo', itemLabel: 'Maelezo', amountLabel: 'Kiasi', totalLabel: 'Jumla Iliyolipwa' },
    emptyState: { title: 'Hakuna risiti', description: 'Risiti zinaundwa baada ya malipo kukamilika.' },
  },

  PAYMENT_METHODS_TEXT: {
    title: 'Njia za Malipo', subtitle: 'Sanidi njia za malipo kwa wazazi.', addMethod: 'Ongeza Njia',
    table: { name: 'Jina', type: 'Aina', details: 'Maelezo', enabled: 'Imewashwa', actions: 'Vitendo' },
    form: { name: 'Jina la Njia', namePlaceholder: 'mf. M-Pesa Paybill', type: 'Aina', details: 'Maelezo / Maagizo', detailsPlaceholder: 'mf. Paybill: 123456', enabled: 'Imewashwa' },
    emptyState: { title: 'Hakuna njia za malipo', description: 'Ongeza njia za malipo kwa wazazi.' },
  },

  TERMS_TEXT: {
    title: 'Vipindi vya Masomo', subtitle: 'Simamia vipindi na kalenda ya shule.', addTerm: 'Ongeza Kipindi',
    table: { name: 'Jina', year: 'Mwaka', startDate: 'Tarehe ya Kuanza', endDate: 'Tarehe ya Mwisho', status: 'Hali', actions: 'Vitendo' },
    form: { name: 'Jina la Kipindi', namePlaceholder: 'mf. Kipindi 1 2026', year: 'Mwaka', startDate: 'Tarehe ya Kuanza', endDate: 'Tarehe ya Mwisho', status: 'Hali' },
    emptyState: { title: 'Hakuna vipindi', description: 'Tengeneza vipindi kwa kalenda ya shule.' },
  },

  SCHOOL_SETTINGS_TEXT: {
    title: 'Mipangilio ya Shule', subtitle: 'Rekebisha wasifu na mapendeleo ya shule yako.',
    sections: { profile: 'Wasifu wa Shule', branding: 'Chapa', subscription: 'Usajili' },
    fields: { schoolName: 'Jina la Shule', schoolNamePlaceholder: 'Ingiza jina', motto: 'Kauli Mbiu', mottoPlaceholder: 'Ingiza kauli mbiu', location: 'Mahali', locationPlaceholder: 'Ingiza mahali', email: 'Barua pepe ya Mawasiliano', emailPlaceholder: 'Ingiza barua pepe', phone: 'Simu', phonePlaceholder: 'Ingiza nambari', primaryColor: 'Rangi Kuu', secondaryColor: 'Rangi ya Pili', logo: 'Nembo ya Shule', uploadLogo: 'Pakia Nembo' },
    subscription: { plan: 'Mpango wa Sasa', planValue: 'Premium', status: 'Hali', statusValue: 'Amilifu', nextBilling: 'Tarehe ya Bili Ijayo', nextBillingValue: 'Machi 1, 2026' },
    saveButton: 'Hifadhi', savedMessage: 'Mipangilio imehifadhiwa.',
  },

  COMMON_TEXT: {
    actions: { save: 'Hifadhi', cancel: 'Ghairi', delete: 'Futa', edit: 'Hariri', view: 'Angalia', create: 'Tengeneza', export: 'Hamisha', import: 'Ingiza', search: 'Tafuta', filter: 'Chuja', refresh: 'Onyesha upya', download: 'Pakua', print: 'Chapisha', close: 'Funga', confirm: 'Thibitisha', back: 'Rudi', next: 'Endelea' },
    status: { active: 'Amilifu', inactive: 'Haifanyi kazi', pending: 'Inasubiri', completed: 'Imekamilika', failed: 'Imeshindwa', overdue: 'Imechelewa', paid: 'Imelipwa', partial: 'Sehemu', suspended: 'Imesimamishwa', upcoming: 'Inakuja' },
    currency: 'KES', noData: 'Hakuna data', loading: 'Inapakia...', logout: 'Toka', profile: 'Wasifu', notifications: 'Arifa', settings: 'Mipangilio',
    vsLastMonth: 'vs mwezi uliopita', notFoundTitle: '404', notFoundMessage: 'Ukurasa haujapatikana', notFoundLink: 'Rudi Nyumbani',
  },

  PAYMENT_METHOD_LABELS: { mpesa: 'M-Pesa', bank: 'Uhamisho wa Benki', cash: 'Taslimu', card: 'Kadi' },

  PARENT_CHILDREN_TEXT: { title: 'Watoto Wangu', subtitle: 'Angalia ada na ufanye malipo.', viewFees: 'Angalia Ada', quickPay: 'Lipa Haraka', feeProgress: 'Maendeleo ya Ada' },
  PARENT_FEES_TEXT: { title: 'Maelezo ya Ada', subtitle: 'Uchambuzi na hali ya malipo', item: 'Kipengele cha Ada', total: 'Jumla', paid: 'Imelipwa', balance: 'Salio', status: 'Hali', payNow: 'Lipa Sasa', backToChildren: 'Rudi kwa Watoto', totalOutstanding: 'Jumla Inayobaki' },
  PARENT_PAY_TEXT: { title: 'Fanya Malipo', selectMethod: 'Chagua Njia ya Malipo', amount: 'Kiasi (KES)', reference: 'Rejea ya Malipo', referencePlaceholder: 'mf. Nambari ya muamala wa M-Pesa', submitPayment: 'Tuma Malipo', cancel: 'Ghairi' },
  PARENT_PAYMENTS_TEXT: { title: 'Historia ya Malipo', subtitle: 'Angalia malipo yako yote.', searchPlaceholder: 'Tafuta kwa rejea...', filterChild: 'Watoto Wote', table: { date: 'Tarehe', child: 'Mtoto', amount: 'Kiasi', method: 'Njia', status: 'Hali', reference: 'Rejea' }, emptyState: { title: 'Hakuna malipo bado', description: 'Historia yako ya malipo itaonekana hapa.' } },
  PARENT_RECEIPTS_TEXT: { title: 'Risiti', subtitle: 'Pakua na uchapisha risiti zako.', searchPlaceholder: 'Tafuta kwa nambari ya risiti...', filterChild: 'Watoto Wote', table: { receiptNo: 'Risiti #', date: 'Tarehe', child: 'Mtoto', amount: 'Kiasi', actions: 'Vitendo' }, emptyState: { title: 'Hakuna risiti', description: 'Risiti zitaonekana baada ya malipo.' } },

  ADMIN_SCHOOLS_TEXT: {
    title: 'Shule', subtitle: 'Simamia shule zote kwenye jukwaa.', addSchool: 'Ongeza Shule', searchPlaceholder: 'Tafuta shule...',
    table: { name: 'Jina la Shule', owner: 'Mmiliki', location: 'Mahali', students: 'Wanafunzi', feesCollected: 'Ada Zilizokusanywa', status: 'Hali', actions: 'Vitendo' },
    form: { name: 'Jina la Shule', namePlaceholder: 'Ingiza jina', owner: 'Mmiliki', ownerPlaceholder: 'Ingiza jina la mmiliki', location: 'Mahali', locationPlaceholder: 'Ingiza mahali', status: 'Hali' },
    emptyState: { title: 'Hakuna shule', description: 'Hakuna shule zilizosajiliwa.' },
    actions: { activate: 'Amilisha', suspend: 'Simamisha', delete: 'Futa' },
  },

  ADMIN_USERS_TEXT: {
    title: 'Watumiaji', subtitle: 'Simamia watumiaji wote wa jukwaa.', searchPlaceholder: 'Tafuta watumiaji...', filterRole: 'Majukumu Yote', filterStatus: 'Hali Zote',
    table: { name: 'Jina', email: 'Barua pepe', role: 'Jukumu', school: 'Shule', status: 'Hali', lastLogin: 'Kuingia Mwisho', actions: 'Vitendo' },
    actions: { deactivate: 'Lemaza', activate: 'Amilisha', resetPassword: 'Weka Upya Neno la Siri' },
    emptyState: { title: 'Hakuna watumiaji', description: 'Watumiaji wataonekana hapa.' },
  },

  ADMIN_SETTINGS_TEXT: {
    title: 'Mipangilio ya Jukwaa', subtitle: 'Sanidi mipangilio ya jumla.',
    sections: { general: 'Jumla', notifications: 'Arifa', billing: 'Utozaji' },
    fields: { platformName: 'Jina la Jukwaa', platformNamePlaceholder: 'Feeyangu', supportEmail: 'Barua pepe ya Msaada', supportEmailPlaceholder: 'support@feeyangu.com', defaultCurrency: 'Sarafu Chaguo-msingi', maintenanceMode: 'Hali ya Matengenezo', emailNotifications: 'Arifa za Barua pepe', smsNotifications: 'Arifa za SMS', paymentAlerts: 'Tahadhari za Malipo', overdueReminders: 'Vikumbusho vya Ucheleweshaji' },
    saveButton: 'Hifadhi', savedMessage: 'Mipangilio ya jukwaa imehifadhiwa.',
  },

  HEADER: {
    roleLabels: { super_admin: 'Msimamizi Mkuu', school_admin: 'Msimamizi wa Shule', parent: 'Mzazi' },
    childrenSummary: 'Muhtasari wa Watoto', recentReceipts: 'Risiti za Hivi Karibuni', viewAll: 'Angalia Zote', feeProgress: 'Maendeleo ya Ada', daysOverdue: 'siku zimechelewa',
    platformStats: 'Takwimu na usimamizi wa jukwaa.', welcomeBack: 'Karibu tena. Hapa ni muhtasari wa shule yako.',
    studentInfo: 'Taarifa za Mwanafunzi', feeStatus: 'Hali ya Ada', totalFees: 'Jumla ya Ada', paid: 'Imelipwa', balanceLabel: 'Salio', paymentProgress: 'Maendeleo ya Malipo', paymentHistory: 'Historia ya Malipo', noPaymentsYet: 'Hakuna malipo bado.', studentNotFound: 'Mwanafunzi hakupatikana',
    deleteConfirmGeneric: 'Una uhakika? Kitendo hiki hakiwezi kutenduliwa.', fillDetails: 'Jaza maelezo hapa chini.', paymentDetails: 'Maelezo ya muamala wa malipo.',
  },

  LANGUAGE: { label: 'Lugha', en: 'English', fr: 'Français', de: 'Deutsch', nl: 'Nederlands', sw: 'Kiswahili' },

  // Teacher sidebar
  SIDEBAR_TEACHER: {
    label: 'Ufundishaji',
    items: {
      dashboard: 'Dashibodi',
      myClasses: 'Madarasa Yangu',
      results: 'Ingiza Matokeo',
      attendance: 'Mahudhurio',
      portfolio: 'Portfolio ya CBC',
      ptMeetings: 'Mikutano ya Wazazi-Walimu',
      announcements: 'Matangazo',
      profile: 'Wasifu',
    },
  },

  // Portfolio
  PORTFOLIO_TEXT: {
    pageTitle: 'Portfolio ya Dijitali ya CBC',
    pageSubtitle: 'Simamia portfolio za kujifunza kwa maeneo yote ya CBC.',
    completionRing: { complete: 'Imekamilika', inProgress: 'Inaendelea', notStarted: 'Haijaanza' },
    evidence: {
      add: 'Ongeza Ushahidi',
      edit: 'Hariri Ushahidi',
      delete: 'Futa Ushahidi',
      publish: 'Chapisha',
      types: { photo: 'Picha', video: 'Video', document: 'Hati', drawing: 'Mchoro', craft_photo: 'Picha ya Ufundi', written_work: 'Kazi ya Maandishi', audio: 'Sauti' },
    },
    ratings: { EE: 'EE', ME: 'ME', AE: 'AE', BE: 'BE', EEFull: 'Zaidi ya Matarajio', MEFull: 'Fikia Matarajio', AEFull: 'Karibu na Matarajio', BEFull: 'Chini ya Matarajio' },
    learningAreas: { empty: 'Hakuna maeneo yaliyosanidiwa', addArea: 'Ongeza Eneo', configure: 'Sanidi' },
    parentView: { downloadButton: 'Pakua Portfolio', draftHidden: 'Rasimu zimefichwa kutoka kwa wazazi.', noEvidenceYet: 'Hakuna ushahidi uliopakiwa bado.' },
    bulkUpload: { title: 'Pakia Ushahidi kwa Wingi', dropzone: 'Buruta picha hapa au bonyeza kutafuta', assignStudent: 'Tenga kwa Mwanafunzi', saveAll: 'Hifadhi Zote' },
  },

  // PT Meetings
  PT_MEETINGS_TEXT: {
    pageTitle: 'Mikutano ya Wazazi-Walimu',
    bookMeeting: 'Panga Mkutano',
    myMeetings: 'Mikutano Yangu',
    session: { create: 'Unda Kikao', open: 'Fungua Upangaji', close: 'Funga Upangaji', complete: 'Weka Alama ya Kukamilika', draft: 'Rasimu' },
    slot: { available: 'Inapatikana', booked: 'Imepangwa', blocked: 'Imezuiwa', select: 'Chagua Wakati' },
    booking: { confirm: 'Thibitisha', cancel: 'Ghairi', reschedule: 'Panga Upya', pending: 'Inasubiri', confirmed: 'Imethibitishwa' },
    steps: { selectChild: 'Chagua Mtoto', selectTeacher: 'Chagua Mwalimu', selectSlot: 'Chagua Wakati', confirm: 'Thibitisha Mpango' },
    notifications: { bookingRequest: 'Ombi la mkutano limetumwa', confirmed: 'Mkutano umethibitishwa', reminder: 'Kikumbusho cha mkutano', cancelled: 'Mkutano umeghairiwa' },
    calendar: { addToCalendar: 'Ongeza kwenye Kalenda' },
  },

  // Health
  HEALTH_TEXT: {
    pageTitle: 'Rekodi za Afya na Matibabu',
    healthProfile: 'Wasifu wa Afya',
    condition: {
      add: 'Ongeza Hali', edit: 'Hariri', deactivate: 'Lemaza',
      types: { chronic: 'Sugu', allergy: 'Mzio', disability: 'Ulemavu', dietary: 'Lishe', mental_health: 'Afya ya Akili', other: 'Nyingine' },
      severities: { mild: 'Kidogo', moderate: 'Wastani', severe: 'Kali', critical: 'Muhimu', life_threatening: 'Hatari kwa Maisha' },
    },
    allergy: {
      add: 'Ongeza Mzio', remove: 'Ondoa Mzio', epiPen: 'EpiPen', responseProtocol: 'Itifaki ya Mwitikio',
      severities: { mild: 'Kidogo', moderate: 'Wastani', severe: 'Kali', critical: 'Muhimu', life_threatening: 'Hatari kwa Maisha' },
    },
    vaccination: { add: 'Ongeza Chanjo', edit: 'Hariri', statuses: { up_to_date: 'Imesasishwa', due_soon: 'Inakaribia', overdue: 'Imechelewa' }, dueDate: 'Tarehe ya Mwisho', upToDate: 'Imesasishwa' },
    incident: {
      record: 'Rekodi Tukio', resolve: 'Suluhisha', followUp: 'Fuatilia', parentNotify: 'Mzazi Amearifu',
      types: { injury: 'Jeraha', illness: 'Ugonjwa', allergic_reaction: 'Mmenyuko wa Mzio', mental_health: 'Afya ya Akili', emergency: 'Dharura', other: 'Nyingine' },
    },
    emergency: { contacts: 'Nambari za Dharura', addContact: 'Ongeza Nambari', priority: 'Kipaumbele' },
    documents: { upload: 'Pakia Hati', download: 'Pakua', types: { medical_certificate: 'Cheti cha Matibabu', vaccination_card: 'Kadi ya Chanjo', doctor_letter: 'Barua ya Daktari', disability_assessment: 'Tathmini ya Ulemavu', insurance_card: 'Kadi ya Bima', other: 'Nyingine' } },
    tripSheet: { generate: 'Tengeneza Orodha ya Safari', selectClass: 'Chagua Darasa', format: 'Muundo' },
    parentView: { flagUpdate: 'Ripoti Sasisho', downloadSummary: 'Pakua Muhtasari wa Afya', updatePending: 'Sasisho Linasubiri' },
    alerts: { severeCondition: 'Hali Kali', lifeThreateningAllergy: 'Mzio Hatari kwa Maisha', vaccinationDue: 'Chanjo Imefika' },
  },

  // Teacher dashboard
  TEACHER_DASHBOARD_TEXT: {
    title: 'Dashibodi ya Mwalimu',
    subtitle: 'Karibu tena. Hapa ni muhtasari wa ufundishaji wako.',
    kpi: { myClasses: 'Madarasa Yangu', myStudents: 'Wanafunzi Wangu', assessmentsSubmitted: 'Tathmini Zilizotumwa', attendanceRate: 'Kiwango cha Mahudhurio' },
    schedule: 'Ratiba ya Leo',
    classPerformance: 'Utendaji wa Darasa',
    attendanceTrend: 'Mwenendo wa Mahudhurio',
    gradeDistribution: 'Usambazaji wa Alama (CBC)',
    lowAttendance: 'Wanafunzi wenye Mahudhurio Kidogo (<80%)',
    pendingPortfolios: 'Mapitio ya Portfolio Yanayosubiri',
  },

  // Teacher pages
  TEACHER_CLASSES_TEXT: {
    title: 'Madarasa Yangu',
    subtitle: 'Angalia na simamia madarasa yako.',
    classDetail: 'Maelezo ya Darasa',
    tabs: { students: 'Wanafunzi', results: 'Matokeo', attendance: 'Mahudhurio', portfolio: 'Portfolio', announcements: 'Matangazo' },
  },

  TEACHER_RESULTS_TEXT: {
    title: 'Ingiza Matokeo',
    subtitle: 'Ingiza na tuma matokeo ya mitihani.',
    steps: { selectExam: 'Chagua Mtihani', enterScores: 'Ingiza Alama', review: 'Kagua na Tuma' },
    fields: { term: 'Kipindi', exam: 'Mtihani', subject: 'Somo', class: 'Darasa', score: 'Alama', grade: 'Daraja', remarks: 'Maoni' },
    actions: { saveDraft: 'Hifadhi Rasimu', submit: 'Tuma kwa Mapitio', bulkUpload: 'Pakia CSV kwa Wingi' },
    cbcMode: { strand: 'Mhimili', rating: 'Tathmini' },
  },

  TEACHER_ATTENDANCE_TEXT: {
    title: 'Kurekodi Mahudhurio',
    subtitle: 'Rekodi mahudhurio ya kila siku ya wanafunzi.',
    modes: { manual: 'Kuingiza kwa Mkono', upload: 'Pakia Orodha' },
    status: { present: 'Yupo', absent: 'Hayupo', late: 'Amechelewa', excused: 'Ameruhusiwa' },
    actions: { submit: 'Tuma Mahudhurio', uploadFile: 'Pakia Faili' },
    history: 'Historia ya Mahudhurio',
  },

  TEACHER_ANNOUNCEMENTS_TEXT: {
    title: 'Matangazo',
    subtitle: 'Tuma matangazo kwa wazazi na wanafunzi.',
    create: 'Tengeneza Tangazo',
    fields: { title: 'Kichwa', body: 'Ujumbe', target: 'Walengwa', priority: 'Kipaumbele', category: 'Kategoria' },
    priorities: { normal: 'Kawaida', important: 'Muhimu', urgent: 'Haraka' },
    categories: { general: 'Jumla', cbcMaterials: 'Vifaa vya CBC', event: 'Tukio', health: 'Arifa ya Afya', academic: 'Masomo', portfolio: 'Portfolio' },
  },

  // Accountant sidebar
  SIDEBAR_ACCOUNTANT: {
    label: 'Fedha',
    items: {
      dashboard: 'Dashibodi',
      feeStructures: 'Miundo ya Ada',
      invoicing: 'Ankara',
      payments: 'Malipo',
      reconciliation: 'Ulinganisho',
      reports: 'Ripoti za Fedha',
      expenses: 'Matumizi',
      integrations: 'Miunganiko',
      paymentGateway: 'Mipangilio ya Malipo',
    },
  },

  // Accountant pages
  ACCOUNTANT_DASHBOARD_TEXT: {
    title: 'Dashibodi ya Mhasibu',
    subtitle: 'Shughuli za fedha za kila siku na muhtasari wa ulinganisho.',
    kpi: {
      dailyCollections: 'Makusanyo ya Leo',
      pendingReconciliation: 'Ulinganisho Unasubiri',
      unmatchedTransactions: 'Miamala Isiyolingana',
      outstandingInvoices: 'Ankara Zilizobaki',
      paymentSuccessRate: 'Kiwango cha Mafanikio ya Malipo',
      pettyCashBalance: 'Salio la Fedha Kidogo',
    },
    collectionTrend: 'Makusanyo dhidi ya Ankara',
    paymentMethods: 'Usambazaji wa Njia za Malipo',
    receivablesAging: 'Umri wa Madeni',
    recentActivity: 'Shughuli za Malipo za Leo',
    reconciliationQueue: 'Foleni ya Ulinganisho',
    integrationStatus: 'Hali ya Miunganiko',
  },

  ACCOUNTANT_INVOICING_TEXT: {
    title: 'Usimamizi wa Ankara',
    subtitle: 'Tengeneza, tuma na simamia ankara za ada.',
    searchPlaceholder: 'Tafuta kwa nambari ya ankara au mwanafunzi...',
    generateInvoices: 'Tengeneza Ankara',
    sendReminder: 'Tuma Kikumbusho',
    table: { invoiceNo: 'Ankara #', student: 'Mwanafunzi', grade: 'Daraja', term: 'Kipindi', total: 'Jumla', paid: 'Imelipwa', balance: 'Salio', status: 'Hali', dueDate: 'Tarehe ya Mwisho', actions: 'Vitendo' },
    filters: { allStatus: 'Hali Zote', allGrades: 'Daraja Zote' },
    actions: { send: 'Tuma', void: 'Batilisha', download: 'Pakua PDF', markPaid: 'Weka Alama ya Kulipwa', viewDetails: 'Angalia Maelezo' },
    emptyState: { title: 'Hakuna ankara', description: 'Tengeneza ankara mwanzoni mwa kila kipindi.' },
  },

  ACCOUNTANT_RECONCILIATION_TEXT: {
    title: 'Ulinganisho wa Benki',
    subtitle: 'Linganisha miamala ya benki na malipo ya mfumo.',
    importStatement: 'Ingiza Taarifa ya Benki',
    autoMatch: 'Linganisha Kiotomatiki',
    tabs: { matched: 'Zimelingana', suggested: 'Mapendekezo', unmatchedBank: 'Benki Hazijalinganishwa', unmatchedSystem: 'Mfumo Haujaolingana' },
    confidence: { high: 'Juu', medium: 'Wastani', low: 'Chini' },
    actions: { confirmMatch: 'Thibitisha', rejectMatch: 'Kataa', manualMatch: 'Linganisha kwa Mkono', markComplete: 'Kamilisha Ulinganisho' },
  },

  ACCOUNTANT_REPORTS_TEXT: {
    title: 'Ripoti za Fedha',
    subtitle: 'Tengeneza na hamisha ripoti kamili za fedha.',
    reports: {
      incomeStatement: 'Taarifa ya Mapato',
      cashFlow: 'Taarifa ya Mtiririko wa Fedha',
      feeCollection: 'Ripoti ya Ukusanyaji wa Ada',
      outstanding: 'Ripoti ya Ada Zilizobaki',
      paymentMethod: 'Uchambuzi wa Njia za Malipo',
      aging: 'Ripoti ya Umri wa Madeni',
      audit: 'Ripoti ya Ukaguzi',
    },
    actions: { generate: 'Tengeneza Ripoti', export: 'Hamisha', schedule: 'Panga', compare: 'Linganisha Vipindi' },
  },

  ACCOUNTANT_EXPENSES_TEXT: {
    title: 'Ufuatiliaji wa Matumizi',
    subtitle: 'Rekodi na panga matumizi ya shule.',
    addExpense: 'Ongeza Matumizi',
    table: { date: 'Tarehe', category: 'Kategoria', description: 'Maelezo', amount: 'Kiasi', vendor: 'Muuzaji', status: 'Hali', actions: 'Vitendo' },
    emptyState: { title: 'Hakuna matumizi yaliyorekodiwa', description: 'Anza kufuatilia matumizi ya shule.' },
  },

  ACCOUNTANT_INTEGRATIONS_TEXT: {
    title: 'Miunganiko ya Uhasibu',
    subtitle: 'Unganisha na simamia miunganiko ya programu za uhasibu.',
    connect: 'Unganisha',
    disconnect: 'Tenganisha',
    syncNow: 'Sawazisha Sasa',
    lastSynced: 'Ilisawazishwa Mara ya Mwisho',
    syncFrequency: 'Mara za Usawazishaji',
    itemsSynced: 'Vipengele Vilivyosawazishwa',
    syncErrors: 'Makosa ya Usawazishaji',
  },

  ACCOUNTANT_PAYMENTS_TEXT: {
    title: 'Usindikaji wa Malipo',
    subtitle: 'Rekodi na idhinisha miamala ya malipo.',
    recordPayment: 'Rekodi Malipo',
    approvalQueue: 'Foleni ya Idhini',
  },
};

export default sw;
