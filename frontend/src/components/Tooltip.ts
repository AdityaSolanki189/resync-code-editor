import { showTooltip, EditorView } from "@codemirror/view"
import { StateField } from "@codemirror/state"
import { IClient } from "../../../common_types"
import { EditorState } from "@uiw/react-codemirror"

interface ITooltipData {
    pos: number
    above: boolean
    strictSide: boolean
    arrow: boolean
    create: () => { dom: HTMLElement }
}

export function tooltipField(users: IClient[]) {
    return StateField.define({
        create: (state) => getCursorTooltips(state, users),
        update(tooltips, tr) {
            if (!tr.docChanged && !tr.selection) return tooltips
            return getCursorTooltips(tr.state, users)
        },
        provide: (f: StateField<ITooltipData[]>) => showTooltip.computeN([f], (state: EditorState) => {
            return state.field(f);
        }),
    })
}

export function getCursorTooltips(state: EditorState, users: IClient[]): ITooltipData[] {
    return users.map((user): ITooltipData | null => {
        if (!user.typing || user.cursorPosition === undefined) {
            return null
        }
        const text = user.username
        const pos = user.cursorPosition

        return {
            pos,
            above: true,
            strictSide: true,
            arrow: true,
            create: () => {
                const dom = document.createElement("div")
                dom.className = "cm-tooltip-cursor"
                dom.textContent = text
                return { dom }
            },
        }
    }).filter((tooltip): tooltip is ITooltipData => tooltip !== null);
}

export const cursorTooltipBaseTheme = EditorView.baseTheme({
    ".cm-tooltip.cm-tooltip-cursor": {
        backgroundColor: "#57b",
        color: "white",
        border: "none",
        padding: "2px 7px",
        borderRadius: "4px",
        zIndex: "10",
        "& .cm-tooltip-arrow:before": {
            borderTopColor: "#57b",
        },
        "& .cm-tooltip-arrow:after": {
            borderTopColor: "transparent",
        },
    },
})
