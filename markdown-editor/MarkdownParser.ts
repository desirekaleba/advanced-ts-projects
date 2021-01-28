/**
 * Main class that render our content
 */
class HtmlHandler {
    private markdownChange: Markdown = new Markdown;
    public TextChangeHandler(inputId: string, outputId: string): void {
        let markdown = <HTMLTextAreaElement>document.getElementById(inputId);
        let markdownOutput = <HTMLLabelElement>document.getElementById(outputId);
        if (markdown !== null) {
            markdown.onkeyup = (e) => {
                this.RenderHtmlContent(markdown, markdownOutput);
            }
            window.onload = () => {
                this.RenderHtmlContent(markdown, markdownOutput);
            }
        }
    }
    private RenderHtmlContent(markdown: HTMLTextAreaElement, markdownOutput: HTMLLabelElement) {
        if (markdown.value)
            markdownOutput.innerHTML = this.markdownChange.ToHtml(markdown.value);
        else
            markdownOutput.innerHTML = `<p></p>`;
    }
}

/*
* available and acceptable tags
* anything beyond this is not parsed
 */
enum TagType {
    Paragraph,
    Header1,
    Header2,
    Header3,
    Header4,
    Header5,
    Header6,
    HorizontalRule
}
/*
* mapping our md tags to their equivalent html tags
* for example # should be mapped to h1
*/
class TagTypeToHtml {
    // tag types holder
    private readonly tagType: Map<TagType, string> = new Map<TagType, string>();
    constructor() {
        this.tagType.set(TagType.Header1, "h1");
        this.tagType.set(TagType.Header2, "h2");
        this.tagType.set(TagType.Header3, "h3");
        this.tagType.set(TagType.Header4, "h4");
        this.tagType.set(TagType.Header5, "h5");
        this.tagType.set(TagType.Header6, "h6");
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
 * Markdown document interface
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
 * parse elements
 */
class ParseElement {
    CurrentLine: string = "";
}

// * visitor design pattern
interface IVisitor {
    Visit(token: ParseElement, markdownDocument: IMarkdownDocument): void;
}
interface IVisitable {
    Accept(visitor: IVisitor, token: ParseElement, markdownDocument: IMarkdownDocument): void;
}

abstract class VisitorBase implements IVisitor {
    constructor(private readonly tagType: TagType, private readonly TagTypeToHtml: TagTypeToHtml) {

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
class Header4Visitor extends VisitorBase {
    constructor() {
        super(TagType.Header4, new TagTypeToHtml());
    }
}
class Header5Visitor extends VisitorBase {
    constructor() {
        super(TagType.Header5, new TagTypeToHtml());
    }
}
class Header6Visitor extends VisitorBase {
    constructor() {
        super(TagType.Header6, new TagTypeToHtml());
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

// deciding which tags to use with chain-of-responsibility pattern
abstract class Handler<T> {
    protected next: Handler<T> | null = null;
    public SetNext(next: Handler<T>): void {
        this.next = next;
    }
    public HandleRequest(request: T): void {
        if (!this.CanHandle(request)) {
            if (this.next !== null) {
                this.next.HandleRequest(request);
            }
            return;
        }
    }
    protected abstract CanHandle(request: T): boolean;
}

class ParseChainHandler extends Handler<ParseElement> {
    private readonly visitable: IVisitable = new Visitable();
    constructor(private readonly document: IMarkdownDocument,
        private readonly tagType: string,
        private readonly visitor: IVisitor) {
        super();
    }
    protected CanHandle(request: ParseElement): boolean {
        let split = new LineParser().Parse(request.CurrentLine, this.tagType);
        if (split[0]) {
            request.CurrentLine = split[1];
            this.visitable.Accept(this.visitor, request, this.document);
        }
        return split[0];
    }
}

//  * parse md
class LineParser {
    public Parse(value: string, tag: string): [boolean, string] {
        let output: [boolean, string] = [false, ""];
        output[1] = value;
        if (value === "") {
            return output;
        }
        let split = value.startsWith(`${tag}`);
        if (split) {
            output[0] = true;
            output[1] = value.substr(tag.length);
        }
        return output;
    }
}
// class to handle paragraphs
class ParagraphHandler extends Handler<ParseElement> {
    private readonly visitable: IVisitable = new Visitable();
    private readonly visitor: IVisitor = new ParagraphVisitor();
    protected CanHandle(request: ParseElement): boolean {
        this.visitable.Accept(this.visitor, request, this.document);
        return true;
    }
    constructor(private readonly document: IMarkdownDocument) {
        super();
    }
}

// handlers for appropriate tags

// h1 chain handler
class Header1ChainHandler extends ParseChainHandler {
    constructor(document: IMarkdownDocument) {
        super(document, "# ", new Header1Visitor());
    }
}

// h2 chain handler
class Header2ChainHandler extends ParseChainHandler {
    constructor(document: IMarkdownDocument) {
        super(document, "## ", new Header2Visitor());
    }
}
// h3 chain handler
class Header3ChainHandler extends ParseChainHandler {
    constructor(document: IMarkdownDocument) {
        super(document, "### ", new Header3Visitor());
    }
}

// h4 chain handler
class Header4ChainHandler extends ParseChainHandler {
    constructor(document: IMarkdownDocument) {
        super(document, "#### ", new Header4Visitor());
    }
}

// h5 chain handler
class Header5ChainHandler extends ParseChainHandler {
    constructor(document: IMarkdownDocument) {
        super(document, "##### ", new Header5Visitor());
    }
}

// h6 chain handler
class Header6ChainHandler extends ParseChainHandler {
    constructor(document: IMarkdownDocument) {
        super(document, "###### ", new Header6Visitor());
    }
}

// hr chain handler
class HorizontalRuleHandler extends ParseChainHandler {
    constructor(document: IMarkdownDocument) {
        super(document, "---", new HorizontalRuleVisitor());
    }
}
// Chain
class ChainOfResponsibilityFactory {
    Build(document: IMarkdownDocument): ParseChainHandler {
        let header1: Header1ChainHandler = new Header1ChainHandler(document);
        let header2: Header2ChainHandler = new Header2ChainHandler(document);
        let header3: Header3ChainHandler = new Header3ChainHandler(document);
        let header4: Header4ChainHandler = new Header4ChainHandler(document);
        let header5: Header5ChainHandler = new Header5ChainHandler(document);
        let header6: Header6ChainHandler = new Header6ChainHandler(document);
        let horizontalRule: HorizontalRuleHandler = new HorizontalRuleHandler(document);
        let paragraph: ParagraphHandler = new ParagraphHandler(document);

        header1.SetNext(header2);
        header2.SetNext(header3);
        header3.SetNext(header4);
        header4.SetNext(header5);
        header5.SetNext(header6);
        header6.SetNext(horizontalRule);
        horizontalRule.SetNext(paragraph);

        return header1;
    }
}

// * Markdown
class Markdown {
    public ToHtml(text: string): string {
        let document: IMarkdownDocument = new MarkdownDocument();
        let header1: Header1ChainHandler = new ChainOfResponsibilityFactory().Build(document);
        let lines: string[] = text.split(`\n`);
        for (let index = 0; index < lines.length; index++) {
            let parseElement: ParseElement = new ParseElement();
            parseElement.CurrentLine = lines[index];
            header1.HandleRequest(parseElement);
        }
        
        return document.Get();
    }
}
