class HtmlHandler {
    public TextChangeHandler(inputId: string, outputId: string): void {
        let markdown = <HTMLTextAreaElement>document.getElementById(inputId);
        let markdownOutput = <HTMLLabelElement>document.getElementById(outputId);
        if (markdown !== null) {
            markdown.onkeyup = (e) => {
                if (markdown.value)
                    markdownOutput.innerHTML = markdown.value;
                else
                    markdownOutput.innerHTML = `<p></p>`;
            }
        }
    }
}

/*
* enumeration holding the available tags
 */
enum TagType {
    Paragraph,
    Header1,
    Header2,
    Header3,
    HorizontalRule
}
/*
* class mapping our md tags to their equivalent html tags
*/
class TagTypeToHtml {
    private readonly tagType: Map<TagType, string> = new Map<TagType, string>();
    constructor() {
        this.tagType.set(TagType.Header1, "h1");
        this.tagType.set(TagType.Header2, "h2");
        this.tagType.set(TagType.Header3, "h3");
        this.tagType.set(TagType.Paragraph, "p");
        this.tagType.set(TagType.HorizontalRule, "hr");
    }
    private getTag(tagType: TagType, openingTagPattern: string): string {
        let tag = this.tagType.get(tagType);
        if (tag !== null) {
            return `${openingTagPattern}${tag}>`;
        }
        return `${openingTagPattern}p>`;
    }
    public OpeningTag(tagType: TagType): string {
        return this.getTag(tagType, `<`);
    }
    public ClosingTag(tagType: TagType): string {
        return this.getTag(tagType, `</`);
    }
}

/*
 * Interface to handle our markdown document
 */
interface IMarkdownDocument {
    Add(...content: string[]): void;
    Get(): string;
}
/*
 * Class to handle our markdown document
 */
class MarkdownDocument implements IMarkdownDocument {
    private content: string = "";
    Add(...content: string[]): void {
        content.forEach(element => {
            this.content += element;
        });
    }
    Get(): string {
        return this.content;
    }
}
/*
 * class for parsing our element
 */
class ParseElement {
    CurrentLine: string = "";
}

// visitor design pattern
interface IVisitor {
    Visit(token: ParseElement, markdownDocument: IMarkdownDocument): void;
}
interface IVisitable {
    Accept(visitor: IVisitor, token: ParseElement, markdownDocument: IMarkdownDocument): void;
}

abstract class VisitorBase implements IVisitor {
    constructor(private readonly tagType: TagType, private readonly TagTypeToHtml: TagTypeToHtml){

    }
    Visit(token: ParseElement, markdownDocument: IMarkdownDocument): void {
        markdownDocument.Add(this.TagTypeToHtml.OpeningTag(this.tagType), token.CurrentLine,
        this.TagTypeToHtml.ClosingTag(this.tagType));
    }
}

class Header1Visitor extends VisitorBase {
    constructor() {
        super(TagType.Header1, new TagTypeToHtml());
    }
}
class Header2Visitor extends VisitorBase {
    constructor() {
        super(TagType.Header2, new TagTypeToHtml());
    }
}
class Header3Visitor extends VisitorBase {
    constructor() {
        super(TagType.Header3, new TagTypeToHtml());
    }
}
class ParagraphVisitor extends VisitorBase {
    constructor() {
        super(TagType.Paragraph, new TagTypeToHtml());
    }
}
class HorizontalRuleVisitor extends VisitorBase {
    constructor() {
        super(TagType.HorizontalRule, new TagTypeToHtml());
    }
}

class Visitable implements IVisitable {
    Accept(visitor: IVisitor, token: ParseElement, markdownDocument: IMarkdownDocument): void {
        visitor.Visit(token, markdownDocument);
    }
}