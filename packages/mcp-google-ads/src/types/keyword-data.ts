/**
 * Represents keyword search volume data
 */
export type KeywordSearchVolume = {
    /** The keyword text */
    keyword: string;
    /** Average monthly searches for the keyword */
    avgMonthlySearches: number;
    /** Competition level (LOW, MEDIUM, HIGH) */
    competition: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNSPECIFIED';
    /** Competition index (0-100) */
    competitionIndex?: number;
    /** Low range of top page bid in micros */
    topOfPageBidLowRange?: number;
    /** High range of top page bid in micros */
    topOfPageBidHighRange?: number;
    /** Monthly search volumes for the past 12 months */
    monthlySearchVolumes?: Array<{
        year: number;
        month: number;
        monthlySearches: number;
    }>;
    /** Currency code for bid estimates */
    currency?: string;
};
