import container from "#client/facades/container.ts";
import type { Theme } from "#client/utils/defineTheme.ts";
import { getDarkMode } from "./useDarkMode";

export function getTheme() {
    return container.get<Theme>('theme')
}

export function getThemeColors(){
    const theme = getTheme()

    const isDark = getDarkMode()

    return isDark ? theme.dark : theme.light
}
