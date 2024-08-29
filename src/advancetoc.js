import { XmlParser } from "./utils/XmlParser";


/**
 * This class handles the parsing of advanced TOC (NCX) files and categorizes media items.
 * 
 */
class AdvancedToc {

  constructor() {
    this.quizItemList = null;
    this.categorizedMediaList = null;
  }

  getQuizItemList() {
    return this.quizItemList;
  }

  getCategorizedList() {
    return this.categorizedMediaList;
  }

  /**
   * Categorizes media items based on their type (algorithm, image, video, slide, GIF).
   * 
   * @param mediaPoints - An array of media items to be categorized.
   * @returns An object containing arrays of categorized media items.
   */
  categorizeMediaItems(mediaPoints) {
    const categories = {
      algo: [],
      img: [],
      vid: [],
      slid: [],
      gif: []
    };

    for (const item of mediaPoints) {
      const type = item && item.type ? item.type.toLowerCase() : null;
      if (type && categories[type]) {
        categories[type].push(item);
      } else if (type) {
        console.warn(`Unknown media type: ${type}`);
      }
    }

    return categories;
  }

/**
   * Handles the loading and parsing of the advanced TOC (NCX) file, and
   * categorizes media items found in the TOC.
   * 
   * @param advancedTocContent - The content of the advanced TOC (NCX) as a string or XML Document.
   */
  async handleAdvancedToc(advancedTocContent) {
    try {
      const advancedTocXmlContent = typeof advancedTocContent === 'string'
        ? advancedTocContent
        : new XMLSerializer().serializeToString(advancedTocContent);

      // Parse the XML content
      const xmlParser = new XmlParser();
      const parsedToc = xmlParser.parseXmlToJson(advancedTocXmlContent);

      // Safely access properties with null checks
      const navMap = parsedToc && parsedToc.navMap ? parsedToc.navMap : {};
      const advancedTocItemList = navMap.navPoint ? navMap.navPoint : [];

      // Find quiz items with null checks
      this.quizItemList = advancedTocItemList.find(item => 
        item && item.navPoint && item.navPoint.mediaMap && item.navPoint.mediaMap.mediaPoint &&
        item.navPoint.mediaMap.mediaPoint.type === "GEN"
      ) || null;

      // Find media items and categorize them with null checks
      const mediaItems = advancedTocItemList.find(item =>
        item && item.content && !item.content.src && item.mediaMap && item.mediaMap.mediaPoint &&
        item.mediaMap.mediaPoint.length > 0
      );

      if (mediaItems) {
        const mediaPoints = mediaItems.mediaMap && mediaItems.mediaMap.mediaPoint ? mediaItems.mediaMap.mediaPoint : [];
        this.categorizedMediaList = this.categorizeMediaItems(mediaPoints);
      } else {
        console.warn('No media items found.');
      }
    } catch (error) {
      console.error('Error loading or parsing the data:', error);
    }
  }
}

export default AdvancedToc;
