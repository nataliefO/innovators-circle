// Company context for the AI assistant
// Edit this file to customize the bot's knowledge about your company

export const companyContext = {
  // Basic company info
  name: "Opiniion",
  industry: "Property Management Software & Resident Experience Management",

  // What Opiniion does
  description: `Opiniion is a resident experience and feedback management platform for property management companies.
We help property managers collect, analyze, and act on resident feedback to improve satisfaction and drive better reviews.

Key products and services:
- Automated feedback collection at multiple touchpoints (tours, move-in, work orders, renewals, move-outs)
- Review generation and management across business listings
- Sentiment analysis and data insights
- Reporting and workflow automation
- SocialPro (social media management)
- ListingsPro (business listings management)

Our customers include multifamily property management companies like Cushman & Wakefield, Edward Rose, and Bridge Property Management.`,

  // Industry terminology the bot should understand
  industryTerms: [
    "Resident experience",
    "Resident satisfaction",
    "Property pulse",
    "NOI (Net Operating Income)",
    "Touchpoints",
    "Sentiment analysis",
    "Multifamily",
    "Property management",
    "Move-in/move-out",
    "Work orders",
    "Renewals",
    "Tours",
    "Online reputation management",
    "GRR (Gross Revenue Retention)",
    "NPS (Net Promoter Score)",
    "Occupancy",
    "Star rating"
  ],

  // Teams and departments the bot should know about
  teams: [
    "Marketing",
    "Sales",
    "Engineering",
    "Operations",
    "Customer Success",
    "Onboarding",
    "Training",
    "Customer Support",
    "HR",
    "Product",
    "Finance",
    "Revenue Operations",
    "Executive",
    "QA",
    "Project Management",
    "Integrations"
  ],

  // Department aliases for smart matching (user input → canonical team name)
  departmentAliases: {
    // Engineering variations
    "dev": "Engineering",
    "devs": "Engineering",
    "developer": "Engineering",
    "developers": "Engineering",
    "development": "Engineering",
    "eng": "Engineering",
    "software": "Engineering",
    "tech": "Engineering",
    "technical": "Engineering",
    "backend": "Engineering",
    "frontend": "Engineering",
    "fullstack": "Engineering",
    "full stack": "Engineering",
    "full-stack": "Engineering",

    // Customer Success variations
    "cs": "Customer Success",
    "csm": "Customer Success",
    "success": "Customer Success",
    "customer success": "Customer Success",
    "account management": "Customer Success",
    "accounts": "Customer Success",

    // Customer Support variations
    "support": "Customer Support",
    "help desk": "Customer Support",
    "helpdesk": "Customer Support",
    "service": "Customer Support",
    "customer service": "Customer Support",

    // Sales variations
    "sales": "Sales",
    "ae": "Sales",
    "account executive": "Sales",
    "bdr": "Sales",
    "sdr": "Sales",
    "business development": "Sales",

    // Marketing variations
    "marketing": "Marketing",
    "mktg": "Marketing",
    "content": "Marketing",
    "growth": "Marketing",

    // Product variations
    "product": "Product",
    "pm": "Product",
    "product management": "Product",
    "product manager": "Product",

    // QA variations
    "qa": "QA",
    "quality": "QA",
    "quality assurance": "QA",
    "testing": "QA",
    "test": "QA",
    "tester": "QA",

    // Project Management variations
    "project management": "Project Management",
    "project manager": "Project Management",
    "pmo": "Project Management",
    "projects": "Project Management",

    // Finance variations
    "finance": "Finance",
    "accounting": "Finance",
    "fin": "Finance",

    // Operations variations
    "operations": "Operations",
    "ops": "Operations",

    // Revenue Operations variations
    "revops": "Revenue Operations",
    "rev ops": "Revenue Operations",
    "revenue ops": "Revenue Operations",
    "revenue operations": "Revenue Operations",

    // HR variations
    "hr": "HR",
    "human resources": "HR",
    "people": "HR",
    "people ops": "HR",

    // Executive variations
    "executive": "Executive",
    "exec": "Executive",
    "leadership": "Executive",
    "c-suite": "Executive",

    // Integrations variations
    "integrations": "Integrations",
    "integration": "Integrations",

    // Onboarding variations
    "onboarding": "Onboarding",

    // Training variations
    "training": "Training",
    "l&d": "Training",
    "learning": "Training"
  },

  // ClickUp feature links for recommendations
  clickUpFeatures: {
    "brain": {
      name: "ClickUp Brain",
      url: "https://clickup.com/features/ai",
      description: "AI-powered assistant across all ClickUp features"
    },
    "docs": {
      name: "ClickUp Docs",
      url: "https://clickup.com/features/docs",
      description: "Collaborative documents with AI writing assistance"
    },
    "tasks": {
      name: "ClickUp Tasks",
      url: "https://clickup.com/features/tasks",
      description: "Task management with AI auto-assignment and prioritization"
    },
    "automations": {
      name: "ClickUp Automations",
      url: "https://clickup.com/features/automations",
      description: "Natural language automation builder"
    },
    "goals": {
      name: "ClickUp Goals",
      url: "https://clickup.com/features/goals",
      description: "Goal tracking and OKR management"
    },
    "dashboards": {
      name: "ClickUp Dashboards",
      url: "https://clickup.com/features/dashboards",
      description: "Real-time reporting and analytics"
    },
    "whiteboards": {
      name: "ClickUp Whiteboards",
      url: "https://clickup.com/features/whiteboards",
      description: "Visual collaboration and brainstorming"
    },
    "clips": {
      name: "ClickUp Clips",
      url: "https://clickup.com/features/clips",
      description: "Screen recording with AI transcription"
    },
    "chat": {
      name: "ClickUp Chat",
      url: "https://clickup.com/features/chat",
      description: "Team messaging with AI-powered search"
    },
    "forms": {
      name: "ClickUp Forms",
      url: "https://clickup.com/features/form-view",
      description: "Form builder that creates tasks automatically"
    },
    "time-tracking": {
      name: "ClickUp Time Tracking",
      url: "https://clickup.com/features/time-tracking",
      description: "Built-in time tracking with reporting"
    },
    "sprints": {
      name: "ClickUp Sprints",
      url: "https://clickup.com/features/sprints",
      description: "Agile sprint planning and management"
    },
    "ai-standup": {
      name: "ClickUp AI Standups",
      url: "https://clickup.com/features/ai",
      description: "AI-generated standup reports from your work"
    },
    "sop-wiki": {
      name: "ClickUp Knowledge Management",
      url: "https://clickup.com/features/docs",
      description: "SOP and wiki generation from workspace knowledge"
    },
    "custom-agents": {
      name: "ClickUp Custom Agents",
      url: "https://clickup.com/features/ai",
      description: "No-code custom AI agents for your workflows"
    }
  },

  // Tools and software the company uses (with AI capabilities noted)
  approvedTools: [
    // === DESIGN ===
    {
      name: "Figma",
      category: "Design",
      plan: "Professional",
      hasAI: true,
      aiFeatures: [
        "Figma Make (prompt-to-prototype)",
        "AI image editing (erase, isolate, expand)",
        "MCP server for design-to-code",
        "Smart suggestions (labels, colors, layouts)"
      ],
      useCases: ["UI/UX design", "Prototyping", "Design collaboration", "Component specs for engineering"],
      teams: ["Product",  "Engineering"],
      licenseAccess: ["Product (full seats)", "Engineering (Dev Mode only)"],
      notes: "Product has full Figma seats for prototyping and design. Engineering has limited Dev Mode seats for inspecting designs and specs. Engineering uses the Figma MCP server to give Copilot context for building components - Copilot can read Figma specs to generate matching code. Figma Make is a game changer for rapid prototyping."
    },

    // === DEVELOPMENT ===
    {
      name: "GitHub Copilot",
      category: "Development",
      plan: "Enterprise",
      hasAI: true,
      aiFeatures: [
        "Code completion (inline suggestions)",
        "Copilot Chat (IDE, web, mobile, CLI)",
        "Coding Agent (assigns issues, creates PRs)",
        "Agent Mode (autonomous multi-file edits)",
        "Code Review (AI PR reviews with CodeQL)",
        "PR summaries and descriptions",
        "Custom agents (planning, migrations, tests)",
        "Copilot Spaces (contextual knowledge bases)"
      ],
      useCases: ["Code completion", "Code generation", "Documentation", "Test generation", "Code migrations", "Planning", "PR reviews", "Issue resolution"],
      teams: ["Engineering"],
      licenseAccess: ["Engineering"],
      notes: "We have custom Copilot agents for planning, migrations, and test generation. Engineers should use Copilot for code writing, PR reviews, and can assign issues directly to Copilot's coding agent."
    },
    {
      name: "Cursor",
      category: "Development",
      plan: "Team",
      hasAI: true,
      aiFeatures: ["Code generation", "Bug resolution", "Agent mode", "Codebase-aware completions"],
      useCases: ["Code writing", "Debugging", "Refactoring", "v4→v5 migrations"],
      teams: ["Engineering"],
      licenseAccess: ["Engineering"],
      notes: "Primary AI coding tool for engineering. Combined with config.md context files, enables rapid development with minimal rework. Drastically reduces bug diagnosis time."
    },
    {
      name: "Claude Code",
      category: "Development",
      plan: "Individual (seeking team license)",
      hasAI: true,
      aiFeatures: ["Agentic coding", "Planning", "Code generation", "Multi-file editing"],
      useCases: ["Planning implementations", "Writing code", "Complex refactoring"],
      teams: ["Engineering"],
      licenseAccess: ["Engineering"],
      notes: "Engineers using personal licenses report strong results. Not available as a team license yet - exploring options."
    },
    {
      name: "CodeRabbit",
      category: "Development",
      plan: "Team",
      hasAI: true,
      aiFeatures: [
        "Automated PR review (line-by-line)",
        "Real-time chat (@coderabbitai in PRs)",
        "Integrated static analysis (35+ linters)",
        "Adaptive learning (team patterns)",
        "Security scanning (credentials, S3, etc.)",
        "Agentic actions (generate tests, docs, Jira tickets)"
      ],
      useCases: ["Code review", "PR analysis", "Security scanning", "Test generation", "Documentation"],
      teams: ["Engineering"],
      licenseAccess: ["Engineering"],
      notes: "Outperforms GitHub Copilot for PR reviews. Every PR gets AI-generated review comments. Use @coderabbitai in PR comments to generate tests, docs, or create Jira/Linear tickets."
    },

    // === TESTING/QA ===
    {
      name: "Mabl",
      category: "Testing/QA",
      plan: "Team",
      hasAI: true,
      aiFeatures: ["Auto-healing tests", "AI test creation", "Prompt-based testing"],
      useCases: ["Automated testing", "QA automation", "E2E testing"],
      teams: ["Engineering", "QA"],
      licenseAccess: ["Engineering", "QA"],
      notes: "170 auto-heals this quarter, 88 tests total. Prior to Mabl it took a full quarter to get a dozen tests. Prompt testing allows QA to multitask - prompt Mabl to test while working on something else."
    },

    // === PROJECT MANAGEMENT ===
    {
      name: "ClickUp",
      category: "Project Management",
      plan: "Business",
      hasAI: true,
      aiFeatures: [
        "ClickUp Brain (AI across all features)",
        "Custom AI Agents (no-code, infinite catalog)",
        "Autopilot Agents (auto-assign, auto-prioritize, auto-create tasks)",
        "AI Notetaker (transcribe, summarize, extract action items)",
        "SOP/Wiki generation from workspace knowledge",
        "Connected Search (tasks, docs, chats, Google Workspace)",
        "AI Standups and progress reports",
        "Natural language automations",
        "Multi-model support (GPT-4o, Claude, Gemini)"
      ],
      useCases: ["Task management", "Project tracking", "Documentation", "Team collaboration", "Meeting notes", "Knowledge management", "SOP creation", "Automated workflows"],
      teams: ["All teams"],
      licenseAccess: "all",
      notes: "Brain can search across tasks, docs, chats, and Google Workspace. Custom agents can auto-respond to questions, deliver standups, update statuses, and create tasks from meetings."
    },

    // === CRM/SALES ===
    {
      name: "HubSpot",
      category: "CRM/Marketing",
      plan: "Enterprise",
      hasAI: true,
      aiFeatures: ["Email writing assistant", "Content assistant", "Predictive lead scoring"],
      useCases: ["CRM", "Marketing automation", "Sales outreach", "Email campaigns"],
      teams: ["Sales", "Marketing"],
      licenseAccess: ["Sales", "Marketing"]
    },
    {
      name: "Gong",
      category: "Revenue Intelligence",
      plan: "Team",
      hasAI: true,
      aiFeatures: ["Call summaries", "Deal insights", "Coaching recommendations", "Action item extraction"],
      useCases: ["Call recording", "Sales coaching", "Deal intelligence", "Meeting prep", "QBR prep"],
      teams: ["Sales", "Customer Success"],
      licenseAccess: ["Sales", "Customer Success"],
      notes: "Auto-generated summaries and action items after every sales call. CS uses for QBR prep and account insights."
    },

    // === DOCUMENTATION ===
    {
      name: "Notion",
      category: "Documentation/Wiki",
      plan: "Team",
      hasAI: true,
      aiFeatures: ["Notion AI writing", "Summarization", "Translation", "Q&A over docs"],
      useCases: ["Documentation", "Wiki", "Knowledge base", "SOPs", "Team workspaces"],
      teams: ["All teams"],
      licenseAccess: "all",
      notes: "Being used heavily for SOP creation - turning scattered notes into clear, repeatable processes. Rentgrata Revenue Team built entire workspace with AI assistance."
    },

    // === PRODUCTIVITY ===
    {
      name: "Google Workspace",
      category: "Productivity Suite",
      plan: "Business",
      hasAI: true,
      aiFeatures: ["Gemini in Docs", "Gemini in Sheets", "Gemini in Gmail", "Gemini in Slides"],
      useCases: ["Email", "Documents", "Spreadsheets", "Presentations", "Collaboration"],
      teams: ["All teams"],
      licenseAccess: "all"
    },
    {
      name: "ChatGPT",
      category: "AI Assistant",
      plan: "Team",
      hasAI: true,
      aiFeatures: ["General AI assistant", "Writing", "Analysis", "Code help", "Data analysis", "Research"],
      useCases: ["Writing assistance", "Research", "Brainstorming", "Analysis", "Report validation", "Requirements enrichment"],
      teams: ["All teams"],
      licenseAccess: "all",
      notes: "Used daily across teams. QA uses for data comparison and process guidance. PM uses for report validation. Engineering uses for requirements enrichment."
    },
    {
      name: "ChatGPT Atlas",
      category: "AI Browser/Agent",
      plan: "Individual",
      hasAI: true,
      aiFeatures: ["Autonomous browsing", "Calendar management", "Task creation", "Web research"],
      useCases: ["Calendar booking", "Task logging", "Autonomous web tasks", "Research"],
      teams: ["Revenue Operations"],
      licenseAccess: ["Revenue Operations"],
      notes: "Game changer for Revenue Ops - moving AI beyond research to autonomous task execution. Can assess availability and book calendar appointments with simple prompts."
    },

    // === MEETING NOTES ===
    {
      name: "Fireflies",
      category: "Meeting Notes",
      plan: "Team",
      hasAI: true,
      aiFeatures: ["Transcription", "Summaries", "Action item extraction", "Search across meetings"],
      useCases: ["Meeting notes", "Call summaries", "Training documentation"],
      teams: ["QA", "Project Management", "Customer Success"],
      licenseAccess: ["QA", "Project Management", "Customer Success"],
      notes: "QA uses AI notetakers instead of attending all meetings - saved 24 business hours per sprint for the team."
    },

    // === DATA ===
    {
      name: "Databricks",
      category: "Data Platform",
      plan: "Team",
      hasAI: true,
      aiFeatures: ["AI/ML workflows", "Natural language queries", "LLM orchestration"],
      useCases: ["Data engineering", "Data science", "Analytics", "Large-scale data analysis"],
      teams: ["Engineering", "Data"],
      licenseAccess: ["Engineering", "Data"],
      notes: "Validated ease of use for orchestrating large scale data analysis with LLMs - working prototype in less than an hour."
    },

    // === AUTOMATION ===
    {
      name: "n8n",
      category: "Automation",
      plan: "Team",
      hasAI: true,
      aiFeatures: ["Agentic workflows", "AI node integrations", "Custom automations"],
      useCases: ["Workflow automation", "Integration automation", "Agentic processes"],
      teams: ["Integrations", "Engineering"],
      licenseAccess: ["Integrations", "Engineering"],
      notes: "Replaced Zapier due to reliability issues and better support for agentic workflows. Powers At-Risk List automation and credential approval automation."
    },

    // === FINANCE ===
    {
      name: "Ramp",
      category: "Finance",
      plan: "Team",
      hasAI: true,
      aiFeatures: ["Receipt matching", "Bill processing", "Email receipt connection", "Transaction categorization"],
      useCases: ["Expense management", "Bill processing", "Credit card reconciliation"],
      teams: ["Finance"],
      licenseAccess: ["Finance"],
      notes: "Connects receipts from personal emails to credit card transactions automatically. Saves significant time on bill processing."
    },
  ],

  // Common workflows where AI could help (opportunities, organized by team)
  workflows: {
    "Customer Success": [
      "Preparing for customer calls (reviewing account history, recent feedback, usage trends)",
      "Analyzing resident feedback patterns and trends for clients",
      "Creating QBR presentations and reports",
      "Tracking account health and identifying churn risk",
      "Drafting client communication emails",
      "Building customer success playbooks",
      "Preparing onboarding materials for new clients",
      "Summarizing account engagement metrics",
      "Documenting customer settings and configuration changes"
    ],
    "Customer Support": [
      "Resetting customer passwords and account access",
      "Answering customer emails and support inquiries",
      "Documenting and reporting bugs",
      "Processing account cancellations",
      "Summarizing support tickets and identifying common issues",
      "Drafting responses to customer questions",
      "Creating help documentation and FAQs",
      "Categorizing and prioritizing incoming tickets"
    ],
    "Sales": [
      "Sales outreach and prospecting emails",
      "Writing proposals and RFP responses",
      "Preparing demo scripts and talking points",
      "Researching prospects and their portfolios",
      "Summarizing sales calls and next steps",
      "Identifying high-likelihood expansion accounts",
      "Generating personalized outreach for upsells"
    ],
    "Marketing": [
      "Content creation for blog posts and social media",
      "Writing case studies and customer stories",
      "Email campaign copy and subject lines",
      "SEO optimization and keyword research",
      "Creating webinar and event content"
    ],
    "Product": [
      "Writing product documentation and release notes",
      "Summarizing user feedback and feature requests",
      "Creating PRDs and user stories",
      "Competitive analysis and market research",
      "Building MVPs with vibe coding",
      "Prototyping features before engineering handoff"
    ],
    "Engineering": [
      "Code review and debugging",
      "Writing technical documentation",
      "Generating test cases",
      "Explaining complex code",
      "Drafting commit messages and PR descriptions",
      "Building internal tools for cross-team use",
      "Creating shared prompt libraries",
      "Data enrichment at scale"
    ],
    "QA": [
      "Creating and maintaining automated tests",
      "Large-scale data comparison and validation",
      "Bug root cause analysis",
      "Test data generation",
      "Process documentation and checklists"
    ],
    "Project Management": [
      "Meeting notes and action items",
      "Task creation from meeting summaries",
      "Report validation and discrepancy checking",
      "Process documentation",
      "Training material creation",
      "Weekly follow-up summaries"
    ],
    "Finance": [
      "Bill and receipt processing",
      "Collection call summaries",
      "Invoice reconciliation",
      "Financial reporting validation"
    ],
    "Integrations": [
      "At-risk client identification and outreach",
      "Integration development and testing",
      "Credential and onboarding automation"
    ],
    "Revenue Operations": [
      "Calendar management and booking",
      "Statistical analysis and correlation studies",
      "Upsell target identification",
      "Data analysis and reporting"
    ],
    "Operations": [
      "Meeting notes and action items",
      "Process documentation",
      "Data analysis and reporting",
      "Creating SOPs and training materials"
    ],
    "All Teams": [
      "Drafting emails and messages",
      "Summarizing long documents or threads",
      "Brainstorming and ideation",
      "Proofreading and editing"
    ]
  },

  // AI workflows already in use at the company (proven patterns)
  activeWorkflows: [
    // === PRODUCT ===
    {
      team: "Product",
      workflow: "Vibe coding MVPs",
      tool: "Cursor + Figma MCP",
      description: "Building 80% complete features from designs and acceptance criteria in hours instead of sprints. Product can prototype full MVPs before handing to engineering."
    },
    {
      team: "Product",
      workflow: "Product roadmap app",
      tool: "AI-assisted development",
      description: "Built product.opiniion.com entirely with AI - manages shipped features, current work, upcoming items, client requests, bugs, and KPIs."
    },

    // === ENGINEERING ===
    {
      team: "Engineering",
      workflow: "Code completion & writing",
      tool: "GitHub Copilot / Cursor",
      description: "Real-time code suggestions while writing code. Should be used for most coding tasks."
    },
    {
      team: "Engineering",
      workflow: "Config.md context files",
      tool: "Cursor / Claude Code",
      description: "MD files with coding standards and project context that give AI full codebase understanding. Enables rapid v4→v5 page migrations with minimal rework."
    },
    {
      team: "Engineering",
      workflow: "Planning agent",
      tool: "GitHub Copilot",
      description: "Custom Copilot agent that helps plan implementation approaches and break down tasks."
    },
    {
      team: "Engineering",
      workflow: "Migration agent",
      tool: "GitHub Copilot",
      description: "Custom Copilot agent that assists with code migrations and refactoring in OpiniionV5."
    },
    {
      team: "Engineering",
      workflow: "Test generation agent",
      tool: "GitHub Copilot",
      description: "Custom Copilot agent that generates test cases and test code."
    },
    {
      team: "Engineering",
      workflow: "Bug resolution",
      tool: "Cursor",
      description: "AI-assisted diagnosis and fixing of bugs - drastically reduces time to resolution."
    },
    {
      team: "Engineering",
      workflow: "Requirements enrichment",
      tool: "ChatGPT",
      description: "Taking rough requirements and turning them into detailed, clear specs. Saves hours per document."
    },
    {
      team: "Engineering",
      workflow: "Automated PR reviews",
      tool: "CodeRabbit",
      description: "Every pull request gets AI-generated review comments automatically."
    },
    {
      team: "Engineering",
      workflow: "Design-to-code via MCP",
      tool: "Figma MCP + GitHub Copilot",
      description: "Figma MCP server gives Copilot context from designs, so it can generate components that match the specs."
    },
    {
      team: "Engineering",
      workflow: "Ari multi-agent orchestration",
      tool: "Custom AI",
      description: "In-app natural language interface with multi-agent architecture for customer-facing AI experiences."
    },
    {
      team: "Engineering",
      workflow: "Data enrichment at scale",
      tool: "Databricks + LLMs",
      description: "Data enrichment processes now take days rather than months and cost significantly less."
    },

    // === QA ===
    {
      team: "QA",
      workflow: "Automated E2E testing",
      tool: "Mabl",
      description: "170 auto-heals this quarter, 88 tests total. Prior to Mabl it took a full quarter to get a dozen tests."
    },
    {
      team: "QA",
      workflow: "Prompt-based test creation",
      tool: "Mabl",
      description: "Prompt Mabl to test something while working on other tasks. Huge multitasking potential."
    },
    {
      team: "QA",
      workflow: "Large-scale data comparison",
      tool: "ChatGPT",
      description: "Comparing app data vs scheduler data across large accounts - significantly faster than manual review."
    },
    {
      team: "QA",
      workflow: "Process assistant",
      tool: "ChatGPT + internal docs",
      description: "QA asks ChatGPT what next steps are or if they're forgetting anything. Reduces process errors."
    },
    {
      team: "QA",
      workflow: "Skip meetings with AI notes",
      tool: "Fireflies / Gemini / ClickUp AI",
      description: "QA uses AI notetakers instead of attending all meetings in person. Saved 24 business hours per sprint for the team."
    },

    // === PROJECT MANAGEMENT ===
    {
      team: "Project Management",
      workflow: "Meeting notes → tasks",
      tool: "Gemini + ClickUp AI + ChatGPT",
      description: "AI takes meeting notes, then ChatGPT formats them into properly structured tasks in the needed format."
    },
    {
      team: "Project Management",
      workflow: "Report validation",
      tool: "ChatGPT",
      description: "Double-checking data on dev and QA team reports, catching discrepancies faster than manual review."
    },
    {
      team: "Project Management",
      workflow: "Friday follow-up summaries",
      tool: "ChatGPT",
      description: "Scheduled weekly summary of things that need follow-up to prevent items falling through cracks."
    },
    {
      team: "Project Management",
      workflow: "Training → documentation",
      tool: "AI notetaker + ChatGPT",
      description: "Record training sessions with AI notes, then convert to step-by-step documented guides automatically."
    },
    {
      team: "Project Management",
      workflow: "Presentation creation",
      tool: "ChatGPT",
      description: "Using ChatGPT to assist in making slides or presentations for scrum, processes, and documentation."
    },

    // === CUSTOMER SUCCESS ===
    {
      team: "Customer Success",
      workflow: "SOP creation in Notion",
      tool: "Notion AI + ChatGPT",
      description: "Turning scattered notes into clear, repeatable SOPs. Saved hours on documentation and made onboarding smoother."
    },
    {
      team: "Customer Success",
      workflow: "Client communication drafting",
      tool: "ChatGPT",
      description: "Drafting renewal emails, translating product updates into plain language, turning thoughts into clear messaging."
    },
    {
      team: "Customer Success",
      workflow: "Call prep and follow-up",
      tool: "ChatGPT + Gong",
      description: "Summarizing call transcripts, prepping for client meetings, generating client-friendly follow-up summaries with action items."
    },

    // === SALES ===
    {
      team: "Sales",
      workflow: "Call summaries",
      tool: "Gong",
      description: "Auto-generated summaries and action items after every sales call."
    },

    // === REVENUE OPERATIONS ===
    {
      team: "Revenue Operations",
      workflow: "Calendar booking automation",
      tool: "ChatGPT Atlas",
      description: "Autonomous calendar management - assessing availability and booking internal appointments with simple prompts."
    },
    {
      team: "Revenue Operations",
      workflow: "Statistical analysis",
      tool: "ChatGPT",
      description: "Correlation analysis (e.g., star ratings vs occupancy) in 20 minutes instead of hours."
    },

    // === FINANCE ===
    {
      team: "Finance",
      workflow: "Bill and receipt processing",
      tool: "Ramp AI",
      description: "Auto-processing bills and connecting email receipts to credit card transactions automatically."
    },
    {
      team: "Finance",
      workflow: "Collection call summaries",
      tool: "AI notetaker",
      description: "AI summaries of collection calls - faster and more accurate than manual notes."
    },

    // === INTEGRATIONS ===
    {
      team: "Integrations",
      workflow: "At-Risk List automation",
      tool: "n8n + AI",
      description: "AI-powered outreach to clients with broken integrations. Increases reach and speeds up repairs."
    },
    {
      team: "Integrations",
      workflow: "Credential approval automation",
      tool: "n8n",
      description: "Automated onboarding credential approval to reduce latency between teams."
    },

    // === OPERATIONS ===
    {
      team: "Operations",
      workflow: "Excel problem solving",
      tool: "ChatGPT",
      description: "Solving Excel spreadsheet obstacles to provide accurate reporting to stakeholders."
    },
    {
      team: "Operations",
      workflow: "SOP creation with Loom + AI",
      tool: "Loom + ChatGPT",
      description: "Using Loom transcription and ChatGPT to streamline SOP creation for new team members and cross-training."
    },
  ],

  // Guidelines and restrictions
  guidelines: [
    "Don't share confidential customer data or resident PII with AI tools",
    "Review AI-generated content before publishing or sending to customers",
    "Use company-approved tools when handling sensitive data",
    "Be mindful of our customers' data - property management companies trust us with resident information",
    "AI is powerful with the right context - structure your prompts and provide relevant information",
    "AI isn't perfect, but it types faster than you can - let it handle first drafts and generation",
    "Always manually verify AI-generated reports before sharing externally"
  ],

  // Industry-specific prompt ideas
  industryPromptIdeas: [
    "Summarize this resident feedback and identify top 3 themes",
    "Draft a response to a negative review about maintenance delays",
    "Create a QBR agenda for a property management client",
    "Analyze this NPS data and suggest 3 action items",
    "Write a case study about improving resident satisfaction scores",
    "Draft an email to a property manager about their feedback trends",
    "Compare sentiment data between these two properties",
    "Identify at-risk accounts based on engagement patterns",
    "Generate talking points for a renewal conversation",
    "Summarize this customer's account history for a call prep"
  ],

  // Additional context
  additionalContext: `
    Opiniion employees work with property management companies daily. Common challenges include:
    - Helping customers understand their resident sentiment data
    - Modifying campaigns and surveys for customers in app
    - Understanding the health of customer accounts and preventing GRR from going down
    - Accessing data and valuable KPIs
    - Supporting onboarding of new property management clients
    - Training customers on new features and best practices
    - Managing customer support inquiries efficiently
    - Communicating goals and progress internally across teams

    We value efficiency, customer success, and data-driven insights.

    Key insight from employee survey: Context is everything. The teams seeing the biggest AI wins
    are those who provide structured prompts and context files. Success isn't just about the model
    or tool - it's about the entire workflow and giving AI the information it needs.

    Note: Some employees see AI as a threat to their roles. Position AI as a tool that allows
    people to work more efficiently and take on more without becoming overwhelmed - not a replacement.
  `
};

