/**
 * This class provides methods to parse XML strings into JSON objects, tailored for specific XML structures like .ncx files.
 * 
 */
export class XmlParser {
    /**
     * Parses an XML string into a JSON object.
     * 
     * @param xmlString - The XML string to be parsed.
     * @returns A JSON representation of the XML string.
     */
    parseXmlToJson(xmlString) {
        // Create a new DOMParser instance
        const parser = new DOMParser();
        // Parse the XML string into an XML document
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");

        // Convert the XML document's root element to JSON
        return this.xmlToJson(xmlDoc.documentElement);
    }

    /**
     * Converts an XML Node to a JSON object, tailored for .ncx file structures.
     * 
     * @param xml - The XML Node to be converted.
     * @param parentKey - The parent key name for nested structures (used recursively).
     * @returns A JSON representation of the XML Node.
     */
    xmlToJson(xml, parentKey = '') {
        const obj = {};

        // Check if the node is an Element
        if (xml.nodeType === Node.ELEMENT_NODE) {
            const element = xml;

            // Add attributes to the JSON object
            if (element.attributes.length > 0) {
                for (const attribute of element.attributes) {
                    obj[attribute.nodeName] = attribute.nodeValue;
                }
            }

            // Process child nodes
            if (element.hasChildNodes()) {
                const childNodes = Array.from(element.childNodes);

                for (const child of childNodes) {
                    if (child.nodeType === Node.ELEMENT_NODE) {
                        const nodeName = child.nodeName;
                        const childJson = this.xmlToJson(child, nodeName);

                        if (typeof obj[nodeName] === 'undefined') {
                            // For 'desc' nodes, store text content directly
                            if (nodeName === 'desc') {
                                obj[nodeName] = child.textContent.trim();
                            } else {
                                obj[nodeName] = childJson;
                            }
                        } else {
                            // Handle multiple nodes with the same name by storing them in an array
                            if (!Array.isArray(obj[nodeName])) {
                                obj[nodeName] = [obj[nodeName]];
                            }
                            obj[nodeName].push(childJson);
                        }
                    } else if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim()) {
                        // Handle text nodes
                        obj['text'] = child.nodeValue.trim();
                    }
                }
            }
        }

        return obj;
    }
}
