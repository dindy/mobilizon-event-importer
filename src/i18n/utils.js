import i18n from './i18n.js'
const { t } = i18n.global

export const componentTranslate = componentName => id => t(`components.${componentName}.${id}`)