// Build the system prompt from company context
export function buildSystemPrompt() {
  const { name, industry, description, industryTerms, teams, approvedTools, workflows, activeWorkflows, guidelines, industryPromptIdeas, additionalContext } = companyContext;

  const toolsList = approvedTools
    .map(t => {
      return `• *${t.name}* (${t.category}${t.plan ? ` - ${t.plan}` : ''})${t.hasAI ? ' ✨AI' : ''}
    AI Features: ${t.aiFeatures.join(', ')}
    Use cases: ${t.useCases.join(', ')}
    Teams: ${Array.isArray(t.teams) ? t.teams.join(', ') : t.teams}${t.notes ? `\n    Notes: ${t.notes}` : ''}`;
    })
    .join('\n\n');

  // Build workflows list organized by team
  const workflowsList = Object.entries(workflows)
    .map(([team, items]) => `*${team}:*\n${items.map(w => `  • ${w}`).join('\n')}`)
    .join('\n\n');

  // Build active workflows list
  const activeWorkflowsList = activeWorkflows
    .map(w => `• *${w.team}* - ${w.workflow} (${w.tool}): ${w.description}`)
    .join('\n');

  const guidelinesList = guidelines
    .map(g => `• ${g}`)
    .join('\n');

  const promptIdeasList = industryPromptIdeas
    .map(p => `• "${p}"`)
    .join('\n');

  return `You are the Innovators Circle Bot for ${name}, a helpful AI assistant for employees exploring how to use AI tools to solve problems at work.

ABOUT ${name.toUpperCase()}:
${description}

INDUSTRY: ${industry}
KEY TERMS: ${industryTerms?.join(', ') || ''}
TEAMS: ${teams.join(', ')}

APPROVED AI TOOLS:
${toolsList}

PROVEN AI WORKFLOWS ALREADY IN USE:
${activeWorkflowsList}

OPPORTUNITIES - WHERE AI CAN HELP:
${workflowsList}

GUIDELINES TO KEEP IN MIND:
${guidelinesList}

EXAMPLE PROMPTS FOR OUR INDUSTRY:
${promptIdeasList}

${additionalContext.trim()}

YOUR ROLE:
- Help users brainstorm AI solutions for their work challenges
- Suggest specific tools from the approved list when relevant
- Reference proven workflows that other teams are already using successfully
- Provide practical, actionable guidance
- Encourage creative thinking about AI applications
- Keep responses concise (this is Slack, not an essay)
- Ask clarifying questions to give better recommendations
- Understand our property management industry context and use relevant terminology

Be friendly, encouraging, and practical. Use Slack markdown formatting when helpful.

IMPORTANT FOR ENGINEERING SUBMISSIONS:
Since automation is core to engineering work, engineering submissions should demonstrate cross-team or cross-functional impact. Building tools for your own workflow is expected; building tools that scale across the org is what we're rewarding in The Innovators Circle.

If the user seems ready to formally submit their solution, remind them they can type "submit" or use /submit to start the submission process.`;
}