export default class Tag {
    constructor() {
        this.tags = ["strong", "img", "p"];
    }

    classify_tag(value) {

        const elements = value.querySelectorAll('*');
        const result = [];
        let i = 0;

        elements.forEach(element => {
            const tagName = element.tagName.toLowerCase();
            const textContent = element.textContent;

            // Skip elements with empty text content
            if (textContent) {
                if (result.length > 0) {
                    const lastTag = result[result.length - 1].tag;
                    const last_count = result[result.length - 1].count;

                    // Merge text content for specific tag combinations
                    if ((lastTag == "strong" && tagName == "p") ||
                        (lastTag == "strong" && tagName == "normal_tag") ||
                        (lastTag == "p" && tagName == "normal_tag") ||
                        (lastTag == "normal_tag" && tagName == "p") ||
                        (last_count < 30) ||
                        (lastTag == tagName)) {
                        result[result.length - 1].text += textContent;
                        result[result.length - 1].count += textContent.length;
                    } else {
                        result.push({ tag: this.tags.includes(tagName) ? tagName : "normal_tag", text: textContent, count: textContent.length, focus: 0, title: "tage" + i });
                        i++;
                    }
                } else {
                    result.push({ tag: this.tags.includes(tagName) ? tagName : "normal_tag", text: textContent, count: textContent.length, focus: 0, title: "tage" + i });
                    i++;
                }


            }
        });

        return result;
    }
}
