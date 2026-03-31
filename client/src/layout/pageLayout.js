/** Max width + horizontal padding for every page `<main>` (consistent content column). */
export const PAGE_MAIN_CLASS = 'mx-auto w-full max-w-4xl px-6'

/**
 * Flow pages: same vertical padding and spacing between back link, stepper, and sections.
 * Use with `FlowBack` (no bottom margin) + `FlowStepper` (no bottom margin).
 */
export const PAGE_FLOW_MAIN = `${PAGE_MAIN_CLASS} flex flex-col gap-8 py-12`
