export const pathImage: { pathImage: string } = {
    pathImage: '../assets/images',

};



export const color = {

    baground: '#081041',
    buttonColor:'#FED428',
    borderColor:'#FED428',
    borderPrimary:'#081041',
    white:'#fff',
    grey:'#909090',
    cardSurface:'#0F1D3A',
    borderSubtle:'rgba(255,255,255,0.08)',

    // Home redesign tokens — additive, does not replace anything above.
    cardSurfaceElevated:'#132549',
    textPrimary:'#FFFFFF',
    textMuted:'#8A93AD',
    textFaint:'#5B6684',
    success:'#22C55E',
    successBg:'rgba(34,197,94,0.12)',
    danger:'#EF4444',
    dangerBg:'rgba(239,68,68,0.12)',
    goldGradient: ['#FFE580', '#FED428', '#F5A623'],
    navyGradient: ['#132549', '#0F1D3A', '#081041'],
}

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
    bodySurface: '#F5F6FA',
    cardSurface: '#FFFFFF',
    cardBorder: 'rgba(10,20,64,0.08)',
    groupLabel: '#8A93AD',
    unreadDot: '#2F6FED',
    titleText: '#12142B',
    descText: '#7C8298',
    wash: { bg: '#E3F7E9', tint: '#1FA34D' },
    delivery: { bg: '#E3ECFB', tint: '#2F6FED' },
    booking: { bg: '#FCEEDA', tint: '#C9821A' },
    payment: { bg: '#FFF3D6', tint: '#B4790A' },
    otp: { bg: '#F1E4FA', tint: '#6A1B9A' },
    general: { bg: '#EEF0F5', tint: '#606880' },
};
