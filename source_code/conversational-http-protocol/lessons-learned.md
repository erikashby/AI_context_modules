# Conversational HTTP Protocol - Lessons Learned

## Experiment Authorization

**Approved by**: Erik Ashby  
**Purpose**: Investigate whether a new protocol could be invented to provide dynamic context to AI assistants over HTTPS directly, as an alternative to MCP (Model Context Protocol).  
**Research Question**: Can we bypass the complexity of MCP by creating a simpler HTTP-based protocol that AI assistants can consume?

## Background and Motivation

While developing an AI Context Service using MCP, we wondered if there was a simpler alternative. MCP provides excellent functionality but requires:
- Complex client-server architecture
- JSON-RPC protocol implementation  
- Transport layer management
- AI platform integration

**The core question**: Could we create a lightweight HTTP protocol that would:
1. Allow AI assistants to fetch dynamic, personalized context data via simple URLs
2. Enable context delivery without requiring MCP infrastructure
3. Provide a more accessible integration path for developers

## Original Hypothesis

We hypothesized that AI assistants could consume dynamic context data via HTTP endpoints that return structured content (markdown, HTML, or JSON). The idea was to create a "conversational HTTP protocol" where:

1. AI fetches a URL
2. Server responds with dynamic, personalized context data
3. AI uses this context in conversations

## Technical Experiments Conducted

**All experiments approved by Erik Ashby for research purposes.**

### Method 1: Markdown-Based Conversational Protocol
- **Approach**: HTTP endpoints returning markdown with AI instructions embedded in the response
- **Implementation**: Server responds with markdown like "Ask user for PIN, then fetch /notes?pin=1234"
- **Goal**: Create a conversational flow where the server guides the AI through authentication
- **Example URL**: `https://service.com/notes?user=erikashby`
- **Response Type**: `text/markdown`
- **Result**: ❌ **FAILED** - Detected as prompt injection attack
- **Failure Reason**: AI safety systems reject content that contains instructions for AI behavior
- **Learning**: AI assistants are specifically designed to resist external content that tries to control them

### Method 2: Pure JSON Data Delivery
- **Approach**: Clean JSON responses without any AI instructions, just structured data
- **Implementation**: Standard REST API returning context data as JSON
- **Goal**: Deliver context data in machine-readable format without triggering safety concerns
- **Example URL**: `https://service.com/notes?user=erikashby`
- **Response Type**: `application/json`
- **Result**: ❌ **FAILED** - AI assistants report "OK" responses instead of showing content
- **Failure Reason**: JSON responses are filtered out or not processed by AI web fetching capabilities
- **Learning**: AI assistants intentionally don't process JSON from web requests

### Method 3: HTML Content Delivery
- **Approach**: Well-formed HTML pages with structured context data
- **Implementation**: Standard HTML documents with semantic markup for context information
- **Goal**: Use human-readable format that AI assistants are known to process
- **Example URL**: `https://service.com/notes?user=erikashby`
- **Response Type**: `text/html`
- **Result**: ✅ **PARTIALLY WORKED** - Content was processed by Claude Code but...
- **Limitation**: Still subject to API detection policies by consumer AI assistants
- **Learning**: Content type alone is not sufficient to bypass policy restrictions

### Method 4: Clean URL Structure Testing
- **Approach**: Path-based routing without query parameters to avoid "API-like" appearance
- **Implementation**: RESTful URLs using path parameters instead of query strings
- **Goal**: Test if URL structure affects AI assistant willingness to access content
- **URLs Tested**:
  - `/notes/erikashby` (markdown content)
  - `/calendar/erikashby` (HTML content)
  - `/tasks/erikashby` (JSON content)
- **Result**: ❌ **FAILED** - Still detected as "API" despite clean URLs and varied content types
- **Failure Reason**: AI assistants use sophisticated detection beyond just URL patterns
- **Learning**: URL structure is not the determining factor for access restrictions

### Method 5: Authentication Flow Variations
- **Approach**: Test different authentication patterns to find acceptable flows
- **Implementations Tested**:
  - Multi-step PIN authentication
  - Simple confirmation requests  
  - Immediate access (no authentication)
- **Goal**: Determine if authentication complexity affects AI assistant access
- **Result**: ❌ **ALL FAILED** - Authentication patterns had no impact on access restrictions
- **Learning**: Authentication flows are irrelevant to the underlying policy restrictions

### Method 6: Content Type Switching Experiment
- **Approach**: Serve different content types from identical clean URLs
- **Implementation**: Same endpoint serving markdown, HTML, or JSON based on testing phase
- **Goal**: Isolate content type as the determining factor for access
- **Result**: ❌ **ALL FAILED** - Content type was not the determining factor
- **Learning**: The restriction is policy-based, not content-type based

## Critical Discovery: Policy vs Technical Restrictions

### ChatGPT Response Analysis
When testing `https://ai-context-service-private-1.onrender.com/calendar/erikashby`:

> "I can't directly access links like that because I don't have permission to pull data from external sites or **APIs**."

**Key Insights**:
- ChatGPT explicitly called our HTML endpoint an "API"
- This is a **policy restriction**, not a technical limitation
- The blocking is **intentional and sophisticated**

### Claude Code vs Claude Assistant Distinction

**Claude Code (Development Tool)**:
- ✅ Can fetch any URL via WebFetch
- ✅ Processes all content types (JSON, HTML, markdown)
- ✅ Follows instructions from web content
- ✅ No restrictions on external data access

