import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import Exa from "exa-js";

// Initialize Exa client
const getExaClient = () => {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    throw new Error("EXA_API_KEY environment variable is not set");
  }
  return new Exa(apiKey);
};

/**
 * Exa Search MCP Server
 * Provides neural and keyword search capabilities for research
 */
export const exaSearchTools = createSdkMcpServer({
  name: "exa-search",
  version: "1.0.0",
  tools: [
    tool(
      "search",
      "Search the web using Exa's neural or keyword search for research papers and articles. Use neural search for semantic understanding and keyword search for exact term matching.",
      {
        query: z.string().describe("The search query. For neural search, use natural language. For keyword search, you can use operators like AND, OR, quotes for exact phrases."),
        type: z.enum(["neural", "keyword"]).default("neural").describe("Search type: 'neural' for semantic search (recommended for research), 'keyword' for exact term matching"),
        num_results: z.number().min(1).max(20).default(5).describe("Number of results to return (1-20)"),
        include_domains: z.array(z.string()).optional().describe("Only include results from these domains (e.g., ['arxiv.org', 'arxiv-vanity.com'])"),
        exclude_domains: z.array(z.string()).optional().describe("Exclude results from these domains"),
        start_published_date: z.string().optional().describe("Only include results published after this date (ISO 8601 format: YYYY-MM-DD)"),
        end_published_date: z.string().optional().describe("Only include results published before this date (ISO 8601 format: YYYY-MM-DD)"),
        use_autoprompt: z.boolean().default(true).describe("Let Exa optimize the search query automatically (recommended for neural search)"),
        include_text: z.boolean().default(false).describe("Include snippets of text from the results"),
        text_length_words: z.number().min(50).max(500).optional().describe("Number of words to include in text snippets (if include_text is true)")
      },
      async (args) => {
        try {
          const exa = getExaClient();

          const searchOptions: any = {
            type: args.type,
            numResults: args.num_results,
            useAutoprompt: args.use_autoprompt,
          };

          // Add optional filters
          if (args.include_domains && args.include_domains.length > 0) {
            searchOptions.includeDomains = args.include_domains;
          }

          if (args.exclude_domains && args.exclude_domains.length > 0) {
            searchOptions.excludeDomains = args.exclude_domains;
          }

          if (args.start_published_date) {
            searchOptions.startPublishedDate = args.start_published_date;
          }

          if (args.end_published_date) {
            searchOptions.endPublishedDate = args.end_published_date;
          }

          // Content options
          if (args.include_text) {
            searchOptions.contents = {
              text: {
                maxCharacters: args.text_length_words ? args.text_length_words * 5 : 1000
              }
            };
          }

          const results = await exa.searchAndContents(args.query, searchOptions);

          // Format results for better readability
          const formattedResults = {
            autoprompt_string: results.autopromptString || null,
            total_results: results.results.length,
            results: results.results.map((r: any) => ({
              id: r.id,
              title: r.title,
              url: r.url,
              author: r.author || "Unknown",
              published_date: r.publishedDate || "Unknown",
              score: r.score || null,
              text: r.text || null,
              highlights: r.highlights || []
            }))
          };

          return {
            content: [{
              type: "text",
              text: JSON.stringify(formattedResults, null, 2)
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: "text",
              text: `Error performing search: ${error.message}`
            }],
            isError: true
          };
        }
      }
    ),

    tool(
      "get_contents",
      "Get full content and metadata from specific URLs or search result IDs. Useful for deep-diving into specific papers after an initial search.",
      {
        ids: z.array(z.string()).min(1).max(10).describe("Result IDs or URLs to fetch content from (maximum 10 at once)"),
        text_length_words: z.number().min(100).max(2000).default(500).describe("Number of words to retrieve from each document")
      },
      async (args) => {
        try {
          const exa = getExaClient();

          const contents = await exa.getContents(args.ids, {
            text: {
              maxCharacters: args.text_length_words * 5
            }
          });

          // Format contents for better readability
          const formattedContents = {
            total_documents: contents.results.length,
            documents: contents.results.map((doc: any) => ({
              id: doc.id,
              url: doc.url,
              title: doc.title,
              author: doc.author || "Unknown",
              published_date: doc.publishedDate || "Unknown",
              text: doc.text,
              word_count: doc.text ? doc.text.split(/\s+/).length : 0
            }))
          };

          return {
            content: [{
              type: "text",
              text: JSON.stringify(formattedContents, null, 2)
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: "text",
              text: `Error fetching contents: ${error.message}`
            }],
            isError: true
          };
        }
      }
    ),

    tool(
      "find_similar",
      "Find papers and articles similar to a given URL. Useful for exploring related work after finding an interesting paper.",
      {
        url: z.string().url().describe("URL of the paper/article to find similar content for"),
        num_results: z.number().min(1).max(20).default(5).describe("Number of similar results to return"),
        exclude_source_domain: z.boolean().default(false).describe("Whether to exclude results from the same domain as the input URL")
      },
      async (args) => {
        try {
          const exa = getExaClient();

          const results = await exa.findSimilar(args.url, {
            numResults: args.num_results,
            excludeSourceDomain: args.exclude_source_domain
          });

          const formattedResults = {
            source_url: args.url,
            total_results: results.results.length,
            similar_papers: results.results.map((r: any) => ({
              id: r.id,
              title: r.title,
              url: r.url,
              author: r.author || "Unknown",
              published_date: r.publishedDate || "Unknown",
              score: r.score || null
            }))
          };

          return {
            content: [{
              type: "text",
              text: JSON.stringify(formattedResults, null, 2)
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: "text",
              text: `Error finding similar content: ${error.message}`
            }],
            isError: true
          };
        }
      }
    )
  ]
});

export default exaSearchTools;
