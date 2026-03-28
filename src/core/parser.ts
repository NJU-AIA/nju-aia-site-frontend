// src/core/parser.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm'; // 【新增】：引入 GFM 支持

export interface SlideNode {
  type: 'cover' | 'content';
  title: string;
  isContinuation?: boolean;
  elements: any[];
}

export function parseMarkdownToSlides(mdContent: string): SlideNode[] {
  // 【新增】：在流水线中加入 remarkGfm
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm) 
    .use(remarkMath);
  
  const ast = processor.parse(mdContent);
  
  const slides: SlideNode[] = [];
  let currentSlide: SlideNode | null = null;

  for (const node of ast.children) {
    if (node.type === 'heading' && (node.depth === 1 || node.depth === 2)) {
      const titleText = (node.children as any[])
        .filter((c: any) => c.type === 'text' || c.type === 'inlineCode')
        .map((c: any) => c.value)
        .join('');

      currentSlide = {
        type: node.depth === 1 ? 'cover' : 'content',
        title: titleText,
        isContinuation: false,
        elements: []
      };
      
      slides.push(currentSlide);
    } 
    else if (node.type === 'thematicBreak') {
      if (currentSlide) {
        currentSlide = {
          type: 'content',
          title: currentSlide.title,
          isContinuation: true,
          elements: []
        };
        slides.push(currentSlide);
      }
    } 
    else if (currentSlide) {
      currentSlide.elements.push(node);
    }
  }

  return slides;
}