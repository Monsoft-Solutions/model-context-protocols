import { GoogleAdsApi } from 'google-ads-api';
import { type Env } from '../config/env.js';
import { GoogleAdsApiError } from '../errors/google-ads-api-error.js';
import { type KeywordSearchVolume } from '../types/keyword-data.js';
import { type KeywordIdeaRequest } from '../types/keyword-idea-request.js';

/**
 * Service for interacting with Google Ads API
 */
export class GoogleAdsClient {
    private client: GoogleAdsApi;
    private customerId: string;
    private loginCustomerId?: string;
    private maxKeywordsPerRequest: number;
    private rateLimitDelay: number;

    constructor(env: Env) {
        this.customerId = env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, '');
        this.loginCustomerId = env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/-/g, '');
        this.maxKeywordsPerRequest = env.MAX_KEYWORDS_PER_REQUEST;
        this.rateLimitDelay = env.RATE_LIMIT_DELAY_MS;

        // Initialize Google Ads API client
        this.client = new GoogleAdsApi({
            client_id: env.GOOGLE_ADS_CLIENT_ID,
            client_secret: env.GOOGLE_ADS_CLIENT_SECRET,
            developer_token: env.GOOGLE_ADS_DEVELOPER_TOKEN,
        });

        // Set the refresh token
        this.client.Customer({
            customer_id: this.customerId,
            refresh_token: env.GOOGLE_ADS_REFRESH_TOKEN,
            login_customer_id: this.loginCustomerId,
        });
    }

    /**
     * Generate keyword ideas based on seed keywords or URLs
     * @param request Keyword idea request parameters
     * @returns Array of keyword ideas with metrics
     */
    async generateKeywordIdeas(request: KeywordIdeaRequest): Promise<KeywordSearchVolume[]> {
        try {
            const customer = this.client.Customer({
                customer_id: this.customerId,
                refresh_token: this.client.getRefreshToken(),
                login_customer_id: this.loginCustomerId,
            });

            // Build the request
            const keywordPlanIdeaService = customer.keywordPlanIdeas();

            const requestBody: any = {
                customer_id: this.customerId,
                language: request.languageCode || 'en',
                geo_target_constants: request.locationCodes || ['1009'], // Default to US
                include_adult_keywords: request.includeAdultKeywords ?? false,
                page_size: Math.min(request.pageSize || 100, this.maxKeywordsPerRequest),
                page_token: request.pageToken,
                keyword_plan_network: request.keywordPlanNetwork || 'GOOGLE_SEARCH',
            };

            // Add seed sources
            if (request.keywords && request.keywords.length > 0) {
                requestBody.keyword_seed = {
                    keywords: request.keywords,
                };
            }

            if (request.urls && request.urls.length > 0) {
                requestBody.url_seed = {
                    urls: request.urls,
                };
            }

            // Make the API call
            const response = await keywordPlanIdeaService.generateKeywordIdeas(requestBody);

            // Apply rate limiting
            await this.applyRateLimit();

            // Transform the response
            return this.transformKeywordIdeas(response);
        } catch (error) {
            throw new GoogleAdsApiError(
                `Failed to generate keyword ideas: ${error instanceof Error ? error.message : 'Unknown error'}`,
                undefined,
                'generateKeywordIdeas',
                error,
            );
        }
    }

    /**
     * Get historical metrics for specific keywords
     * @param keywords Array of keywords to get metrics for
     * @param languageCode Language code for the keywords
     * @param locationCodes Geographic location codes
     * @returns Array of keywords with historical metrics
     */
    async getKeywordHistoricalMetrics(
        keywords: string[],
        languageCode?: string,
        locationCodes?: string[],
    ): Promise<KeywordSearchVolume[]> {
        try {
            const customer = this.client.Customer({
                customer_id: this.customerId,
                refresh_token: this.client.getRefreshToken(),
                login_customer_id: this.loginCustomerId,
            });

            const keywordPlanIdeaService = customer.keywordPlanIdeas();

            // Split keywords into batches
            const batches = this.createBatches(keywords, this.maxKeywordsPerRequest);
            const allResults: KeywordSearchVolume[] = [];

            for (const batch of batches) {
                const response = await keywordPlanIdeaService.generateKeywordHistoricalMetrics({
                    customer_id: this.customerId,
                    keywords: batch,
                    language: languageCode || 'en',
                    geo_target_constants: locationCodes || ['1009'], // Default to US
                    keyword_plan_network: 'GOOGLE_SEARCH',
                });

                const transformed = this.transformHistoricalMetrics(response);
                allResults.push(...transformed);

                // Apply rate limiting between batches
                if (batches.indexOf(batch) < batches.length - 1) {
                    await this.applyRateLimit();
                }
            }

            return allResults;
        } catch (error) {
            throw new GoogleAdsApiError(
                `Failed to get keyword historical metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
                undefined,
                'getKeywordHistoricalMetrics',
                error,
            );
        }
    }

    /**
     * Transform keyword ideas response to our format
     */
    private transformKeywordIdeas(response: any): KeywordSearchVolume[] {
        const results: KeywordSearchVolume[] = [];

        if (!response.results) {
            return results;
        }

        for (const result of response.results) {
            const keywordIdeaMetrics = result.keyword_idea_metrics;
            const keyword = result.text;

            if (!keyword || !keywordIdeaMetrics) {
                continue;
            }

            results.push({
                keyword,
                avgMonthlySearches: keywordIdeaMetrics.avg_monthly_searches || 0,
                competition: this.mapCompetition(keywordIdeaMetrics.competition),
                competitionIndex: keywordIdeaMetrics.competition_index,
                topOfPageBidLowRange: keywordIdeaMetrics.low_top_of_page_bid_micros,
                topOfPageBidHighRange: keywordIdeaMetrics.high_top_of_page_bid_micros,
                monthlySearchVolumes: keywordIdeaMetrics.monthly_search_volumes?.map((volume: any) => ({
                    year: volume.year,
                    month: volume.month,
                    monthlySearches: volume.monthly_searches || 0,
                })),
                currency: 'USD', // Google Ads API returns in account currency
            });
        }

        return results;
    }

    /**
     * Transform historical metrics response to our format
     */
    private transformHistoricalMetrics(response: any): KeywordSearchVolume[] {
        const results: KeywordSearchVolume[] = [];

        if (!response.results) {
            return results;
        }

        for (const result of response.results) {
            const metrics = result.keyword_metrics;
            const keyword = result.text;

            if (!keyword || !metrics) {
                continue;
            }

            results.push({
                keyword,
                avgMonthlySearches: metrics.avg_monthly_searches || 0,
                competition: this.mapCompetition(metrics.competition),
                competitionIndex: metrics.competition_index,
                topOfPageBidLowRange: metrics.low_top_of_page_bid_micros,
                topOfPageBidHighRange: metrics.high_top_of_page_bid_micros,
                monthlySearchVolumes: metrics.monthly_search_volumes?.map((volume: any) => ({
                    year: volume.year,
                    month: volume.month,
                    monthlySearches: volume.monthly_searches || 0,
                })),
                currency: 'USD',
            });
        }

        return results;
    }

    /**
     * Map competition level from API response
     */
    private mapCompetition(competition?: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'UNSPECIFIED' {
        switch (competition) {
            case 'LOW':
                return 'LOW';
            case 'MEDIUM':
                return 'MEDIUM';
            case 'HIGH':
                return 'HIGH';
            default:
                return 'UNSPECIFIED';
        }
    }

    /**
     * Create batches of items for API requests
     */
    private createBatches<T>(items: T[], batchSize: number): T[][] {
        const batches: T[][] = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }

    /**
     * Apply rate limiting between API calls
     */
    private async applyRateLimit(): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay));
    }
}
