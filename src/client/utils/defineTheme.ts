import { kebabCase } from "lodash-es"

export interface ThemeColors {
    background: string
    foreground: string

    card: string
    cardForeground: string
    popover: string
    popoverForeground: string

    primary: string
    primaryForeground: string

    secondary: string
    secondaryForeground: string

    muted: string
    mutedForeground: string

    accent: string
    accentForeground: string

    destructive: string
    destructiveForeground: string

    border: string
    input: string
    ring: string

    chart1: string
    chart2: string
    chart3: string
    chart4: string
    chart5: string

    sidebar: string
    sidebarForeground: string

    sidebarPrimary: string
    sidebarPrimaryForeground: string

    sidebarAccent: string
    sidebarAccentForeground: string

    sidebarBorder: string
    sidebarRing: string
}


export interface Theme {
    light: ThemeColors
    dark: ThemeColors
}

export function defineTheme(light: ThemeColors, dark: ThemeColors = light): Theme {
    return {
        light,
        dark
    }
}

function cssVariables(colors: ThemeColors) {
    return Object.entries(colors)
        .map(([name, value]) => `--${kebabCase(name)}: ${value};`)
        .join('\n')
}


export function themeToCss(theme: Theme) {
    return `:root {\n${cssVariables(theme.light)}\n}\n\n.dark {\n${cssVariables(theme.dark)}\n}`
}

