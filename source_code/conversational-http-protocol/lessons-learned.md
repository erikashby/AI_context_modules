# Conversational HTTP Protocol - Lessons Learned

## Executive Summary

**Key Finding**: AI assistants have deliberate policy restrictions that block external data access, regardless of technical implementation. Dynamic context delivery to AI assistants requires official protocols, not HTTP workarounds.

## Original Hypothesis

We hypothesized that AI assistants could consume dynamic context data via HTTP endpoints that return structured content (markdown, HTML, or JSON). The idea was to create a "conversational HTTP protocol" where:

1. AI fetches a URL
2. Server responds with dynamic, personalized context data
3. AI uses this context in conversations

## Technical Experiments Conducted

### 1. Markdown-Based Conversational Protocol
- **Approach**: HTTP endpoints returning markdown with AI instructions
- **Example**: "Ask user for PIN, then fetch /notes?pin=1234"
- **Result**: ❌ **BLOCKED** - Detected as prompt injection
- **Reason**: AI safety systems reject content that tries to control AI behavior

### 2. Pure JSON Data Delivery
- **Approach**: Clean JSON responses without AI instructions
- **Content-Type**: `application/json`
- **Result**: ❌ **BLOCKED** - AI assistants report "OK" responses instead of content
- **Reason**: JSON responses are filtered out or not processed by web fetching

### 3. HTML Content Delivery
- **Approach**: Well-formed HTML pages with structured data
- **Content-Type**: `text/html`
- **Result**: ✅ **PARTIALLY WORKS** - Content is processed but...
- **Limitation**: Still subject to API detection policies

### 4. Clean URL Testing
- **Approach**: Path-based routing without query parameters
- **URLs Tested**:
  - `/notes/erikashby` (markdown)
  - `/calendar/erikashby` (HTML)
  - `/tasks/erikashby` (JSON)
- **Result**: ❌ **BLOCKED** - Still detected as "API" despite clean URLs

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

## Conclusion

**The fundamental lesson**: AI context services must be **officially sanctioned** by AI platforms to be viable. HTTP-based workarounds are sophisticated dead ends that will be consistently blocked.

**The opportunity**: Official protocols like MCP provide the right foundation for AI context services. The technical feasibility is proven - the path forward is building within sanctioned frameworks, not around them.

**The validation**: This experiment definitively proves that AI platforms have both the capability and intent to control external data access. The business model for AI context services must account for this reality.

---

*Experiment conducted: July 8, 2025*  
*Technologies tested: HTTP, JSON, HTML, Markdown, Express.js, Render deployment*  
*AI assistants tested: ChatGPT, Claude Assistant (consumer)*  
*Development tool tested: Claude Code*