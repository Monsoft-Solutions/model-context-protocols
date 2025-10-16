/**
 * Request parameters for generating keyword ideas
 */
export type KeywordIdeaRequest = {
    /** Keywords to use as seeds for generating ideas */
    keywords?: string[];
    /** URLs to extract keyword ideas from */
    urls?: string[];
    /** Language code (e.g., 'en' for English) */
    languageCode?: string;
    /** Geographic location codes to target */
    locationCodes?: string[];
    /** Whether to include adult keywords */
    includeAdultKeywords?: boolean;
    /** Maximum number of keyword ideas to return */
    pageSize?: number;
    /** Page token for pagination */
    pageToken?: string;
    /** Keyword plan network (GOOGLE_SEARCH, GOOGLE_SEARCH_AND_PARTNERS) */
    keywordPlanNetwork?: 'GOOGLE_SEARCH' | 'GOOGLE_SEARCH_AND_PARTNERS';
};