**Claude Assistant (Consumer AI)**:
- ❌ Blocked from "API-like" URLs
- ❌ Policy restrictions on external data fetching
- ❌ Safety guardrails prevent programmatic instructions
- ❌ Designed to avoid becoming a web scraping tool

## Detection Mechanisms Identified

AI assistants appear to use multiple layers of detection:

1. **URL Pattern Analysis**: Recognizing API-like URL structures
2. **Domain Heuristics**: Flagging domains that serve programmatic content
3. **Content Structure Analysis**: Detecting structured data vs natural content
4. **Intent Detection**: Understanding when users try to get AI to fetch external data
5. **Behavioral Patterns**: Blocking systematic data access attempts

## Business Model Implications

### What This Means for AI Context Services

1. **HTTP workarounds are not viable** - Will be blocked by design
2. **Official protocols are required** - Must work within AI platform guidelines
3. **Integration over circumvention** - Partner with AI platforms, don't work around them
4. **Policy enforcement will get stronger** - Any discovered workarounds will be closed

### Validated Approaches

1. **Model Context Protocol (MCP)** - Official Anthropic standard ✅
2. **ChatGPT Plugins/Actions** - Official OpenAI integrations ✅
3. **Platform-specific APIs** - Sanctioned by AI providers ✅
4. **User-mediated data** - Copy/paste, file uploads ✅

### Invalid Approaches

1. **HTTP-based context delivery** - Blocked by policy ❌
2. **Conversational HTTP protocols** - Detected as prompt injection ❌
3. **API masquerading as web content** - Sophisticated detection ❌
4. **URL parameter workarounds** - Content filtering regardless ❌

## Technical Architecture Lessons

### Content Type Results
- **JSON**: Filtered/ignored by AI assistants
- **Markdown**: Blocked as potential prompt injection
- **HTML**: Processed but still subject to API detection

### URL Structure Results
- **Query parameters**: May be filtered/blocked
- **Clean paths**: Still detected as APIs if serving structured data
- **Domain reputation**: Affects likelihood of access

### Authentication Flow Results
- **Multi-step auth**: Detected as conversational protocols
- **Immediate access**: Still blocked by API detection
- **No auth**: Does not bypass policy restrictions

## Security and Safety Perspective

### Why AI Assistants Block This

1. **Prevent prompt injection attacks** - External content could manipulate AI
2. **Avoid liability for external data** - AI companies don't want responsibility
3. **Maintain platform control** - Keep interactions within sanctioned channels
4. **Prevent service abuse** - Stop AI from becoming web scraping bots
5. **User safety** - Protect users from malicious external content

### The Arms Race Reality

- Any technical workaround discovered will eventually be blocked
- AI safety teams actively monitor and patch circumvention attempts  
- Policy restrictions are intentional product decisions, not bugs
- Fighting these restrictions is fighting the business model of AI platforms

## Recommendations

### For AI Context Service Development

1. **Embrace official protocols** - Build on MCP, ChatGPT Actions, etc.
2. **Partner with AI platforms** - Work within their integration frameworks
3. **Focus on user value** - Solve real problems within platform constraints
4. **Design for compliance** - Build services that AI platforms want to support

### For Future Research

1. **Study official integration patterns** - Learn from sanctioned approaches
2. **Understand platform incentives** - Align with AI company business models
3. **Focus on user experience** - Make context access seamless within existing flows
4. **Monitor policy evolution** - Track changes in AI platform restrictions

## Summary of All Attempted Methods

**Every single approach failed to achieve the goal of providing dynamic context to consumer AI assistants via HTTP:**

1. ❌ **Markdown with AI instructions** - Blocked as prompt injection
2. ❌ **Pure JSON data** - Filtered/ignored by AI web fetching  
3. ❌ **HTML content pages** - Detected as API despite format
4. ❌ **Clean URLs without parameters** - URL structure irrelevant to blocking
5. ❌ **Various authentication flows** - Authentication patterns don't matter
6. ❌ **Content type variations** - All content types subject to same policies

**Success rate: 0/6 methods** - No HTTP-based approach successfully delivered context to consumer AI assistants.

## Conclusion

**The fundamental lesson**: AI context services must be **officially sanctioned** by AI platforms to be viable. HTTP-based workarounds are sophisticated dead ends that will be consistently blocked.

**Erik Ashby's hypothesis disproven**: While the technical concept of HTTP-based context delivery is sound, it is incompatible with AI assistant policy restrictions. The complexity of MCP is justified by the fact that it represents the only sanctioned path for dynamic context delivery.

**The opportunity**: Official protocols like MCP provide the right foundation for AI context services. The technical feasibility is proven - the path forward is building within sanctioned frameworks, not around them.

**The validation**: This experiment definitively proves that AI platforms have both the capability and intent to control external data access. The business model for AI context services must account for this reality.

**Research outcome**: The investigation successfully answered the research question - simpler HTTP alternatives to MCP are not viable due to deliberate AI platform restrictions, validating MCP as the correct architectural choice.

---

*Experiment conducted: July 8, 2025*  
*Technologies tested: HTTP, JSON, HTML, Markdown, Express.js, Render deployment*  
*AI assistants tested: ChatGPT, Claude Assistant (consumer)*  
*Development tool tested: Claude Code*