export default class Tag {
    constructor() {
        this.tags = ["strong", "p", "normal_tag"];
    }

    classify_tag(value) {
        const return_value = [];
        const traverse = (element) => {
            if (element.nodeType === Node.ELEMENT_NODE) {
                const tagName = element.tagName.toLowerCase();
                if (this.tags.includes(tagName)) {
                    return_value.push({ [tagName]: element.innerHTML });
                } else {
                    return_value.push({ "normal_tag": element.innerHTML });
                }

                // Traverse child elements
                element.childNodes.forEach(traverse);
            }
        };

        traverse(value);
        return return_value;
    }
}

