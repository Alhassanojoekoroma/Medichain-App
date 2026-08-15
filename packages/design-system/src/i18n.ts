/**
 * MediChain SL — i18n String Table
 * English-first string lookup. Route all user-facing strings through t().
 * Add new locales (Krio, etc.) without changing any screen code.
 */

export type Locale = 'en' | 'kr'; // kr = Krio

const strings: Record<Locale, Record<string, string>> = {
  en: {
    // Nav
    'nav.dashboard':     'Dashboard',
    'nav.patients':      'Patients',
    'nav.insights':      'Insights',
    'nav.appointments':  'Appointments',
    'nav.records':       'Records',
    'nav.team':          'Team',
    'nav.settings':      'Settings',
    'nav.docs':          'Docs',
    'nav.schedule':      'Schedule',

    // Common actions
    'action.viewMore':   'View more',
    'action.export':     'Export data',
    'action.filter':     'Filter',
    'action.sort':       'Sort by',
    'action.search':     'Search…',
    'action.add':        'Add',
    'action.save':       'Save',
    'action.cancel':     'Cancel',
    'action.confirm':    'Confirm',
    'action.revert':     'Revert',
    'action.accept':     'Accept',
    'action.decline':    'Decline',
    'action.signOut':    'Sign Out',
    'action.call':       'Call',
    'action.schedule':   'Schedule visit',
    'action.newPatient': '+ New patient',
    'action.uploadRecord': 'Upload Record',

    // Status labels
    'status.ready':        'Ready',
    'status.atRisk':       'At-Risk',
    'status.inProgress':   'In Progress',
    'status.discharged':   'Discharged',
    'status.confirmed':    'Confirmed',
    'status.cancelled':    'Cancelled',
    'status.pending':      'Pending',
    'status.done':         'Done',
    'status.awaiting':     'Awaiting clearance',
    'status.liveData':     'Live data',
    'status.staleData':    'Stale data',
    'status.offline':      'Offline',

    // KPI cards
    'kpi.topCaseTypes':   'Top case types this week',
    'kpi.satisfaction':   'Patient satisfaction',
    'kpi.totalPatients':  'Total patients',
    'kpi.appointments':   'Total appointments',
    'kpi.bedOccupancy':   'Bed occupancy',
    'kpi.vaccineCoverage':'Vaccine coverage',
    'kpi.prescriptions':  'Prescriptions today',
    'kpi.testsOrdered':   'Tests ordered',
    'kpi.testsPending':   'Tests pending',
    'kpi.criticalResults':'Critical results',

    // Patient segments
    'patients.inpatient':   'Inpatient',
    'patients.discharged':  'Discharged',
    'patients.outpatient':  'Outpatient',

    // Journey steps
    'journey.intake':     'Intake',
    'journey.triage':     'Triage',
    'journey.consult':    'Consultation',
    'journey.lab':        'Lab',
    'journey.pharmacy':   'Pharmacy',
    'journey.discharge':  'Discharge',

    // Blockchain
    'chain.verified':     'Verified on-chain',
    'chain.lastAnchor':   'Last anchor',
    'chain.syncPending':  'Sync pending',

    // AI assist
    'ai.suggested':        'AI-suggested',
    'ai.reviewAll':        'Review all suggestions before saving',
    'ai.confirmAll':       'Confirm all AI suggestions',
    'ai.offlineTitle':     'AI service offline',
    'ai.offlineBody':      'Complete the report manually. All fields work without AI assistance.',
    'ai.panelTitle':       'AI Report Assist',

    // Offline / sync
    'sync.offline':        'You are offline. Showing cached data.',
    'sync.stale':          'Showing last-synced data.',
    'sync.lastUpdated':    'Last updated',

    // Errors / empty
    'empty.patients':      'No patients found',
    'empty.patientsBody':  'Try adjusting your search or filters.',
    'empty.appointments':  'No appointments today',
    'empty.records':       'No records yet',
    'error.loadFailed':    'Could not load data',
    'error.loadBody':      'Check your connection and try again.',

    // Login
    'login.welcome':       'Welcome back',
    'login.subtitle':      'Sign in to MediChain SL',
    'login.email':         'Email address',
    'login.password':      'Password',
    'login.signIn':        'Sign In',
    'login.noAccount':     'Don\'t have an account?',
    'login.createOne':     'Create account',

    // MoH specific
    'moh.title':           'Ministry of Health — National Dashboard',
    'moh.districts':       'Districts',
    'moh.facilities':      'Connected facilities',
    'moh.nationalCases':   'National case count',
    'moh.activeOutbreaks': 'Active outbreaks',
    'moh.districtRollup':  'District rollup',
    'moh.caseDensity':     'Case density by chiefdom',

    // Mobile
    'mobile.home':         'Home',
    'mobile.records':      'My Records',
    'mobile.profile':      'Profile',
    'mobile.qr':           'My QR Code',
    'mobile.requests':     'Access Requests',
    'mobile.notifications':'Notifications',
  },

  kr: {
    // Krio translations placeholder — add progressively
    'nav.dashboard':     'Dashbod',
    'nav.patients':      'Pesient dem',
    'nav.settings':      'Seting',
    'action.signOut':    'Sayn Owt',
    'login.signIn':      'Sayn In',
    'status.offline':    'No konek',
    'sync.offline':      'Yu no konek. Wi de sho yu di las data.',
  },
};

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string, params?: Record<string, string | number>): string {
  const str =
    strings[currentLocale]?.[key] ??
    strings['en']?.[key] ??
    key; // fallback to key itself

  if (!params) return str;
  return Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(`{{${k}}}`, String(v)),
    str
  );
}
