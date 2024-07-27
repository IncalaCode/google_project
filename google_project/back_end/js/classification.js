// export default class Tag {
//     constructor() {
//         this.tags = ["strong", "img", "p"];
//     }

//     classify_tag(value) {

//         const elements = value.querySelectorAll('*');
//         const result = [];
//         let i = 0;

//         elements.forEach(element => {
//             const tagName = element.tagName.toLowerCase();
//             const textContent = (`<${element.tagName}>${element.innerHTML}</${element.tagName}>`).trim();

//             // Skip elements with empty text content
//             if (textContent) {
//                 if (result.length > 0) {
//                     const lastTag = result[result.length - 1].tag;
//                     const last_count = result[result.length - 1].count;
//                     const last_text = result[result.length - 1].text;

//                     // Merge text content for specific tag combinations
//                     if ((lastTag == "strong" && tagName == "p")
//                         || (lastTag == "strong" && tagName == "normal_tag")
//                         || (lastTag == "p" && tagName == "normal_tag")
//                         || (lastTag == "normal_tag" && tagName == "p")
//                         || (last_count < 100)
//                         || (lastTag == tagName)
//                     ) {
//                         result[result.length - 1].text += textContent;
//                         result[result.length - 1].count += textContent.length;
//                     } else {
//                         result.push({ tag: this.tags.includes(tagName) ? tagName : "normal_tag", text: textContent, count: textContent.length, focus: 0, title: "tage" + i });
//                         i++;
//                     }
//                 } else {
//                     result.push({ tag: this.tags.includes(tagName) ? tagName : "normal_tag", text: textContent, count: textContent.length, focus: 0, title: "tage" + i });
//                     i++;
//                 }


//             }
//         });

//         return result;
//     }
// }


export class Tag {
    constructor() {
        this.turndownService = new TurndownService();

        // Rule for <strong> tags
        this.turndownService.addRule('strong', {
            filter: 'strong',
            replacement: (content) => content.replace(/(\*)+/g, '')
        });

        // Rule for <table> tags
        this.turndownService.addRule('table', {
            filter: 'table',
            replacement: function (content, node) {
                // Handle the table conversion here
                let tableMarkdown = '';
                // Extract headers
                let headers = Array.from(node.querySelectorAll('thead th')).map(th => th.textContent.trim());
                if (headers.length > 0) {
                    tableMarkdown += '| ' + headers.join(' | ') + ' |\n';
                    tableMarkdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
                }
                // Extract rows
                let rows = Array.from(node.querySelectorAll('tbody tr'));
                rows.forEach(row => {
                    let rowData = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
                    tableMarkdown += '| ' + rowData.join(' | ') + ' |\n';
                });
                return tableMarkdown;
            }
        });


    }

    classify_tag(value) {
        const markdown = this.turndownService.turndown(value);
        console.log(markdown);
        return markdown;
    }

}