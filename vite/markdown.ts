import { marked, type Token, type Tokens } from 'marked';
import type { Block, Inline } from '../src/content/schema';

export class MarkdownError extends Error {}

function inline(tokens: Token[] | undefined): Inline[] {
  const out: Inline[] = [];
  for (const tok of tokens ?? []) {
    switch (tok.type) {
      case 'text':
      case 'escape': {
        const t = tok as Tokens.Text;
        if (t.tokens && t.tokens.length) out.push(...inline(t.tokens));
        else out.push({ t: 'text', v: t.text });
        break;
      }
      case 'strong':
        out.push({ t: 'strong', c: inline((tok as Tokens.Strong).tokens) });
        break;
      case 'em':
        out.push({ t: 'em', c: inline((tok as Tokens.Em).tokens) });
        break;
      case 'codespan':
        out.push({ t: 'code', v: (tok as Tokens.Codespan).text });
        break;
      case 'link': {
        const l = tok as Tokens.Link;
        if (!/^(https:\/\/|mailto:|#)/.test(l.href)) {
          throw new MarkdownError(`link href must be https:, mailto: or #anchor, got "${l.href}"`);
        }
        out.push({ t: 'link', href: l.href, c: inline(l.tokens) });
        break;
      }
      case 'br':
        out.push({ t: 'text', v: ' ' });
        break;
      default:
        throw new MarkdownError(`unsupported inline markdown: ${tok.type}`);
    }
  }
  return out;
}

/** Markdown body → the restricted node tree the page renders. Anything else throws. */
export function toBlocks(src: string): Block[] {
  const blocks: Block[] = [];
  for (const tok of marked.lexer(src)) {
    switch (tok.type) {
      case 'space':
        break;
      case 'paragraph':
        blocks.push({ t: 'p', c: inline((tok as Tokens.Paragraph).tokens) });
        break;
      case 'list': {
        const list = tok as Tokens.List;
        if (list.ordered) throw new MarkdownError('unsupported markdown: ordered list');
        blocks.push({
          t: 'ul',
          items: list.items.map((item) =>
            inline(item.tokens.flatMap((t) => ('tokens' in t && t.tokens ? t.tokens : [t]))),
          ),
        });
        break;
      }
      default:
        throw new MarkdownError(`unsupported markdown: ${tok.type}`);
    }
  }
  return blocks;
}
