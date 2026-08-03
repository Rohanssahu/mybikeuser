export const pathImage: { pathImage: string } = {
    pathImage: '../assets/images',

};



export const color = {

    // Lighter navy improves readability across every themed screen while
    // preserving the app's blue/gold identity.
    baground: '#111C4E',
    buttonColor:'#FED428',
    borderColor:'#FED428',
    borderPrimary:'#111C4E',
    white:'#fff',
    grey:'#909090',
    cardSurface:'#1A2A50',
    borderSubtle:'rgba(255,255,255,0.14)',

    // Home redesign tokens — additive, does not replace anything above.
    cardSurfaceElevated:'#22365F',
    textPrimary:'#FFFFFF',
    textMuted:'#B4BDD3',
    textFaint:'#8995B3',
    success:'#22C55E',
    successBg:'rgba(34,197,94,0.12)',
    danger:'#EF4444',
    dangerBg:'rgba(239,68,68,0.12)',
    goldGradient: ['#FFE580', '#FED428', '#F5A623'],
    navyGradient: ['#263B67', '#1A2A50', '#111C4E'],
};

// Spacing / radius scale used by the redesigned Home screen components —
// keeps new premium sections consistent without hardcoding magic numbers
// per file.
export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
};

export const radius = {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    pill: 999,
};

// Base height of the bottom tab bar, excluding the device's safe-area bottom inset.
// Screens rendered inside the Bottom Tab Navigator should add
// `insets.bottom + TAB_BAR_HEIGHT` as bottom padding so content never sits behind the tab bar.
export const TAB_BAR_HEIGHT = 60;

// Tokens for the flat-design Notifications ("Alerts") screen — kept separate from
// `color` since that object is dark-navy-surface oriented and this screen's body
// is a light surface with per-category tinted icon chips.
export const notificationColors = {
    bodySurface: '#EEF4FF',
    cardSurface: '#FFFFFF',
    cardBorder: '#D6E3FA',
    groupLabel: '#58709D',
    unreadDot: '#2563EB',
    titleText: '#132550',
    descText: '#627398',
    wash: { bg: '#E3F7E9', tint: '#1FA34D' },
    delivery: { bg: '#E3ECFB', tint: '#2F6FED' },
    booking: { bg: '#FCEEDA', tint: '#C9821A' },
    payment: { bg: '#FFF3D6', tint: '#B4790A' },
    otp: { bg: '#F1E4FA', tint: '#6A1B9A' },
    general: { bg: '#EEF0F5', tint: '#606880' },
};
