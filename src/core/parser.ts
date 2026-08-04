import { unified } from 'unified';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';

export type MarkdownNode = {
  type: string;
  depth?: number;
  value?: string;
  lang?: string | null;
  url?: string;
  alt?: string;
  ordered?: boolean;
  children?: MarkdownNode[];
  [key: string]: unknown;
};

export type LayoutDirection = 'columns' | 'rows';

export type SlideLayoutNode =
  | {
      kind: 'content';
      title?: string;
      elements: MarkdownNode[];
    }
  | {
      kind: 'split';
      title?: string;
      direction: LayoutDirection;
      ratio: [number, number];
      children: [SlideLayoutNode, SlideLayoutNode];
    };

export interface SlideNode {
  type: 'cover' | 'content';
  title: string;
  isContinuation?: boolean;
  /** Legacy flat nodes retained for the existing presentation themes. */
  elements: MarkdownNode[];
  body: SlideLayoutNode;
}

type LayoutDirective = {
  direction: LayoutDirection;
  ratio: [number, number];
  reverse: boolean;
};

type SectionNode = {
  level: number;
  title: string;
  directive?: LayoutDirective;
  elements: MarkdownNode[];
  children: SectionNode[];
};

type RawSlide = {
  type: 'cover' | 'content';
  title: string;
  directive?: LayoutDirective;
  isContinuation?: boolean;
  elements: MarkdownNode[];
};

function createProcessor() {
  return unified().use(remarkParse).use(remarkGfm).use(remarkMath);
}

export function parseMarkdownDocument(markdown: string): MarkdownNode[] {
  const root = createProcessor().parse(markdown) as unknown as {
    children?: MarkdownNode[];
  };
  return Array.isArray(root.children) ? root.children : [];
}

function nodeText(node: MarkdownNode): string {
  if (typeof node.value === 'string') return node.value;
  return (node.children ?? []).map(nodeText).join('');
}

function normalizeRatio(value?: string): [number, number] {
  const match = value?.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
  if (!match) return [1, 1];

  const first = Number(match[1]);
  const second = Number(match[2]);
  if (!Number.isFinite(first) || !Number.isFinite(second) || first <= 0 || second <= 0) {
    return [1, 1];
  }
  return [first, second];
}

function parseDirective(value: string): {
  title: string;
  directive?: LayoutDirective;
} {
  const match = value.match(/^(.*?)\s*\{([^{}]+)\}\s*$/);
  if (!match) return { title: value.trim() };

  const title = match[1].trim();
  const [layoutToken = '', ratioToken] = match[2].trim().split(/\s+/);
  const normalized = layoutToken.toLowerCase().replace(/\s/g, '');

  const columnTokens = new Set([
    'left|right',
    'right|left',
    'columns',
    'column',
    'horizontal',
    '左右',
    '右左',
  ]);
  const rowTokens = new Set([
    'top|bottom',
    'bottom|top',
    'rows',
    'row',
    'vertical',
    '上下',
    '下上',
  ]);

  const direction = columnTokens.has(normalized)
    ? 'columns'
    : rowTokens.has(normalized)
      ? 'rows'
      : null;

  if (!direction) return { title: value.trim() };

  return {
    title,
    directive: {
      direction,
      ratio: normalizeRatio(ratioToken),
      reverse: normalized === 'right|left' || normalized === 'bottom|top' || normalized === '右左' || normalized === '下上',
    },
  };
}

function headingNode(title: string, depth: number): MarkdownNode {
  return {
    type: 'heading',
    depth: Math.min(6, Math.max(3, depth)),
    children: [{ type: 'text', value: title }],
  };
}

function flattenSection(section: SectionNode): MarkdownNode[] {
  const result: MarkdownNode[] = [];
  if (section.title) result.push(headingNode(section.title, section.level));
  result.push(...section.elements);
  for (const child of section.children) result.push(...flattenSection(child));
  return result;
}

function prependElements(node: SlideLayoutNode, elements: MarkdownNode[]): SlideLayoutNode {
  if (elements.length === 0) return node;

  if (node.kind === 'content') {
    return { ...node, elements: [...elements, ...node.elements] };
  }

  return {
    ...node,
    children: [prependElements(node.children[0], elements), node.children[1]],
  };
}

function sectionToLayout(section: SectionNode, includeTitle: boolean): SlideLayoutNode {
  const title = includeTitle && section.title ? section.title : undefined;

  if (section.directive && section.children.length >= 2) {
    const [firstSection, secondSection, ...rest] = section.children;
    let first = sectionToLayout(firstSection, true);
    let second = sectionToLayout(secondSection, true);

    if (rest.length > 0) {
      const extraElements = rest.flatMap(flattenSection);
      second = prependElements(second, extraElements);
    }

    first = prependElements(first, section.elements);

    const children: [SlideLayoutNode, SlideLayoutNode] = section.directive.reverse
      ? [second, first]
      : [first, second];

    return {
      kind: 'split',
      title,
      direction: section.directive.direction,
      ratio: section.directive.ratio,
      children,
    };
  }

  return {
    kind: 'content',
    title,
    elements: [
      ...section.elements,
      ...section.children.flatMap(flattenSection),
    ],
  };
}

function buildLayout(rawSlide: RawSlide): SlideLayoutNode {
  const root: SectionNode = {
    level: rawSlide.type === 'cover' ? 1 : 2,
    title: rawSlide.title,
    directive: rawSlide.directive,
    elements: [],
    children: [],
  };
  const stack: SectionNode[] = [root];

  for (const node of rawSlide.elements) {
    if (node.type === 'heading' && Number(node.depth) >= 3) {
      const parsed = parseDirective(nodeText(node));
      const section: SectionNode = {
        level: Number(node.depth),
        title: parsed.title,
        directive: parsed.directive,
        elements: [],
        children: [],
      };

      while (stack.length > 1 && stack[stack.length - 1].level >= section.level) {
        stack.pop();
      }
      stack[stack.length - 1].children.push(section);
      stack.push(section);
      continue;
    }

    stack[stack.length - 1].elements.push(node);
  }

  return sectionToLayout(root, false);
}

export function parseMarkdownToSlides(markdown: string): SlideNode[] {
  const nodes = parseMarkdownDocument(markdown);
  const rawSlides: RawSlide[] = [];
  let current: RawSlide | null = null;

  for (const node of nodes) {
    if (node.type === 'heading' && (node.depth === 1 || node.depth === 2)) {
      const parsed = parseDirective(nodeText(node));
      current = {
        type: node.depth === 1 ? 'cover' : 'content',
        title: parsed.title,
        directive: parsed.directive,
        elements: [],
      };
      rawSlides.push(current);
      continue;
    }

    if (node.type === 'thematicBreak' && current) {
      current = {
        type: 'content',
        title: current.title,
        directive: current.directive,
        isContinuation: true,
        elements: [],
      };
      rawSlides.push(current);
      continue;
    }

    if (!current) {
      current = {
        type: 'content',
        title: '',
        elements: [],
      };
      rawSlides.push(current);
    }
    current.elements.push(node);
  }

  return rawSlides
    .filter((slide) => slide.title || slide.elements.length > 0)
    .map((slide) => ({
      type: slide.type,
      title: slide.title,
      isContinuation: slide.isContinuation,
      elements: slide.elements,
      body: buildLayout(slide),
    }));
}
