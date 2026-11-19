import type {Fragment, Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

// Plain-text form of a copied selection. ProseMirror's default drops list markers, so a
// copied bullet list pastes into other apps as bare lines. Bullets and numbers are kept
// so the list structure survives the round trip through the clipboard.
export function serializeSliceAsText(slice: Slice): string {
	return linesOf(slice.content).join('\n')
}

function linesOf(fragment: Fragment): string[] {
	const lines: string[] = []

	fragment.forEach((node: ProseMirrorNode) => {
		if (node.type.name === 'bulletList' || node.type.name === 'orderedList') {
			let index = 1
			node.forEach((item: ProseMirrorNode) => {
				const marker = node.type.name === 'orderedList' ? `${index++}. ` : '- '
				const [first = '', ...rest] = linesOf(item.content)
				lines.push(marker + first, ...rest.map(line => '  ' + line))
			})
			return
		}

		if (node.isTextblock) {
			lines.push(node.textContent)
			return
		}

		if (node.isBlock) {
			lines.push(...linesOf(node.content))
		}
	})

	return lines
}
